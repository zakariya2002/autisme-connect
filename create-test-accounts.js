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

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Liste des professionnels à créer
const professionals = [
  {
    email: 'test.educateur@autismeconnect.fr',
    profession_type: 'educator',
    first_name: 'Marie',
    last_name: 'Dupont',
    diploma_type: 'DEES',
    rpps_number: null,
  },
  {
    email: 'test.moniteur@autismeconnect.fr',
    profession_type: 'moniteur_educateur',
    first_name: 'Pierre',
    last_name: 'Martin',
    diploma_type: 'DEME',
    rpps_number: null,
  },
  {
    email: 'test.psychologue@autismeconnect.fr',
    profession_type: 'psychologist',
    first_name: 'Sophie',
    last_name: 'Bernard',
    diploma_type: 'MASTER_PSY',
    rpps_number: '10100166294',
  },
  {
    email: 'test.psychiatre@autismeconnect.fr',
    profession_type: 'psychiatrist',
    first_name: 'Lucas',
    last_name: 'Petit',
    diploma_type: 'DES_PSYCHIATRIE',
    rpps_number: '10100113965',
  },
  {
    email: 'test.pedopsychiatre@autismeconnect.fr',
    profession_type: 'child_psychiatrist',
    first_name: 'Claire',
    last_name: 'Moreau',
    diploma_type: 'DES_PSYCHIATRIE',
    rpps_number: '10003486586',
  },
  {
    email: 'test.psychomotricien@autismeconnect.fr',
    profession_type: 'psychomotricist',
    first_name: 'Thomas',
    last_name: 'Leroy',
    diploma_type: 'DE_PSYCHOMOT',
    rpps_number: '10100166294',
  },
  {
    email: 'test.ergotherapeute@autismeconnect.fr',
    profession_type: 'occupational_therapist',
    first_name: 'Julie',
    last_name: 'Dubois',
    diploma_type: 'DE_ERGO',
    rpps_number: '10100113965',
  },
  {
    email: 'test.orthophoniste@autismeconnect.fr',
    profession_type: 'speech_therapist',
    first_name: 'Emma',
    last_name: 'Laurent',
    diploma_type: 'CCO',
    rpps_number: '10003486586',
  },
  {
    email: 'test.kinesitherapeute@autismeconnect.fr',
    profession_type: 'physiotherapist',
    first_name: 'Antoine',
    last_name: 'Simon',
    diploma_type: 'DE_KINE',
    rpps_number: '10100166294',
  },
  {
    email: 'test.apa@autismeconnect.fr',
    profession_type: 'apa_teacher',
    first_name: 'Camille',
    last_name: 'Michel',
    diploma_type: 'LICENCE_STAPS_APA',
    rpps_number: null,
  },
  {
    email: 'test.musicotherapeute@autismeconnect.fr',
    profession_type: 'music_therapist',
    first_name: 'Léa',
    last_name: 'Garcia',
    diploma_type: 'DU_MUSICOTHERAPIE',
    rpps_number: null,
  },
];

async function createTestAccounts() {
  console.log('🚀 Création des comptes de test pour chaque profession...\n');

  const password = 'Test1234!'; // Mot de passe commun pour tous les comptes de test

  for (const pro of professionals) {
    console.log(`📝 Création de ${pro.first_name} ${pro.last_name} (${pro.profession_type})...`);

    try {
      // Vérifier si l'utilisateur existe déjà
      const { data: existingUsers } = await supabase.auth.admin.listUsers();
      const existingUser = existingUsers?.users?.find(u => u.email === pro.email);

      let userId;

      if (existingUser) {
        console.log(`   ⚠️ Utilisateur ${pro.email} existe déjà`);
        userId = existingUser.id;
      } else {
        // Créer l'utilisateur dans Auth
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: pro.email,
          password: password,
          email_confirm: true, // Confirmer l'email automatiquement
        });

        if (authError) {
          console.log(`   ❌ Erreur auth: ${authError.message}`);
          continue;
        }

        userId = authData.user.id;
        console.log(`   ✅ Utilisateur créé dans Auth`);
      }

      // Vérifier si le profil éducateur existe déjà
      const { data: existingProfile } = await supabase
        .from('educator_profiles')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (existingProfile) {
        // Mettre à jour le profil existant
        const { error: updateError } = await supabase
          .from('educator_profiles')
          .update({
            profession_type: pro.profession_type,
            diploma_type: pro.diploma_type,
            rpps_number: pro.rpps_number,
          })
          .eq('user_id', userId);

        if (updateError) {
          console.log(`   ❌ Erreur mise à jour profil: ${updateError.message}`);
        } else {
          console.log(`   ✅ Profil mis à jour`);
        }
      } else {
        // Créer le profil éducateur (avec uniquement les colonnes qui existent)
        const { error: profileError } = await supabase
          .from('educator_profiles')
          .insert({
            user_id: userId,
            first_name: pro.first_name,
            last_name: pro.last_name,
            profession_type: pro.profession_type,
            diploma_type: pro.diploma_type,
            rpps_number: pro.rpps_number,
            bio: `Professionnel de test - ${pro.profession_type}`,
            experience_years: 5,
            hourly_rate: 50,
            location: 'Paris, France',
            verification_status: 'pending_documents',
            profile_visible: false,
          });

        if (profileError) {
          console.log(`   ❌ Erreur profil: ${profileError.message}`);
        } else {
          console.log(`   ✅ Profil éducateur créé`);
        }
      }

      console.log('');
    } catch (error) {
      console.log(`   ❌ Erreur: ${error.message}`);
    }
  }

  console.log('\n✨ Terminé !');
  console.log('\n📋 Comptes créés (mot de passe: Test1234!) :');
  console.log('═══════════════════════════════════════════════════════════════════');
  professionals.forEach(pro => {
    const verification = pro.rpps_number ? '🔬 RPPS' : (
      ['educator', 'moniteur_educateur'].includes(pro.profession_type) ? '🏛️ DREETS' : '👤 Manuel'
    );
    console.log(`${verification} ${pro.email.padEnd(45)} → ${pro.first_name} ${pro.last_name} (${pro.profession_type})`);
  });
  console.log('═══════════════════════════════════════════════════════════════════');
}

createTestAccounts();
