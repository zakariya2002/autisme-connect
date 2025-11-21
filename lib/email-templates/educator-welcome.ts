export function getEducatorWelcomeEmail(firstName: string): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bienvenue sur Autisme Connect</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f7fa;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 30px 40px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold;">
                Bienvenue sur Autisme Connect !
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px 0; font-size: 18px; color: #333333;">
                Bonjour ${firstName},
              </p>

              <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #555555;">
                Nous sommes ravis de vous accueillir en tant qu'<strong>éducateur spécialisé</strong> sur Autisme Connect ! Vous faites maintenant partie d'une communauté dédiée à accompagner les familles d'enfants autistes.
              </p>

              <p style="margin: 0 0 30px 0; font-size: 16px; line-height: 1.6; color: #555555;">
                Votre profil est désormais visible par les familles qui recherchent un accompagnement de qualité. Vous pouvez dès maintenant :
              </p>

              <div style="background-color: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; margin: 0 0 30px 0; border-radius: 4px;">
                <ul style="margin: 0; padding-left: 20px;">
                  <li style="margin-bottom: 12px; color: #555555; font-size: 15px;">
                    ✅ <strong>Compléter votre profil</strong> avec vos certifications et expériences
                  </li>
                  <li style="margin-bottom: 12px; color: #555555; font-size: 15px;">
                    📅 <strong>Gérer vos disponibilités</strong> pour recevoir des demandes de rendez-vous
                  </li>
                  <li style="margin-bottom: 12px; color: #555555; font-size: 15px;">
                    💬 <strong>Échanger avec les familles</strong> via notre système de messagerie
                  </li>
                  <li style="margin-bottom: 0; color: #555555; font-size: 15px;">
                    ⭐ <strong>Passer Premium</strong> pour des réservations et conversations illimitées
                  </li>
                </ul>
              </div>

              <p style="margin: 0 0 30px 0; font-size: 16px; line-height: 1.6; color: #555555;">
                En tant que membre gratuit, vous pouvez accepter jusqu'à <strong>3 réservations par mois</strong> et gérer <strong>5 conversations actives</strong>. Passez Premium pour lever ces limites !
              </p>

              <!-- CTA Button -->
              <table role="presentation" style="margin: 0 auto;">
                <tr>
                  <td style="border-radius: 8px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                    <a href="https://www.autismeconnect.fr/dashboard/educator"
                       style="display: inline-block; padding: 16px 40px; color: #ffffff; text-decoration: none; font-weight: bold; font-size: 16px;">
                      Accéder à mon tableau de bord
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 30px 0 0 0; font-size: 16px; line-height: 1.6; color: #555555;">
                Merci de votre confiance et à très bientôt sur la plateforme !
              </p>

              <p style="margin: 20px 0 0 0; font-size: 16px; color: #555555;">
                L'équipe <strong>Autisme Connect</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px; text-align: center; background-color: #f8f9fa; border-radius: 0 0 12px 12px;">
              <p style="margin: 0 0 10px 0; font-size: 14px; color: #888888;">
                Vous recevez cet email car vous vous êtes inscrit sur Autisme Connect
              </p>
              <p style="margin: 0; font-size: 14px; color: #888888;">
                © 2025 Autisme Connect - Tous droits réservés
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}
