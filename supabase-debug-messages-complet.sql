-- DIAGNOSTIC COMPLET DES MESSAGES
-- Ce script vérifie tout le système de messagerie

-- 1. Vérifier les profils
SELECT '=== PROFILS ÉDUCATEURS ===' as info;
SELECT id, user_id, first_name, last_name, email FROM educator_profiles;

SELECT '=== PROFILS FAMILLES ===' as info;
SELECT id, user_id, first_name, last_name, email FROM family_profiles;

-- 2. Vérifier les conversations
SELECT '=== CONVERSATIONS ===' as info;
SELECT
  c.id as conv_id,
  c.educator_id,
  c.family_id,
  e.first_name || ' ' || e.last_name as educateur,
  f.first_name || ' ' || f.last_name as famille,
  c.created_at
FROM conversations c
LEFT JOIN educator_profiles e ON e.id = c.educator_id
LEFT JOIN family_profiles f ON f.id = c.family_id
ORDER BY c.created_at DESC;

-- 3. Vérifier les messages avec détails
SELECT '=== MESSAGES ===' as info;
SELECT
  m.id,
  m.conversation_id,
  m.sender_id,
  m.receiver_id,
  m.content,
  m.is_read,
  m.created_at,
  -- Profil expéditeur
  COALESCE(
    (SELECT first_name || ' ' || last_name FROM educator_profiles WHERE user_id = m.sender_id),
    (SELECT first_name || ' ' || last_name FROM family_profiles WHERE user_id = m.sender_id)
  ) as expediteur,
  -- Profil destinataire
  COALESCE(
    (SELECT first_name || ' ' || last_name FROM educator_profiles WHERE user_id = m.receiver_id),
    (SELECT first_name || ' ' || last_name FROM family_profiles WHERE user_id = m.receiver_id)
  ) as destinataire
FROM messages m
ORDER BY m.created_at DESC;

-- 4. Vérifier les politiques RLS actives
SELECT '=== POLITIQUES RLS ===' as info;
SELECT
  tablename,
  policyname,
  cmd,
  CASE
    WHEN qual IS NOT NULL THEN 'USING: ' || qual
    ELSE 'No USING clause'
  END as using_clause
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('conversations', 'messages', 'educator_profiles', 'family_profiles')
ORDER BY tablename, policyname;

-- 5. Vérifier si RLS est activé
SELECT '=== ÉTAT RLS ===' as info;
SELECT
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('conversations', 'messages', 'educator_profiles', 'family_profiles')
ORDER BY tablename;
