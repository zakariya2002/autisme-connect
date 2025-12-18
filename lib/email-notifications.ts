/**
 * Système de notifications email pour la vérification des diplômes
 *
 * Ce fichier contient les fonctions pour envoyer des emails automatiques
 * aux éducateurs lors des changements de statut de leur diplôme.
 *
 * Pour utiliser ce système, vous devez :
 * 1. Choisir un service d'email (Resend, SendGrid, Mailgun, etc.)
 * 2. Configurer les variables d'environnement
 * 3. Décommenter et adapter le code ci-dessous
 */

// Type pour les statuts de diplôme
export type DiplomaStatusChange = 'submitted' | 'verified' | 'rejected';

// Interface pour les données de l'éducateur
interface EducatorEmailData {
  email: string;
  firstName: string;
  lastName: string;
  diplomaSubmittedAt?: string;
  diplomaRejectedReason?: string;
}

/**
 * Envoie un email de notification à l'éducateur
 *
 * @param educator - Données de l'éducateur
 * @param status - Nouveau statut du diplôme
 */
export async function sendDiplomaStatusEmail(
  educator: EducatorEmailData,
  status: DiplomaStatusChange
): Promise<void> {
  try {
    // TODO: Implémenter avec votre service d'email préféré

    // Exemple avec Resend (décommenter et installer: npm install resend)
    /*
    import { Resend } from 'resend';
    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: 'neurocare Pro <noreply@neuro-care.fr>',
      to: educator.email,
      subject: getEmailSubject(status),
      html: getEmailHtml(educator, status),
    });
    */

    // Exemple avec SendGrid (décommenter et installer: npm install @sendgrid/mail)
    /*
    import sgMail from '@sendgrid/mail';
    sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

    await sgMail.send({
      to: educator.email,
      from: 'noreply@neuro-care.fr',
      subject: getEmailSubject(status),
      html: getEmailHtml(educator, status),
    });
    */

    // Pour l'instant, on log juste dans la console
    console.log('📧 Email à envoyer:', {
      to: educator.email,
      subject: getEmailSubject(status),
      status
    });

  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    // Ne pas faire échouer l'opération si l'email échoue
  }
}

/**
 * Retourne le sujet de l'email selon le statut
 */
function getEmailSubject(status: DiplomaStatusChange): string {
  switch (status) {
    case 'submitted':
      return '✓ Diplôme reçu - Vérification en cours';
    case 'verified':
      return '🎉 Diplôme vérifié - Votre profil est maintenant visible !';
    case 'rejected':
      return '⚠️ Diplôme refusé - Action requise';
    default:
      return 'Mise à jour de votre statut de diplôme';
  }
}

/**
 * Génère le HTML de l'email selon le statut
 */
