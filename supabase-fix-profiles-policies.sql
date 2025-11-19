-- CORRIGER LES POLITIQUES DE SÉCURITÉ POUR LES PROFILS
-- Ce script permet aux utilisateurs de lire et modifier leurs propres profils

-- 1. Activer RLS sur les tables profils
ALTER TABLE educator_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_profiles ENABLE ROW LEVEL SECURITY;

-- 2. Supprimer les anciennes politiques (si elles existent)
DROP POLICY IF EXISTS "Users can view their own educator profile" ON educator_profiles;
DROP POLICY IF EXISTS "Users can update their own educator profile" ON educator_profiles;
DROP POLICY IF EXISTS "Public can view approved educator profiles" ON educator_profiles;
DROP POLICY IF EXISTS "Users can insert their own educator profile" ON educator_profiles;

DROP POLICY IF EXISTS "Users can view their own family profile" ON family_profiles;
DROP POLICY IF EXISTS "Users can update their own family profile" ON family_profiles;
DROP POLICY IF EXISTS "Users can insert their own family profile" ON family_profiles;

-- 3. POLITIQUES POUR EDUCATOR_PROFILES

-- Tout le monde peut voir les profils éducateurs (pour la recherche publique)
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

-- 4. POLITIQUES POUR FAMILY_PROFILES

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

-- 5. Vérification
SELECT 'Politiques des profils créées avec succès !' as status;
