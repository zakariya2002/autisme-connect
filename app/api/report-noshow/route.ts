import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const resend = new Resend(process.env.RESEND_API_KEY);
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@autismeconnect.fr';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { appointmentId, reporterId, description } = body;

    if (!appointmentId || !reporterId) {
      return NextResponse.json(
        { error: 'Données manquantes' },
        { status: 400 }
      );
    }

    // Récupérer les informations du rendez-vous
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .select(`
        *,
        educator:educator_profiles(id, first_name, last_name, user_id, no_show_count),
        family:family_profiles(id, first_name, last_name)
      `)
      .eq('id', appointmentId)
      .single();

    if (appointmentError || !appointment) {
      return NextResponse.json(
        { error: 'Rendez-vous non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier que le signalement vient bien de la famille concernée
    if (appointment.family_id !== reporterId) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 403 }
      );
    }

    // Vérifier que le rendez-vous était accepté et la date est passée
    const appointmentDate = new Date(appointment.appointment_date + 'T' + appointment.end_time);
    if (appointment.status !== 'accepted' || appointmentDate > new Date()) {
      return NextResponse.json(
        { error: 'Ce rendez-vous ne peut pas être signalé comme no-show' },
        { status: 400 }
      );
    }

    // Créer le signalement
    const { data: report, error: reportError } = await supabase
      .from('appointment_reports')
      .insert({
        appointment_id: appointmentId,
        reporter_id: reporterId,
        educator_id: appointment.educator_id,
        report_type: 'no_show',
        description: description || 'L\'éducateur ne s\'est pas présenté au rendez-vous',
        status: 'pending'
      })
      .select()
      .single();

    if (reportError) {
      console.error('Erreur création signalement:', reportError);
      return NextResponse.json(
        { error: 'Erreur lors de la création du signalement' },
        { status: 500 }
      );
    }

    // Mettre à jour le statut du rendez-vous
    await supabase
      .from('appointments')
      .update({ status: 'no_show' })
      .eq('id', appointmentId);

    // Récupérer le nouveau compteur de no-show
    const { data: updatedEducator } = await supabase
      .from('educator_profiles')
      .select('no_show_count, suspended_until')
      .eq('id', appointment.educator_id)
      .single();

    const noShowCount = updatedEducator?.no_show_count || 0;
    const isSuspended = updatedEducator?.suspended_until && new Date(updatedEducator.suspended_until) > new Date();

    // Envoyer un email à l'admin
    try {
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'Autisme Connect <noreply@autismeconnect.fr>',
        to: ADMIN_EMAIL,
        subject: `🚨 Signalement No-Show - ${appointment.educator.first_name} ${appointment.educator.last_name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc2626;">🚨 Nouveau signalement de No-Show</h2>

            <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin: 16px 0;">
              <h3 style="margin: 0 0 8px 0; color: #991b1b;">Éducateur concerné</h3>
              <p style="margin: 4px 0;"><strong>Nom:</strong> ${appointment.educator.first_name} ${appointment.educator.last_name}</p>
              <p style="margin: 4px 0;"><strong>ID:</strong> ${appointment.educator.id}</p>
              <p style="margin: 4px 0;"><strong>Nombre de no-shows:</strong> <span style="color: #dc2626; font-weight: bold;">${noShowCount}</span></p>
              ${isSuspended ? `<p style="margin: 4px 0; color: #dc2626; font-weight: bold;">⚠️ SUSPENDU jusqu'au ${new Date(updatedEducator.suspended_until).toLocaleDateString('fr-FR')}</p>` : ''}
            </div>

            <div style="background: #f3f4f6; border-radius: 8px; padding: 16px; margin: 16px 0;">
              <h3 style="margin: 0 0 8px 0;">Détails du rendez-vous</h3>
              <p style="margin: 4px 0;"><strong>Date:</strong> ${new Date(appointment.appointment_date).toLocaleDateString('fr-FR')}</p>
              <p style="margin: 4px 0;"><strong>Horaire:</strong> ${appointment.start_time} - ${appointment.end_time}</p>
              <p style="margin: 4px 0;"><strong>Famille:</strong> ${appointment.family.first_name} ${appointment.family.last_name}</p>
              ${appointment.address ? `<p style="margin: 4px 0;"><strong>Adresse:</strong> ${appointment.address}</p>` : ''}
            </div>

            ${description ? `
            <div style="background: #fff7ed; border: 1px solid #fed7aa; border-radius: 8px; padding: 16px; margin: 16px 0;">
              <h3 style="margin: 0 0 8px 0; color: #9a3412;">Commentaire de la famille</h3>
              <p style="margin: 0; font-style: italic;">"${description}"</p>
            </div>
            ` : ''}

            <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px;">
                Ce signalement nécessite votre attention. Connectez-vous au panneau d'administration pour le traiter.
              </p>
            </div>
          </div>
        `
      });
    } catch (emailError) {
      console.error('Erreur envoi email admin:', emailError);
      // On continue même si l'email échoue
    }

    return NextResponse.json({
      success: true,
      message: isSuspended
        ? 'Signalement enregistré. L\'éducateur a été suspendu temporairement.'
        : 'Signalement enregistré. L\'administration va traiter votre demande.',
      noShowCount,
      isSuspended
    });

  } catch (error: any) {
    console.error('Erreur API report-noshow:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
