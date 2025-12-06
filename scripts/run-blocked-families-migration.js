const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ckxvyfrhxqmoxpxxaxua.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNreHZ5ZnJoeHFtb3hweHhheHVhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMjI4MjY2NiwiZXhwIjoyMDQ3ODU4NjY2fQ.YKGW8itsE7hKjJHBSjbdk0Lp-6C_S5L4h_7ob2Cv2F0';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  console.log('Creating blocked_families table...\n');

  // Create the table
  const { error: tableError } = await supabase.rpc('exec', {
    query: `
      CREATE TABLE IF NOT EXISTS blocked_families (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        educator_id UUID NOT NULL REFERENCES educator_profiles(id) ON DELETE CASCADE,
        family_id UUID NOT NULL REFERENCES family_profiles(id) ON DELETE CASCADE,
        reason TEXT,
        blocked_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(educator_id, family_id)
      );
    `
  });

  if (tableError && !tableError.message.includes('already exists')) {
    console.log('Note: Using direct SQL approach...');
  }

  // Try using raw SQL via fetch
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseServiceKey,
      'Authorization': `Bearer ${supabaseServiceKey}`
    },
    body: JSON.stringify({
      query: `
        CREATE TABLE IF NOT EXISTS blocked_families (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          educator_id UUID NOT NULL REFERENCES educator_profiles(id) ON DELETE CASCADE,
          family_id UUID NOT NULL REFERENCES family_profiles(id) ON DELETE CASCADE,
          reason TEXT,
          blocked_at TIMESTAMPTZ DEFAULT NOW(),
          UNIQUE(educator_id, family_id)
        );
      `
    })
  });

  console.log('Response status:', response.status);

  // Check if table exists by trying to select from it
  const { data, error: selectError } = await supabase
    .from('blocked_families')
    .select('id')
    .limit(1);

  if (selectError) {
    console.log('Table check error:', selectError.message);
    console.log('\n⚠️  Please run the migration manually in Supabase SQL Editor:');
    console.log('File: supabase/migrations/20251206_create_blocked_families.sql');
  } else {
    console.log('✅ Table blocked_families exists and is accessible!');
  }
}

runMigration().catch(console.error);
