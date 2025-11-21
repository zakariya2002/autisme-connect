/**
 * Service de vérification des diplômes auprès de la DREETS
 *
 * Envoie automatiquement un email à la DREETS de la région concernée
 * pour vérifier l'authenticité du diplôme d'un éducateur.
 */

// Emails des DREETS par région (à compléter selon vos besoins)
const DREETS_EMAILS: { [region: string]: string } = {
  'Île-de-France': 'dreets-idf-diplomes@travail.gouv.fr',
  'Auvergne-Rhône-Alpes': 'dreets-ara-diplomes@travail.gouv.fr',
  'Provence-Alpes-Côte d\'Azur': 'dreets-paca-diplomes@travail.gouv.fr',
  'Nouvelle-Aquitaine': 'dreets-na-diplomes@travail.gouv.fr',
  'Occitanie': 'dreets-occitanie-diplomes@travail.gouv.fr',
  'Hauts-de-France': 'dreets-hdf-diplomes@travail.gouv.fr',
  'Grand Est': 'dreets-grandest-diplomes@travail.gouv.fr',
  'Bretagne': 'dreets-bretagne-diplomes@travail.gouv.fr',
  'Pays de la Loire': 'dreets-pdl-diplomes@travail.gouv.fr',
  'Normandie': 'dreets-normandie-diplomes@travail.gouv.fr',
  'Bourgogne-Franche-Comté': 'dreets-bfc-diplomes@travail.gouv.fr',
  'Centre-Val de Loire': 'dreets-cvl-diplomes@travail.gouv.fr',
  // Email générique si région non trouvée
  'default': 'dreets-verification@travail.gouv.fr'
};

export interface DREETSVerificationRequest {
  educatorId: string;
  educatorFirstName: string;
  educatorLastName: string;
  educatorEmail: string;
  educatorPhone: string;
  diplomaUrl: string;
  diplomaNumber?: string;
  deliveryDate?: string;
  region?: string;
  ocrAnalysis?: string;
}

/**
 * Envoie une demande de vérification à la DREETS
 */
export async function sendDREETSVerificationRequest(
  request: DREETSVerificationRequest
): Promise<{ success: boolean; message: string }> {
  try {
    // Déterminer l'email DREETS selon la région
    const dreetsEmail = request.region
      ? DREETS_EMAILS[request.region] || DREETS_EMAILS['default']
      : DREETS_EMAILS['default'];

    console.log('📧 Envoi de la demande de vérification à la DREETS:', dreetsEmail);

    // TODO: Implémenter avec votre service d'email
    // Pour l'instant, on log juste les informations

    const emailData = {
      to: dreetsEmail,
      cc: process.env.ADMIN_EMAIL || 'admin@autismeconnect.fr',
      subject: `Demande de vérification de diplôme - ${request.educatorLastName} ${request.educatorFirstName}`,
      html: generateDREETSEmailTemplate(request),
      attachments: [
        {
          filename: `diplome_${request.educatorLastName}_${request.educatorFirstName}.pdf`,
          path: request.diplomaUrl
        }
      ]
    };

    console.log('📧 Email DREETS à envoyer:', emailData);

    // Exemple avec Resend (décommenter et configurer)
    /*
    import { Resend } from 'resend';
    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: 'Autisme Connect <verification@autismeconnect.fr>',
      to: dreetsEmail,
      cc: process.env.ADMIN_EMAIL,
      subject: emailData.subject,
      html: emailData.html,
      attachments: emailData.attachments
    });
    */

    // Exemple avec SendGrid (décommenter et configurer)
    /*
    import sgMail from '@sendgrid/mail';
    sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

    await sgMail.send({
      to: dreetsEmail,
      cc: process.env.ADMIN_EMAIL,
      from: 'verification@autismeconnect.fr',
      subject: emailData.subject,
      html: emailData.html,
      attachments: [{
        content: await fetchFileAsBase64(request.diplomaUrl),
        filename: emailData.attachments[0].filename,
        type: 'application/pdf',
        disposition: 'attachment'
      }]
    });
    */

    return {
      success: true,
      message: 'Demande de vérification envoyée à la DREETS'
    };

  } catch (error) {
    console.error('❌ Erreur envoi DREETS:', error);
    return {
      success: false,
      message: 'Erreur lors de l\'envoi de la demande à la DREETS'
    };
  }
}

/**
 * Génère le template HTML de l'email pour la DREETS
 */
