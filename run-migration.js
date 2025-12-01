const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Charger les variables d'environnement depuis .env.local
const envContent = fs.readFileSync('.env.local', 'utf-8');
envContent.split('\n').forEach(line => {
  const [key, ...values] = line.split('=');
  if (key && values.length > 0) {
    process.env[key.trim()] = values.join('=').trim();
  }
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkColumns() {
  console.log('🔍 Vérification des colonnes dans educator_profiles...\n');

  // Test de lecture pour vérifier si les colonnes existent
  const { data, error } = await supabase
    .from('educator_profiles')
    .select('id, first_name, profession_type, diploma_type, rpps_number')
    .limit(3);

  if (error && error.message.includes('column')) {
    console.log('⚠️  Certaines colonnes n\'existent pas encore.');
    console.log('\n📋 Exécutez ce SQL dans le Dashboard Supabase (SQL Editor):\n');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`
-- Migration: Ajout du support multi-professions
-- Note: RPPS remplace ADELI depuis fin 2024

ALTER TABLE educator_profiles
ADD COLUMN IF NOT EXISTS profession_type VARCHAR(50) DEFAULT 'educator';

ALTER TABLE educator_profiles
ADD COLUMN IF NOT EXISTS diploma_type VARCHAR(50);

ALTER TABLE educator_profiles
ADD COLUMN IF NOT EXISTS rpps_number VARCHAR(11);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_educator_profession_type ON educator_profiles(profession_type);

-- Mise à jour des profils existants
UPDATE educator_profiles SET profession_type = 'educator' WHERE profession_type IS NULL;
`);
    console.log('═══════════════════════════════════════════════════════════\n');
  } else if (error) {
    console.log('❌ Erreur:', error.message);
  } else {
    console.log('✅ Les colonnes existent dans la base de données!\n');
    console.log('Profils trouvés:');
    data.forEach(p => {
      console.log(`  - ${p.first_name}: profession_type=${p.profession_type || 'null'}, diploma_type=${p.diploma_type || 'null'}, rpps=${p.rpps_number || 'null'}`);
    });
  }
}

checkColumns();
