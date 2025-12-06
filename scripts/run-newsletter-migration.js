const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://ckxvyfrhxqmoxpxxaxua.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNreHZ5ZnJoeHFtb3hweHhheHVhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMjk3NjI0MCwiZXhwIjoyMDQ4NTUyMjQwfQ.RToZ2IndjVgYEelVHxRKVfjEdXsxfTxkxmJuJjSlNYw'
);

async function runMigration() {
  console.log('Création de la table newsletter_subscribers...');

  const { error } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS newsletter_subscribers (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        audience VARCHAR(50) DEFAULT 'general',
        source VARCHAR(100) DEFAULT 'website_footer',
        subscribed_at TIMESTAMPTZ DEFAULT NOW(),
        unsubscribed_at TIMESTAMPTZ,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `
  });

  if (error) {
    // Essayer avec une requête directe via REST
    console.log('Tentative via requête directe...');

    const response = await fetch('https://ckxvyfrhxqmoxpxxaxua.supabase.co/rest/v1/rpc/exec_sql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNreHZ5ZnJoeHFtb3hweHhheHVhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMjk3NjI0MCwiZXhwIjoyMDQ4NTUyMjQwfQ.RToZ2IndjVgYEelVHxRKVfjEdXsxfTxkxmJuJjSlNYw',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNreHZ5ZnJoeHFtb3hweHhheHVhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMjk3NjI0MCwiZXhwIjoyMDQ4NTUyMjQwfQ.RToZ2IndjVgYEelVHxRKVfjEdXsxfTxkxmJuJjSlNYw'
      },
      body: JSON.stringify({
        sql: `CREATE TABLE IF NOT EXISTS newsletter_subscribers (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          email VARCHAR(255) NOT NULL UNIQUE,
          first_name VARCHAR(100),
          last_name VARCHAR(100),
          audience VARCHAR(50) DEFAULT 'general',
          source VARCHAR(100) DEFAULT 'website_footer',
          subscribed_at TIMESTAMPTZ DEFAULT NOW(),
          unsubscribed_at TIMESTAMPTZ,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );`
      })
    });

    if (!response.ok) {
      console.log('La table devra être créée via le dashboard Supabase');
      console.log('SQL à exécuter:');
      console.log(`
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  audience VARCHAR(50) DEFAULT 'general',
  source VARCHAR(100) DEFAULT 'website_footer',
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
      `);
    }
  } else {
    console.log('Table créée avec succès!');
  }
}

runMigration().catch(console.error);
