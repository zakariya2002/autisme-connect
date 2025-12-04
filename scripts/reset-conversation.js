const { createClient } = require('@supabase/supabase-js');

// Projet Supabase actuel (depuis .env.local)
const supabaseUrl = 'https://ghfymwjclzacriswqxme.supabase.co';
const supabaseKey = 'sb_publishable_N8-lqG1kJnSPusOAQJI-cQ_P_K4nq6L';

const supabase = createClient(supabaseUrl, supabaseKey);

async function resetConversation() {
  console.log('Recherche de la conversation...');

  try {
    // Vérifier l'éducateur avec l'ID spécifique
    const { data: educatorById } = await supabase
      .from('educator_profiles')
      .select('id, first_name, last_name')
      .eq('id', 'd2542585-68bb-4f19-be96-f2be24319119')
      .single();

    console.log('Éducateur d2542585:', educatorById);

    // Trouver l'éducateur yassine
    const { data: educator, error: educatorError } = await supabase
      .from('educator_profiles')
      .select('id, first_name, last_name')
      .ilike('first_name', '%yassine%')
      .single();

    if (educatorError) {
      console.log('Éducateur non trouvé, recherche par ID...');
      // Utiliser l'ID direct
    }

    console.log('Éducateur Yassine:', educator);

    // Trouver la famille jena
    const { data: family, error: familyError } = await supabase
      .from('family_profiles')
      .select('id, first_name, last_name')
      .ilike('first_name', '%jena%')
      .single();

    if (familyError) {
      console.log('Famille non trouvée:', familyError.message);
    }

    console.log('Famille trouvée:', family);

    if (educator && family) {
      // Supprimer les messages de la conversation
      const { data: conv } = await supabase
        .from('conversations')
        .select('id')
        .eq('educator_id', educator.id)
        .eq('family_id', family.id)
        .single();

      if (conv) {
        console.log('Conversation trouvée:', conv.id);

        // Supprimer les messages
        const { error: msgError } = await supabase
          .from('messages')
          .delete()
          .eq('conversation_id', conv.id);

        if (msgError) {
          console.log('Erreur suppression messages:', msgError.message);
        } else {
          console.log('Messages supprimés');
        }

        // Supprimer la conversation
        const { error: convError } = await supabase
          .from('conversations')
          .delete()
          .eq('id', conv.id);

        if (convError) {
          console.log('Erreur suppression conversation:', convError.message);
        } else {
          console.log('Conversation supprimée avec succès!');
        }
      } else {
        console.log('Aucune conversation trouvée entre ces utilisateurs');
      }
    }
  } catch (error) {
    console.error('Erreur:', error);
  }
}

resetConversation();
