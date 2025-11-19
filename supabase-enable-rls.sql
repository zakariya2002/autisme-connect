-- RÉACTIVER RLS SUR TOUTES LES TABLES
-- Ce script réactive la sécurité Row Level Security

-- 1. Réactiver RLS sur toutes les tables
ALTER TABLE educator_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

SELECT '✅ RLS réactivé sur toutes les tables !' as status;

-- 2. Vérifier que toutes les politiques sont bien en place
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
