import { Resend } from 'resend';
import { getEducatorWelcomeEmail } from '../lib/email-templates/educator-welcome';
import { getPremiumWelcomeEmail } from '../lib/email-templates/premium-welcome';

const resend = new Resend(process.env.RESEND_API_KEY);

async function testProEmails() {
  const email = 'zakariyanebbache@gmail.com';
  const firstName = 'Zakariya';

  console.log('📧 Envoi des emails professionnels neurocare Pro...\n');

  // 1. Email de bienvenue éducateur (avec confirmation)
  console.log('1. Envoi email de bienvenue éducateur avec confirmation...');
  try {
    const { data, error } = await resend.emails.send({
      from: 'neurocare Pro <admin@neuro-care.fr>',
      to: [email],
      subject: `Confirmez votre email - Bienvenue sur neurocare Pro, ${firstName} !`,
      html: getEducatorWelcomeEmail(firstName, 'https://neuro-care.fr/auth/confirm?token=test123'),
    });
    if (error) {
      console.log('❌ Échec', error);
    } else {
      console.log('✅ Envoyé !', data);
    }
  } catch (err) {
    console.log('❌ Erreur', err);
  }

  // Attendre 1 seconde pour éviter le rate limit
  await new Promise(resolve => setTimeout(resolve, 1500));

  // 2. Email Premium
  console.log('\n2. Envoi email Premium...');
  try {
    const { data, error } = await resend.emails.send({
      from: 'neurocare Pro <admin@neuro-care.fr>',
      to: [email],
      subject: `🌟 Bienvenue dans la famille Premium neurocare Pro, ${firstName} !`,
      html: getPremiumWelcomeEmail(firstName),
    });
    if (error) {
      console.log('❌ Échec', error);
    } else {
      console.log('✅ Envoyé !', data);
    }
  } catch (err) {
    console.log('❌ Erreur', err);
  }

  console.log('\n🎉 Test terminé ! Vérifiez votre boîte mail.');
}

testProEmails().catch(console.error);
