interface AppointmentConfirmedData {
  firstName: string;
  educatorName: string;
  appointmentDate: string;
  appointmentTime: string;
  childName?: string;
  address?: string;
}

export function getFamilyAppointmentConfirmedEmail(data: AppointmentConfirmedData): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rendez-vous confirmé - neurocare</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f7fa;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 30px 40px; text-align: center; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 12px 12px 0 0;">
              <div style="font-size: 48px; margin-bottom: 10px;">✅</div>
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                Rendez-vous confirmé !
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px 0; font-size: 18px; color: #333333;">
                Bonjour ${data.firstName},
              </p>

              <p style="margin: 0 0 25px 0; font-size: 16px; line-height: 1.6; color: #555555;">
                Bonne nouvelle ! Votre demande de rendez-vous a été <strong style="color: #10b981;">acceptée</strong> par le professionnel.
              </p>

              <!-- Appointment Details Box -->
              <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border: 2px solid #10b981; border-radius: 12px; padding: 25px; margin: 0 0 30px 0;">
                <h2 style="margin: 0 0 20px 0; color: #166534; font-size: 18px; font-weight: bold;">
                  📅 Détails du rendez-vous
                </h2>
                <table style="width: 100%;">
                  <tr>
                    <td style="padding: 8px 0; color: #555555; font-size: 15px;">
                      <strong>Professionnel :</strong>
                    </td>
                    <td style="padding: 8px 0; color: #333333; font-size: 15px;">
                      ${data.educatorName}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #555555; font-size: 15px;">
                      <strong>Date :</strong>
                    </td>
                    <td style="padding: 8px 0; color: #333333; font-size: 15px;">
                      ${data.appointmentDate}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #555555; font-size: 15px;">
                      <strong>Heure :</strong>
                    </td>
                    <td style="padding: 8px 0; color: #333333; font-size: 15px;">
                      ${data.appointmentTime}
                    </td>
                  </tr>
                  ${data.childName ? `
                  <tr>
                    <td style="padding: 8px 0; color: #555555; font-size: 15px;">
                      <strong>Enfant :</strong>
                    </td>
                    <td style="padding: 8px 0; color: #333333; font-size: 15px;">
                      ${data.childName}
                    </td>
                  </tr>
                  ` : ''}
                  ${data.address ? `
                  <tr>
                    <td style="padding: 8px 0; color: #555555; font-size: 15px;">
                      <strong>Lieu :</strong>
                    </td>
                    <td style="padding: 8px 0; color: #333333; font-size: 15px;">
                      ${data.address}
                    </td>
                  </tr>
                  ` : ''}
                </table>
              </div>

              <p style="margin: 0 0 25px 0; font-size: 16px; line-height: 1.6; color: #555555;">
                Vous pouvez contacter le professionnel via la messagerie si vous avez des questions avant le rendez-vous.
              </p>

              <!-- CTA Button -->
              <table role="presentation" style="margin: 0 auto;">
                <tr>
                  <td style="border-radius: 8px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                    <a href="https://www.autismeconnect.fr/dashboard/family/appointments"
                       style="display: inline-block; padding: 16px 40px; color: #ffffff; text-decoration: none; font-weight: bold; font-size: 16px;">
                      Voir mes rendez-vous
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 30px 0 0 0; font-size: 16px; color: #555555;">
                À bientôt,<br>
                L'équipe <strong>neurocare</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px; text-align: center; background-color: #f8f9fa; border-radius: 0 0 12px 12px;">
              <p style="margin: 0 0 10px 0; font-size: 14px; color: #888888;">
                Vous recevez cet email car vous avez un compte sur neurocare
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
