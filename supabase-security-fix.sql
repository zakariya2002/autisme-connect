-- =====================================================
-- CORRECTION SÉCURITÉ URGENTE - NeuroCare
-- À exécuter IMMÉDIATEMENT dans Supabase SQL Editor
-- Date: 2026-03-17
-- =====================================================

-- =====================================================
-- ÉTAPE 1 : Activer RLS sur TOUTES les tables publiques
-- =====================================================
DO $$
DECLARE
  t record;
BEGIN
  FOR t IN
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename NOT LIKE 'pg_%'
    AND tablename NOT LIKE '_prisma_%'
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', t.tablename);
    RAISE NOTICE 'RLS activé sur: %', t.tablename;
  END LOOP;
END $$;

-- =====================================================
-- ÉTAPE 2 : educator_profiles
-- Lecture publique UNIQUEMENT si profile_visible = true
-- =====================================================
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'educator_profiles' AND table_schema = 'public') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Anyone can view educator profiles" ON educator_profiles';
    EXECUTE 'DROP POLICY IF EXISTS "Public can view profiles" ON educator_profiles';
    EXECUTE 'DROP POLICY IF EXISTS "Educators can view all profiles" ON educator_profiles';
    EXECUTE 'DROP POLICY IF EXISTS "Educators can update own profile" ON educator_profiles';
    EXECUTE 'DROP POLICY IF EXISTS "Educators can insert own profile" ON educator_profiles';
    EXECUTE 'DROP POLICY IF EXISTS "Public read visible educator profiles" ON educator_profiles';
    EXECUTE 'DROP POLICY IF EXISTS "Educators can view own profile" ON educator_profiles';

    EXECUTE 'CREATE POLICY "Public read visible educator profiles" ON educator_profiles FOR SELECT USING (profile_visible = true)';
    EXECUTE 'CREATE POLICY "Educators can view own profile" ON educator_profiles FOR SELECT TO authenticated USING (user_id = auth.uid())';
    EXECUTE 'CREATE POLICY "Educators can update own profile" ON educator_profiles FOR UPDATE TO authenticated USING (user_id = auth.uid())';
    EXECUTE 'CREATE POLICY "Educators can insert own profile" ON educator_profiles FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid())';
  END IF;
END $$;

-- =====================================================
-- ÉTAPE 3 : family_profiles - PRIVÉ
-- =====================================================
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'family_profiles' AND table_schema = 'public') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Anyone can view family profiles" ON family_profiles';
    EXECUTE 'DROP POLICY IF EXISTS "Public can view family profiles" ON family_profiles';
    EXECUTE 'DROP POLICY IF EXISTS "Users can view own family profile" ON family_profiles';
    EXECUTE 'DROP POLICY IF EXISTS "Users can update own family profile" ON family_profiles';
    EXECUTE 'DROP POLICY IF EXISTS "Users can insert own family profile" ON family_profiles';

    EXECUTE 'CREATE POLICY "Users can view own family profile" ON family_profiles FOR SELECT TO authenticated USING (user_id = auth.uid())';
    EXECUTE 'CREATE POLICY "Users can update own family profile" ON family_profiles FOR UPDATE TO authenticated USING (user_id = auth.uid())';
    EXECUTE 'CREATE POLICY "Users can insert own family profile" ON family_profiles FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid())';
  END IF;
END $$;

-- =====================================================
-- ÉTAPE 4 : child_profiles - PRIVÉ
-- =====================================================
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'child_profiles' AND table_schema = 'public') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Anyone can view child profiles" ON child_profiles';
    EXECUTE 'DROP POLICY IF EXISTS "Public can view child profiles" ON child_profiles';
    EXECUTE 'DROP POLICY IF EXISTS "Families can view own children" ON child_profiles';
    EXECUTE 'DROP POLICY IF EXISTS "Families can update own children" ON child_profiles';
    EXECUTE 'DROP POLICY IF EXISTS "Families can insert children" ON child_profiles';
    EXECUTE 'DROP POLICY IF EXISTS "Families can delete own children" ON child_profiles';

    EXECUTE 'CREATE POLICY "Families can view own children" ON child_profiles FOR SELECT TO authenticated USING (family_id IN (SELECT id FROM family_profiles WHERE user_id = auth.uid()))';
    EXECUTE 'CREATE POLICY "Families can update own children" ON child_profiles FOR UPDATE TO authenticated USING (family_id IN (SELECT id FROM family_profiles WHERE user_id = auth.uid()))';
    EXECUTE 'CREATE POLICY "Families can insert children" ON child_profiles FOR INSERT TO authenticated WITH CHECK (family_id IN (SELECT id FROM family_profiles WHERE user_id = auth.uid()))';
    EXECUTE 'CREATE POLICY "Families can delete own children" ON child_profiles FOR DELETE TO authenticated USING (family_id IN (SELECT id FROM family_profiles WHERE user_id = auth.uid()))';
  END IF;
