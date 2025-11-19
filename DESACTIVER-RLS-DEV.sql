-- ========================================
-- DÉSACTIVER RLS POUR LE DÉVELOPPEMENT
-- ========================================
-- ⚠️ À UTILISER UNIQUEMENT EN DÉVELOPPEMENT
-- NE PAS UTILISER EN PRODUCTION

-- Désactiver RLS sur les tables de profils
ALTER TABLE educator_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE family_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE certifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE availability_slots DISABLE ROW LEVEL SECURITY;
ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;
ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE reviews DISABLE ROW LEVEL SECURITY;

-- Confirmer tous les emails existants
UPDATE auth.users
SET email_confirmed_at = NOW(),
    confirmation_token = NULL,
    confirmation_sent_at = NOW()
WHERE email_confirmed_at IS NULL;

-- Vérifier que tout est OK
SELECT
    tablename,
    rowsecurity as "RLS Activé"
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('educator_profiles', 'family_profiles')
ORDER BY tablename;

-- Afficher les utilisateurs
SELECT id, email, email_confirmed_at, created_at
FROM auth.users
ORDER BY created_at DESC;
