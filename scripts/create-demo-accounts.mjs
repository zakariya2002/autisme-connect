import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ghfymwjclzacriswqxme.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdoZnltd2pjbHphY3Jpc3dxeG1lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzM3NDYzOSwiZXhwIjoyMDc4OTUwNjM5fQ.EMVS9n3JvuqSVJhEiaEx3Hou8ePc46YQRCHM4lcEfAQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createDemoAccounts() {
  console.log('=== Création des comptes démo pour Apple Review ===\n');

  // 1. Créer le compte professionnel (éducateur)
  console.log('1. Création du compte PROFESSIONNEL...');

  const proEmail = 'demo-pro@neuro-care.fr';
  const proPassword = 'DemoNeuro2024!';

  // Vérifier si le compte existe déjà
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const existingPro = existingUsers?.users?.find(u => u.email === proEmail);

  if (existingPro) {
    console.log('   ⚠️  Le compte pro existe déjà, suppression...');
    await supabase.auth.admin.deleteUser(existingPro.id);
    await supabase.from('educator_profiles').delete().eq('user_id', existingPro.id);
  }

  // Créer l'utilisateur pro avec confirmation automatique
  const { data: proUser, error: proError } = await supabase.auth.admin.createUser({
    email: proEmail,
    password: proPassword,
    email_confirm: true, // Auto-confirme l'email
    user_metadata: { role: 'educator' }
  });

  if (proError) {
    console.error('   ❌ Erreur création compte pro:', proError.message);
    return;
  }

  console.log('   ✅ Utilisateur pro créé:', proUser.user.id);

  // Créer le profil éducateur
  const { error: proProfileError } = await supabase
    .from('educator_profiles')
    .insert({
      user_id: proUser.user.id,
      first_name: 'Marie',
      last_name: 'Dupont',
      bio: 'Éducatrice spécialisée avec 10 ans d\'expérience dans l\'accompagnement des personnes avec troubles du neurodéveloppement. Formée aux méthodes ABA et TEACCH.',
      phone: '0612345678',
      location: 'Paris, France',
      years_of_experience: 10,
      hourly_rate: 50,
      specializations: ['TSA', 'TDAH', 'DYS'],
      languages: ['Français', 'Anglais'],
      profession_type: 'educator',
      siret: '12345678901234'
    });

  if (proProfileError) {
    console.error('   ❌ Erreur création profil pro:', proProfileError.message);
  } else {
    console.log('   ✅ Profil éducateur créé');
  }

  // 2. Créer le compte famille (aidant)
  console.log('\n2. Création du compte FAMILLE (aidant)...');

  const familyEmail = 'demo-famille@neuro-care.fr';
  const familyPassword = 'DemoNeuro2024!';

  const existingFamily = existingUsers?.users?.find(u => u.email === familyEmail);

  if (existingFamily) {
    console.log('   ⚠️  Le compte famille existe déjà, suppression...');
    await supabase.auth.admin.deleteUser(existingFamily.id);
    await supabase.from('family_profiles').delete().eq('user_id', existingFamily.id);
  }

  // Créer l'utilisateur famille avec confirmation automatique
  const { data: familyUser, error: familyError } = await supabase.auth.admin.createUser({
    email: familyEmail,
    password: familyPassword,
    email_confirm: true,
    user_metadata: { role: 'family' }
  });

  if (familyError) {
    console.error('   ❌ Erreur création compte famille:', familyError.message);
    return;
  }

  console.log('   ✅ Utilisateur famille créé:', familyUser.user.id);

  // Créer le profil famille
  const { error: familyProfileError } = await supabase
    .from('family_profiles')
    .insert({
      user_id: familyUser.user.id,
      first_name: 'Jean',
      last_name: 'Martin',
      phone: '0698765432',
      location: 'Lyon, France',
      relationship: 'parent',
      person_with_autism_age: 8,
      support_level_needed: 'level_2',
      specific_needs: ['Aide aux devoirs', 'Activités sociales'],
      preferred_certifications: []
    });

  if (familyProfileError) {
    console.error('   ❌ Erreur création profil famille:', familyProfileError.message);
  } else {
    console.log('   ✅ Profil famille créé');
  }

  // Résumé
  console.log('\n=== COMPTES CRÉÉS AVEC SUCCÈS ===\n');
  console.log('📱 COMPTE PROFESSIONNEL (pour tester l\'espace pro):');
  console.log('   Email: ' + proEmail);
  console.log('   Mot de passe: ' + proPassword);
  console.log('');
  console.log('👨‍👩‍👧 COMPTE FAMILLE (pour tester l\'espace aidant):');
  console.log('   Email: ' + familyEmail);
  console.log('   Mot de passe: ' + familyPassword);
  console.log('');
  console.log('Ces comptes sont confirmés et prêts à être utilisés par Apple Review.');
}

createDemoAccounts().catch(console.error);
