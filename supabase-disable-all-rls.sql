-- DÉSACTIVER COMPLÈTEMENT LE RLS POUR LE DÉVELOPPEMENT
-- ⚠️ NE PAS UTILISER EN PRODUCTION ⚠️

-- Désactiver RLS sur toutes les tables
ALTER TABLE educator_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE certifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE family_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE availability_slots DISABLE ROW LEVEL SECURITY;
ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;
ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE reviews DISABLE ROW LEVEL SECURITY;

-- Supprimer toutes les politiques existantes
DROP POLICY IF EXISTS "Users can view their own educator profile" ON educator_profiles;
DROP POLICY IF EXISTS "Users can insert their own educator profile" ON educator_profiles;
DROP POLICY IF EXISTS "Users can update their own educator profile" ON educator_profiles;
DROP POLICY IF EXISTS "Public educator profiles are viewable by everyone" ON educator_profiles;

DROP POLICY IF EXISTS "Educators can manage their own certifications" ON certifications;
DROP POLICY IF EXISTS "Public certifications are viewable by everyone" ON certifications;

DROP POLICY IF EXISTS "Users can view their own family profile" ON family_profiles;
DROP POLICY IF EXISTS "Users can insert their own family profile" ON family_profiles;
DROP POLICY IF EXISTS "Users can update their own family profile" ON family_profiles;

DROP POLICY IF EXISTS "Educators can manage their own availability" ON availability_slots;

DROP POLICY IF EXISTS "Users can view their own bookings" ON bookings;
DROP POLICY IF EXISTS "Users can create bookings" ON bookings;

DROP POLICY IF EXISTS "Users can view their own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;

DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can create messages in their conversations" ON messages;

DROP POLICY IF EXISTS "Users can view reviews" ON reviews;
DROP POLICY IF EXISTS "Users can create reviews" ON reviews;

-- Vérifier l'état du RLS
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
