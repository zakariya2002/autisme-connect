// Script pour régénérer tous les reçus famille avec le nouveau format CESU/PCH

const regenerateReceipts = async () => {
  try {
    console.log('🔄 Régénération de tous les reçus famille...\n');

    const response = await fetch('http://localhost:3000/api/invoices/regenerate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const result = await response.json();

    if (result.success) {
      console.log('✅ Régénération terminée avec succès!\n');
      console.log(`📊 Résumé:`);
      console.log(`   Total de reçus: ${result.total}`);
      console.log(`   ✅ Succès: ${result.successCount}`);
      console.log(`   ❌ Erreurs: ${result.errorCount}`);

      if (result.errors && result.errors.length > 0) {
        console.log('\n❌ Détails des erreurs:');
        result.errors.forEach(err => {
          console.log(`   - ${err.invoice_number}: ${err.error}`);
        });
      }
    } else {
      console.error('❌ Erreur:', result.error || result.message);
    }

  } catch (error) {
    console.error('❌ Erreur lors de l\'appel API:', error.message);
  }
};

regenerateReceipts();
