// Script pour exécuter la migration
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ckxvyfrhxqmoxpxxaxua.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('SUPABASE_SERVICE_ROLE_KEY is required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  console.log('Running migration: Add conversation status...');

  try {
    // Ajouter la colonne status
    const { error: error1 } = await supabase.rpc('exec_sql', {
      sql: `ALTER TABLE conversations ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected'))`
    });
    if (error1) console.log('Status column:', error1.message);
    else console.log('Status column added');

    // Ajouter la colonne request_message
    const { error: error2 } = await supabase.rpc('exec_sql', {
      sql: `ALTER TABLE conversations ADD COLUMN IF NOT EXISTS request_message TEXT`
    });
    if (error2) console.log('request_message column:', error2.message);
    else console.log('request_message column added');

    // Ajouter la colonne responded_at
    const { error: error3 } = await supabase.rpc('exec_sql', {
      sql: `ALTER TABLE conversations ADD COLUMN IF NOT EXISTS responded_at TIMESTAMPTZ`
    });
    if (error3) console.log('responded_at column:', error3.message);
    else console.log('responded_at column added');

    console.log('Migration completed!');
  } catch (error) {
    console.error('Migration error:', error);
  }
}

runMigration();
