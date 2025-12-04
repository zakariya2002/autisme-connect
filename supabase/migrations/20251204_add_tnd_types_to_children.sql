-- Migration: Ajouter les champs TND (Troubles du Neurodéveloppement) aux profils enfants
-- Date: 2024-12-04

-- Ajouter la colonne tnd_types pour permettre aux familles de spécifier les TND de leur enfant
ALTER TABLE child_profiles
ADD COLUMN IF NOT EXISTS tnd_types TEXT[] DEFAULT '{}';

-- Ajouter la colonne tnd_other pour préciser un trouble "Autre"
ALTER TABLE child_profiles
ADD COLUMN IF NOT EXISTS tnd_other TEXT;

-- Commentaires sur les colonnes
COMMENT ON COLUMN child_profiles.tnd_types IS 'Types de Troubles du Neurodéveloppement (TSA, TDAH, DYS, etc.)';
COMMENT ON COLUMN child_profiles.tnd_other IS 'Précision du trouble si "autre" est sélectionné';
