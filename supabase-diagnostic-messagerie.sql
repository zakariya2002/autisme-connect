-- DIAGNOSTIC DE LA MESSAGERIE
-- Exécutez ce script pour identifier les problèmes

-- 1. Vérifier que les tables existent
SELECT 'Tables existantes:' as info;
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('conversations', 'messages', 'educator_profiles', 'family_profiles');

-- 2. Vérifier les politiques RLS
SELECT 'Politiques RLS sur conversations:' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'conversations';

SELECT 'Politiques RLS sur messages:' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'messages';

-- 3. Compter les profils
SELECT 'Nombre de profils éducateurs:' as info, COUNT(*) as count
FROM educator_profiles;

SELECT 'Nombre de profils familles:' as info, COUNT(*) as count
FROM family_profiles;

-- 4. Vérifier les conversations existantes
SELECT 'Conversations existantes:' as info;
SELECT
  c.id,
  e.first_name || ' ' || e.last_name as educateur,
  f.first_name || ' ' || f.last_name as famille,
  c.created_at
FROM conversations c
LEFT JOIN educator_profiles e ON e.id = c.educator_id
LEFT JOIN family_profiles f ON f.id = c.family_id
ORDER BY c.created_at DESC
LIMIT 10;

-- 5. Vérifier si RLS est activé
SELECT 'RLS activé sur conversations:' as info, relrowsecurity
FROM pg_class
WHERE relname = 'conversations';

SELECT 'RLS activé sur messages:' as info, relrowsecurity
FROM pg_class
WHERE relname = 'messages';

-- 6. Lister vos profils (pour tester)
SELECT 'Vos profils éducateurs:' as info;
SELECT id, first_name, last_name, user_id
FROM educator_profiles
ORDER BY created_at DESC
LIMIT 5;

SELECT 'Vos profils familles:' as info;
SELECT id, first_name, last_name, user_id
FROM family_profiles
ORDER BY created_at DESC
LIMIT 5;
