-- NETTOYER LES PROFILS ORPHELINS
-- Ce script supprime les profils dont le user_id ne correspond à aucun utilisateur existant

-- Afficher les profils éducateurs orphelins avant suppression
SELECT 'Profils éducateurs orphelins:' as type;
SELECT ep.id, ep.user_id, ep.first_name, ep.last_name, ep.location
FROM educator_profiles ep
LEFT JOIN auth.users u ON ep.user_id = u.id
WHERE u.id IS NULL;

-- Afficher les profils familles orphelins avant suppression
SELECT 'Profils familles orphelins:' as type;
SELECT fp.id, fp.user_id, fp.first_name, fp.last_name, fp.location
FROM family_profiles fp
LEFT JOIN auth.users u ON fp.user_id = u.id
WHERE u.id IS NULL;

-- Supprimer les certifications liées aux profils éducateurs orphelins
DELETE FROM certifications
WHERE educator_id IN (
  SELECT ep.id
  FROM educator_profiles ep
  LEFT JOIN auth.users u ON ep.user_id = u.id
  WHERE u.id IS NULL
);

-- Supprimer les profils éducateurs orphelins
DELETE FROM educator_profiles
WHERE id IN (
  SELECT ep.id
  FROM educator_profiles ep
  LEFT JOIN auth.users u ON ep.user_id = u.id
  WHERE u.id IS NULL
);

-- Supprimer les profils familles orphelins
DELETE FROM family_profiles
WHERE id IN (
  SELECT fp.id
  FROM family_profiles fp
  LEFT JOIN auth.users u ON fp.user_id = u.id
  WHERE u.id IS NULL
);

-- Afficher le résultat
SELECT 'Nettoyage terminé!' as message;

-- Vérifier qu'il ne reste que des profils valides
SELECT 'Profils éducateurs restants:' as type;
SELECT id, user_id, first_name, last_name, location FROM educator_profiles;

SELECT 'Profils familles restants:' as type;
SELECT id, user_id, first_name, last_name, location FROM family_profiles;
