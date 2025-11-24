import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { educatorId, status, rejectReason } = body;

    if (!educatorId || !status) {
      return NextResponse.json(
        { success: false, message: 'Données manquantes' },
        { status: 400 }
      );
    }

    if (status === 'rejected' && !rejectReason) {
      return NextResponse.json(
        { success: false, message: 'Raison de rejet requise' },
        { status: 400 }
      );
    }

    // Créer le client Supabase avec service role
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Récupérer le profil éducateur
    const { data: educator, error: educatorError } = await supabase
      .from('educator_profiles')
      .select('*')
      .eq('id', educatorId)
      .single();

    if (educatorError) throw educatorError;

    // Récupérer l'email de l'éducateur depuis auth.users
    const { data: userData } = await supabase.auth.admin.getUserById(educator.user_id);
    const educatorEmail = userData?.user?.email;

    // Mettre à jour le statut du diplôme
    const updateData: any = {
      diploma_verification_status: status,
      diploma_verified_at: status === 'verified' ? new Date().toISOString() : null,
      diploma_rejected_reason: status === 'rejected' ? rejectReason : null,
      dreets_verified: status === 'verified' ? true : false,
      dreets_response_date: new Date().toISOString(),
      verification_badge: status === 'verified' ? true : false // ✅ Activer automatiquement le badge
    };

    const { error: updateError } = await supabase
      .from('educator_profiles')
      .update(updateData)
      .eq('id', educatorId);

    if (updateError) throw updateError;

    // Ajouter une entrée dans l'historique
    await supabase
      .from('diploma_verification_history')
      .insert({
        educator_id: educatorId,
        action: status === 'verified' ? 'approved' : 'rejected',
        reason: status === 'rejected' ? rejectReason : 'Diplôme vérifié et approuvé par l\'administrateur',
        dreets_verification_sent: true
      });

    // Envoyer un email de notification à l'éducateur
    if (educatorEmail && process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);

      if (status === 'verified') {
        // Email d'acceptation
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || 'Autisme Connect <noreply@autismeconnect.fr>',
          to: educatorEmail,
          subject: '✅ Votre diplôme a été vérifié !',
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: white; padding: 30px; border: 1px solid #e0e0e0; }
                .button { display: inline-block; padding: 12px 24px; background: #10b981; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🎉 Félicitations !</h1>
                </div>
                <div class="content">
                  <p>Bonjour ${educator.first_name},</p>

                  <p><strong>Excellente nouvelle !</strong> Votre diplôme ME/ES a été vérifié et approuvé par notre équipe.</p>

                  <div style="background: #f0fdf4; padding: 20px; border-left: 4px solid #10b981; margin: 20px 0;">
                    <h3 style="margin-top: 0; color: #059669;">✓ Votre profil est maintenant actif</h3>
                    <p style="margin-bottom: 0;">
                      Votre profil apparaît désormais dans les résultats de recherche et les familles peuvent vous contacter directement.
                    </p>
                  </div>

                  <p><strong>Prochaines étapes :</strong></p>
                  <ul>
                    <li>Complétez votre profil pour attirer plus de familles</li>
                    <li>Ajoutez des détails sur vos spécialisations</li>
                    <li>Indiquez vos disponibilités</li>
                  </ul>

                  <div style="text-align: center;">
                    <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/educator" class="button">
                      Accéder à mon tableau de bord
                    </a>
                  </div>

                  <p style="margin-top: 30px;">
                    Merci de faire partie d'Autisme Connect !<br>
                    <strong>L'équipe Autisme Connect</strong>
                  </p>
                </div>
                <div class="footer">
                  <p>Autisme Connect - Plateforme de mise en relation familles-éducateurs</p>
                  <p>${process.env.NEXT_PUBLIC_APP_URL}</p>
                </div>
              </div>
            </body>
            </html>
          `
        });
        console.log('✅ Email d\'acceptation envoyé à:', educatorEmail);
      } else {
        // Email de rejet
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || 'Autisme Connect <noreply@autismeconnect.fr>',
          to: educatorEmail,
          subject: '❌ Problème avec votre diplôme',
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: white; padding: 30px; border: 1px solid #e0e0e0; }
                .button { display: inline-block; padding: 12px 24px; background: #3b82f6; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>⚠️ Action requise</h1>
                </div>
                <div class="content">
                  <p>Bonjour ${educator.first_name},</p>

                  <p>Nous avons examiné votre diplôme mais nous ne pouvons pas le valider pour la raison suivante :</p>

                  <div style="background: #fef2f2; padding: 20px; border-left: 4px solid #ef4444; margin: 20px 0;">
                    <p style="margin: 0; color: #991b1b;">
                      <strong>Raison :</strong> ${rejectReason}
                    </p>
                  </div>

                  <p><strong>Que faire maintenant ?</strong></p>
                  <ul>
                    <li>Vérifiez que votre diplôme est lisible et de bonne qualité</li>
                    <li>Assurez-vous qu'il s'agit bien d'un diplôme ME (Moniteur Éducateur) ou ES (Éducateur Spécialisé)</li>
                    <li>Uploadez un nouveau diplôme depuis votre tableau de bord</li>
                  </ul>

                  <div style="text-align: center;">
                    <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/educator/diploma" class="button">
                      Uploader un nouveau diplôme
                    </a>
                  </div>

                  <p style="margin-top: 30px;">
                    Si vous avez des questions, n'hésitez pas à nous contacter.<br>
                    <strong>L'équipe Autisme Connect</strong>
                  </p>
                </div>
                <div class="footer">
                  <p>Autisme Connect - Plateforme de mise en relation familles-éducateurs</p>
                  <p>${process.env.NEXT_PUBLIC_APP_URL}</p>
                </div>
              </div>
            </body>
            </html>
          `
        });
        console.log('✅ Email de rejet envoyé à:', educatorEmail);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Diplôme ${status === 'verified' ? 'accepté' : 'refusé'} avec succès`
    });

  } catch (error: any) {
    console.error('❌ Erreur API verify-diploma:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
