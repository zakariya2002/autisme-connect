-- VÉRIFIER LES MESSAGES ET CONVERSATIONS
-- Ce script affiche toutes les conversations et messages pour déboguer

-- 1. Toutes les conversations
SELECT 'TOUTES LES CONVERSATIONS:' as info;
SELECT
  c.id,
  c.educator_id,
  c.family_id,
  e.first_name || ' ' || e.last_name as educateur,
  f.first_name || ' ' || f.last_name as famille,
  c.created_at,
  c.updated_at
FROM conversations c
LEFT JOIN educator_profiles e ON e.id = c.educator_id
LEFT JOIN family_profiles f ON f.id = c.family_id
ORDER BY c.created_at DESC;

-- 2. Tous les messages
SELECT 'TOUS LES MESSAGES:' as info;
SELECT
  m.id,
  m.conversation_id,
  m.sender_id,
  m.receiver_id,
  m.content,
  m.is_read,
  m.created_at
FROM messages m
ORDER BY m.created_at DESC
LIMIT 50;

-- 3. Messages avec détails des conversations
SELECT 'MESSAGES AVEC DÉTAILS:' as info;
SELECT
  m.content as message,
  m.created_at as envoyé_le,
  m.is_read as lu,
  sender_edu.first_name || ' ' || sender_edu.last_name as expéditeur_éducateur,
  sender_fam.first_name || ' ' || sender_fam.last_name as expéditeur_famille,
  receiver_edu.first_name || ' ' || receiver_edu.last_name as destinataire_éducateur,
  receiver_fam.first_name || ' ' || receiver_fam.last_name as destinataire_famille
FROM messages m
LEFT JOIN conversations c ON c.id = m.conversation_id
LEFT JOIN educator_profiles sender_edu ON sender_edu.user_id = m.sender_id
LEFT JOIN family_profiles sender_fam ON sender_fam.user_id = m.sender_id
LEFT JOIN educator_profiles receiver_edu ON receiver_edu.user_id = m.receiver_id
LEFT JOIN family_profiles receiver_fam ON receiver_fam.user_id = m.receiver_id
ORDER BY m.created_at DESC
LIMIT 20;

-- 4. Compter les messages par conversation
SELECT 'NOMBRE DE MESSAGES PAR CONVERSATION:' as info;
SELECT
  c.id as conversation_id,
  e.first_name || ' ' || e.last_name as educateur,
  f.first_name || ' ' || f.last_name as famille,
  COUNT(m.id) as nombre_messages
FROM conversations c
LEFT JOIN educator_profiles e ON e.id = c.educator_id
LEFT JOIN family_profiles f ON f.id = c.family_id
LEFT JOIN messages m ON m.conversation_id = c.id
GROUP BY c.id, e.first_name, e.last_name, f.first_name, f.last_name
ORDER BY c.created_at DESC;
