-- AJOUTER LES PARAMÈTRES DE CONFIDENTIALITÉ POUR LES COORDONNÉES
-- Ce script ajoute des colonnes pour contrôler la visibilité de l'email et du téléphone

-- 1. Ajouter les colonnes de confidentialité pour les éducateurs
ALTER TABLE educator_profiles
ADD COLUMN IF NOT EXISTS show_email BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS show_phone BOOLEAN DEFAULT false;

-- 2. Ajouter les colonnes de confidentialité pour les familles
ALTER TABLE family_profiles
ADD COLUMN IF NOT EXISTS show_email BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS show_phone BOOLEAN DEFAULT false;

-- 3. Ajouter des commentaires pour documentation
COMMENT ON COLUMN educator_profiles.show_email IS 'Si true, l''email est visible sur le profil public';
COMMENT ON COLUMN educator_profiles.show_phone IS 'Si true, le téléphone est visible sur le profil public';
COMMENT ON COLUMN family_profiles.show_email IS 'Si true, l''email est visible pour les éducateurs';
COMMENT ON COLUMN family_profiles.show_phone IS 'Si true, le téléphone est visible pour les éducateurs';

SELECT '✅ Paramètres de confidentialité ajoutés avec succès !' as status;

-- Afficher la structure mise à jour
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name IN ('educator_profiles', 'family_profiles')
  AND column_name IN ('email', 'phone', 'show_email', 'show_phone')
ORDER BY table_name, ordinal_position;
