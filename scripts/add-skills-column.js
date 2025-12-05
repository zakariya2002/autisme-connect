// Script pour ajouter la colonne skills à educator_profiles
// Usage: node scripts/add-skills-column.js

const { createClient } = require('@supabase/supabase-js');

// Utiliser les vraies valeurs du .env.local
const supabaseUrl = 'https://ghfymwjclzacriswqxme.supabase.co';
const supabaseServiceKey = 'sb_secret_MumEttAtfQBVqhs17vqFbw_xBp-hB7F';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addSkillsColumn() {
  console.log('🚀 Ajout de la colonne skills...');

  try {
    // Tester d'abord si la colonne existe déjà
    const { data: testData, error: testError } = await supabase
      .from('educator_profiles')
      .select('skills')
      .limit(1);

    if (!testError) {
      console.log('✅ La colonne skills existe déjà!');
      return;
    }

    console.log('La colonne n\'existe pas encore, ajout en cours...');
    console.log('\n📋 IMPORTANT: Exécute cette requête dans Supabase Dashboard > SQL Editor:');
    console.log('\n----------------------------------------');
    console.log('ALTER TABLE educator_profiles');
    console.log('ADD COLUMN IF NOT EXISTS skills TEXT;');
    console.log('----------------------------------------\n');
    console.log('URL du dashboard: https://supabase.com/dashboard/project/ghfymwjclzacriswqxme/sql');

  } catch (err) {
    console.error('Erreur:', err.message);
  }
}

addSkillsColumn();
