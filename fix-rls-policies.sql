-- Fix RLS Policies pour Autisme Connect
-- Exécutez ce fichier dans l'éditeur SQL de Supabase si vous avez des problèmes d'insertion

-- Supprimer les anciennes politiques
DROP POLICY IF EXISTS "Les éducateurs peuvent créer leur profil" ON educator_profiles;
DROP POLICY IF EXISTS "Les familles peuvent créer leur profil" ON family_profiles;

-- Nouvelles politiques plus permissives pour l'inscription

-- Politique pour educator_profiles INSERT
CREATE POLICY "Les utilisateurs authentifiés peuvent créer leur profil éducateur"
ON educator_profiles
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
);

-- Politique pour family_profiles INSERT
CREATE POLICY "Les utilisateurs authentifiés peuvent créer leur profil famille"
ON family_profiles
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
);

-- Alternative si ça ne marche toujours pas : Désactiver temporairement RLS pour les insertions
-- (À utiliser UNIQUEMENT en développement)

-- DROP POLICY IF EXISTS "Les éducateurs peuvent créer leur profil" ON educator_profiles;
-- DROP POLICY IF EXISTS "Les familles peuvent créer leur profil" ON family_profiles;

-- CREATE POLICY "Permettre insertion éducateurs" ON educator_profiles
-- FOR INSERT WITH CHECK (true);

-- CREATE POLICY "Permettre insertion familles" ON family_profiles
-- FOR INSERT WITH CHECK (true);
