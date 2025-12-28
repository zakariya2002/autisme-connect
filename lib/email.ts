import { Resend } from 'resend';
import { getEducatorWelcomeEmail } from './email-templates/educator-welcome';
import { getFamilyWelcomeEmail } from './email-templates/family-welcome';
import { getPremiumWelcomeEmail } from './email-templates/premium-welcome';
import { getPasswordResetEmail } from './email-templates/password-reset';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEducatorWelcomeEmail(email: string, firstName: string, confirmationUrl?: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'neurocare Pro <admin@neuro-care.fr>',
      to: [email],
      subject: confirmationUrl
        ? `Confirmez votre email - Bienvenue sur neurocare Pro, ${firstName} !`
        : `Bienvenue sur neurocare Pro, ${firstName} !`,
      html: getEducatorWelcomeEmail(firstName, confirmationUrl),
    });

    if (error) {
      console.error('❌ Erreur envoi email éducateur:', error);
      return { success: false, error };
    }

    console.log('✅ Email de bienvenue éducateur envoyé à:', email);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Erreur envoi email éducateur:', error);
    return { success: false, error };
  }
}

export async function sendFamilyWelcomeEmail(email: string, firstName: string, confirmationUrl?: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'neurocare <admin@neuro-care.fr>',
      to: [email],
      subject: confirmationUrl
        ? `Confirmez votre email - Bienvenue sur neurocare, ${firstName} !`
        : `Bienvenue sur neurocare, ${firstName} !`,
      html: getFamilyWelcomeEmail(firstName, confirmationUrl),
    });

    if (error) {
      console.error('❌ Erreur envoi email famille:', error);
      return { success: false, error };
    }

    console.log('✅ Email de bienvenue famille envoyé à:', email);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Erreur envoi email famille:', error);
    return { success: false, error };
  }
}

export async function sendPremiumWelcomeEmail(email: string, firstName: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'neurocare Pro <admin@neuro-care.fr>',
      to: [email],
      subject: `🌟 Bienvenue dans la famille Premium neurocare Pro, ${firstName} !`,
      html: getPremiumWelcomeEmail(firstName),
    });

    if (error) {
      console.error('❌ Erreur envoi email Premium:', error);
      return { success: false, error };
    }

    console.log('✅ Email de bienvenue Premium envoyé à:', email);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Erreur envoi email Premium:', error);
    return { success: false, error };
  }
}

export async function sendPasswordResetEmail(email: string, firstName: string, resetUrl: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'neurocare <admin@neuro-care.fr>',
      to: [email],
      subject: `🔐 Réinitialisation de votre mot de passe neurocare`,
      html: getPasswordResetEmail(firstName, resetUrl),
    });

    if (error) {
      console.error('❌ Erreur envoi email réinitialisation:', error);
      return { success: false, error };
    }

    console.log('✅ Email de réinitialisation envoyé à:', email);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Erreur envoi email réinitialisation:', error);
    return { success: false, error };
  }
}
