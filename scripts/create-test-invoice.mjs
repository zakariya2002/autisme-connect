import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ghfymwjclzacriswqxme.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdoZnltd2pjbHphY3Jpc3dxeG1lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzM3NDYzOSwiZXhwIjoyMDc4OTUwNjM5fQ.EMVS9n3JvuqSVJhEiaEx3Hou8ePc46YQRCHM4lcEfAQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function deleteTestInvoice() {
  console.log('Suppression de la facture test...');

  const { error } = await supabase
    .from('invoices')
    .delete()
    .eq('invoice_number', 'FACT-36504466');

  if (error) {
    console.error('Erreur:', error);
    return;
  }

  console.log('✅ Facture test supprimée');
}

deleteTestInvoice();
