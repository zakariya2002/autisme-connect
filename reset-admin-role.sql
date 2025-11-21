-- ============================================
-- Dissociation du compte personnel et configuration admin unique
-- Date: 2025-11-22
-- ============================================

-- ÉTAPE 1 : Retirer le rôle admin du compte personnel
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"educator"'
)
WHERE email = 'zakariyanebbache@gmail.com';

-- Vérifier que le rôle a été retiré
SELECT
  id,
  email,
  raw_user_meta_data->>'role' as role,
  created_at
FROM auth.users
WHERE email = 'zakariyanebbache@gmail.com';


-- ============================================
-- ÉTAPE 2 : Donner le rôle admin à admin@autismeconnect.fr
-- ============================================

-- IMPORTANT : Ce compte doit exister avant d'exécuter cette commande
-- Si le compte n'existe pas, créez-le d'abord sur /auth/signup

UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE email = 'admin@autismeconnect.fr';

-- Vérifier que ça a marché
SELECT
  id,
  email,
  raw_user_meta_data->>'role' as role,
  created_at,
  email_confirmed_at
FROM auth.users
WHERE email = 'admin@autismeconnect.fr';


-- ============================================
-- ÉTAPE 3 : Vérifier tous les comptes admin
-- ============================================

-- Il ne devrait y avoir QUE admin@autismeconnect.fr
SELECT
  id,
  email,
  raw_user_meta_data->>'role' as role,
  created_at
FROM auth.users
WHERE raw_user_meta_data->>'role' = 'admin'
ORDER BY created_at DESC;


-- ============================================
-- NOTES IMPORTANTES
-- ============================================

-- Si admin@autismeconnect.fr n'existe pas encore :
-- 1. Allez sur https://www.autismeconnect.fr/auth/signup
-- 2. Créez le compte avec admin@autismeconnect.fr
-- 3. Vérifiez l'email
-- 4. Connectez-vous une fois
-- 5. Revenez ici et exécutez l'ÉTAPE 2

-- Votre compte zakariyanebbache@gmail.com sera à nouveau un compte "educator" normal
-- Vous pourrez vous connecter normalement et accéder à /dashboard/educator