END $$;

-- =====================================================
-- ÉTAPE 5 : reviews - READ public, WRITE authentifié propriétaire
-- =====================================================
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reviews' AND table_schema = 'public') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Anyone can view reviews" ON reviews';
    EXECUTE 'DROP POLICY IF EXISTS "Anyone can create reviews" ON reviews';
    EXECUTE 'DROP POLICY IF EXISTS "Public can view reviews" ON reviews';
    EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can create reviews" ON reviews';
    EXECUTE 'DROP POLICY IF EXISTS "Users can update own reviews" ON reviews';
    EXECUTE 'DROP POLICY IF EXISTS "Users can delete own reviews" ON reviews';
    EXECUTE 'DROP POLICY IF EXISTS "Anyone can read reviews" ON reviews';

    EXECUTE 'CREATE POLICY "Anyone can read reviews" ON reviews FOR SELECT USING (true)';
    EXECUTE 'CREATE POLICY "Authenticated users can create reviews" ON reviews FOR INSERT TO authenticated WITH CHECK (family_id IN (SELECT id FROM family_profiles WHERE user_id = auth.uid()))';
    EXECUTE 'CREATE POLICY "Users can update own reviews" ON reviews FOR UPDATE TO authenticated USING (family_id IN (SELECT id FROM family_profiles WHERE user_id = auth.uid()))';
    EXECUTE 'CREATE POLICY "Users can delete own reviews" ON reviews FOR DELETE TO authenticated USING (family_id IN (SELECT id FROM family_profiles WHERE user_id = auth.uid()))';
  END IF;
END $$;

-- =====================================================
-- ÉTAPE 6 : appointments - PRIVÉ parties concernées
-- =====================================================
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'appointments' AND table_schema = 'public') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Anyone can view appointments" ON appointments';
    EXECUTE 'DROP POLICY IF EXISTS "Parties can view their appointments" ON appointments';
    EXECUTE 'DROP POLICY IF EXISTS "Anyone can create appointments" ON appointments';
    EXECUTE 'DROP POLICY IF EXISTS "Authenticated can create appointments" ON appointments';
    EXECUTE 'DROP POLICY IF EXISTS "Parties can update their appointments" ON appointments';

    EXECUTE 'CREATE POLICY "Parties can view their appointments" ON appointments FOR SELECT TO authenticated USING (family_id IN (SELECT id FROM family_profiles WHERE user_id = auth.uid()) OR educator_id IN (SELECT id FROM educator_profiles WHERE user_id = auth.uid()))';
    EXECUTE 'CREATE POLICY "Authenticated can create appointments" ON appointments FOR INSERT TO authenticated WITH CHECK (family_id IN (SELECT id FROM family_profiles WHERE user_id = auth.uid()))';
    EXECUTE 'CREATE POLICY "Parties can update their appointments" ON appointments FOR UPDATE TO authenticated USING (family_id IN (SELECT id FROM family_profiles WHERE user_id = auth.uid()) OR educator_id IN (SELECT id FROM educator_profiles WHERE user_id = auth.uid()))';
  END IF;
END $$;

-- =====================================================
-- ÉTAPE 7 : messages - PRIVÉ expéditeur/destinataire
-- =====================================================
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'messages' AND table_schema = 'public') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Anyone can view messages" ON messages';
    EXECUTE 'DROP POLICY IF EXISTS "Users can view own messages" ON messages';
    EXECUTE 'DROP POLICY IF EXISTS "Users can send messages" ON messages';

    EXECUTE 'CREATE POLICY "Users can view own messages" ON messages FOR SELECT TO authenticated USING (sender_id = auth.uid() OR receiver_id = auth.uid())';
    EXECUTE 'CREATE POLICY "Users can send messages" ON messages FOR INSERT TO authenticated WITH CHECK (sender_id = auth.uid())';
  END IF;
END $$;

-- =====================================================
-- ÉTAPE 8 : password_reset_tokens - AUCUN accès (service_role only)
-- =====================================================
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'password_reset_tokens' AND table_schema = 'public') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Anyone can view tokens" ON password_reset_tokens';
    EXECUTE 'DROP POLICY IF EXISTS "Anyone can create tokens" ON password_reset_tokens';
  END IF;
