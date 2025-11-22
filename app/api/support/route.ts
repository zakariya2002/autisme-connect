import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Vérifier l'authentification
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const { subject, message } = await request.json();

    if (!subject || !message) {
      return NextResponse.json(
        { error: 'Sujet et message requis' },
        { status: 400 }
      );
    }

    // Récupérer les informations de l'utilisateur
    const userEmail = session.user.email;
    const userId = session.user.id;
    const userName = session.user.user_metadata?.first_name
      ? `${session.user.user_metadata.first_name} ${session.user.user_metadata.last_name || ''}`
      : 'Utilisateur';
    const userRole = session.user.user_metadata?.role || 'Non spécifié';

    // Envoyer l'email via Resend
    const emailData = await resend.emails.send({
      from: 'Support Autisme Connect <noreply@autismeconnect.fr>',
      to: ['admin@autismeconnect.fr'],
      replyTo: userEmail,
      subject: `[Support] ${subject}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
                color: white;
                padding: 30px 20px;
                border-radius: 10px 10px 0 0;
                text-align: center;
              }
              .header h1 {
                margin: 0;
                font-size: 24px;
              }
              .content {
                background: #f9fafb;
                padding: 30px;
                border: 1px solid #e5e7eb;
                border-top: none;
                border-radius: 0 0 10px 10px;
              }
              .info-box {
                background: white;
                border-left: 4px solid #3b82f6;
                padding: 15px;
                margin: 20px 0;
                border-radius: 4px;
              }
              .info-box strong {
                color: #1f2937;
              }
              .message-box {
                background: white;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
                border: 1px solid #e5e7eb;
              }
              .footer {
                text-align: center;
                color: #6b7280;
                font-size: 12px;
                margin-top: 20px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
              }
              .label {
                display: inline-block;
                background: #dbeafe;
                color: #1e40af;
                padding: 4px 12px;
                border-radius: 12px;
                font-size: 12px;
                font-weight: 600;
                margin-bottom: 8px;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>📧 Nouvelle demande de support</h1>
            </div>
            <div class="content">
              <div class="info-box">
                <p><strong>De :</strong> ${userName} (${userEmail})</p>
                <p><strong>Type de compte :</strong> <span class="label">${userRole === 'educator' ? 'Éducateur' : 'Famille'}</span></p>
                <p><strong>ID utilisateur :</strong> ${userId}</p>
                <p><strong>Date :</strong> ${new Date().toLocaleString('fr-FR', {
                  dateStyle: 'full',
                  timeStyle: 'short'
                })}</p>
              </div>

              <h2 style="color: #1f2937; margin-top: 30px;">Sujet :</h2>
              <p style="font-size: 18px; font-weight: 600; color: #3b82f6;">${subject}</p>

              <h2 style="color: #1f2937; margin-top: 30px;">Message :</h2>
              <div class="message-box">
                ${message.replace(/\n/g, '<br>')}
              </div>

              <div style="margin-top: 30px; padding: 15px; background: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
                <p style="margin: 0; color: #92400e;">
                  <strong>💡 Conseil :</strong> Répondez directement à cet email pour contacter ${userName}.
                </p>
              </div>
            </div>
            <div class="footer">
              <p>Autisme Connect - Centre d'Assistance</p>
              <p>Cet email a été envoyé automatiquement depuis le formulaire de support.</p>
            </div>
          </body>
        </html>
      `,
    });

    // Optionnel : Enregistrer la demande dans Supabase
    await supabase.from('support_tickets').insert({
      user_id: userId,
      subject,
      message,
      email: userEmail,
      status: 'pending',
      created_at: new Date().toISOString()
    });

    return NextResponse.json(
      { success: true, messageId: emailData.data?.id },
      { status: 200 }
    );

  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi du message' },
      { status: 500 }
    );
  }
}
