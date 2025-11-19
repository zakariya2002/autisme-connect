-- AJOUTER LES COLONNES EMAIL ET PHONE À LA TABLE EDUCATOR_PROFILES
-- Ce script ajoute les colonnes email et phone pour permettre aux éducateurs de renseigner leurs coordonnées de contact

-- 1. Ajouter les colonnes email et phone
ALTER TABLE educator_profiles
ADD COLUMN IF NOT EXISTS email VARCHAR(255),
ADD COLUMN IF NOT EXISTS phone VARCHAR(20);

-- 2. Créer un index pour optimiser les recherches par email
CREATE INDEX IF NOT EXISTS idx_educator_email
ON educator_profiles(email);

-- 3. Ajouter des commentaires pour documentation
COMMENT ON COLUMN educator_profiles.email IS 'Email de contact professionnel de l''éducateur';
COMMENT ON COLUMN educator_profiles.phone IS 'Numéro de téléphone de contact de l''éducateur';

SELECT '✅ Colonnes email et phone ajoutées avec succès à educator_profiles !' as status;

-- Vérifier la structure de la table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'educator_profiles'
ORDER BY ordinal_position;
