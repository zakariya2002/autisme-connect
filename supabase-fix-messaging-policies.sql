-- CORRIGER LES POLITIQUES DE SÉCURITÉ POUR LA MESSAGERIE
-- Exécutez ce script dans Supabase SQL Editor pour permettre la messagerie

-- 1. Activer RLS sur les tables (si pas déjà fait)
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- 2. Supprimer les anciennes politiques (si elles existent)
DROP POLICY IF EXISTS "Users can view their own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
DROP POLICY IF EXISTS "Users can view their own messages" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON messages;

-- 3. POLITIQUES POUR LES CONVERSATIONS

-- Les familles et éducateurs peuvent voir leurs propres conversations
CREATE POLICY "Users can view their own conversations"
ON conversations
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM educator_profiles
    WHERE educator_profiles.id = conversations.educator_id
    AND educator_profiles.user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM family_profiles
    WHERE family_profiles.id = conversations.family_id
    AND family_profiles.user_id = auth.uid()
  )
);

-- Les familles peuvent créer des conversations avec des éducateurs
CREATE POLICY "Families can create conversations"
ON conversations
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM family_profiles
    WHERE family_profiles.id = conversations.family_id
    AND family_profiles.user_id = auth.uid()
  )
);

-- 4. POLITIQUES POUR LES MESSAGES

-- Les utilisateurs peuvent voir les messages de leurs conversations
CREATE POLICY "Users can view their own messages"
ON messages
FOR SELECT
USING (
  sender_id = auth.uid() OR receiver_id = auth.uid()
);

-- Les utilisateurs peuvent envoyer des messages
CREATE POLICY "Users can send messages"
ON messages
FOR INSERT
WITH CHECK (
  sender_id = auth.uid()
  AND
  EXISTS (
    SELECT 1 FROM conversations
    WHERE conversations.id = messages.conversation_id
    AND (
      EXISTS (
        SELECT 1 FROM educator_profiles
        WHERE educator_profiles.id = conversations.educator_id
        AND educator_profiles.user_id = auth.uid()
      )
      OR
      EXISTS (
        SELECT 1 FROM family_profiles
        WHERE family_profiles.id = conversations.family_id
        AND family_profiles.user_id = auth.uid()
      )
    )
  )
);

-- Les utilisateurs peuvent marquer leurs messages comme lus
CREATE POLICY "Users can update their received messages"
ON messages
FOR UPDATE
USING (receiver_id = auth.uid())
WITH CHECK (receiver_id = auth.uid());

-- 5. Vérifier que tout fonctionne
SELECT 'Politiques de messagerie créées avec succès !' as status;
