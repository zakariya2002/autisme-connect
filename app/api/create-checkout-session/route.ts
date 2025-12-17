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
          unit_amount: 34800, // 348.00€ (29€ x 12 mois)
          recurring: { interval: 'year' as const },
        }
      : {
          unit_amount: 2900, // 29.00€
          recurring: { interval: 'month' as const },
        };

    // Période d'essai gratuite de 3 mois pour les abonnements mensuels
    const trialPeriodDays = planType === 'monthly' ? 90 : undefined; // 3 mois = 90 jours

    // Créer la session de paiement Stripe
    console.log('💳 Création session Stripe pour customer:', customerId);

    try {
      const sessionData: Stripe.Checkout.SessionCreateParams = {
        customer: customerId,
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'eur',
              product_data: {
                name: 'NeuroCare Pro - Abonnement Professionnel',
                description: planType === 'annual'
                  ? 'Abonnement annuel - 29€/mois (348€/an)'
                  : 'Abonnement mensuel - 3 mois offerts puis 29€/mois',
              },
              unit_amount: priceData.unit_amount,
              recurring: priceData.recurring,
            },
            quantity: 1,
          },
        ],
        subscription_data: {
          metadata: {
            educator_id: educatorId,
            plan_type: planType,
          },
          // Ajouter la période d'essai gratuite de 3 mois pour les abonnements mensuels
          ...(trialPeriodDays && { trial_period_days: trialPeriodDays }),
        },
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/educator?subscription=success`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pro/pricing?canceled=true`,
        metadata: {
          educator_id: educatorId,
          plan_type: planType,
        },
      };

      const session = await stripe.checkout.sessions.create(sessionData);

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
