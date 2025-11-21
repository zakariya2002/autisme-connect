import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: Request) {
  try {
    const { educatorId, planType } = await request.json();

    console.log('📝 Création session checkout pour:', { educatorId, planType });

    if (!educatorId || !planType) {
      console.error('❌ Paramètres manquants:', { educatorId, planType });
      return NextResponse.json(
        { error: 'Educator ID et plan type sont requis' },
        { status: 400 }
      );
    }

    // Vérifier que l'éducateur existe
    const { data: educator, error: educatorError } = await supabase
      .from('educator_profiles')
      .select('id, user_id, first_name, last_name')
      .eq('id', educatorId)
      .single();

    if (educatorError || !educator) {
      console.error('❌ Éducateur introuvable:', educatorError?.message);
      return NextResponse.json(
        { error: 'Éducateur introuvable', details: educatorError?.message },
        { status: 404 }
      );
    }

    console.log('✅ Éducateur trouvé:', educator.first_name, educator.last_name);

    // Récupérer l'email de l'utilisateur
    console.log('🔍 Recherche utilisateur:', educator.user_id);
    const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(
      educator.user_id
    );

    if (userError || !user) {
      console.error('❌ Utilisateur introuvable:', userError?.message);
      return NextResponse.json(
        { error: 'Utilisateur introuvable', details: userError?.message },
        { status: 404 }
      );
    }

    console.log('✅ Utilisateur trouvé:', user.email);

    // Vérifier si un abonnement existe déjà
    const { data: existingSubscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('educator_id', educatorId)
      .single();

    let customerId = existingSubscription?.stripe_customer_id;

    // Créer ou récupérer le customer Stripe
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          educator_id: educatorId,
          user_id: educator.user_id,
        },
      });
      customerId = customer.id;
    }

    // Déterminer le prix selon le plan
    const priceData = planType === 'annual'
      ? {
          unit_amount: 8000, // 80.00€
          recurring: { interval: 'year' as const },
        }
      : {
          unit_amount: 9000, // 90.00€
          recurring: { interval: 'month' as const },
        };

    // Créer la session de paiement Stripe
    console.log('💳 Création session Stripe pour customer:', customerId);

    try {
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'eur',
              product_data: {
                name: 'Autisme Connect - Abonnement Éducateur',
                description: planType === 'annual'
                  ? 'Abonnement annuel - Économisez 120€'
                  : 'Abonnement mensuel',
              },
              unit_amount: priceData.unit_amount,
              recurring: priceData.recurring,
            },
            quantity: 1,
          },
        ],
        subscription_data: {
          trial_period_days: 30, // 30 jours gratuits
          metadata: {
            educator_id: educatorId,
            plan_type: planType,
          },
        },
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/educator?subscription=success`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
        metadata: {
          educator_id: educatorId,
          plan_type: planType,
        },
      });

      console.log('✅ Session Stripe créée:', session.id);
      return NextResponse.json({ sessionId: session.id, url: session.url });
    } catch (stripeError: any) {
      console.error('❌ Erreur Stripe:', stripeError.message);
      return NextResponse.json(
        { error: 'Erreur Stripe: ' + stripeError.message },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('❌ Erreur création session checkout:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la création de la session' },
      { status: 500 }
    );
  }
}