END $$;

-- =====================================================
-- ÉTAPE 9 : invoices - PRIVÉ
-- =====================================================
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'invoices' AND table_schema = 'public') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Anyone can view invoices" ON invoices';
    EXECUTE 'DROP POLICY IF EXISTS "Users can view own invoices" ON invoices';

    EXECUTE 'CREATE POLICY "Users can view own invoices" ON invoices FOR SELECT TO authenticated USING (educator_id IN (SELECT id FROM educator_profiles WHERE user_id = auth.uid()) OR family_id IN (SELECT id FROM family_profiles WHERE user_id = auth.uid()))';
  END IF;
END $$;

-- =====================================================
-- ÉTAPE 10 : transactions - PRIVÉ
-- =====================================================
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'transactions' AND table_schema = 'public') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Anyone can view transactions" ON transactions';
    EXECUTE 'DROP POLICY IF EXISTS "Users can view own transactions" ON transactions';

    EXECUTE 'CREATE POLICY "Users can view own transactions" ON transactions FOR SELECT TO authenticated USING (educator_id IN (SELECT id FROM educator_profiles WHERE user_id = auth.uid()) OR family_id IN (SELECT id FROM family_profiles WHERE user_id = auth.uid()))';
  END IF;
END $$;

-- =====================================================
-- ÉTAPE 11 : notifications - PRIVÉ
-- =====================================================
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications' AND table_schema = 'public') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Anyone can view notifications" ON notifications';
    EXECUTE 'DROP POLICY IF EXISTS "Users can view own notifications" ON notifications';
    EXECUTE 'DROP POLICY IF EXISTS "Users can update own notifications" ON notifications';
    EXECUTE 'DROP POLICY IF EXISTS "Users can delete own notifications" ON notifications';

    EXECUTE 'CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT TO authenticated USING (user_id = auth.uid())';
    EXECUTE 'CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE TO authenticated USING (user_id = auth.uid())';
    EXECUTE 'CREATE POLICY "Users can delete own notifications" ON notifications FOR DELETE TO authenticated USING (user_id = auth.uid())';
  END IF;
END $$;

-- =====================================================
-- ÉTAPE 12 : verification_documents - PRIVÉ
-- =====================================================
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'verification_documents' AND table_schema = 'public') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Anyone can view verification_documents" ON verification_documents';
    EXECUTE 'DROP POLICY IF EXISTS "Educators can view own documents" ON verification_documents';
    EXECUTE 'DROP POLICY IF EXISTS "Educators can upload documents" ON verification_documents';

    EXECUTE 'CREATE POLICY "Educators can view own documents" ON verification_documents FOR SELECT TO authenticated USING (educator_id IN (SELECT id FROM educator_profiles WHERE user_id = auth.uid()))';
    EXECUTE 'CREATE POLICY "Educators can upload documents" ON verification_documents FOR INSERT TO authenticated WITH CHECK (educator_id IN (SELECT id FROM educator_profiles WHERE user_id = auth.uid()))';
  END IF;
END $$;

-- =====================================================
-- ÉTAPE 13 : community_posts - READ public, WRITE authentifié
-- =====================================================
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'community_posts' AND table_schema = 'public') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Anyone can view published posts" ON community_posts';
    EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can create posts" ON community_posts';
    EXECUTE 'DROP POLICY IF EXISTS "Authors can update own posts" ON community_posts';
    EXECUTE 'DROP POLICY IF EXISTS "Authors can delete own posts" ON community_posts';

    EXECUTE 'CREATE POLICY "Anyone can view published posts" ON community_posts FOR SELECT USING (true)';
    EXECUTE 'CREATE POLICY "Authenticated users can create posts" ON community_posts FOR INSERT TO authenticated WITH CHECK (author_id = auth.uid())';
    EXECUTE 'CREATE POLICY "Authors can update own posts" ON community_posts FOR UPDATE TO authenticated USING (author_id = auth.uid())';
    EXECUTE 'CREATE POLICY "Authors can delete own posts" ON community_posts FOR DELETE TO authenticated USING (author_id = auth.uid())';
  END IF;
END $$;

