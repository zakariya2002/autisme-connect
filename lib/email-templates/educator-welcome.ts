export function getEducatorWelcomeEmail(firstName: string, confirmationUrl?: string): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bienvenue sur neurocare Pro</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #fdf9f4;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 20px rgba(2, 126, 126, 0.15);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 30px 40px; text-align: center; background: linear-gradient(135deg, #027e7e 0%, #05a5a5 50%, #3a9e9e 100%); border-radius: 16px 16px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold;">
                Bienvenue sur neurocare Pro !
              </h1>
              <p style="margin: 15px 0 0 0; color: #ffffff; font-size: 16px; opacity: 0.95;">
                Plateforme pour les professionnels du neuro développement
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px 0; font-size: 18px; color: #333333;">
                Bonjour ${firstName},
              </p>

              ${confirmationUrl ? `
              <!-- Email Confirmation Section -->
              <div style="background: linear-gradient(135deg, #e6f4f4 0%, #c9eaea 100%); border: 2px solid #027e7e; border-radius: 12px; padding: 25px; margin: 0 0 30px 0; text-align: center;">
                <div style="font-size: 40px; margin-bottom: 15px;">✉️</div>
                <h2 style="margin: 0 0 15px 0; color: #027e7e; font-size: 20px; font-weight: bold;">
                  Confirmez votre adresse email
                </h2>
                <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.6; color: #333333;">
                  Pour activer votre compte et accéder à toutes les fonctionnalités, veuillez confirmer votre adresse email en cliquant sur le bouton ci-dessous.
                </p>
                <table role="presentation" style="margin: 0 auto;">
                  <tr>
                    <td style="border-radius: 8px; background: linear-gradient(135deg, #027e7e 0%, #05a5a5 100%); box-shadow: 0 4px 6px rgba(2, 126, 126, 0.3);">
                      <a href="${confirmationUrl}"
                         style="display: inline-block; padding: 16px 40px; color: #ffffff; text-decoration: none; font-weight: bold; font-size: 16px;">
                        ✓ Confirmer mon email
                      </a>
                    </td>
                  </tr>
                </table>
                <p style="margin: 20px 0 0 0; font-size: 13px; color: #027e7e;">
                  Ce lien expire dans 24 heures.
                </p>
              </div>
              ` : ''}

              <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #555555;">
                Nous sommes ravis de vous accueillir en tant que <strong>professionnel</strong> sur neurocare Pro ! Vous faites maintenant partie d'une communauté dédiée à accompagner les familles et personnes avec des troubles neurodéveloppementaux.
              </p>

              <p style="margin: 0 0 30px 0; font-size: 16px; line-height: 1.6; color: #555555;">
                ${confirmationUrl ? 'Une fois votre email confirmé, votre profil sera visible par les familles. Vous pourrez' : 'Votre profil est désormais visible par les familles qui recherchent un accompagnement de qualité. Vous pouvez dès maintenant'} :
              </p>

              <div style="background-color: #e6f4f4; border-left: 4px solid #027e7e; padding: 20px; margin: 0 0 30px 0; border-radius: 0 8px 8px 0;">
                <ul style="margin: 0; padding-left: 20px;">
                  <li style="margin-bottom: 12px; color: #333333; font-size: 15px;">
                    ✅ <strong>Compléter votre profil</strong> avec vos certifications et expériences
                  </li>
                  <li style="margin-bottom: 12px; color: #333333; font-size: 15px;">
                    📅 <strong>Gérer vos disponibilités</strong> pour recevoir des demandes de rendez-vous
                  </li>
                  <li style="margin-bottom: 12px; color: #333333; font-size: 15px;">
                    💬 <strong>Échanger avec les familles</strong> via notre système de messagerie
                  </li>
                  <li style="margin-bottom: 0; color: #333333; font-size: 15px;">
                    ⭐ <strong>Passer Premium</strong> pour des réservations et conversations illimitées
                  </li>
                </ul>
              </div>

              <p style="margin: 0 0 30px 0; font-size: 16px; line-height: 1.6; color: #555555;">
                En tant que membre gratuit, vous pouvez accepter jusqu'à <strong>3 réservations par mois</strong> et gérer <strong>5 conversations actives</strong>. Passez Premium pour lever ces limites !
              </p>

              <!-- SAP Accreditation Section -->
              <div style="background: linear-gradient(135deg, #fdf9f4 0%, #f8c3cf 20%, #e6f4f4 100%); border-left: 4px solid #f0879f; padding: 25px; margin: 0 0 30px 0; border-radius: 0 12px 12px 0; border: 1px solid #f0879f; border-left-width: 4px;">
                <h3 style="margin: 0 0 15px 0; color: #d16a7f; font-size: 18px; font-weight: bold;">
                  🏅 Obtenez l'agrément Services à la Personne (SAP)
                </h3>
                <p style="margin: 0 0 15px 0; font-size: 15px; line-height: 1.6; color: #333333;">
                  Permettez à vos clients de bénéficier du <strong>CESU préfinancé</strong> et du <strong>crédit d'impôt de 50%</strong> ! L'agrément SAP est <strong style="color: #027e7e;">100% GRATUIT</strong> et vous permet d'attirer beaucoup plus de familles.
                </p>
                <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.6; color: #333333;">
                  Nous avons préparé un guide complet pour vous accompagner dans toutes les démarches.
                </p>
                <table role="presentation" style="margin: 0;">
                  <tr>
                    <td style="border-radius: 6px; background-color: #f0879f;">
                      <a href="https://neuro-care.fr/educators/sap-accreditation"
                         style="display: inline-block; padding: 12px 30px; color: #ffffff; text-decoration: none; font-weight: bold; font-size: 15px;">
                        📋 Consulter le guide SAP
                      </a>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- CTA Button -->
              <table role="presentation" style="margin: 0 auto;">
                <tr>
                  <td style="border-radius: 8px; background: linear-gradient(135deg, #027e7e 0%, #05a5a5 100%); box-shadow: 0 4px 12px rgba(2, 126, 126, 0.3);">
                    <a href="https://neuro-care.fr/dashboard/educator"
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
                L'équipe <strong style="color: #027e7e;">neurocare Pro</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px; text-align: center; background-color: #fdf9f4; border-radius: 0 0 16px 16px; border-top: 1px solid #e6f4f4;">
              <p style="margin: 0 0 10px 0; font-size: 14px; color: #666666;">
                Vous recevez cet email car vous vous êtes inscrit sur neurocare Pro
              </p>
              <p style="margin: 0; font-size: 14px; color: #888888;">
                © 2025 <span style="color: #027e7e; font-weight: 600;">neurocare</span> - Tous droits réservés
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
