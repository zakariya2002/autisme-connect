-- SOLUTION SIMPLE : RENDRE LES PROFILS FAMILLE VISIBLES
-- Comme les profils éducateurs sont publics, on rend aussi les profils famille visibles
-- Cela évite la récursion infinie et permet la messagerie

-- 1. Supprimer toutes les anciennes politiques sur family_profiles
DROP POLICY IF EXISTS "family_select_own" ON family_profiles;
DROP POLICY IF EXISTS "family_profiles_select" ON family_profiles;
DROP POLICY IF EXISTS "family_select_in_conversations" ON family_profiles;
DROP POLICY IF EXISTS "Users can view own family profile" ON family_profiles;
DROP POLICY IF EXISTS "Users can view their own family profile" ON family_profiles;

-- 2. Créer une politique simple : tout le monde peut voir les profils de famille
CREATE POLICY "family_profiles_visible_to_all"
ON family_profiles
FOR SELECT
USING (true);

-- 3. Les autres politiques restent inchangées (INSERT, UPDATE, DELETE)
-- On recrée seulement si elles n'existent pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'family_profiles'
    AND policyname = 'family_insert_own'
  ) THEN
    CREATE POLICY "family_insert_own"
    ON family_profiles
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'family_profiles'
    AND policyname = 'family_update_own'
  ) THEN
    CREATE POLICY "family_update_own"
    ON family_profiles
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'family_profiles'
    AND policyname = 'family_delete_own'
  ) THEN
    CREATE POLICY "family_delete_own"
    ON family_profiles
    FOR DELETE
    USING (auth.uid() = user_id);
  END IF;
END $$;

SELECT '✅ Profils famille maintenant visibles par tous (comme les profils éducateurs) !' as status;
