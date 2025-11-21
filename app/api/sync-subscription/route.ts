import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: Request) {
  try {
    const { educatorId } = await request.json();

    console.log('🔄 Synchronisation abonnement pour educator:', educatorId);

    if (!educatorId) {
      return NextResponse.json(
        { error: 'Educator ID requis' },
        { status: 400 }
      );
    }

    // Récupérer l'éducateur
    const { data: educator, error: educatorError } = await supabase
      .from('educator_profiles')
      .select('id, user_id, first_name, last_name')
      .eq('id', educatorId)
      .single();

    if (educatorError || !educator) {
      console.error('❌ Éducateur introuvable:', educatorError?.message);
      return NextResponse.json(
        { error: 'Éducateur introuvable' },
        { status: 404 }
      );
    }

    // Récupérer l'email de l'utilisateur
    const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(
      educator.user_id
    );

    if (userError || !user?.email) {
      console.error('❌ Utilisateur introuvable:', userError?.message);
      return NextResponse.json(
        { error: 'Utilisateur introuvable' },
        { status: 404 }
      );
    }

    console.log('✅ Recherche abonnements Stripe pour email:', user.email);

    // Rechercher le customer Stripe par email
    const customers = await stripe.customers.list({
      email: user.email,
      limit: 1,
    });

    if (customers.data.length === 0) {
      console.log('❌ Aucun customer Stripe trouvé');
      return NextResponse.json(
        { error: 'Aucun abonnement Stripe trouvé pour cet email' },
        { status: 404 }
      );
    }

    const customer = customers.data[0];
    console.log('✅ Customer Stripe trouvé:', customer.id);

    // Récupérer les abonnements du customer
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      limit: 10,
    });

    if (subscriptions.data.length === 0) {
      console.log('❌ Aucun abonnement actif');
      return NextResponse.json(
        { error: 'Aucun abonnement actif trouvé' },
        { status: 404 }
      );
    }

    // Prendre le premier abonnement actif ou en trial
    const subscriptionSummary = subscriptions.data.find(
      sub => sub.status === 'active' || sub.status === 'trialing'
    ) || subscriptions.data[0];

    // Récupérer l'abonnement complet avec toutes les propriétés
    const subscription = await stripe.subscriptions.retrieve(subscriptionSummary.id);

    console.log('✅ Abonnement trouvé:', subscription.id, 'Status:', subscription.status);

    // DEBUG: Afficher TOUTES les clés de l'objet subscription
    console.log('🔍 Clés disponibles dans subscription:', Object.keys(subscription));

    // DEBUG: Afficher l'objet complet (stringifié pour voir la structure)
    console.log('🔍 Subscription complet:', JSON.stringify(subscription, null, 2));

    // Insérer ou mettre à jour dans Supabase
    // Les propriétés Stripe sont en snake_case, pas camelCase
    const subscriptionData = subscription as any;
    const currentPeriodStart = subscriptionData.current_period_start;
    const currentPeriodEnd = subscriptionData.current_period_end;

    console.log('📅 Dates (snake_case):', {
      current_period_start: currentPeriodStart,
      current_period_end: currentPeriodEnd,
      trial_start: subscription.trial_start,
      trial_end: subscription.trial_end
    });

    // Essayer aussi en camelCase au cas où
    console.log('📅 Dates (camelCase):', {
      currentPeriodStart: (subscription as any).currentPeriodStart,
      currentPeriodEnd: (subscription as any).currentPeriodEnd,
    });

    if (!currentPeriodStart || !currentPeriodEnd) {
      console.error('❌ Dates manquantes dans l\'abonnement');
      return NextResponse.json(
        { error: 'Dates d\'abonnement manquantes' },
        { status: 400 }
      );
    }

    const { error: upsertError } = await supabase
      .from('subscriptions')
      .upsert({
        educator_id: educatorId,
        stripe_customer_id: customer.id,
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
        plan_type: subscription.items.data[0].price.recurring?.interval === 'year' ? 'annual' : 'monthly',
        price_amount: (subscription.items.data[0].price.unit_amount || 0) / 100,
        currency: 'eur',
      }, {
        onConflict: 'educator_id',
      });

    if (upsertError) {
      console.error('❌ Erreur synchronisation:', upsertError.message);
      return NextResponse.json(
        { error: 'Erreur lors de la synchronisation', details: upsertError.message },
        { status: 500 }
      );
    }

    console.log('✅ Abonnement synchronisé avec succès');

    return NextResponse.json({
      success: true,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        trial_end: subscription.trial_end,
        current_period_end: currentPeriodEnd,
      }
    });

  } catch (error: any) {
    console.error('❌ Erreur sync-subscription:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la synchronisation' },
      { status: 500 }
    );
  }
}
