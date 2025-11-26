const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ckxvyfrhxqmoxpxxaxua.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNreHZ5ZnJoeHFtb3hweHhheHVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5NTc2NTQsImV4cCI6MjA1MDUzMzY1NH0.fZ-z25pPL3RFQZqsNLnRZmKpgHCHu3s0I-XkM1hQmog';

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  console.log('🚀 Exécution de la migration SIRET et SAP...\n');

  try {
    // Ajouter la colonne siret
    console.log('➡️  Ajout de la colonne siret...');
    const { error: siretError } = await supabase.rpc('exec_sql', {
      sql_query: 'ALTER TABLE educator_profiles ADD COLUMN IF NOT EXISTS siret VARCHAR(14);'
    });

    if (siretError && !siretError.message.includes('already exists')) {
      throw siretError;
    }
    console.log('✅ Colonne siret ajoutée\n');

    // Ajouter la colonne sap_number
    console.log('➡️  Ajout de la colonne sap_number...');
    const { error: sapError } = await supabase.rpc('exec_sql', {
      sql_query: 'ALTER TABLE educator_profiles ADD COLUMN IF NOT EXISTS sap_number VARCHAR(50);'
    });

    if (sapError && !sapError.message.includes('already exists')) {
      throw sapError;
    }
    console.log('✅ Colonne sap_number ajoutée\n');

    console.log('🎉 Migration terminée avec succès !');
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error.message);
    process.exit(1);
  }
}

runMigration();
