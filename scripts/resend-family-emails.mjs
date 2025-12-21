import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Charger les variables d'environnement manuellement
const envPath = join(__dirname, '..', '.env.local');
const envContent = readFileSync(envPath, 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    envVars[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '');
  }
});

// Définir process.env
Object.assign(process.env, envVars);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const resendApiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.RESEND_FROM_EMAIL;
const appUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://neuro-care.fr';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables Supabase manquantes');
  process.exit(1);
}

if (!resendApiKey || !fromEmail) {
  console.error('❌ Variables Resend manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const resend = new Resend(resendApiKey);

async function resendFamilyEmails() {
  console.log('📧 Recherche des rendez-vous récents...\n');

  // Récupérer les rendez-vous récents (dernières 24h)
  const { data: appointments, error } = await supabase
    .from('appointments')
    .select(`
      id,
      appointment_date,
      start_time,
      end_time,
      address,
      location_type,
      pin_code,
      price,
      status,
      family_id,
      educator_id,
      created_at,
      family_profiles!inner(id, first_name, last_name, user_id),
      educator_profiles!inner(id, first_name, last_name)
    `)
    .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    .eq('status', 'accepted')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Erreur récupération RDV:', error);
    return;
  }

  if (!appointments || appointments.length === 0) {
    console.log('ℹ️ Aucun rendez-vous récent trouvé');
    return;
  }

  console.log(`📋 ${appointments.length} rendez-vous trouvés:\n`);

  for (const apt of appointments) {
    const family = apt.family_profiles;
    const educator = apt.educator_profiles;

    // Récupérer l'email de la famille
    const { data: userData } = await supabase.auth.admin.getUserById(family.user_id);
    const familyEmail = userData?.user?.email;

    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`📅 RDV: ${apt.appointment_date} à ${apt.start_time}`);
    console.log(`👨‍👩‍👦 Famille: ${family.first_name} ${family.last_name}`);
    console.log(`📧 Email: ${familyEmail || 'NON TROUVÉ'}`);
    console.log(`👨‍🏫 Pro: ${educator.first_name} ${educator.last_name}`);
    console.log(`🔐 PIN: ${apt.pin_code}`);
    console.log(`💰 Prix: ${(apt.price / 100).toFixed(2)}€`);

    if (!familyEmail) {
      console.log(`⚠️ Email non trouvé, skip`);
      continue;
    }

    // Formater la date
    const scheduledDate = new Date(`${apt.appointment_date}T${apt.start_time}`);
    const formattedDate = new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(scheduledDate);

    // Envoyer l'email
    try {
      const result = await resend.emails.send({
        from: fromEmail,
        to: familyEmail,
        subject: '✅ Rendez-vous confirmé - Votre code PIN',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #027e7e;">✅ Votre rendez-vous est confirmé !</h2>

            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>📅 Date :</strong> ${formattedDate}</p>
              <p style="margin: 5px 0;"><strong>👨‍🏫 Professionnel :</strong> ${educator.first_name} ${educator.last_name}</p>
              ${apt.address ? `<p style="margin: 5px 0;"><strong>📍 Lieu :</strong> ${apt.address}</p>` : ''}
              ${apt.location_type === 'online' ? '<p style="margin: 5px 0;"><strong>💻 Mode :</strong> En ligne</p>' : ''}
            </div>

            <div style="background: #d1fae5; border-left: 4px solid #027e7e; padding: 20px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #027e7e;">🔐 Votre code PIN</h3>
              <div style="background: white; padding: 20px; border-radius: 8px; text-align: center; margin: 15px 0;">
                <div style="font-size: 48px; font-weight: bold; letter-spacing: 10px; color: #027e7e;">
                  ${apt.pin_code}
                </div>
              </div>

              <div style="margin-top: 15px;">
                <p style="margin: 10px 0;"><strong>⚠️ IMPORTANT :</strong></p>
                <ul style="margin: 5px 0; padding-left: 20px;">
                  <li>Donnez ce code au professionnel au <strong>début du rendez-vous</strong></li>
                  <li>Ce code permet de démarrer la séance et déclencher le paiement</li>
                  <li>Ne partagez ce code avec personne d'autre</li>
                  <li>Le code expire 2h après l'heure de début prévue</li>
                </ul>
              </div>
            </div>

            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
              <p style="margin: 5px 0; color: #92400e;"><strong>💳 Conditions de paiement :</strong></p>
              <ul style="margin: 5px 0; padding-left: 20px; color: #92400e; font-size: 14px;">
                <li>Le paiement est prélevé <strong>uniquement après la réalisation</strong> du RDV</li>
                <li>Annulation gratuite jusqu'à <strong>48h avant</strong></li>
                <li>Annulation après 48h : 50% de la prestation sera débité</li>
              </ul>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${appUrl}/dashboard/family"
                 style="background: #027e7e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Voir mes rendez-vous
              </a>
            </div>

            <p style="font-size: 12px; color: #9ca3af; text-align: center; margin-top: 30px;">
              NeuroCare - Plateforme de mise en relation
            </p>
          </div>
        `
      });
      console.log(`✅ Email envoyé! ID: ${result.data?.id}`);
    } catch (emailError) {
      console.error(`❌ Erreur envoi:`, emailError);
    }
  }

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log('✅ Terminé!');
}

resendFamilyEmails();
