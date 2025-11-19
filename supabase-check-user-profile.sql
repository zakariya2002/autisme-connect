-- VÉRIFIER SI VOTRE PROFIL FAMILLE EXISTE
-- Remplacez l'ID utilisateur par le vôtre

-- 1. Chercher votre profil famille
SELECT 'Votre profil famille:' as info;
SELECT *
FROM family_profiles
WHERE user_id = '0720adb1-c6a3-4459-a43e-49035dbb8ba2';

-- 2. Chercher votre profil éducateur (au cas où)
SELECT 'Votre profil éducateur:' as info;
SELECT *
FROM educator_profiles
WHERE user_id = '0720adb1-c6a3-4459-a43e-49035dbb8ba2';

-- 3. Vérifier votre utilisateur auth
SELECT 'Votre utilisateur:' as info;
SELECT id, email, raw_user_meta_data->>'role' as role, created_at
FROM auth.users
WHERE id = '0720adb1-c6a3-4459-a43e-49035dbb8ba2';

-- 4. SI LE PROFIL FAMILLE N'EXISTE PAS, créez-le (décommentez les lignes ci-dessous)
-- INSERT INTO family_profiles (user_id, first_name, last_name, location, relationship, support_level_needed)
-- VALUES (
--   '0720adb1-c6a3-4459-a43e-49035dbb8ba2',
--   'Votre Prénom',  -- Remplacez par votre prénom
--   'Votre Nom',     -- Remplacez par votre nom
--   'Paris, France', -- Remplacez par votre localisation
--   'parent',
--   'level_1'
-- );
