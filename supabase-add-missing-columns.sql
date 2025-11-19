-- AJOUTER TOUTES LES COLONNES MANQUANTES À EDUCATOR_PROFILES
-- Ce script ajoute toutes les colonnes nécessaires pour les profils d'éducateurs

-- 1. Ajouter toutes les colonnes manquantes
ALTER TABLE educator_profiles
ADD COLUMN IF NOT EXISTS email VARCHAR(255),
ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS specialties TEXT,
ADD COLUMN IF NOT EXISTS certifications TEXT,
ADD COLUMN IF NOT EXISTS experience_years INTEGER,
ADD COLUMN IF NOT EXISTS hourly_rate DECIMAL(10, 2);

-- 2. Créer des index pour optimiser les recherches
CREATE INDEX IF NOT EXISTS idx_educator_email ON educator_profiles(email);
CREATE INDEX IF NOT EXISTS idx_educator_location ON educator_profiles(latitude, longitude);

-- 3. Ajouter des commentaires pour documentation
COMMENT ON COLUMN educator_profiles.email IS 'Email de contact professionnel de l''éducateur';
COMMENT ON COLUMN educator_profiles.phone IS 'Numéro de téléphone de contact de l''éducateur';
COMMENT ON COLUMN educator_profiles.latitude IS 'Latitude GPS du lieu d''exercice';
COMMENT ON COLUMN educator_profiles.longitude IS 'Longitude GPS du lieu d''exercice';
COMMENT ON COLUMN educator_profiles.specialties IS 'Spécialités et méthodes (ABA, TEACCH, PECS, etc.)';
COMMENT ON COLUMN educator_profiles.certifications IS 'Certifications et diplômes';
COMMENT ON COLUMN educator_profiles.experience_years IS 'Années d''expérience';
COMMENT ON COLUMN educator_profiles.hourly_rate IS 'Tarif horaire en euros';

SELECT '✅ Toutes les colonnes ont été ajoutées avec succès !' as status;

-- Vérifier la structure complète de la table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'educator_profiles'
ORDER BY ordinal_position;