function generateDREETSEmailTemplate(request: DREETSVerificationRequest): string {
  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 700px; margin: 0 auto; padding: 20px; }
        .header { background: #1e3a8a; color: white; padding: 20px; text-align: center; }
        .content { background: white; padding: 30px; border: 1px solid #e0e0e0; }
        .info-box { background: #f3f4f6; padding: 15px; margin: 15px 0; border-left: 4px solid #1e3a8a; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        td { padding: 10px; border-bottom: 1px solid #e0e0e0; }
        td:first-child { font-weight: bold; width: 200px; }
        .important { background: #fef3c7; padding: 15px; margin: 20px 0; border-left: 4px solid #f59e0b; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Demande de Vérification de Diplôme</h1>
          <p>Plateforme Autisme Connect</p>
        </div>

        <div class="content">
          <p>Madame, Monsieur,</p>

          <p>
            Dans le cadre de notre plateforme de mise en relation entre familles et éducateurs spécialisés,
            nous sollicitons votre expertise pour vérifier l'authenticité du diplôme d'un éducateur souhaitant
            exercer via notre service.
          </p>

          <div class="info-box">
            <h3>📋 Informations de l'éducateur</h3>
            <table>
              <tr>
                <td>Nom :</td>
                <td><strong>${request.educatorLastName}</strong></td>
              </tr>
              <tr>
                <td>Prénom :</td>
                <td><strong>${request.educatorFirstName}</strong></td>
              </tr>
              <tr>
                <td>Email :</td>
                <td>${request.educatorEmail}</td>
              </tr>
              <tr>
                <td>Téléphone :</td>
                <td>${request.educatorPhone}</td>
              </tr>
              ${request.diplomaNumber ? `
              <tr>
                <td>N° de diplôme :</td>
                <td><strong>${request.diplomaNumber}</strong></td>
              </tr>
              ` : ''}
              ${request.deliveryDate ? `
              <tr>
                <td>Date de délivrance :</td>
                <td>${request.deliveryDate}</td>
              </tr>
              ` : ''}
              ${request.region ? `
              <tr>
                <td>Région :</td>
                <td>${request.region}</td>
              </tr>
              ` : ''}
            </table>
          </div>

          ${request.ocrAnalysis ? `
          <div class="info-box">
            <h3>🔍 Analyse automatique (OCR)</h3>
            <pre style="white-space: pre-wrap; font-size: 12px; background: #f9fafb; padding: 10px; border-radius: 5px;">${request.ocrAnalysis}</pre>
          </div>
          ` : ''}

          <div class="important">
            <h3>⚠️ Document joint</h3>
            <p>
              Le diplôme est joint en pièce jointe de cet email au format PDF/Image.
              <br>
              <strong>Merci de vérifier son authenticité et de nous confirmer :</strong>
            </p>
            <ul>
              <li>✓ Le diplôme est authentique et valide</li>
              <li>✗ Le diplôme n'est pas reconnu / est invalide</li>
            </ul>
          </div>

          <h3>📞 Comment nous répondre ?</h3>
          <p>
            Merci de répondre à cet email en indiquant :
          </p>
          <ol>
            <li>La validité du diplôme (OUI / NON)</li>
            <li>Le numéro d'enregistrement si applicable</li>
            <li>Toute information complémentaire pertinente</li>
          </ol>

          <p style="margin-top: 30px;">
            Nous vous remercions par avance pour votre collaboration qui contribue à garantir
            la sécurité et la qualité des services proposés aux familles d'enfants autistes.
          </p>

          <p>
            Cordialement,<br>
            <strong>L'équipe Autisme Connect</strong>
          </p>
        </div>

        <div class="footer">
          <p>
            <strong>Autisme Connect</strong><br>
            Plateforme de mise en relation familles-éducateurs<br>
            ${process.env.NEXT_PUBLIC_APP_URL || 'https://autismeconnect.fr'}<br>
            ${process.env.ADMIN_EMAIL || 'contact@autismeconnect.fr'}
          </p>
          <p style="margin-top: 20px; font-size: 10px; color: #999;">
            Cet email est envoyé automatiquement dans le cadre de la vérification des diplômes
            des professionnels inscrits sur notre plateforme. Si vous recevez cet email par erreur,
            merci de nous en informer.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Envoie une notification à l'admin quand la DREETS répond
 */
export async function notifyAdminDREETSResponse(
  educatorName: string,
  isVerified: boolean,
  dreetsResponse: string
): Promise<void> {
  try {
    console.log('📧 Notification admin - Réponse DREETS:', {
      educator: educatorName,
      verified: isVerified
    });

    // TODO: Implémenter l'envoi d'email à l'admin
    const emailData = {
      to: process.env.ADMIN_EMAIL || 'admin@autismeconnect.fr',
      subject: `Réponse DREETS - ${educatorName}`,
      html: `
        <h2>Réponse de la DREETS reçue</h2>
        <p><strong>Éducateur:</strong> ${educatorName}</p>
        <p><strong>Résultat:</strong> ${isVerified ? '✅ Diplôme vérifié' : '❌ Diplôme non vérifié'}</p>
        <p><strong>Réponse DREETS:</strong></p>
        <pre>${dreetsResponse}</pre>
        <p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/verify-diplomas">
            Voir dans le dashboard admin
          </a>
        </p>
      `
    };

    console.log('Email admin préparé:', emailData);
  } catch (error) {
    console.error('Erreur notification admin:', error);
  }
}

/**
 * Utilitaire pour convertir un fichier en base64 (pour les pièces jointes)
 */
async function fetchFileAsBase64(url: string): Promise<string> {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// Export du service
export const dreetsService = {
  sendDREETSVerificationRequest,
  notifyAdminDREETSResponse,
  DREETS_EMAILS,
};