-- =====================================================
-- ÉTAPE 14 : community_comments - READ public, WRITE authentifié
-- =====================================================
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'community_comments' AND table_schema = 'public') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Anyone can view comments" ON community_comments';
    EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can create comments" ON community_comments';
    EXECUTE 'DROP POLICY IF EXISTS "Authors can update own comments" ON community_comments';
    EXECUTE 'DROP POLICY IF EXISTS "Authors can delete own comments" ON community_comments';

    EXECUTE 'CREATE POLICY "Anyone can view comments" ON community_comments FOR SELECT USING (true)';
    EXECUTE 'CREATE POLICY "Authenticated users can create comments" ON community_comments FOR INSERT TO authenticated WITH CHECK (author_id = auth.uid())';
    EXECUTE 'CREATE POLICY "Authors can update own comments" ON community_comments FOR UPDATE TO authenticated USING (author_id = auth.uid())';
    EXECUTE 'CREATE POLICY "Authors can delete own comments" ON community_comments FOR DELETE TO authenticated USING (author_id = auth.uid())';
  END IF;
END $$;

-- =====================================================
-- ÉTAPE 15 : community_reactions - READ public, WRITE authentifié
-- =====================================================
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'community_reactions' AND table_schema = 'public') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Anyone can view reactions" ON community_reactions';
    EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can create reactions" ON community_reactions';
    EXECUTE 'DROP POLICY IF EXISTS "Users can delete own reactions" ON community_reactions';

    EXECUTE 'CREATE POLICY "Anyone can view reactions" ON community_reactions FOR SELECT USING (true)';
    EXECUTE 'CREATE POLICY "Authenticated users can create reactions" ON community_reactions FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid())';
    EXECUTE 'CREATE POLICY "Users can delete own reactions" ON community_reactions FOR DELETE TO authenticated USING (user_id = auth.uid())';
  END IF;
END $$;

-- =====================================================
-- ÉTAPE 16 : community_reports - PRIVÉ
-- =====================================================
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'community_reports' AND table_schema = 'public') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Users can view own reports" ON community_reports';
    EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can create reports" ON community_reports';

    EXECUTE 'CREATE POLICY "Users can view own reports" ON community_reports FOR SELECT TO authenticated USING (reporter_id = auth.uid())';
    EXECUTE 'CREATE POLICY "Authenticated users can create reports" ON community_reports FOR INSERT TO authenticated WITH CHECK (reporter_id = auth.uid())';
  END IF;
END $$;

-- =====================================================
-- ÉTAPE 17 : favorite_educators - PRIVÉ
-- =====================================================
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'favorite_educators' AND table_schema = 'public') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Users can view own favorites" ON favorite_educators';
    EXECUTE 'DROP POLICY IF EXISTS "Users can add favorites" ON favorite_educators';
    EXECUTE 'DROP POLICY IF EXISTS "Users can remove favorites" ON favorite_educators';

    EXECUTE 'CREATE POLICY "Users can view own favorites" ON favorite_educators FOR SELECT TO authenticated USING (family_id IN (SELECT id FROM family_profiles WHERE user_id = auth.uid()))';
    EXECUTE 'CREATE POLICY "Users can add favorites" ON favorite_educators FOR INSERT TO authenticated WITH CHECK (family_id IN (SELECT id FROM family_profiles WHERE user_id = auth.uid()))';
    EXECUTE 'CREATE POLICY "Users can remove favorites" ON favorite_educators FOR DELETE TO authenticated USING (family_id IN (SELECT id FROM family_profiles WHERE user_id = auth.uid()))';
  END IF;
END $$;

-- =====================================================
-- ÉTAPE 18 : blog_posts - READ public
-- =====================================================
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'blog_posts' AND table_schema = 'public') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Anyone can view published blog posts" ON blog_posts';
    EXECUTE 'CREATE POLICY "Anyone can view published blog posts" ON blog_posts FOR SELECT USING (true)';
  END IF;
END $$;

-- =====================================================
-- ÉTAPE 19 : educator_reputation - READ public
-- =====================================================
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'educator_reputation' AND table_schema = 'public') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Anyone can view educator reputation" ON educator_reputation';
    EXECUTE 'CREATE POLICY "Anyone can view educator reputation" ON educator_reputation FOR SELECT USING (true)';
  END IF;
END $$;

-- =====================================================
-- ÉTAPE 20 : newsletter_subscribers - PRIVÉ
-- =====================================================
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'newsletter_subscribers' AND table_schema = 'public') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Users can view own subscription" ON newsletter_subscribers';
    EXECUTE 'CREATE POLICY "Users can view own subscription" ON newsletter_subscribers FOR SELECT TO authenticated USING (email IN (SELECT email FROM auth.users WHERE id = auth.uid()))';
  END IF;
END $$;

