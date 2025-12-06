// Configuration des listes Brevo pour neurocare
// Usage: BREVO_API_KEY=your_key node scripts/setup-brevo-lists.js
const BREVO_API_KEY = process.env.BREVO_API_KEY;

if (!BREVO_API_KEY) {
  console.error('❌ BREVO_API_KEY manquant. Usage: BREVO_API_KEY=your_key node scripts/setup-brevo-lists.js');
  process.exit(1);
}

async function setupBrevoLists() {
  console.log('Configuration des listes Brevo pour neurocare...\n');

  const listsToCreate = [
    { name: 'neurocare - Familles & Aidants', folderId: 1 },
    { name: 'neurocare - Professionnels', folderId: 1 },
    { name: 'neurocare - Newsletter Générale', folderId: 1 }
  ];

  const createdLists = [];

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
        console.log(`✅ Liste créée: ${list.name} (ID: ${result.id})`);
        createdLists.push({ name: list.name, id: result.id });
      } else if (result.code === 'duplicate_parameter') {
        console.log(`⚠️  ${list.name}: existe déjà`);
      } else {
        console.log(`❌ ${list.name}: ${result.message || JSON.stringify(result)}`);
      }
    } catch (error) {
      console.log(`❌ Erreur création ${list.name}:`, error.message);
    }
  }

  // Afficher toutes les listes existantes
  console.log('\n📋 Listes disponibles:');
  const listsResponse = await fetch('https://api.brevo.com/v3/contacts/lists', {
    headers: {
      'Accept': 'application/json',
      'api-key': BREVO_API_KEY
    }
  });

  if (listsResponse.ok) {
    const lists = await listsResponse.json();
    lists.lists.forEach(list => {
      console.log(`   ID ${list.id}: ${list.name}`);
    });

    console.log('\n📝 Mettez à jour les IDs dans app/api/newsletter/subscribe/route.ts:');
    console.log('const BREVO_LIST_IDS = {');
    const familleList = lists.lists.find(l => l.name.includes('Famille'));
    const proList = lists.lists.find(l => l.name.includes('Professionnel'));
    const generalList = lists.lists.find(l => l.name.includes('Générale') || l.name.includes('première'));
    console.log(`  famille: ${familleList?.id || 2},`);
    console.log(`  pro: ${proList?.id || 2},`);
    console.log(`  all: ${generalList?.id || 2}`);
    console.log('};');
  }

  console.log('\n✅ Configuration terminée!');
}

setupBrevoLists();
