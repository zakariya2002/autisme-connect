-- ========================================
-- SOLUTION COMPLÈTE : Désactiver la Confirmation d'Email
-- ========================================
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- Option 1 : Désactiver complètement la vérification d'email
-- Cela permet aux utilisateurs de se connecter immédiatement après inscription

-- Mettre à jour la configuration d'authentification
UPDATE auth.config
SET email_confirm = false
WHERE id = 1;

-- Option 2 : Confirmer automatiquement tous les emails existants
-- (Utile si vous avez déjà des comptes créés)
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;

-- Vérifier que ça a fonctionné
SELECT email, email_confirmed_at, created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;
