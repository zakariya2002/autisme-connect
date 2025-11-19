-- NETTOYAGE COMPLET ET RÉINSTALLATION DES POLITIQUES
-- Ce script supprime TOUTES les anciennes politiques et les recrée proprement

-- ============================================
-- 1. SUPPRIMER TOUTES LES ANCIENNES POLITIQUES
-- ============================================

-- Profils éducateurs
DROP POLICY IF EXISTS "Users can view their own educator profile" ON educator_profiles;
DROP POLICY IF EXISTS "Users can update their own educator profile" ON educator_profiles;
DROP POLICY IF EXISTS "Public can view approved educator profiles" ON educator_profiles;
DROP POLICY IF EXISTS "Public can view educator profiles" ON educator_profiles;
DROP POLICY IF EXISTS "Users can insert their own educator profile" ON educator_profiles;
DROP POLICY IF EXISTS "Users can delete their own educator profile" ON educator_profiles;

-- Profils familles
DROP POLICY IF EXISTS "Users can view their own family profile" ON family_profiles;
DROP POLICY IF EXISTS "Users can update their own family profile" ON family_profiles;
DROP POLICY IF EXISTS "Users can insert their own family profile" ON family_profiles;
DROP POLICY IF EXISTS "Users can delete their own family profile" ON family_profiles;
DROP POLICY IF EXISTS "Educators can view family profiles in conversations" ON family_profiles;

-- Conversations
DROP POLICY IF EXISTS "Users can view their own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
DROP POLICY IF EXISTS "Families can create conversations" ON conversations;

-- Messages
DROP POLICY IF EXISTS "Users can view their own messages" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON messages;
DROP POLICY IF EXISTS "Users can update their received messages" ON messages;

-- ============================================
-- 2. ACTIVER RLS SUR TOUTES LES TABLES
-- ============================================

ALTER TABLE educator_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 3. POLITIQUES POUR EDUCATOR_PROFILES
-- ============================================

-- Tout le monde peut voir les profils éducateurs (recherche publique)
CREATE POLICY "Public can view educator profiles"
ON educator_profiles
FOR SELECT
USING (true);

-- Les éducateurs peuvent créer leur propre profil
CREATE POLICY "Users can insert their own educator profile"
ON educator_profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Les éducateurs peuvent modifier leur propre profil
CREATE POLICY "Users can update their own educator profile"
ON educator_profiles
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Les éducateurs peuvent supprimer leur propre profil
CREATE POLICY "Users can delete their own educator profile"
ON educator_profiles
FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- 4. POLITIQUES POUR FAMILY_PROFILES
-- ============================================

-- Les familles peuvent voir leur propre profil
CREATE POLICY "Users can view their own family profile"
ON family_profiles
FOR SELECT
USING (auth.uid() = user_id);

-- Les éducateurs peuvent voir les profils des familles avec qui ils ont une conversation
CREATE POLICY "Educators can view family profiles in conversations"
ON family_profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM conversations c
    JOIN educator_profiles ep ON ep.id = c.educator_id
    WHERE c.family_id = family_profiles.id
    AND ep.user_id = auth.uid()
  )
);

-- Les familles peuvent créer leur propre profil
CREATE POLICY "Users can insert their own family profile"
ON family_profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Les familles peuvent modifier leur propre profil
CREATE POLICY "Users can update their own family profile"
ON family_profiles
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Les familles peuvent supprimer leur propre profil
CREATE POLICY "Users can delete their own family profile"
ON family_profiles
FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- 5. POLITIQUES POUR CONVERSATIONS
-- ============================================

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

-- ============================================
-- 6. POLITIQUES POUR MESSAGES
-- ============================================

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

-- ============================================
-- 7. VÉRIFICATION
-- ============================================

SELECT '✅ Toutes les politiques ont été créées avec succès !' as status;
