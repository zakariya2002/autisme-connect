import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: Request) {
  try {
    const {
      educatorId,
      familyId,
      appointmentDate,
      startTime,
      endTime,
      locationType,
      address,
      familyNotes,
      price
    } = await request.json();

    console.log('📝 Création RDV avec paiement:', {
      educatorId,
      familyId,
      price
    });

    // Utiliser APP_URL (server-side) au lieu de NEXT_PUBLIC_APP_URL (build-time)
    const appUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    console.log('🌐 APP_URL utilisée:', appUrl);

    // Valider les données
    if (!educatorId || !familyId || !appointmentDate || !startTime || !endTime || !price) {
      return NextResponse.json(
        { error: 'Données manquantes' },
        { status: 400 }
      );
    }

    // Récupérer les infos famille
    const { data: familyProfile, error: familyError } = await supabase
      .from('family_profiles')
      .select('id, first_name, last_name, user_id')
      .eq('id', familyId)
      .single();

    if (familyError || !familyProfile) {
      console.error('❌ Famille introuvable:', familyError);
      return NextResponse.json(
        { error: 'Famille introuvable' },
        { status: 404 }
      );
    }

    // Récupérer l'email de la famille
    const { data: familyUserData } = await supabase.auth.admin.getUserById(
      familyProfile.user_id
    );
    const familyEmail = familyUserData?.user?.email;

    if (!familyEmail) {
      return NextResponse.json(
        { error: 'Email famille introuvable' },
        { status: 404 }
      );
    }

    // Récupérer les infos éducateur
    const { data: educatorProfile, error: educatorError } = await supabase
      .from('educator_profiles')
      .select('id, first_name, last_name, user_id')
      .eq('id', educatorId)
      .single();

    if (educatorError || !educatorProfile) {
      console.error('❌ Éducateur introuvable:', educatorError);
      return NextResponse.json(
        { error: 'Éducateur introuvable' },
        { status: 404 }
      );
    }

    // Créer ou récupérer le customer Stripe pour la famille
    let customerId: string;

    // Chercher un customer existant
    const customers = await stripe.customers.list({
      email: familyEmail,
      limit: 1
    });

    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      console.log('✅ Customer Stripe existant:', customerId);
    } else {
      const customer = await stripe.customers.create({
        email: familyEmail,
        metadata: {
          family_id: familyId,
          user_id: familyProfile.user_id,
        },
      });
      customerId = customer.id;
      console.log('✅ Customer Stripe créé:', customerId);
    }

    // Calculer les montants (en centimes)
    const priceInCents = Math.round(price * 100);
    const commissionAmount = Math.round(priceInCents * 0.10); // 10%
    const stripeFees = Math.round(priceInCents * 0.014 + 25); // 1.4% + 0.25€
    const educatorAmount = priceInCents - commissionAmount - stripeFees;

    // Créer la session Stripe Checkout avec capture manuelle
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `Séance avec ${educatorProfile.first_name} ${educatorProfile.last_name}`,
              description: `Le ${new Date(appointmentDate).toLocaleDateString('fr-FR')} à ${startTime}\n\n✅ Le prélèvement aura lieu uniquement après la séance terminée avec ${educatorProfile.first_name} ${educatorProfile.last_name}.\n\nVous ne serez débité(e) qu'une fois le rendez-vous effectué et validé par l'éducateur.`,
            },
            unit_amount: priceInCents,
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        capture_method: 'manual', // Important : capture manuelle
        metadata: {
          educator_id: educatorId,
          family_id: familyId,
          appointment_date: appointmentDate,
          start_time: startTime,
          end_time: endTime,
          commission_amount: commissionAmount.toString(),
          stripe_fees: stripeFees.toString(),
          educator_amount: educatorAmount.toString(),
        },
      },
      metadata: {
        educator_id: educatorId,
        family_id: familyId,
        appointment_date: appointmentDate,
        start_time: startTime,
        end_time: endTime,
        location_type: locationType,
        address: address || '',
        family_notes: familyNotes || '',
      },
      success_url: `${appUrl}/dashboard/family?booking=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/educator/${educatorId}/book-appointment?canceled=true`,
    });

    console.log('✅ Session Stripe créée:', session.id);

    // Créer le rendez-vous IMMÉDIATEMENT
    try {
      const { data: appointment, error: appointmentError } = await supabase
        .from('appointments')
        .insert({
          educator_id: educatorId,
          family_id: familyId,
          appointment_date: appointmentDate,
          start_time: startTime,
          end_time: endTime,
          location_type: locationType,
          address: address || null,
          family_notes: familyNotes || null,
          price: priceInCents, // En centimes
          status: 'pending', // En attente d'acceptation par l'éducateur
          payment_status: 'authorized', // Paiement autorisé (à capturer après la séance)
        })
        .select()
        .single();

      if (appointmentError) {
        console.error('❌ Erreur création RDV immédiate:', appointmentError);
      } else {
        console.log('✅ Rendez-vous créé immédiatement:', appointment.id);
      }
    } catch (err) {
      console.error('❌ Erreur création RDV:', err);
      // Ne pas bloquer la session de paiement même si la création échoue
    }

    return NextResponse.json({
      sessionId: session.id,
      url: session.url
    });

  } catch (error: any) {
    console.error('❌ Erreur création session paiement:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la création de la session de paiement' },
      { status: 500 }
    );
  }
}
