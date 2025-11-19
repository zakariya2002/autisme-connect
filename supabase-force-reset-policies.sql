-- RÉINITIALISATION FORCÉE DE TOUTES LES POLITIQUES
-- Ce script supprime ABSOLUMENT TOUTES les politiques et les recrée

-- 1. Supprimer TOUTES les variantes possibles de politiques
DROP POLICY IF EXISTS "Users can view their own family profile" ON family_profiles;
DROP POLICY IF EXISTS "Users can view own family profile" ON family_profiles;
DROP POLICY IF EXISTS "Educators can view family profiles in conversations" ON family_profiles;
DROP POLICY IF EXISTS "Users can insert their own family profile" ON family_profiles;
DROP POLICY IF EXISTS "Users can insert own family profile" ON family_profiles;
DROP POLICY IF EXISTS "Users can update their own family profile" ON family_profiles;
DROP POLICY IF EXISTS "Users can update own family profile" ON family_profiles;
DROP POLICY IF EXISTS "Users can delete their own family profile" ON family_profiles;
DROP POLICY IF EXISTS "Users can delete own family profile" ON family_profiles;

DROP POLICY IF EXISTS "Public can view educator profiles" ON educator_profiles;
DROP POLICY IF EXISTS "Anyone can view educator profiles" ON educator_profiles;
DROP POLICY IF EXISTS "Users can insert their own educator profile" ON educator_profiles;
DROP POLICY IF EXISTS "Users can insert own educator profile" ON educator_profiles;
DROP POLICY IF EXISTS "Users can update their own educator profile" ON educator_profiles;
DROP POLICY IF EXISTS "Users can update own educator profile" ON educator_profiles;
DROP POLICY IF EXISTS "Users can delete their own educator profile" ON educator_profiles;
DROP POLICY IF EXISTS "Users can delete own educator profile" ON educator_profiles;

DROP POLICY IF EXISTS "Users can view their own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
DROP POLICY IF EXISTS "Families can create conversations" ON conversations;

DROP POLICY IF EXISTS "Users can view their own messages" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON messages;
DROP POLICY IF EXISTS "Users can update their received messages" ON messages;

-- 2. Désactiver temporairement RLS pour vérifier
ALTER TABLE family_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE educator_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;

-- 3. Réactiver RLS
ALTER TABLE family_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE educator_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- 4. Créer les politiques SIMPLES et PROPRES

-- ============================================
-- FAMILY_PROFILES
-- ============================================

CREATE POLICY "family_select_own"
ON family_profiles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "family_insert_own"
ON family_profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "family_update_own"
ON family_profiles
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "family_delete_own"
ON family_profiles
FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- EDUCATOR_PROFILES
-- ============================================

CREATE POLICY "educator_select_all"
ON educator_profiles
FOR SELECT
USING (true);

CREATE POLICY "educator_insert_own"
ON educator_profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "educator_update_own"
ON educator_profiles
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "educator_delete_own"
ON educator_profiles
FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- CONVERSATIONS
-- ============================================

CREATE POLICY "conversations_select_own"
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

CREATE POLICY "conversations_insert_family"
ON conversations
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM family_profiles
    WHERE family_profiles.id = conversations.family_id
    AND family_profiles.user_id = auth.uid()
  )
);

-- ============================================
-- MESSAGES
-- ============================================

CREATE POLICY "messages_select_own"
ON messages
FOR SELECT
USING (sender_id = auth.uid() OR receiver_id = auth.uid());

CREATE POLICY "messages_insert_own"
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

CREATE POLICY "messages_update_received"
ON messages
FOR UPDATE
USING (receiver_id = auth.uid())
WITH CHECK (receiver_id = auth.uid());

-- ============================================
-- VÉRIFICATION
-- ============================================

SELECT '✅ TOUTES les politiques ont été réinitialisées avec succès !' as status;
