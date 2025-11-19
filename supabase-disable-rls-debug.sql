-- DÉSACTIVER TEMPORAIREMENT RLS POUR DÉBOGUER
-- ATTENTION : Ceci désactive la sécurité temporairement pour identifier le problème

-- 1. Désactiver RLS sur toutes les tables
ALTER TABLE educator_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE family_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;

-- 2. Vérifier votre profil famille
SELECT '=== VOTRE PROFIL FAMILLE ===' as info;
SELECT *
FROM family_profiles
WHERE user_id = '0720adb1-c6a3-4459-a43e-49035dbb8ba2';

-- 3. Vérifier votre profil éducateur
SELECT '=== VOTRE PROFIL ÉDUCATEUR ===' as info;
SELECT *
FROM educator_profiles
WHERE user_id = '0720adb1-c6a3-4459-a43e-49035dbb8ba2';

-- 4. Compter tous les profils
SELECT '=== NOMBRE DE PROFILS ===' as info;
SELECT
  (SELECT COUNT(*) FROM family_profiles) as total_familles,
  (SELECT COUNT(*) FROM educator_profiles) as total_educateurs;

SELECT '⚠️ RLS désactivé temporairement - Testez maintenant votre application' as status;
