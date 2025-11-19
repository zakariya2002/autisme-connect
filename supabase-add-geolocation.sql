-- AJOUTER LA GÉOLOCALISATION AUX PROFILS ÉDUCATEURS
-- Ce script ajoute les colonnes latitude et longitude pour permettre la recherche par proximité

-- 1. Ajouter les colonnes de géolocalisation
ALTER TABLE educator_profiles
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);

-- 2. Créer un index pour optimiser les requêtes de géolocalisation
CREATE INDEX IF NOT EXISTS idx_educator_location
ON educator_profiles(latitude, longitude);

-- 3. Commentaires pour documentation
COMMENT ON COLUMN educator_profiles.latitude IS 'Latitude GPS du lieu d''exercice de l''éducateur';
COMMENT ON COLUMN educator_profiles.longitude IS 'Longitude GPS du lieu d''exercice de l''éducateur';

SELECT '✅ Colonnes de géolocalisation ajoutées avec succès !' as status;

-- Instructions pour les éducateurs :
-- Pour renseigner les coordonnées GPS, les éducateurs peuvent :
-- 1. Aller sur https://www.latlong.net/
-- 2. Entrer leur adresse
-- 3. Copier les coordonnées latitude et longitude dans leur profil
