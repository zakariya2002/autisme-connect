import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { sendPremiumWelcomeEmail } from '@/lib/email';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: Request) {
  try {
    console.log('🔔 Webhook Stripe reçu');
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      console.error('❌ Signature manquante');
      return NextResponse.json(
        { error: 'Signature manquante' },
        { status: 400 }
      );
    }

    // Vérifier l'événement Stripe
    let event: Stripe.Event;

    // En développement, parser directement le body sans vérification stricte
    if (process.env.NODE_ENV === 'development') {
      console.log('🔧 Mode développement : parsing sans vérification stricte');
      try {
        event = JSON.parse(body);
        console.log('📦 Événement reçu:', event.type);
      } catch (err: any) {
        console.error('❌ Erreur parsing JSON:', err.message);
        return NextResponse.json(
          { error: `Parse Error: ${err.message}` },
          { status: 400 }
        );
      }
    } else {
      // En production, vérifier la signature normalement
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
      try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      } catch (err: any) {
        console.error('Erreur webhook signature:', err.message);
        return NextResponse.json(
          { error: `Webhook Error: ${err.message}` },
          { status: 400 }
        );
      }
    }

    // Gérer les différents types d'événements
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`Événement non géré: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Erreur webhook:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  // Vérifier si c'est un paiement de rendez-vous ou un abonnement
  const isAppointment = session.metadata?.appointment_date;

  if (isAppointment) {
    // Gérer le paiement de rendez-vous
    await handleAppointmentPayment(session);
    return;
  }

  // Sinon, c'est un abonnement éducateur
  const educatorId = session.metadata?.educator_id;
  const planType = session.metadata?.plan_type;

  if (!educatorId) {
    console.error('Educator ID manquant dans les metadata');
    return;
  }

  // Créer ou mettre à jour l'abonnement dans la base de données
  const subscription = await stripe.subscriptions.retrieve(session.subscription as string);

  // DEBUG: Afficher TOUTES les clés de l'objet subscription
  console.log('🔍 [WEBHOOK] Clés disponibles dans subscription:', Object.keys(subscription));

  // DEBUG: Afficher l'objet complet
  console.log('🔍 [WEBHOOK] Subscription complet:', JSON.stringify(subscription, null, 2));

  // Les dates current_period_start/end sont dans subscription.items.data[0]
  const subscriptionItem = subscription.items.data[0];
  const currentPeriodStart = subscriptionItem.current_period_start;
  const currentPeriodEnd = subscriptionItem.current_period_end;

  console.log('📅 [WEBHOOK] Dates trouvées dans subscription.items.data[0]:', {
    current_period_start: currentPeriodStart,
    current_period_end: currentPeriodEnd,
    trial_start: subscription.trial_start,
    trial_end: subscription.trial_end
  });

  const { error } = await supabase
    .from('subscriptions')
    .upsert({
      educator_id: educatorId,
      stripe_customer_id: session.customer as string,
      stripe_subscription_id: subscription.id,
      stripe_price_id: subscription.items.data[0].price.id,
      status: subscription.status,
      trial_start: subscription.trial_start
        ? new Date(subscription.trial_start * 1000).toISOString()
        : null,
      trial_end: subscription.trial_end
        ? new Date(subscription.trial_end * 1000).toISOString()
        : null,
      current_period_start: new Date(currentPeriodStart * 1000).toISOString(),
      current_period_end: new Date(currentPeriodEnd * 1000).toISOString(),
      plan_type: planType || 'monthly',
      price_amount: subscription.items.data[0].price.unit_amount! / 100,
      currency: 'eur',
    });

  if (error) {
    console.error('Erreur création abonnement:', error);
  } else {
    // Envoyer l'email de bienvenue Premium
    try {
      // Récupérer l'éducateur et son email
      const { data: educator } = await supabase
        .from('educator_profiles')
        .select('first_name, user_id')
        .eq('id', educatorId)
        .single();

      if (educator) {
        const { data: userData } = await supabase.auth.admin.getUserById(educator.user_id);
        const userEmail = userData?.user?.email;

        if (userEmail) {
          await sendPremiumWelcomeEmail(userEmail, educator.first_name);
        }
      }
    } catch (emailError) {
      console.error('Erreur envoi email Premium:', emailError);
      // On ne fait pas échouer le webhook si l'email échoue
    }
  }
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  // Les dates current_period_start/end sont dans subscription.items.data[0]
  const subscriptionItem = subscription.items.data[0];
  const currentPeriodStart = subscriptionItem.current_period_start;
  const currentPeriodEnd = subscriptionItem.current_period_end;

  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: subscription.status,
      current_period_start: new Date(currentPeriodStart * 1000).toISOString(),
      current_period_end: new Date(currentPeriodEnd * 1000).toISOString(),
      cancel_at: subscription.cancel_at
        ? new Date(subscription.cancel_at * 1000).toISOString()
        : null,
      canceled_at: subscription.canceled_at
        ? new Date(subscription.canceled_at * 1000).toISOString()
        : null,
    })
    .eq('stripe_subscription_id', subscription.id);

  if (error) {
    console.error('Erreur mise à jour abonnement:', error);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: 'canceled',
      canceled_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id);

  if (error) {
    console.error('Erreur suppression abonnement:', error);
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  // @ts-ignore - Invoice has subscription property at runtime
  if (!invoice.subscription) return;

  // Récupérer l'abonnement
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('educator_id')
    // @ts-ignore - Invoice has subscription property at runtime
    .eq('stripe_subscription_id', invoice.subscription as string)
    .single();

  if (!subscription) return;

  // Enregistrer la transaction
  // @ts-ignore - Invoice has these properties at runtime
  const paymentIntent = invoice.payment_intent;
  // @ts-ignore - Invoice has these properties at runtime
  const amountPaid = invoice.amount_paid;
  // @ts-ignore - Invoice has these properties at runtime
  const hostedInvoiceUrl = invoice.hosted_invoice_url;

  await supabase
    .from('payment_transactions')
    .insert({
      subscription_id: subscription.educator_id,
      educator_id: subscription.educator_id,
      stripe_payment_intent_id: paymentIntent as string,
      stripe_invoice_id: invoice.id,
      amount: amountPaid / 100,
      currency: 'eur',
      status: 'succeeded',
      description: invoice.description || 'Paiement abonnement',
      receipt_url: hostedInvoiceUrl,
    });
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  // @ts-ignore - Invoice has subscription property at runtime
  if (!invoice.subscription) return;

  // Récupérer l'abonnement
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('educator_id')
    // @ts-ignore - Invoice has subscription property at runtime
    .eq('stripe_subscription_id', invoice.subscription as string)
    .single();

  if (!subscription) return;

  // Enregistrer la transaction échouée
  // @ts-ignore - Invoice has these properties at runtime
  const paymentIntent = invoice.payment_intent;
  // @ts-ignore - Invoice has these properties at runtime
  const amountDue = invoice.amount_due;

  await supabase
    .from('payment_transactions')
    .insert({
      subscription_id: subscription.educator_id,
      educator_id: subscription.educator_id,
      stripe_payment_intent_id: paymentIntent as string,
      stripe_invoice_id: invoice.id,
      amount: amountDue / 100,
      currency: 'eur',
      status: 'failed',
      description: 'Échec du paiement',
    });
}

async function handleAppointmentPayment(session: Stripe.Checkout.Session) {
  console.log('📅 Création de rendez-vous après paiement');

  const {
    educator_id,
    family_id,
    appointment_date,
    start_time,
    end_time,
    location_type,
    address,
    family_notes,
  } = session.metadata || {};

  if (!educator_id || !family_id || !appointment_date || !start_time || !end_time) {
    console.error('❌ Métadonnées manquantes dans la session');
    return;
  }

  // Récupérer le PaymentIntent
  const paymentIntentId = session.payment_intent as string;

  // Créer le rendez-vous dans la base de données
  const { data: appointment, error: appointmentError } = await supabase
    .from('appointments')
    .insert({
      educator_id,
      family_id,
      appointment_date,
      start_time,
      end_time,
      location_type: location_type || 'online',
      address: address || null,
      family_notes: family_notes || null,
      price: session.amount_total, // En centimes
      status: 'pending', // En attente d'acceptation par l'éducateur
      payment_intent_id: paymentIntentId,
      payment_status: 'authorized', // Fonds bloqués mais non capturés
    })
    .select()
    .single();

  if (appointmentError) {
    console.error('❌ Erreur création RDV:', appointmentError);
    return;
  }

  console.log('✅ Rendez-vous créé:', appointment.id);

  // TODO: Envoyer un email de confirmation à la famille
}
