-- PERMETTRE AUX ÉDUCATEURS DE VOIR LES PROFILS DE FAMILLES
-- Version 2 - Correction de la syntaxe

-- 1. Supprimer toutes les anciennes politiques sur family_profiles
DROP POLICY IF EXISTS "family_select_own" ON family_profiles;
DROP POLICY IF EXISTS "family_select_in_conversations" ON family_profiles;
DROP POLICY IF EXISTS "Users can view own family profile" ON family_profiles;
DROP POLICY IF EXISTS "Users can view their own family profile" ON family_profiles;

-- 2. Créer la nouvelle politique qui permet :
--    - Aux familles de voir leur propre profil
--    - Aux éducateurs de voir les profils de familles dans leurs conversations
CREATE POLICY "family_profiles_select"
ON family_profiles
FOR SELECT
USING (
  auth.uid() = user_id
  OR
  EXISTS (
    SELECT 1
    FROM conversations c
    INNER JOIN educator_profiles ep ON ep.id = c.educator_id
    WHERE c.family_id = family_profiles.id
      AND ep.user_id = auth.uid()
  )
);

-- 3. Vérifier que la politique a été créée
SELECT
  'Politique créée: ' || policyname as status
FROM pg_policies
WHERE tablename = 'family_profiles'
  AND policyname = 'family_profiles_select';