-- =====================================================
-- ÉTAPE 21 : child_ppa - PRIVÉ
-- =====================================================
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'child_ppa' AND table_schema = 'public') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Families can view own child PPA" ON child_ppa';
    EXECUTE 'DROP POLICY IF EXISTS "Families can update own child PPA" ON child_ppa';
    EXECUTE 'DROP POLICY IF EXISTS "Families can create child PPA" ON child_ppa';

    EXECUTE 'CREATE POLICY "Families can view own child PPA" ON child_ppa FOR SELECT TO authenticated USING (child_id IN (SELECT id FROM child_profiles WHERE family_id IN (SELECT id FROM family_profiles WHERE user_id = auth.uid())))';
    EXECUTE 'CREATE POLICY "Families can update own child PPA" ON child_ppa FOR UPDATE TO authenticated USING (child_id IN (SELECT id FROM child_profiles WHERE family_id IN (SELECT id FROM family_profiles WHERE user_id = auth.uid())))';
    EXECUTE 'CREATE POLICY "Families can create child PPA" ON child_ppa FOR INSERT TO authenticated WITH CHECK (child_id IN (SELECT id FROM child_profiles WHERE family_id IN (SELECT id FROM family_profiles WHERE user_id = auth.uid())))';
  END IF;
END $$;

-- =====================================================
-- ÉTAPE 22 : child_ppa_versions - PRIVÉ
-- =====================================================
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'child_ppa_versions' AND table_schema = 'public') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Families can view own child PPA versions" ON child_ppa_versions';
    EXECUTE 'DROP POLICY IF EXISTS "Families can create child PPA versions" ON child_ppa_versions';
    EXECUTE 'DROP POLICY IF EXISTS "Accès aux versions PPA" ON child_ppa_versions';

    EXECUTE 'CREATE POLICY "Families can view own child PPA versions" ON child_ppa_versions FOR SELECT TO authenticated USING (child_id IN (SELECT id FROM child_profiles WHERE family_id IN (SELECT id FROM family_profiles WHERE user_id = auth.uid())))';
    EXECUTE 'CREATE POLICY "Families can create child PPA versions" ON child_ppa_versions FOR INSERT TO authenticated WITH CHECK (child_id IN (SELECT id FROM child_profiles WHERE family_id IN (SELECT id FROM family_profiles WHERE user_id = auth.uid())))';
  END IF;
END $$;

-- =====================================================
-- ÉTAPE 23 : documents - PRIVÉ
-- =====================================================
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'documents' AND table_schema = 'public') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Users can view own documents" ON documents';
    EXECUTE 'CREATE POLICY "Users can view own documents" ON documents FOR SELECT TO authenticated USING (educator_id IN (SELECT id FROM educator_profiles WHERE user_id = auth.uid()))';
  END IF;
END $$;

-- =====================================================
-- ÉTAPE 24 : user_feedback - PRIVÉ
-- =====================================================
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_feedback' AND table_schema = 'public') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Users can view own feedback" ON user_feedback';
    EXECUTE 'DROP POLICY IF EXISTS "Users can create feedback" ON user_feedback';

    EXECUTE 'CREATE POLICY "Users can view own feedback" ON user_feedback FOR SELECT TO authenticated USING (user_id = auth.uid())';
    EXECUTE 'CREATE POLICY "Users can create feedback" ON user_feedback FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid())';
  END IF;
END $$;

-- =====================================================
-- VÉRIFICATION FINALE
-- =====================================================
SELECT
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY rowsecurity ASC, tablename;

-- =============================================================
-- ÉTAPE FINALE: Protection contre l'escalade de privilèges
-- Empêcher les utilisateurs de modifier leur propre rôle
-- via supabase.auth.updateUser({ data: { role: 'admin' } })
-- =============================================================
CREATE OR REPLACE FUNCTION public.protect_user_role()
RETURNS TRIGGER AS $$
BEGIN
  -- Si le rôle dans user_metadata change, bloquer sauf si c'est le service_role
  IF (OLD.raw_user_meta_data->>'role') IS DISTINCT FROM (NEW.raw_user_meta_data->>'role') THEN
    -- Autoriser uniquement si l'appel vient du service_role (via trigger/admin)
    IF current_setting('request.jwt.claim.role', true) != 'service_role' THEN
      -- Restaurer l'ancien rôle
      NEW.raw_user_meta_data = jsonb_set(
        NEW.raw_user_meta_data,
        '{role}',
        COALESCE(OLD.raw_user_meta_data->'role', '"unknown"'::jsonb)
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Supprimer le trigger s'il existe déjà
DROP TRIGGER IF EXISTS protect_user_role_trigger ON auth.users;

-- Créer le trigger
CREATE TRIGGER protect_user_role_trigger
  BEFORE UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_user_role();
