import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: Request) {
  try {
    const { subscriptionId } = await request.json();

    console.log('❌ Annulation abonnement:', subscriptionId);

    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'Subscription ID requis' },
        { status: 400 }
      );
    }

    // Annuler l'abonnement sur Stripe à la fin de la période en cours
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });

    console.log('✅ Abonnement marqué pour annulation:', subscription.id);

    // Mettre à jour dans Supabase
    // @ts-ignore - Stripe subscription has these properties at runtime
    const cancelAt = subscription.cancel_at;

    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({
        cancel_at: cancelAt ? new Date(cancelAt * 1000).toISOString() : null,
        canceled_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', subscriptionId);

    if (updateError) {
      console.error('❌ Erreur mise à jour Supabase:', updateError.message);
    }

    return NextResponse.json({
      success: true,
      cancel_at: subscription.cancel_at,
    });

  } catch (error: any) {
    console.error('❌ Erreur cancel-subscription:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de l\'annulation de l\'abonnement' },
      { status: 500 }
    );
  }
}
