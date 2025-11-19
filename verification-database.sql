-- ========================================
-- SCRIPT DE VÉRIFICATION - Base de Données
-- ========================================
-- Exécutez ce script dans Supabase SQL Editor
-- pour vérifier que toutes les tables sont créées

-- 1. Vérifier que les tables existent
SELECT
    tablename as "Nom de la Table",
    rowsecurity as "RLS Activé"
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
    'educator_profiles',
    'family_profiles',
    'certifications',
    'availability_slots',
    'bookings',
    'conversations',
    'messages',
    'reviews'
)
ORDER BY tablename;

-- 2. Compter les utilisateurs
SELECT
    'Utilisateurs créés' as "Type",
    COUNT(*) as "Nombre"
FROM auth.users;

-- 3. Compter les profils éducateurs
SELECT
    'Profils éducateurs' as "Type",
    COUNT(*) as "Nombre"
FROM educator_profiles;

-- 4. Compter les profils familles
SELECT
    'Profils familles' as "Type",
    COUNT(*) as "Nombre"
FROM family_profiles;

-- ========================================
-- RÉSULTATS ATTENDUS :
-- ========================================
--
-- Si les tables n'existent PAS :
-- ➡️ Vous devez exécuter le fichier "supabase-schema.sql" d'abord !
--
-- Si RLS est activé (true) :
-- ➡️ Suivez les instructions dans GUIDE-INSCRIPTION.md pour désactiver RLS
--
-- Si RLS est désactivé (false) :
-- ✅ Vous pouvez tester l'inscription !
