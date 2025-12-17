import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Vérifier si RESEND_API_KEY est configurée
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({
        error: 'RESEND_API_KEY non configurée',
        message: 'Ajoutez RESEND_API_KEY dans votre fichier .env.local',
        guide: 'Voir RESEND_SETUP.md pour les instructions complètes'
      }, { status: 500 });
    }

    // Import dynamique de Resend
    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);

    // Envoyer un email de test
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'neurocare <onboarding@resend.dev>',
      to: process.env.ADMIN_EMAIL || 'test@example.com',
      subject: '✅ Test Resend - neurocare',
      html: `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #fdf9f4; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #027e7e 0%, #05a5a5 50%, #3a9e9e 100%); color: white; padding: 30px; text-align: center; border-radius: 16px 16px 0 0; }
            .content { background: white; padding: 30px; border: 1px solid #e6f4f4; }
            .success { background: linear-gradient(135deg, #e6f4f4 0%, #c9eaea 100%); border-left: 4px solid #027e7e; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0; }
            .info-box { background-color: #fdf9f4; padding: 15px; margin: 15px 0; border-radius: 8px; border: 1px solid #e6f4f4; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; background-color: #fdf9f4; border-radius: 0 0 16px 16px; }
            .check-icon { color: #027e7e; margin-right: 8px; }
            h1 { margin: 0; }
            h3 { color: #027e7e; margin-top: 24px; }
            ul { padding-left: 20px; }
            li { margin-bottom: 8px; }
            code { background-color: #e6f4f4; padding: 2px 6px; border-radius: 4px; font-size: 13px; }
            strong { color: #027e7e; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Resend fonctionne !</h1>
            </div>
            <div class="content">
              <div class="success">
                <strong>🎉 Félicitations !</strong> Votre configuration Resend est opérationnelle.
              </div>

              <p>Ceci est un email de test depuis <strong>neurocare</strong>.</p>

              <p>Si vous recevez cet email, cela signifie que :</p>
              <ul>
                <li><span class="check-icon">✅</span> Votre clé API Resend est correcte</li>
                <li><span class="check-icon">✅</span> Les variables d'environnement sont bien configurées</li>
                <li><span class="check-icon">✅</span> L'envoi d'emails fonctionne parfaitement</li>
              </ul>

              <div class="info-box">
                <h3 style="margin-top: 0;">📧 Informations de Configuration</h3>
                <p><strong>From:</strong> ${process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'}</p>
                <p><strong>To:</strong> ${process.env.ADMIN_EMAIL || 'test@example.com'}</p>
                <p><strong>Date:</strong> ${new Date().toLocaleString('fr-FR', {
                  timeZone: 'Europe/Paris',
                  dateStyle: 'full',
                  timeStyle: 'long'
                })}</p>
              </div>

              <h3>🚀 Prochaines Étapes</h3>
              <ol>
                <li>Vérifiez que cet email n'est <strong>pas en spam</strong></li>
                <li>Si tout est ok, vous pouvez supprimer l'API de test : <code>/api/test-resend</code></li>
                <li>Les emails de vérification DREETS sont prêts à être envoyés !</li>
              </ol>

              <p style="margin-top: 30px; color: #666;">
                Pour plus d'informations, consultez la documentation :
                <strong style="color: #027e7e;">RESEND_SETUP.md</strong>
              </p>
            </div>
            <div class="footer">
              <p>
                <strong style="color: #027e7e;">neurocare</strong><br>
                Plateforme de mise en relation familles-professionnels<br>
                ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    });

    if (error) {
      return NextResponse.json({
        error: 'Erreur lors de l\'envoi',
        details: error
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: '✅ Email envoyé avec succès !',
      emailId: data?.id,
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: process.env.ADMIN_EMAIL || 'test@example.com',
      timestamp: new Date().toISOString(),
      instructions: [
        '1. Vérifiez votre boîte email',
        '2. Assurez-vous que l\'email n\'est pas en spam',
        '3. Si reçu, Resend est prêt à être utilisé !',
        '4. Vous pouvez supprimer cette API de test'
      ]
    });

  } catch (error: any) {
    console.error('❌ Erreur test Resend:', error);

    return NextResponse.json({
      error: 'Exception lors du test',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      help: 'Vérifiez que resend est bien installé (npm install resend) et que RESEND_API_KEY est configurée'
    }, { status: 500 });
  }
}
