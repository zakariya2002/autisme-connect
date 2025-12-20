import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import { Resend } from 'resend';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const appointmentId = params.id;
    const { cancelledBy } = await request.json(); // 'family' or 'educator'

    console.log('🚫 Annulation RDV:', appointmentId, 'par:', cancelledBy);

    // Récupérer le RDV avec les infos
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .select(`
        *,
        family:family_profiles(id, first_name, last_name, user_id),
        educator:educator_profiles(id, first_name, last_name, user_id)
      `)
      .eq('id', appointmentId)
      .single();

    if (appointmentError || !appointment) {
      return NextResponse.json(
        { error: 'Rendez-vous introuvable' },
        { status: 404 }
      );
    }

    // Vérifier que le RDV peut être annulé
    if (!['pending', 'accepted'].includes(appointment.status)) {
      return NextResponse.json(
        { error: 'Ce rendez-vous ne peut plus être annulé' },
        { status: 400 }
      );
    }

    // Calculer si on est à moins de 48h du RDV
    const appointmentDateTime = new Date(`${appointment.appointment_date}T${appointment.start_time}`);
    const now = new Date();
    const hoursUntilAppointment = (appointmentDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    const isLateCancel = hoursUntilAppointment < 48;

    console.log('⏰ Heures avant RDV:', hoursUntilAppointment.toFixed(1));
    console.log('💰 Annulation tardive (< 48h):', isLateCancel);

    let amountCharged = 0;
    let paymentCaptured = false;

    // Si annulation tardive par la famille, capturer 50%
    if (isLateCancel && cancelledBy === 'family' && appointment.payment_status === 'authorized') {
      try {
        // Récupérer le PaymentIntent depuis Stripe
        const paymentIntents = await stripe.paymentIntents.search({
          query: `metadata['family_id']:'${appointment.family_id}' AND metadata['appointment_date']:'${appointment.appointment_date}'`,
        });

        if (paymentIntents.data.length > 0) {
          const paymentIntent = paymentIntents.data[0];

          // Capturer 50% du montant
          const halfAmount = Math.round(paymentIntent.amount / 2);

          await stripe.paymentIntents.capture(paymentIntent.id, {
            amount_to_capture: halfAmount,
          });

          amountCharged = halfAmount / 100; // Convertir en euros
          paymentCaptured = true;
          console.log('💳 50% capturé:', amountCharged, '€');
        }
      } catch (stripeError: any) {
        console.error('⚠️ Erreur Stripe capture:', stripeError.message);
        // Continuer même si le paiement échoue
      }
    }

    // Si annulation par l'éducateur, annuler le paiement complètement
    if (cancelledBy === 'educator' && appointment.payment_status === 'authorized') {
      try {
        const paymentIntents = await stripe.paymentIntents.search({
          query: `metadata['family_id']:'${appointment.family_id}' AND metadata['appointment_date']:'${appointment.appointment_date}'`,
        });

        if (paymentIntents.data.length > 0) {
          await stripe.paymentIntents.cancel(paymentIntents.data[0].id);
          console.log('💳 Paiement annulé (éducateur a annulé)');
        }
      } catch (stripeError: any) {
        console.error('⚠️ Erreur Stripe cancel:', stripeError.message);
      }
    }

    // Mettre à jour le statut du RDV
    const { error: updateError } = await supabase
      .from('appointments')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        cancelled_by: cancelledBy,
        cancellation_fee: paymentCaptured ? amountCharged * 100 : 0, // En centimes
        payment_status: paymentCaptured ? 'partially_captured' : 'cancelled'
      })
      .eq('id', appointmentId);

    if (updateError) {
      console.error('❌ Erreur update:', updateError);
      return NextResponse.json(
        { error: 'Erreur lors de l\'annulation' },
        { status: 500 }
      );
    }

    // Envoyer emails de notification
    const formattedDate = new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(appointmentDateTime);

    // Email à la famille
    try {
      const { data: familyUser } = await supabase.auth.admin.getUserById(appointment.family.user_id);
      if (familyUser?.user?.email) {
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL!,
          to: familyUser.user.email,
          subject: '❌ Rendez-vous annulé',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #dc2626;">❌ Rendez-vous annulé</h2>

              <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>📅 Date :</strong> ${formattedDate}</p>
                <p><strong>👨‍🏫 Professionnel :</strong> ${appointment.educator.first_name} ${appointment.educator.last_name}</p>
                <p><strong>Annulé par :</strong> ${cancelledBy === 'family' ? 'Vous' : 'Le professionnel'}</p>
              </div>

              ${paymentCaptured ? `
              <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
                <p style="color: #92400e; margin: 0;"><strong>💳 Frais d'annulation :</strong> ${amountCharged.toFixed(2)}€</p>
                <p style="color: #92400e; font-size: 14px; margin: 5px 0 0;">
                  Conformément aux conditions, 50% du montant a été prélevé car l'annulation a eu lieu moins de 48h avant le rendez-vous.
                </p>
              </div>
              ` : `
              <div style="background: #d1fae5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0;">
                <p style="color: #047857; margin: 0;">✅ Aucun frais - Annulation gratuite (plus de 48h avant le RDV)</p>
              </div>
              `}

              <p style="font-size: 12px; color: #9ca3af; text-align: center; margin-top: 30px;">
                NeuroCare - Plateforme de mise en relation
              </p>
            </div>
          `
        });
      }
    } catch (emailError) {
      console.error('⚠️ Erreur email famille:', emailError);
    }

    // Email à l'éducateur
    try {
      const { data: educatorUser } = await supabase.auth.admin.getUserById(appointment.educator.user_id);
      if (educatorUser?.user?.email) {
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL!,
          to: educatorUser.user.email,
          subject: '❌ Rendez-vous annulé',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #dc2626;">❌ Rendez-vous annulé</h2>

              <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>📅 Date :</strong> ${formattedDate}</p>
                <p><strong>👨‍👩‍👦 Famille :</strong> ${appointment.family.first_name} ${appointment.family.last_name}</p>
                <p><strong>Annulé par :</strong> ${cancelledBy === 'family' ? 'La famille' : 'Vous'}</p>
              </div>

              ${paymentCaptured && cancelledBy === 'family' ? `
              <div style="background: #dbeafe; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0;">
                <p style="color: #1e40af; margin: 0;"><strong>💰 Compensation :</strong> ${(amountCharged * 0.88).toFixed(2)}€</p>
                <p style="color: #1e40af; font-size: 14px; margin: 5px 0 0;">
                  La famille a annulé moins de 48h avant. Vous recevrez 50% de la prestation (moins commission).
                </p>
              </div>
              ` : ''}

              <p style="font-size: 12px; color: #9ca3af; text-align: center; margin-top: 30px;">
                NeuroCare - Plateforme de mise en relation
              </p>
            </div>
          `
        });
      }
    } catch (emailError) {
      console.error('⚠️ Erreur email éducateur:', emailError);
    }

    return NextResponse.json({
      success: true,
      isLateCancel,
      amountCharged,
      message: isLateCancel && cancelledBy === 'family'
        ? `Rendez-vous annulé. Frais d'annulation: ${amountCharged.toFixed(2)}€`
        : 'Rendez-vous annulé sans frais'
    });

  } catch (error: any) {
    console.error('❌ Erreur annulation:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de l\'annulation' },
      { status: 500 }
    );
  }
}
