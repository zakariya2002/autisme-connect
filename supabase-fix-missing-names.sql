-- CORRIGER LES NOMS ET PRÉNOMS MANQUANTS
-- Ce script permet de voir et corriger les profils avec des noms/prénoms manquants

-- 1. Voir les profils éducateurs avec prénom manquant
SELECT
  id,
  user_id,
  first_name,
  last_name,
  location,
  created_at
FROM educator_profiles
WHERE first_name IS NULL
   OR first_name = ''
   OR TRIM(first_name) = '';

-- 2. Voir les profils familles avec prénom manquant
SELECT
  id,
  user_id,
  first_name,
  last_name,
  location,
  created_at
FROM family_profiles
WHERE first_name IS NULL
   OR first_name = ''
   OR TRIM(first_name) = '';

-- 3. EXEMPLE : Mettre à jour un profil éducateur spécifique
-- Remplacez l'ID et les valeurs par les bonnes informations
-- UPDATE educator_profiles
-- SET first_name = 'Zakariya'  -- Remplacez par le vrai prénom
-- WHERE id = 'd2542585-68bb-4f19-be96-f2be24319119';

-- 4. Afficher le résultat final pour vérifier
-- SELECT
--   id,
--   first_name || ' ' || last_name as nom_complet,
--   location
-- FROM educator_profiles
-- WHERE id = 'd2542585-68bb-4f19-be96-f2be24319119';
