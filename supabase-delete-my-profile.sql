-- SUPPRIMER VOTRE PROFIL ACTUEL POUR EN RECRÉER UN NOUVEAU
-- Remplacez l'ID ci-dessous par votre user_id: 340f51aa-c288-4a55-8319-b07cea33e3a3

-- Afficher vos profils avant suppression
SELECT 'Vos profils éducateurs:' as type;
SELECT * FROM educator_profiles WHERE user_id = '340f51aa-c288-4a55-8319-b07cea33e3a3';

SELECT 'Vos profils familles:' as type;
SELECT * FROM family_profiles WHERE user_id = '340f51aa-c288-4a55-8319-b07cea33e3a3';

-- Supprimer les certifications liées à vos profils éducateurs
DELETE FROM certifications
WHERE educator_id IN (
  SELECT id FROM educator_profiles WHERE user_id = '340f51aa-c288-4a55-8319-b07cea33e3a3'
);

-- Supprimer vos profils éducateurs
DELETE FROM educator_profiles WHERE user_id = '340f51aa-c288-4a55-8319-b07cea33e3a3';

-- Supprimer vos profils familles
DELETE FROM family_profiles WHERE user_id = '340f51aa-c288-4a55-8319-b07cea33e3a3';

-- Confirmation
SELECT 'Profils supprimés! Vous pouvez maintenant recréer votre profil via http://localhost:3000/create-profile' as message;
