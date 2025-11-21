-- ============================================
-- Configuration du compte Admin
-- Email: admin@autismeconnect.fr
-- ============================================

-- ÉTAPE 1 : Donner le rôle admin au compte admin@autismeconnect.fr
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
-- OPTIONNEL : Rendre votre compte personnel admin aussi
-- ============================================

-- Donner le rôle admin à zakariyanebbache@gmail.com
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE email = 'zakariyanebbache@gmail.com';

-- Vérifier tous les comptes admin
SELECT
  id,
  email,
  raw_user_meta_data->>'role' as role,
  created_at
FROM auth.users
WHERE raw_user_meta_data->>'role' = 'admin'
ORDER BY created_at DESC;
