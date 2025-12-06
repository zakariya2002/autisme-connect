// Test de l'API Brevo
// Usage: BREVO_API_KEY=your_key node scripts/test-brevo.js
const BREVO_API_KEY = process.env.BREVO_API_KEY;

if (!BREVO_API_KEY) {
  console.error('❌ BREVO_API_KEY manquant. Usage: BREVO_API_KEY=your_key node scripts/test-brevo.js');
  process.exit(1);
}

async function testBrevo() {
  console.log('Test de connexion à Brevo...\n');

  // 1. Vérifier le compte
  try {
    const accountResponse = await fetch('https://api.brevo.com/v3/account', {
      headers: {
        'Accept': 'application/json',
        'api-key': BREVO_API_KEY
      }
    });

    if (accountResponse.ok) {
      const account = await accountResponse.json();
      console.log('✅ Connexion Brevo OK');
      console.log(`   Email: ${account.email}`);
      console.log(`   Plan: ${account.plan[0]?.type || 'Free'}`);
      console.log(`   Crédits: ${account.plan[0]?.credits || 'N/A'}\n`);
    } else {
      console.log('❌ Erreur connexion:', await accountResponse.text());
      return;
    }
  } catch (error) {
    console.log('❌ Erreur:', error.message);
    return;
  }

  // 2. Lister les listes de contacts
  try {
    const listsResponse = await fetch('https://api.brevo.com/v3/contacts/lists', {
      headers: {
        'Accept': 'application/json',
        'api-key': BREVO_API_KEY
      }
    });

    if (listsResponse.ok) {
      const lists = await listsResponse.json();
      console.log('📋 Listes de contacts:');
      if (lists.lists && lists.lists.length > 0) {
        lists.lists.forEach(list => {
          console.log(`   - ID ${list.id}: ${list.name} (${list.totalSubscribers} abonnés)`);
        });
      } else {
        console.log('   Aucune liste trouvée. Création des listes...');
        await createLists();
      }
    }
  } catch (error) {
    console.log('❌ Erreur listes:', error.message);
  }

  // 3. Test d'ajout d'un contact
  console.log('\n📧 Test d\'ajout d\'un contact...');
  try {
    const testContact = {
      email: 'test-newsletter@neurocare.fr',
      attributes: {
        PRENOM: 'Test',
        NOM: 'Newsletter',
        AUDIENCE: 'test',
        SOURCE: 'script_test',
        DATE_INSCRIPTION: new Date().toISOString().split('T')[0]
      },
      updateEnabled: true
    };

    const addResponse = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY
      },
      body: JSON.stringify(testContact)
    });

    const result = await addResponse.json();
    if (addResponse.ok || result.code === 'duplicate_parameter') {
      console.log('✅ Contact test ajouté/existant');
    } else {
      console.log('⚠️  Réponse:', result);
    }
  } catch (error) {
    console.log('❌ Erreur ajout contact:', error.message);
  }

  console.log('\n✅ Test Brevo terminé!');
}

async function createLists() {
  const listsToCreate = [
    { name: 'Familles & Aidants', folderId: 1 },
    { name: 'Professionnels', folderId: 1 },
    { name: 'Newsletter Générale', folderId: 1 }
  ];

  for (const list of listsToCreate) {
    try {
      const response = await fetch('https://api.brevo.com/v3/contacts/lists', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'api-key': BREVO_API_KEY
        },
        body: JSON.stringify(list)
      });

      const result = await response.json();
      if (response.ok) {
        console.log(`   ✅ Liste créée: ${list.name} (ID: ${result.id})`);
      } else {
        console.log(`   ⚠️  ${list.name}: ${result.message || JSON.stringify(result)}`);
      }
    } catch (error) {
      console.log(`   ❌ Erreur création ${list.name}:`, error.message);
    }
  }
}

testBrevo();
