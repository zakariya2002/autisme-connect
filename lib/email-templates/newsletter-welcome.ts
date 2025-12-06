export function getNewsletterWelcomeEmail(firstName?: string, audience?: string): string {
  const name = firstName || 'là';
  const isFamily = audience === 'famille';
  const isPro = audience === 'pro';

  const audienceContent = isPro
    ? `En tant que professionnel, vous recevrez des informations sur les dernières pratiques, les opportunités de la plateforme, et des conseils pour développer votre activité.`
    : isFamily
      ? `En tant que parent ou aidant, vous recevrez des conseils pratiques, des ressources utiles et les dernières actualités pour accompagner au mieux votre enfant.`
      : `Vous recevrez des conseils pratiques, des ressources utiles et les dernières actualités sur l'accompagnement des troubles neurodéveloppementaux.`;

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bienvenue dans la newsletter neurocare</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f7fa;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 30px 40px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px 12px 0 0;">
              <div style="font-size: 48px; margin-bottom: 15px;">📬</div>
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                Bienvenue dans notre newsletter !
              </h1>
              <p style="margin: 15px 0 0 0; color: #ffffff; font-size: 16px; opacity: 0.95;">
                Merci de rejoindre la communauté neurocare
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px 0; font-size: 18px; color: #333333;">
                Bonjour ${name} !
              </p>

              <p style="margin: 0 0 25px 0; font-size: 16px; line-height: 1.6; color: #555555;">
                Votre inscription à notre newsletter est confirmée. Nous sommes ravis de vous compter parmi nos abonnés !
              </p>

              <!-- What to expect -->
              <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-radius: 12px; padding: 25px; margin: 0 0 30px 0;">
                <h2 style="margin: 0 0 15px 0; color: #0369a1; font-size: 18px; font-weight: bold;">
                  📮 Ce que vous allez recevoir
                </h2>
                <p style="margin: 0 0 15px 0; font-size: 15px; line-height: 1.6; color: #555555;">
                  ${audienceContent}
                </p>
                <p style="margin: 0; font-size: 14px; color: #0369a1; font-style: italic;">
                  Fréquence : 1 newsletter par mois (pas de spam, promis !)
                </p>
              </div>

              <!-- Content types -->
              <h3 style="margin: 0 0 15px 0; color: #333333; font-size: 16px;">
                Au programme de nos prochains envois :
              </h3>

              <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px; margin: 0 0 30px 0;">
                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 10px 15px 10px 0; vertical-align: top; width: 30px;">
                      <span style="font-size: 20px;">💡</span>
                    </td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0;">
                      <strong style="color: #333;">Conseils pratiques</strong>
                      <p style="margin: 5px 0 0 0; font-size: 14px; color: #666;">Astuces et stratégies pour le quotidien</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 15px 10px 0; vertical-align: top;">
                      <span style="font-size: 20px;">📚</span>
                    </td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0;">
                      <strong style="color: #333;">Ressources & outils</strong>
                      <p style="margin: 5px 0 0 0; font-size: 14px; color: #666;">Guides gratuits, fiches pratiques, liens utiles</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 15px 10px 0; vertical-align: top;">
                      <span style="font-size: 20px;">🎯</span>
                    </td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0;">
                      <strong style="color: #333;">Actualités</strong>
                      <p style="margin: 5px 0 0 0; font-size: 14px; color: #666;">Nouveautés de la plateforme et du secteur</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 15px 10px 0; vertical-align: top;">
                      <span style="font-size: 20px;">🎁</span>
                    </td>
                    <td style="padding: 10px 0;">
                      <strong style="color: #333;">Offres exclusives</strong>
                      <p style="margin: 5px 0 0 0; font-size: 14px; color: #666;">Accès en avant-première aux nouveautés</p>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- CTA Button -->
              <div style="text-align: center; margin: 0 0 30px 0;">
                <p style="margin: 0 0 15px 0; font-size: 15px; color: #555;">
                  En attendant notre prochaine newsletter, découvrez notre plateforme :
                </p>
                <table role="presentation" style="margin: 0 auto;">
                  <tr>
                    <td style="border-radius: 8px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                      <a href="https://www.neurocare.fr"
                         style="display: inline-block; padding: 14px 35px; color: #ffffff; text-decoration: none; font-weight: bold; font-size: 15px;">
                        Découvrir neurocare
                      </a>
                    </td>
                  </tr>
                </table>
              </div>

              <p style="margin: 0; font-size: 16px; color: #555555;">
                À très bientôt,<br>
                L'équipe <strong>neurocare</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 25px 30px; text-align: center; background-color: #f8f9fa; border-radius: 0 0 12px 12px;">
              <p style="margin: 0 0 10px 0; font-size: 13px; color: #888888;">
                Vous recevez cet email car vous vous êtes inscrit à la newsletter neurocare.
              </p>
              <p style="margin: 0 0 10px 0; font-size: 13px;">
                <a href="https://www.neurocare.fr/unsubscribe" style="color: #667eea; text-decoration: underline;">
                  Se désabonner
                </a>
              </p>
              <p style="margin: 0; font-size: 13px; color: #888888;">
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
