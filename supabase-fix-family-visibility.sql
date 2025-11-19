-- PERMETTRE AUX ÉDUCATEURS DE VOIR LES PROFILS DE FAMILLES AVEC QUI ILS ONT UNE CONVERSATION
-- Ce script ajoute une politique pour que les éducateurs puissent voir les profils de leurs familles

-- 1. Ajouter une politique pour que les éducateurs voient les profils de famille dans leurs conversations
CREATE POLICY "family_select_in_conversations"
ON family_profiles
FOR SELECT
USING (
  -- L'utilisateur peut voir son propre profil
  auth.uid() = user_id
  OR
  -- OU l'utilisateur est un éducateur qui a une conversation avec cette famille
  EXISTS (
    SELECT 1
    FROM conversations c
    INNER JOIN educator_profiles ep ON ep.id = c.educator_id
    WHERE c.family_id = family_profiles.id
      AND ep.user_id = auth.uid()
  )
);

-- 2. Supprimer l'ancienne politique restrictive
DROP POLICY IF EXISTS "family_select_own" ON family_profiles;

SELECT '✅ Les éducateurs peuvent maintenant voir les profils de famille dans leurs conversations !' as status;
