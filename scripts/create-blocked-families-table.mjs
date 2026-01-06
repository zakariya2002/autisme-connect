import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ckxvyfrhxqmoxpxxaxua.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNreHZ5ZnJoeHFtb3hweHhheHVhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMjI4MjY2NiwiZXhwIjoyMDQ3ODU4NjY2fQ.YKGW8itsE7hKjJHBSjbdk0Lp-6C_S5L4h_7ob2Cv2F0';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  db: { schema: 'public' },
  auth: { persistSession: false }
});

async function createTable() {
  console.log('Creating blocked_families table...\n');

  // Execute SQL via REST API
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseServiceKey,
      'Authorization': `Bearer ${supabaseServiceKey}`,
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify({
      sql: `
        -- Table pour les familles bloquées par les éducateurs
        CREATE TABLE IF NOT EXISTS blocked_families (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          educator_id UUID NOT NULL REFERENCES educator_profiles(id) ON DELETE CASCADE,
          family_id UUID NOT NULL REFERENCES family_profiles(id) ON DELETE CASCADE,
          reason TEXT,
          blocked_at TIMESTAMPTZ DEFAULT NOW(),
          UNIQUE(educator_id, family_id)
        );

        -- Index pour les recherches rapides
        CREATE INDEX IF NOT EXISTS idx_blocked_families_educator ON blocked_families(educator_id);
        CREATE INDEX IF NOT EXISTS idx_blocked_families_family ON blocked_families(family_id);

        -- RLS Policies
        ALTER TABLE blocked_families ENABLE ROW LEVEL SECURITY;

        -- Drop existing policies if they exist
        DROP POLICY IF EXISTS "Educators can view their blocked families" ON blocked_families;
        DROP POLICY IF EXISTS "Educators can block families" ON blocked_families;
        DROP POLICY IF EXISTS "Educators can unblock families" ON blocked_families;

        -- Les éducateurs peuvent voir leurs propres blocages
        CREATE POLICY "Educators can view their blocked families"
        ON blocked_families FOR SELECT
        USING (
          educator_id IN (
            SELECT id FROM educator_profiles WHERE user_id = auth.uid()
          )
        );

        -- Les éducateurs peuvent bloquer des familles
        CREATE POLICY "Educators can block families"
        ON blocked_families FOR INSERT
        WITH CHECK (
          educator_id IN (
            SELECT id FROM educator_profiles WHERE user_id = auth.uid()
          )
        );

        -- Les éducateurs peuvent débloquer des familles
        CREATE POLICY "Educators can unblock families"
        ON blocked_families FOR DELETE
        USING (
          educator_id IN (
            SELECT id FROM educator_profiles WHERE user_id = auth.uid()
          )
        );
      `
    })
  });

  console.log('API Response status:', response.status);

  if (!response.ok) {
    const text = await response.text();
    console.log('Response:', text);
    console.log('\n⚠️ The exec_sql RPC may not exist. Trying alternative method...\n');

    // Try direct table creation via REST
    const { data, error } = await supabase
      .from('blocked_families')
      .select('id')
      .limit(1);

    if (error && error.message.includes('does not exist')) {
      console.log('❌ Table does not exist. Please create it manually in Supabase Dashboard SQL Editor.');
      console.log('\nSQL to run:');
      console.log(`
CREATE TABLE IF NOT EXISTS blocked_families (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  educator_id UUID NOT NULL REFERENCES educator_profiles(id) ON DELETE CASCADE,
  family_id UUID NOT NULL REFERENCES family_profiles(id) ON DELETE CASCADE,
  reason TEXT,
  blocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(educator_id, family_id)
);

CREATE INDEX IF NOT EXISTS idx_blocked_families_educator ON blocked_families(educator_id);
CREATE INDEX IF NOT EXISTS idx_blocked_families_family ON blocked_families(family_id);

ALTER TABLE blocked_families ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Educators can view their blocked families"
ON blocked_families FOR SELECT
USING (educator_id IN (SELECT id FROM educator_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Educators can block families"
ON blocked_families FOR INSERT
WITH CHECK (educator_id IN (SELECT id FROM educator_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Educators can unblock families"
ON blocked_families FOR DELETE
USING (educator_id IN (SELECT id FROM educator_profiles WHERE user_id = auth.uid()));
      `);
    } else if (error) {
      console.log('Error:', error.message);
    } else {
      console.log('✅ Table blocked_families already exists!');
    }
  } else {
    console.log('✅ Migration completed successfully!');
  }
}

createTable().catch(console.error);