function getEmailHtml(educator: EducatorEmailData, status: DiplomaStatusChange): string {
  const baseStyles = `
    <style>
      body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #fdf9f4; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { background: linear-gradient(135deg, #027e7e 0%, #05a5a5 50%, #3a9e9e 100%); color: white; padding: 30px; text-align: center; border-radius: 16px 16px 0 0; }
      .content { background: white; padding: 30px; border: 1px solid #e6f4f4; border-top: none; }
      .button { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #027e7e 0%, #05a5a5 100%); color: white; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: 600; box-shadow: 0 4px 12px rgba(2, 126, 126, 0.3); }
      .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; background-color: #fdf9f4; border-radius: 0 0 16px 16px; }
      .success { color: #027e7e; font-weight: bold; }
      .warning { color: #f0879f; font-weight: bold; }
      .error { color: #d16a7f; font-weight: bold; }
      .info-box { background-color: #e6f4f4; border-left: 4px solid #027e7e; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0; }
      .warning-box { background: linear-gradient(135deg, #fdf9f4 0%, #f8c3cf 100%); border-left: 4px solid #f0879f; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0; }
    </style>
  `;

  switch (status) {
    case 'submitted':
      return `
        ${baseStyles}
        <div class="container">
          <div class="header">
            <h1>📄 Diplôme reçu !</h1>
          </div>
          <div class="content">
            <p>Bonjour ${educator.firstName},</p>
            <p>Nous avons bien reçu votre diplôme. Notre équipe va le vérifier dans les <strong>24 à 48 heures</strong>.</p>
            <div class="warning-box">
              <p class="warning">⏳ Votre profil n'est pas encore visible dans les recherches.</p>
            </div>
            <p>Vous recevrez un email dès que la vérification sera terminée.</p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/educator/diploma" class="button">Voir le statut</a>
            <p>Merci de votre patience !</p>
            <p>L'équipe <strong style="color: #027e7e;">neurocare Pro</strong></p>
          </div>
          <div class="footer">
            <p>© 2025 <span style="color: #027e7e; font-weight: 600;">neurocare Pro</span> - Plateforme de mise en relation familles-professionnels</p>
          </div>
        </div>
      `;

    case 'verified':
      return `
        ${baseStyles}
        <div class="container">
          <div class="header">
            <h1>🎉 Diplôme vérifié !</h1>
          </div>
          <div class="content">
            <p>Bonjour ${educator.firstName},</p>
            <div class="info-box">
              <p class="success">✓ Excellente nouvelle ! Votre diplôme a été vérifié avec succès.</p>
            </div>
            <p><strong>Votre profil est maintenant visible</strong> dans les résultats de recherche et les familles peuvent vous contacter.</p>
            <h3 style="color: #027e7e;">Prochaines étapes :</h3>
            <ul>
              <li>Complétez votre profil si ce n'est pas déjà fait</li>
              <li>Configurez vos disponibilités</li>
              <li>Répondez rapidement aux messages des familles</li>
            </ul>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/educator" class="button">Accéder à mon tableau de bord</a>
            <p>Bonne chance dans vos accompagnements !</p>
            <p>L'équipe <strong style="color: #027e7e;">neurocare Pro</strong></p>
          </div>
          <div class="footer">
            <p>© 2025 <span style="color: #027e7e; font-weight: 600;">neurocare Pro</span> - Plateforme de mise en relation familles-professionnels</p>
          </div>
        </div>
      `;

    case 'rejected':
      return `
        ${baseStyles}
        <div class="container">
          <div class="header">
            <h1>⚠️ Action requise</h1>
          </div>
          <div class="content">
            <p>Bonjour ${educator.firstName},</p>
            <div class="warning-box">
              <p class="error">⚠️ Votre diplôme n'a pas pu être vérifié.</p>
            </div>
            ${educator.diplomaRejectedReason ? `
              <p><strong>Raison :</strong> ${educator.diplomaRejectedReason}</p>
            ` : ''}
            <p><strong style="color: #027e7e;">Que faire maintenant ?</strong></p>
            <ul>
              <li>Vérifiez que votre document est lisible</li>
              <li>Assurez-vous qu'il s'agit bien d'un diplôme ME ou ES</li>
              <li>Uploadez à nouveau votre diplôme</li>
            </ul>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/educator/diploma" class="button">Re-soumettre mon diplôme</a>
            <p>Notre équipe reste à votre disposition si vous avez des questions.</p>
            <p>L'équipe <strong style="color: #027e7e;">neurocare Pro</strong></p>
          </div>
          <div class="footer">
            <p>© 2025 <span style="color: #027e7e; font-weight: 600;">neurocare Pro</span> - Plateforme de mise en relation familles-professionnels</p>
          </div>
        </div>
      `;

    default:
      return `<p>Mise à jour de votre statut de diplôme.</p>`;
  }
}

/**
 * Envoie une notification à l'admin quand un nouveau diplôme est soumis
 */
export async function notifyAdminNewDiploma(
  educator: EducatorEmailData
): Promise<void> {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@neuro-care.fr';

    // TODO: Implémenter avec votre service d'email
    console.log('📧 Notification admin:', {
      to: adminEmail,
      subject: '🔔 Nouveau diplôme à vérifier',
      educator: `${educator.firstName} ${educator.lastName}`
    });

    // Exemple de template pour l'admin
    /*
    const html = `
      <h2>Nouveau diplôme à vérifier</h2>
      <p><strong>Éducateur:</strong> ${educator.firstName} ${educator.lastName}</p>
      <p><strong>Email:</strong> ${educator.email}</p>
      <p><strong>Date de soumission:</strong> ${educator.diplomaSubmittedAt}</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/verify-diplomas">Vérifier maintenant</a>
    `;
    */

  } catch (error) {
    console.error('Erreur notification admin:', error);
  }
}

// Export des fonctions utilitaires
export const emailService = {
  sendDiplomaStatusEmail,
  notifyAdminNewDiploma,
};
