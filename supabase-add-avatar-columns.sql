-- =====================================================
-- AJOUTER LES COLONNES DE GESTION D'AVATAR
-- =====================================================
-- Ce script ajoute les colonnes nécessaires pour gérer
-- les photos de profil (avatars) des éducateurs et familles

-- =====================================================
-- 1. AJOUTER LES COLONNES AUX PROFILS ÉDUCATEURS
-- =====================================================

ALTER TABLE educator_profiles
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS avatar_moderation_status VARCHAR(20) DEFAULT 'approved',
ADD COLUMN IF NOT EXISTS avatar_moderation_reason TEXT;

-- =====================================================
-- 2. AJOUTER LES COLONNES AUX PROFILS FAMILLES
-- =====================================================

ALTER TABLE family_profiles
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS avatar_moderation_status VARCHAR(20) DEFAULT 'approved',
ADD COLUMN IF NOT EXISTS avatar_moderation_reason TEXT;

-- =====================================================
-- 3. AJOUTER DES CONTRAINTES
-- =====================================================

-- Contrainte pour le statut de modération des avatars
ALTER TABLE educator_profiles
DROP CONSTRAINT IF EXISTS check_avatar_moderation_status;

ALTER TABLE educator_profiles
ADD CONSTRAINT check_avatar_moderation_status
CHECK (avatar_moderation_status IN ('pending', 'approved', 'rejected'));

ALTER TABLE family_profiles
DROP CONSTRAINT IF EXISTS check_avatar_moderation_status;

ALTER TABLE family_profiles
ADD CONSTRAINT check_avatar_moderation_status
CHECK (avatar_moderation_status IN ('pending', 'approved', 'rejected'));

-- =====================================================
-- 4. COMMENTAIRES POUR DOCUMENTATION
-- =====================================================

COMMENT ON COLUMN educator_profiles.avatar_url IS 'URL de la photo de profil de l''éducateur';
COMMENT ON COLUMN educator_profiles.avatar_moderation_status IS 'Statut de modération : pending (en attente), approved (approuvé), rejected (rejeté)';
COMMENT ON COLUMN educator_profiles.avatar_moderation_reason IS 'Raison du rejet de la photo si rejetée';

COMMENT ON COLUMN family_profiles.avatar_url IS 'URL de la photo de profil de la famille';
COMMENT ON COLUMN family_profiles.avatar_moderation_status IS 'Statut de modération : pending (en attente), approved (approuvé), rejected (rejeté)';
COMMENT ON COLUMN family_profiles.avatar_moderation_reason IS 'Raison du rejet de la photo si rejetée';

-- =====================================================
-- 5. CRÉER DES INDEX POUR LES RECHERCHES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_educator_avatar_moderation
ON educator_profiles(avatar_moderation_status);

CREATE INDEX IF NOT EXISTS idx_family_avatar_moderation
ON family_profiles(avatar_moderation_status);

-- =====================================================
-- RÉSUMÉ
-- =====================================================

SELECT '✅ Colonnes d''avatar ajoutées avec succès !' as status;

SELECT
  'Configuration' as info,
  'Colonnes ajoutées : avatar_url, avatar_moderation_status, avatar_moderation_reason' as colonnes,
  'Tables modifiées : educator_profiles, family_profiles' as tables,
  'Statuts possibles : pending, approved, rejected' as statuts;

-- Vérifier les colonnes
SELECT
  column_name,
  data_type,
  column_default
FROM information_schema.columns
WHERE table_name = 'educator_profiles'
  AND column_name LIKE 'avatar%'
ORDER BY column_name;
