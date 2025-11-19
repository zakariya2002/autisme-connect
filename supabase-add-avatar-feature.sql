-- AJOUTER LA FONCTIONNALITÉ DE PHOTO DE PROFIL
-- Ce script ajoute les colonnes avatar_url et configure le système de modération

-- 1. Ajouter les colonnes avatar_url aux tables de profils
ALTER TABLE educator_profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE educator_profiles ADD COLUMN IF NOT EXISTS avatar_moderation_status TEXT DEFAULT 'pending' CHECK (avatar_moderation_status IN ('pending', 'approved', 'rejected'));
ALTER TABLE educator_profiles ADD COLUMN IF NOT EXISTS avatar_moderation_reason TEXT;

ALTER TABLE family_profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE family_profiles ADD COLUMN IF NOT EXISTS avatar_moderation_status TEXT DEFAULT 'pending' CHECK (avatar_moderation_status IN ('pending', 'approved', 'rejected'));
ALTER TABLE family_profiles ADD COLUMN IF NOT EXISTS avatar_moderation_reason TEXT;

-- 2. Créer une table pour l'historique de modération des avatars
CREATE TABLE IF NOT EXISTS avatar_moderation_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_type TEXT NOT NULL CHECK (profile_type IN ('educator', 'family')),
  profile_id UUID NOT NULL,
  avatar_url TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
  reason TEXT,
  moderated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Créer des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_educator_avatar_status ON educator_profiles(avatar_moderation_status);
CREATE INDEX IF NOT EXISTS idx_family_avatar_status ON family_profiles(avatar_moderation_status);
CREATE INDEX IF NOT EXISTS idx_moderation_logs_profile ON avatar_moderation_logs(profile_type, profile_id);

-- 4. Créer une fonction trigger pour logger les changements de modération
CREATE OR REPLACE FUNCTION log_avatar_moderation_change()
RETURNS TRIGGER AS $$
BEGIN
  IF (OLD.avatar_moderation_status IS DISTINCT FROM NEW.avatar_moderation_status) THEN
    INSERT INTO avatar_moderation_logs (
      profile_type,
      profile_id,
      avatar_url,
      status,
      reason
    ) VALUES (
      TG_ARGV[0],
      NEW.id,
      NEW.avatar_url,
      NEW.avatar_moderation_status,
      NEW.avatar_moderation_reason
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Créer les triggers pour les deux tables
DROP TRIGGER IF EXISTS educator_avatar_moderation_log ON educator_profiles;
CREATE TRIGGER educator_avatar_moderation_log
  AFTER UPDATE ON educator_profiles
  FOR EACH ROW
  EXECUTE FUNCTION log_avatar_moderation_change('educator');

DROP TRIGGER IF EXISTS family_avatar_moderation_log ON family_profiles;
CREATE TRIGGER family_avatar_moderation_log
  AFTER UPDATE ON family_profiles
  FOR EACH ROW
  EXECUTE FUNCTION log_avatar_moderation_change('family');

-- 6. Afficher le résultat
SELECT 'Colonnes avatar ajoutées avec succès!' as message;
SELECT 'Table de modération créée!' as message;

-- Vérifier les nouvelles colonnes
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name IN ('educator_profiles', 'family_profiles')
AND column_name LIKE '%avatar%'
ORDER BY table_name, ordinal_position;
