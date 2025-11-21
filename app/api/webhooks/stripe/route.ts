import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Signature manquante' },
        { status: 400 }
      );
    }

    // Vérifier l'événement Stripe
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('Erreur webhook signature:', err.message);
      return NextResponse.json(
        { error: `Webhook Error: ${err.message}` },
        { status: 400 }
      );
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
  const educatorId = session.metadata?.educator_id;
  const planType = session.metadata?.plan_type;

  if (!educatorId) {
    console.error('Educator ID manquant dans les metadata');
    return;
  }

  // Créer ou mettre à jour l'abonnement dans la base de données
  const subscription = await stripe.subscriptions.retrieve(session.subscription as string);

  // @ts-ignore - Stripe subscription has these properties at runtime
  const currentPeriodStart = subscription.current_period_start;
  // @ts-ignore - Stripe subscription has these properties at runtime
  const currentPeriodEnd = subscription.current_period_end;

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
  }
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  // @ts-ignore - Stripe subscription has these properties at runtime
  const currentPeriodStart = subscription.current_period_start;
  // @ts-ignore - Stripe subscription has these properties at runtime
  const currentPeriodEnd = subscription.current_period_end;

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
