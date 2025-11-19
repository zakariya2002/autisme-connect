-- CORRIGER LA RÉCURSION INFINIE DANS LES POLITIQUES
-- Ce script résout le problème "infinite recursion detected"

-- 1. Supprimer TOUTES les politiques problématiques
DROP POLICY IF EXISTS "Users can view their own family profile" ON family_profiles;
DROP POLICY IF EXISTS "Educators can view family profiles in conversations" ON family_profiles;
DROP POLICY IF EXISTS "Users can insert their own family profile" ON family_profiles;
DROP POLICY IF EXISTS "Users can update their own family profile" ON family_profiles;
DROP POLICY IF EXISTS "Users can delete their own family profile" ON family_profiles;

DROP POLICY IF EXISTS "Public can view educator profiles" ON educator_profiles;
DROP POLICY IF EXISTS "Users can insert their own educator profile" ON educator_profiles;
DROP POLICY IF EXISTS "Users can update their own educator profile" ON educator_profiles;
DROP POLICY IF EXISTS "Users can delete their own educator profile" ON educator_profiles;

-- 2. Recréer les politiques SANS récursion

-- ============================================
-- FAMILY_PROFILES - Politiques SIMPLES
-- ============================================

-- Les familles peuvent voir leur propre profil (SANS jointure)
CREATE POLICY "Users can view own family profile"
ON family_profiles
FOR SELECT
USING (auth.uid() = user_id);

-- Les familles peuvent insérer leur propre profil
CREATE POLICY "Users can insert own family profile"
ON family_profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Les familles peuvent modifier leur propre profil
CREATE POLICY "Users can update own family profile"
ON family_profiles
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Les familles peuvent supprimer leur propre profil
CREATE POLICY "Users can delete own family profile"
ON family_profiles
FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- EDUCATOR_PROFILES - Politiques SIMPLES
-- ============================================

-- Tout le monde peut voir les profils éducateurs (pour la recherche)
CREATE POLICY "Anyone can view educator profiles"
ON educator_profiles
FOR SELECT
USING (true);

-- Les éducateurs peuvent insérer leur propre profil
CREATE POLICY "Users can insert own educator profile"
ON educator_profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Les éducateurs peuvent modifier leur propre profil
CREATE POLICY "Users can update own educator profile"
ON educator_profiles
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Les éducateurs peuvent supprimer leur propre profil
CREATE POLICY "Users can delete own educator profile"
ON educator_profiles
FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- VÉRIFICATION
-- ============================================

SELECT '✅ Politiques corrigées sans récursion !' as status;
