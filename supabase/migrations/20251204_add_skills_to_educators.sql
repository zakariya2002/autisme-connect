-- Migration: Ajouter le champ skills (compétences en texte libre) aux profils éducateurs
-- Date: 2024-12-04

-- Ajouter la colonne skills pour permettre aux éducateurs de décrire leurs compétences librement
ALTER TABLE educator_profiles
ADD COLUMN IF NOT EXISTS skills TEXT;

-- Commentaire sur la colonne
COMMENT ON COLUMN educator_profiles.skills IS 'Description libre des compétences, atouts et spécialités du professionnel';
