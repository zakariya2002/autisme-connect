import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { getEducatorWelcomeEmail } from '@/lib/email-templates/educator-welcome';
import { getFamilyWelcomeEmail } from '@/lib/email-templates/family-welcome';
import { getPremiumWelcomeEmail } from '@/lib/email-templates/premium-welcome';
import { getNewsletterWelcomeEmail } from '@/lib/email-templates/newsletter-welcome';
import { getFamilyAppointmentConfirmedEmail } from '@/lib/email-templates/family-appointment-confirmed';
import { getFamilyAppointmentCancelledEmail } from '@/lib/email-templates/family-appointment-cancelled';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email') || 'zakariyanebbache@gmail.com';

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: 'RESEND_API_KEY non configurée' }, { status: 500 });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const results: any[] = [];
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'neurocare <onboarding@resend.dev>';

  // 1. Email de bienvenue Éducateur (avec confirmation)
  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: '1️⃣ Test - Bienvenue Professionnel (avec confirmation)',
      html: getEducatorWelcomeEmail('Zakariya', 'https://www.autismeconnect.fr/auth/confirm?token=test'),
    });
    results.push({ template: 'educator-welcome', success: !error, id: data?.id, error });
  } catch (e: any) {
    results.push({ template: 'educator-welcome', success: false, error: e.message });
  }

  // Petit délai pour éviter le rate limiting
  await new Promise(resolve => setTimeout(resolve, 500));

  // 2. Email de bienvenue Famille (avec confirmation)
  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: '2️⃣ Test - Bienvenue Famille (avec confirmation)',
      html: getFamilyWelcomeEmail('Zakariya', 'https://www.autismeconnect.fr/auth/confirm?token=test'),
    });
    results.push({ template: 'family-welcome', success: !error, id: data?.id, error });
  } catch (e: any) {
    results.push({ template: 'family-welcome', success: false, error: e.message });
  }

  await new Promise(resolve => setTimeout(resolve, 500));

  // 3. Email Premium
  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: '3️⃣ Test - Bienvenue Premium',
      html: getPremiumWelcomeEmail('Zakariya'),
    });
    results.push({ template: 'premium-welcome', success: !error, id: data?.id, error });
  } catch (e: any) {
    results.push({ template: 'premium-welcome', success: false, error: e.message });
  }

  await new Promise(resolve => setTimeout(resolve, 500));

  // 4. Email Newsletter
  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: '4️⃣ Test - Bienvenue Newsletter',
      html: getNewsletterWelcomeEmail('Zakariya', 'famille'),
    });
    results.push({ template: 'newsletter-welcome', success: !error, id: data?.id, error });
  } catch (e: any) {
    results.push({ template: 'newsletter-welcome', success: false, error: e.message });
  }

  await new Promise(resolve => setTimeout(resolve, 500));

  // 5. Email RDV Confirmé
  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: '5️⃣ Test - Rendez-vous Confirmé',
      html: getFamilyAppointmentConfirmedEmail({
        firstName: 'Zakariya',
        educatorName: 'Marie Dupont',
        appointmentDate: 'Lundi 23 décembre 2025',
        appointmentTime: '14h30',
        childName: 'Lucas',
        address: '12 rue de la Paix, 75001 Paris',
      }),
    });
    results.push({ template: 'appointment-confirmed', success: !error, id: data?.id, error });
  } catch (e: any) {
    results.push({ template: 'appointment-confirmed', success: false, error: e.message });
  }

  await new Promise(resolve => setTimeout(resolve, 500));

  // 6. Email RDV Annulé
  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: '6️⃣ Test - Rendez-vous Annulé',
      html: getFamilyAppointmentCancelledEmail({
        firstName: 'Zakariya',
        educatorName: 'Marie Dupont',
        appointmentDate: 'Lundi 23 décembre 2025',
        appointmentTime: '14h30',
        reason: 'Empêchement personnel du professionnel',
        cancelledBy: 'educator',
      }),
    });
    results.push({ template: 'appointment-cancelled', success: !error, id: data?.id, error });
  } catch (e: any) {
    results.push({ template: 'appointment-cancelled', success: false, error: e.message });
  }

  const successCount = results.filter(r => r.success).length;

  return NextResponse.json({
    message: `${successCount}/${results.length} emails envoyés avec succès`,
    to: email,
    results,
  });
}
