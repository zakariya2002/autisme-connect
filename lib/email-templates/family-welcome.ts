export function getFamilyWelcomeEmail(firstName: string, confirmationUrl?: string): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bienvenue sur neurocare</title>
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
                Bienvenue sur neurocare !
              </h1>
              <p style="margin: 15px 0 0 0; color: #ffffff; font-size: 18px; opacity: 0.95;">
                Nous sommes là pour vous accompagner
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
              <div style="background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 50%, #ddd6fe 100%); border: 2px solid #7c3aed; border-radius: 12px; padding: 25px; margin: 0 0 30px 0; text-align: center;">
                <div style="font-size: 40px; margin-bottom: 15px;">✉️</div>
                <h2 style="margin: 0 0 15px 0; color: #5b21b6; font-size: 20px; font-weight: bold;">
                  Confirmez votre adresse email
                </h2>
                <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.6; color: #4c1d95;">
                  Pour activer votre compte et accéder à toutes les fonctionnalités, veuillez confirmer votre adresse email en cliquant sur le bouton ci-dessous.
                </p>
                <table role="presentation" style="margin: 0 auto;">
                  <tr>
                    <td style="border-radius: 8px; background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%); box-shadow: 0 4px 6px rgba(124, 58, 237, 0.3);">
                      <a href="${confirmationUrl}"
                         style="display: inline-block; padding: 16px 40px; color: #ffffff; text-decoration: none; font-weight: bold; font-size: 16px;">
                        ✓ Confirmer mon email
                      </a>
                    </td>
                  </tr>
                </table>
                <p style="margin: 20px 0 0 0; font-size: 13px; color: #5b21b6;">
                  Ce lien expire dans 24 heures.
                </p>
              </div>
              ` : ''}

              <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #555555;">
                Nous sommes ravis de vous accueillir sur <strong>neurocare</strong>, la plateforme qui met en relation les familles et les professionnels spécialisés dans les troubles neurodéveloppementaux.
              </p>

              <p style="margin: 0 0 30px 0; font-size: 16px; line-height: 1.6; color: #555555;">
                ${confirmationUrl ? 'Une fois votre email confirmé, vous pourrez' : 'Votre compte est désormais actif et <strong>entièrement gratuit</strong>. Vous pouvez dès maintenant'} accéder à toutes nos fonctionnalités :
              </p>

              <div style="background-color: #f0fdf4; border-left: 4px solid #48bb78; padding: 20px; margin: 0 0 30px 0; border-radius: 4px;">
                <ul style="margin: 0; padding-left: 20px;">
                  <li style="margin-bottom: 12px; color: #555555; font-size: 15px;">
                    🔍 <strong>Rechercher des éducateurs</strong> près de chez vous
                  </li>
                  <li style="margin-bottom: 12px; color: #555555; font-size: 15px;">
                    📅 <strong>Prendre rendez-vous</strong> directement en ligne
                  </li>
                  <li style="margin-bottom: 12px; color: #555555; font-size: 15px;">
                    💬 <strong>Échanger avec les éducateurs</strong> via notre messagerie sécurisée
                  </li>
                  <li style="margin-bottom: 0; color: #555555; font-size: 15px;">
                    ⭐ <strong>Consulter les avis</strong> et choisir le meilleur accompagnement
                  </li>
                </ul>
              </div>

              <p style="margin: 0 0 30px 0; font-size: 16px; line-height: 1.6; color: #555555;">
                Notre mission est de vous offrir un accès simplifié à des professionnels qualifiés pour accompagner votre enfant dans son développement.
              </p>

              <!-- CTA Button -->
              <table role="presentation" style="margin: 0 auto;">
                <tr>
                  <td style="border-radius: 8px; background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);">
                    <a href="https://www.autismeconnect.fr/search"
                       style="display: inline-block; padding: 16px 40px; color: #ffffff; text-decoration: none; font-weight: bold; font-size: 16px;">
                      Trouver un professionnel
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 30px 0 20px 0; font-size: 16px; line-height: 1.6; color: #555555;">
                Nous sommes ravis de faire partie de votre parcours. N'hésitez pas à nous contacter si vous avez la moindre question !
              </p>

              <p style="margin: 0; font-size: 16px; color: #555555;">
                Avec tout notre soutien,<br>
                L'équipe <strong>neurocare</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px; text-align: center; background-color: #f8f9fa; border-radius: 0 0 12px 12px;">
              <p style="margin: 0 0 10px 0; font-size: 14px; color: #888888;">
                Vous recevez cet email car vous vous êtes inscrit sur neurocare
              </p>
              <p style="margin: 0; font-size: 14px; color: #888888;">
                © 2025 neurocare - Tous droits réservés
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
