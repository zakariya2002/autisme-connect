-- ========================================
-- NETTOYAGE DES COMPTES DE TEST
-- ========================================
-- ⚠️ À utiliser UNIQUEMENT en développement
-- Ce script supprime tous les utilisateurs et profils

-- 1. Supprimer tous les profils
DELETE FROM certifications;
DELETE FROM availability_slots;
DELETE FROM bookings;
DELETE FROM messages;
DELETE FROM conversations;
DELETE FROM reviews;
DELETE FROM educator_profiles;
DELETE FROM family_profiles;

-- 2. Supprimer tous les utilisateurs
DELETE FROM auth.users;

-- 3. Vérifier que tout est vide
SELECT 'Utilisateurs restants' as "Type", COUNT(*) as "Nombre" FROM auth.users
UNION ALL
SELECT 'Profils éducateurs', COUNT(*) FROM educator_profiles
UNION ALL
SELECT 'Profils familles', COUNT(*) FROM family_profiles;

-- ✅ Vous devriez voir 0 partout
-- Maintenant vous pouvez créer de nouveaux comptes !
