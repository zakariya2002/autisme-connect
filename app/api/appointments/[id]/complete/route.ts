import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import { Resend } from 'resend';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');
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

    console.log('🏁 Complétion RDV:', appointmentId);

    // Récupérer le RDV avec toutes les infos
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .select(`
        *,
        family:family_profiles(
          id,
          first_name,
          last_name,
          user_id
        ),
        educator:educator_profiles(
          id,
          first_name,
          last_name,
          user_id
        )
      `)
      .eq('id', appointmentId)
      .single();

    if (appointmentError || !appointment) {
      console.error('❌ RDV introuvable:', appointmentError);
      return NextResponse.json(
        { error: 'Rendez-vous introuvable' },
        { status: 404 }
      );
    }

    // Vérifications de sécurité
    if (!appointment.pin_code_validated) {
      console.error('❌ Code PIN non validé');
      return NextResponse.json(
        {
          error: 'Le code PIN n\'a pas été validé',
          code: 'PIN_NOT_VALIDATED'
        },
        { status: 400 }
      );
    }

    if (appointment.status !== 'in_progress') {
      console.error('❌ Statut invalide:', appointment.status);
      return NextResponse.json(
        {
          error: 'Le rendez-vous n\'est pas en cours',
          code: 'INVALID_STATUS'
        },
        { status: 400 }
      );
    }

    const price = appointment.price || 10000; // 100€ par défaut en centimes
    const commission = Math.round(price * 0.10); // 10%
    const stripeFees = Math.round(price * 0.014 + 25); // 1.4% + 0.25€
    const educatorAmount = price - commission - stripeFees;

    console.log('💰 Montants:', {
      total: price,
      commission,
      stripeFees,
      educator: educatorAmount
    });

    // Capturer le paiement Stripe si un payment_intent_id existe
    let paymentCaptured = false;
    if (appointment.payment_intent_id) {
      try {
        console.log('💳 Capture du paiement Stripe:', appointment.payment_intent_id);

        const paymentIntent = await stripe.paymentIntents.capture(
          appointment.payment_intent_id
        );

        if (paymentIntent.status === 'succeeded') {
          paymentCaptured = true;
          console.log('✅ Paiement capturé avec succès');
        } else {
          console.error('❌ Échec capture paiement:', paymentIntent.status);
        }
      } catch (stripeError: any) {
        console.error('❌ Erreur capture Stripe:', stripeError.message);
        return NextResponse.json(
          { error: 'Erreur lors de la capture du paiement' },
          { status: 500 }
        );
      }
    } else {
      console.log('⚠️ Pas de payment_intent_id, mode test sans paiement');
    }

    // Créer ou mettre à jour la transaction
    let { data: transaction } = await supabase
      .from('transactions')
      .select('*')
      .eq('appointment_id', appointmentId)
      .single();

    if (!transaction) {
      console.log('📝 Création transaction');

      const { data: newTransaction, error: transactionError } = await supabase
        .from('transactions')
        .insert({
          appointment_id: appointmentId,
          family_id: appointment.family_id,
          educator_id: appointment.educator_id,
          amount_total: price,
          amount_educator: educatorAmount,
          amount_commission: commission,
          amount_stripe_fees: stripeFees,
          payment_intent_id: appointment.payment_intent_id,
          status: paymentCaptured ? 'captured' : 'test',
          payment_status: paymentCaptured ? 'succeeded' : 'test',
          authorized_at: new Date().toISOString(),
          captured_at: paymentCaptured ? new Date().toISOString() : null
        })
        .select()
        .single();

      if (transactionError) {
        console.error('❌ Erreur création transaction:', transactionError);
        return NextResponse.json(
          { error: 'Erreur lors de la création de la transaction' },
          { status: 500 }
        );
      }

      transaction = newTransaction;
    } else {
      // Mettre à jour la transaction existante
      const { error: updateTransactionError } = await supabase
        .from('transactions')
        .update({
          status: paymentCaptured ? 'captured' : 'test',
          payment_status: paymentCaptured ? 'succeeded' : 'test',
          captured_at: paymentCaptured ? new Date().toISOString() : null
        })
        .eq('id', transaction.id);

      if (updateTransactionError) {
        console.error('❌ Erreur update transaction:', updateTransactionError);
      }
    }

    // Mettre à jour le RDV
    const { error: updateError } = await supabase
      .from('appointments')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', appointmentId);

    if (updateError) {
      console.error('❌ Erreur update RDV:', updateError);
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour du rendez-vous' },
        { status: 500 }
      );
    }

    // Mettre à jour la réputation de l'éducateur
    const { data: reputation } = await supabase
      .from('educator_reputation')
      .select('*')
      .eq('educator_id', appointment.educator_id)
      .single();

    if (reputation) {
      const newValidated = reputation.validated_appointments + 1;
      const newTotal = reputation.total_appointments + 1;

      await supabase
        .from('educator_reputation')
        .update({
          total_appointments: newTotal,
          validated_appointments: newValidated
        })
        .eq('educator_id', appointment.educator_id);

      console.log('⭐ Réputation mise à jour:', { total: newTotal, validated: newValidated });
    }

    // Récupérer les emails
    const { data: familyUserData } = await supabase.auth.admin.getUserById(
      appointment.family.user_id
    );
    const familyEmail = familyUserData?.user?.email;

    const { data: educatorUserData } = await supabase.auth.admin.getUserById(
      appointment.educator.user_id
    );
    const educatorEmail = educatorUserData?.user?.email;

    // Envoyer les emails
    const appointmentDateTime = `${appointment.appointment_date}T${appointment.start_time}`;
    const formattedDate = new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(appointmentDateTime));

    // Email famille
    try {
      if (familyEmail) {
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL!,
          to: familyEmail,
        subject: '✅ Séance terminée - Votre reçu',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #10b981;">✅ Séance terminée !</h2>

            <p>Bonjour ${appointment.family.first_name},</p>

            <p>Votre séance du ${formattedDate} avec <strong>${appointment.educator.first_name} ${appointment.educator.last_name}</strong> est terminée.</p>

            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">💳 Récapitulatif du paiement</h3>
              <p style="margin: 5px 0;"><strong>Montant :</strong> ${(price / 100).toFixed(2)}€</p>
              <p style="margin: 5px 0;"><strong>Durée :</strong> ${appointment.duration || 60} minutes</p>
              <p style="font-size: 14px; color: #6b7280; margin: 10px 0 0 0;">
                Le paiement a été débité de votre carte bancaire.
              </p>
            </div>

            <p>Votre facture sera disponible dans quelques instants dans votre espace famille.</p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/family"
                 style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Voir mes séances
              </a>
            </div>

            <p style="font-size: 12px; color: #9ca3af; text-align: center; margin-top: 30px;">
              Autisme Connect - Plateforme de mise en relation
            </p>
          </div>
        `
        });
        console.log('✅ Email famille envoyé');
      }
    } catch (emailError) {
      console.error('⚠️ Erreur envoi email famille:', emailError);
    }

    // Email éducateur
    try {
      if (educatorEmail) {
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL!,
          to: educatorEmail,
        subject: '💰 Paiement effectué - Séance terminée',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #10b981;">💰 Paiement effectué !</h2>

            <p>Bonjour ${appointment.educator.first_name},</p>

            <p>Votre séance du ${formattedDate} avec la famille <strong>${appointment.family.first_name} ${appointment.family.last_name}</strong> est terminée et payée.</p>

            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">💵 Récapitulatif des revenus</h3>
              <p style="margin: 5px 0;"><strong>Montant séance :</strong> ${(price / 100).toFixed(2)}€</p>
              <p style="margin: 5px 0; color: #ef4444;"><strong>Commission (10%) :</strong> -${(commission / 100).toFixed(2)}€</p>
              <p style="margin: 5px 0; color: #ef4444;"><strong>Frais bancaires :</strong> -${(stripeFees / 100).toFixed(2)}€</p>
              <p style="margin: 15px 0 5px 0; font-size: 18px; color: #10b981;"><strong>Net à percevoir :</strong> ${(educatorAmount / 100).toFixed(2)}€</p>
            </div>

            <p style="font-size: 14px; color: #6b7280;">
              Le virement sera effectué sur votre compte bancaire sous 48h ouvrées.
            </p>

            <p>Votre facture sera disponible dans quelques instants dans votre espace éducateur.</p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/educator"
                 style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Voir mes revenus
              </a>
            </div>

            <p style="font-size: 12px; color: #9ca3af; text-align: center; margin-top: 30px;">
              Autisme Connect - Plateforme de mise en relation
            </p>
          </div>
        `
        });
        console.log('✅ Email éducateur envoyé');
      }
    } catch (emailError) {
      console.error('⚠️ Erreur envoi email éducateur:', emailError);
    }

    console.log('🎉 RDV complété avec succès');

    return NextResponse.json({
      success: true,
      message: 'Rendez-vous terminé et paiement effectué',
      transaction: {
        id: transaction.id,
        amount_total: price,
        amount_educator: educatorAmount,
        amount_commission: commission,
        status: 'captured'
      }
    });

  } catch (error: any) {
    console.error('❌ Erreur complétion RDV:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la complétion du rendez-vous' },
      { status: 500 }
    );
  }
}
