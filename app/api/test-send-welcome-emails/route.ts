import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendEducatorWelcomeEmail, sendFamilyWelcomeEmail, sendPremiumWelcomeEmail } from '@/lib/email';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: Request) {
  try {
    const results = {
      educators: { sent: 0, failed: 0, errors: [] as string[] },
      families: { sent: 0, failed: 0, errors: [] as string[] },
      premium: { sent: 0, failed: 0, errors: [] as string[] }
    };

    // 1. Récupérer tous les éducateurs
    const { data: educators, error: educatorsError } = await supabase
      .from('educator_profiles')
      .select('id, first_name, user_id');

    if (educatorsError) {
      return NextResponse.json({ error: educatorsError.message }, { status: 500 });
    }

    // 2. Récupérer toutes les familles
    const { data: families, error: familiesError } = await supabase
      .from('family_profiles')
      .select('id, first_name, user_id');

    if (familiesError) {
      return NextResponse.json({ error: familiesError.message }, { status: 500 });
    }

    // 3. Récupérer tous les abonnements actifs
    const { data: subscriptions, error: subsError } = await supabase
      .from('subscriptions')
      .select('educator_id')
      .in('status', ['active', 'trialing']);

    if (subsError) {
      return NextResponse.json({ error: subsError.message }, { status: 500 });
    }

    const premiumEducatorIds = new Set(subscriptions?.map(s => s.educator_id) || []);

    // 4. Envoyer les emails aux éducateurs
    for (const educator of educators || []) {
      try {
        // Récupérer l'email de l'utilisateur
        const { data: userData } = await supabase.auth.admin.getUserById(educator.user_id);
        const email = userData?.user?.email;

        if (!email) {
          results.educators.failed++;
          results.educators.errors.push(`Educator ${educator.id}: no email`);
          continue;
        }

        // Vérifier si Premium
        const isPremium = premiumEducatorIds.has(educator.id);

        if (isPremium) {
          await sendPremiumWelcomeEmail(email, educator.first_name);
          results.premium.sent++;
        } else {
          await sendEducatorWelcomeEmail(email, educator.first_name);
          results.educators.sent++;
        }

        // Petit délai pour éviter de surcharger l'API
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error: any) {
        if (premiumEducatorIds.has(educator.id)) {
          results.premium.failed++;
          results.premium.errors.push(`Premium ${educator.id}: ${error.message}`);
        } else {
          results.educators.failed++;
          results.educators.errors.push(`Educator ${educator.id}: ${error.message}`);
        }
      }
    }

    // 5. Envoyer les emails aux familles
    for (const family of families || []) {
      try {
        // Récupérer l'email de l'utilisateur
        const { data: userData } = await supabase.auth.admin.getUserById(family.user_id);
        const email = userData?.user?.email;

        if (!email) {
          results.families.failed++;
          results.families.errors.push(`Family ${family.id}: no email`);
          continue;
        }

        await sendFamilyWelcomeEmail(email, family.first_name);
        results.families.sent++;

        // Petit délai pour éviter de surcharger l'API
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error: any) {
        results.families.failed++;
        results.families.errors.push(`Family ${family.id}: ${error.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      summary: {
        educators: `${results.educators.sent} envoyés, ${results.educators.failed} échecs`,
        families: `${results.families.sent} envoyés, ${results.families.failed} échecs`,
        premium: `${results.premium.sent} envoyés, ${results.premium.failed} échecs`,
      },
      details: results
    });
  } catch (error: any) {
    console.error('Erreur test-send-welcome-emails:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
