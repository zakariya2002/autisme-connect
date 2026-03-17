-- =============================================================
-- NEUROCARE - NUCLEAR RLS FIX
-- Supprime TOUTES les policies existantes puis recree uniquement
-- les bonnes. A executer dans le SQL Editor Supabase.
-- =============================================================

-- =====================================================
-- ETAPE 1 : SUPPRIMER TOUTES LES POLICIES EXISTANTES
-- =====================================================
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
  )
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
  END LOOP;
END $$;

-- =====================================================
-- ETAPE 2 : VERIFIER QUE RLS EST ACTIVE SUR TOUT
-- =====================================================
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (
    SELECT tablename FROM pg_tables WHERE schemaname = 'public'
  )
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', r.tablename);
  END LOOP;
END $$;

-- =====================================================
-- ETAPE 3 : RECREER LES BONNES POLICIES
-- =====================================================

-- ========================
-- educator_profiles
-- ========================
-- Public: lecture des profils visibles uniquement
CREATE POLICY "educator_profiles_public_read"
  ON public.educator_profiles FOR SELECT
  TO public
  USING (profile_visible = true);

-- Authenticated: lecture de son propre profil (meme si non visible)
CREATE POLICY "educator_profiles_own_read"
  ON public.educator_profiles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Authenticated: creer son profil
CREATE POLICY "educator_profiles_own_insert"
  ON public.educator_profiles FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Authenticated: modifier son profil
CREATE POLICY "educator_profiles_own_update"
  ON public.educator_profiles FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Authenticated: supprimer son profil
CREATE POLICY "educator_profiles_own_delete"
  ON public.educator_profiles FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ========================
-- family_profiles (PRIVE)
-- ========================
CREATE POLICY "family_profiles_own_read"
  ON public.family_profiles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "family_profiles_own_insert"
  ON public.family_profiles FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "family_profiles_own_update"
  ON public.family_profiles FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "family_profiles_own_delete"
  ON public.family_profiles FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Educateurs lies par RDV peuvent voir nom/prenom des familles
CREATE POLICY "family_profiles_educator_read"
  ON public.family_profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM appointments a
      JOIN educator_profiles ep ON ep.id = a.educator_id
      WHERE a.family_id = family_profiles.id
      AND ep.user_id = auth.uid()
    )
  );

-- ========================
-- child_profiles (PRIVE)
-- ========================
CREATE POLICY "child_profiles_family_read"
  ON public.child_profiles FOR SELECT
  TO authenticated
  USING (family_id IN (SELECT id FROM family_profiles WHERE user_id = auth.uid()));

CREATE POLICY "child_profiles_family_insert"
  ON public.child_profiles FOR INSERT
  TO authenticated
  WITH CHECK (family_id IN (SELECT id FROM family_profiles WHERE user_id = auth.uid()));

CREATE POLICY "child_profiles_family_update"
  ON public.child_profiles FOR UPDATE
  TO authenticated
  USING (family_id IN (SELECT id FROM family_profiles WHERE user_id = auth.uid()));

CREATE POLICY "child_profiles_family_delete"
  ON public.child_profiles FOR DELETE
  TO authenticated
  USING (family_id IN (SELECT id FROM family_profiles WHERE user_id = auth.uid()));

-- Educateurs lies par RDV
CREATE POLICY "child_profiles_educator_read"
  ON public.child_profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM appointments a
      JOIN educator_profiles ep ON ep.id = a.educator_id
      WHERE a.family_id = child_profiles.family_id AND ep.user_id = auth.uid()
    )
  );

-- ========================
-- appointments (PRIVE - parties uniquement)
-- ========================
CREATE POLICY "appointments_parties_read"
  ON public.appointments FOR SELECT
  TO authenticated
  USING (
    family_id IN (SELECT id FROM family_profiles WHERE user_id = auth.uid())
    OR educator_id IN (SELECT id FROM educator_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "appointments_authenticated_insert"
  ON public.appointments FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "appointments_parties_update"
  ON public.appointments FOR UPDATE
  TO authenticated
  USING (
    family_id IN (SELECT id FROM family_profiles WHERE user_id = auth.uid())
    OR educator_id IN (SELECT id FROM educator_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "appointments_parties_delete"
  ON public.appointments FOR DELETE
  TO authenticated
  USING (
    family_id IN (SELECT id FROM family_profiles WHERE user_id = auth.uid())
    OR educator_id IN (SELECT id FROM educator_profiles WHERE user_id = auth.uid())
  );

-- ========================
-- messages (PRIVE)
-- ========================
CREATE POLICY "messages_own_read"
  ON public.messages FOR SELECT
  TO authenticated
  USING (sender_id = auth.uid() OR receiver_id = auth.uid());

CREATE POLICY "messages_own_insert"
  ON public.messages FOR INSERT
  TO authenticated
  WITH CHECK (sender_id = auth.uid());

CREATE POLICY "messages_own_update"
  ON public.messages FOR UPDATE
  TO authenticated
  USING (receiver_id = auth.uid());

-- ========================
-- conversations (PRIVE)
-- ========================
CREATE POLICY "conversations_parties_read"
  ON public.conversations FOR SELECT
  TO authenticated
  USING (
    educator_id IN (SELECT id FROM educator_profiles WHERE user_id = auth.uid())
    OR family_id IN (SELECT id FROM family_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "conversations_authenticated_insert"
  ON public.conversations FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "conversations_parties_update"
  ON public.conversations FOR UPDATE
  TO authenticated
  USING (
    educator_id IN (SELECT id FROM educator_profiles WHERE user_id = auth.uid())
    OR family_id IN (SELECT id FROM family_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "conversations_parties_delete"
  ON public.conversations FOR DELETE
  TO authenticated
  USING (
    educator_id IN (SELECT id FROM educator_profiles WHERE user_id = auth.uid())
    OR family_id IN (SELECT id FROM family_profiles WHERE user_id = auth.uid())
  );

-- ========================
-- reviews (public read, authenticated write)
-- ========================
CREATE POLICY "reviews_public_read"
  ON public.reviews FOR SELECT
  TO public
  USING (true);

CREATE POLICY "reviews_family_insert"
  ON public.reviews FOR INSERT
  TO authenticated
  WITH CHECK (family_id IN (SELECT id FROM family_profiles WHERE user_id = auth.uid()));

CREATE POLICY "reviews_family_update"
  ON public.reviews FOR UPDATE
  TO authenticated
  USING (family_id IN (SELECT id FROM family_profiles WHERE user_id = auth.uid()));

CREATE POLICY "reviews_family_delete"
  ON public.reviews FOR DELETE
  TO authenticated
  USING (family_id IN (SELECT id FROM family_profiles WHERE user_id = auth.uid()));

-- ========================
-- notifications (PRIVE)
-- ========================
CREATE POLICY "notifications_own_read"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "notifications_own_update"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "notifications_own_delete"
  ON public.notifications FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Service peut inserer
CREATE POLICY "notifications_service_insert"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ========================
-- transactions (PRIVE - parties uniquement)
-- ========================
CREATE POLICY "transactions_parties_read"
  ON public.transactions FOR SELECT
  TO authenticated
  USING (
    educator_id IN (SELECT id FROM educator_profiles WHERE user_id = auth.uid())
    OR family_id IN (SELECT id FROM family_profiles WHERE user_id = auth.uid())
  );

-- ========================
-- invoices (PRIVE - parties uniquement)
-- ========================
CREATE POLICY "invoices_parties_read"
  ON public.invoices FOR SELECT
  TO authenticated
  USING (
    educator_id IN (SELECT id FROM educator_profiles WHERE user_id = auth.uid())
    OR family_id IN (SELECT id FROM family_profiles WHERE user_id = auth.uid())
  );

-- ========================
-- verification_documents (PRIVE - educateur + admin)
-- ========================
CREATE POLICY "verification_docs_educator_read"
  ON public.verification_documents FOR SELECT
  TO authenticated
  USING (educator_id IN (SELECT id FROM educator_profiles WHERE user_id = auth.uid()));

CREATE POLICY "verification_docs_educator_insert"
  ON public.verification_documents FOR INSERT
  TO authenticated
  WITH CHECK (educator_id IN (SELECT id FROM educator_profiles WHERE user_id = auth.uid()));

CREATE POLICY "verification_docs_educator_update"
  ON public.verification_documents FOR UPDATE
  TO authenticated
  USING (educator_id IN (SELECT id FROM educator_profiles WHERE user_id = auth.uid()));

CREATE POLICY "verification_docs_educator_delete"
  ON public.verification_documents FOR DELETE
  TO authenticated
  USING (educator_id IN (SELECT id FROM educator_profiles WHERE user_id = auth.uid()));

CREATE POLICY "verification_docs_admin_all"
  ON public.verification_documents FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin'));

-- ========================
-- criminal_record_verifications (ADMIN uniquement)
-- ========================
CREATE POLICY "criminal_records_admin_only"
  ON public.criminal_record_verifications FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin'));

-- Educateur peut voir les siens
CREATE POLICY "criminal_records_educator_read"
  ON public.criminal_record_verifications FOR SELECT
  TO authenticated
  USING (educator_id IN (SELECT id FROM educator_profiles WHERE user_id = auth.uid()));

-- ========================
-- video_interviews (PRIVE - educateur + admin)
-- ========================
CREATE POLICY "video_interviews_educator_read"
  ON public.video_interviews FOR SELECT
  TO authenticated
  USING (educator_id IN (SELECT id FROM educator_profiles WHERE user_id = auth.uid()));

CREATE POLICY "video_interviews_admin_all"
  ON public.video_interviews FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin'));

-- ========================
-- password_reset_tokens (AUCUN acces public)
-- ========================
CREATE POLICY "password_reset_no_access"
  ON public.password_reset_tokens FOR ALL
  TO public
  USING (false);

-- ========================
-- educator_reputation (lecture publique)
-- ========================
CREATE POLICY "educator_reputation_public_read"
  ON public.educator_reputation FOR SELECT
  TO public
  USING (true);

-- ========================
-- blog_posts (lecture publique des publies)
-- ========================
CREATE POLICY "blog_posts_published_read"
  ON public.blog_posts FOR SELECT
  TO public
  USING (status = 'published');

CREATE POLICY "blog_posts_author_read"
  ON public.blog_posts FOR SELECT
  TO authenticated
  USING (author_id IN (SELECT id FROM educator_profiles WHERE user_id = auth.uid()));

CREATE POLICY "blog_posts_author_insert"
  ON public.blog_posts FOR INSERT
  TO authenticated
  WITH CHECK (author_id IN (SELECT id FROM educator_profiles WHERE user_id = auth.uid()));

CREATE POLICY "blog_posts_author_update"
  ON public.blog_posts FOR UPDATE
  TO authenticated
  USING (author_id IN (SELECT id FROM educator_profiles WHERE user_id = auth.uid()));

CREATE POLICY "blog_posts_author_delete"
  ON public.blog_posts FOR DELETE
  TO authenticated
  USING (author_id IN (SELECT id FROM educator_profiles WHERE user_id = auth.uid()));

-- ========================
-- community_posts (lecture publique)
-- ========================
CREATE POLICY "community_posts_public_read"
  ON public.community_posts FOR SELECT
  TO public
  USING (true);

CREATE POLICY "community_posts_auth_insert"
  ON public.community_posts FOR INSERT
  TO authenticated
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "community_posts_author_update"
  ON public.community_posts FOR UPDATE
  TO authenticated
  USING (author_id = auth.uid());

CREATE POLICY "community_posts_author_delete"
  ON public.community_posts FOR DELETE
  TO authenticated
  USING (author_id = auth.uid());

-- ========================
-- community_comments (lecture publique)
-- ========================
CREATE POLICY "community_comments_public_read"
  ON public.community_comments FOR SELECT
  TO public
  USING (true);

CREATE POLICY "community_comments_auth_insert"
  ON public.community_comments FOR INSERT
  TO authenticated
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "community_comments_author_update"
  ON public.community_comments FOR UPDATE
  TO authenticated
  USING (author_id = auth.uid());

CREATE POLICY "community_comments_author_delete"
  ON public.community_comments FOR DELETE
  TO authenticated
  USING (author_id = auth.uid());

-- ========================
-- community_reactions (lecture publique)
-- ========================
CREATE POLICY "community_reactions_public_read"
  ON public.community_reactions FOR SELECT
  TO public
  USING (true);

CREATE POLICY "community_reactions_auth_insert"
  ON public.community_reactions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "community_reactions_own_delete"
  ON public.community_reactions FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ========================
-- community_reports (PRIVE)
-- ========================
CREATE POLICY "community_reports_auth_insert"
  ON public.community_reports FOR INSERT
  TO authenticated
  WITH CHECK (reporter_id = auth.uid());

CREATE POLICY "community_reports_own_read"
  ON public.community_reports FOR SELECT
  TO authenticated
  USING (reporter_id = auth.uid());

-- ========================
-- content_reports (PRIVE)
-- ========================
CREATE POLICY "content_reports_auth_insert"
  ON public.content_reports FOR INSERT
  TO authenticated
  WITH CHECK (reporter_id = auth.uid());

CREATE POLICY "content_reports_own_read"
  ON public.content_reports FOR SELECT
  TO authenticated
  USING (reporter_id = auth.uid());

-- ========================
-- bookings (parties uniquement)
-- ========================
CREATE POLICY "bookings_parties_read"
  ON public.bookings FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM educator_profiles WHERE id = bookings.educator_id AND user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM family_profiles WHERE id = bookings.family_id AND user_id = auth.uid())
  );

CREATE POLICY "bookings_auth_insert"
  ON public.bookings FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "bookings_parties_update"
  ON public.bookings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM educator_profiles WHERE id = bookings.educator_id AND user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM family_profiles WHERE id = bookings.family_id AND user_id = auth.uid())
  );

-- ========================
-- certifications (lecture publique, gestion par educateur)
-- ========================
CREATE POLICY "certifications_public_read"
  ON public.certifications FOR SELECT
  TO public
  USING (true);

CREATE POLICY "certifications_educator_manage"
  ON public.certifications FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM educator_profiles WHERE id = certifications.educator_id AND user_id = auth.uid()));

-- ========================
-- educator_availability (lecture publique future, gestion par educateur)
-- ========================
CREATE POLICY "educator_availability_public_read"
  ON public.educator_availability FOR SELECT
  TO public
  USING (is_available = true AND availability_date >= CURRENT_DATE);

CREATE POLICY "educator_availability_own_manage"
  ON public.educator_availability FOR ALL
  TO authenticated
  USING (educator_id IN (SELECT id FROM educator_profiles WHERE user_id = auth.uid()));

-- ========================
-- educator_weekly_availability (lecture publique, gestion par educateur)
-- ========================
CREATE POLICY "educator_weekly_avail_public_read"
  ON public.educator_weekly_availability FOR SELECT
  TO public
  USING (true);

CREATE POLICY "educator_weekly_avail_own_manage"
  ON public.educator_weekly_availability FOR ALL
  TO authenticated
  USING (educator_id IN (SELECT id FROM educator_profiles WHERE user_id = auth.uid()));

-- ========================
-- educator_availability_exceptions (lecture publique, gestion par educateur)
-- ========================
CREATE POLICY "educator_avail_exceptions_public_read"
  ON public.educator_availability_exceptions FOR SELECT
  TO public
  USING (true);

CREATE POLICY "educator_avail_exceptions_own_manage"
  ON public.educator_availability_exceptions FOR ALL
  TO authenticated
  USING (educator_id IN (SELECT id FROM educator_profiles WHERE user_id = auth.uid()));

-- ========================
-- availability_slots (gestion par educateur + admin)
-- ========================
CREATE POLICY "availability_slots_own_manage"
  ON public.availability_slots FOR ALL
  TO authenticated
  USING (educator_id IN (SELECT id FROM educator_profiles WHERE user_id = auth.uid()));

CREATE POLICY "availability_slots_admin_manage"
  ON public.availability_slots FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin'));

-- ========================
-- favorite_educators (PRIVE)
-- ========================
CREATE POLICY "favorites_own_read"
  ON public.favorite_educators FOR SELECT
  TO authenticated
  USING (family_id IN (SELECT id FROM family_profiles WHERE user_id = auth.uid()));

CREATE POLICY "favorites_own_insert"
  ON public.favorite_educators FOR INSERT
  TO authenticated
  WITH CHECK (family_id IN (SELECT id FROM family_profiles WHERE user_id = auth.uid()));

CREATE POLICY "favorites_own_delete"
  ON public.favorite_educators FOR DELETE
  TO authenticated
  USING (family_id IN (SELECT id FROM family_profiles WHERE user_id = auth.uid()));

-- ========================
-- blocked_families (educateur uniquement)
-- ========================
CREATE POLICY "blocked_families_educator_read"
  ON public.blocked_families FOR SELECT
  TO authenticated
  USING (educator_id IN (SELECT id FROM educator_profiles WHERE user_id = auth.uid()));

CREATE POLICY "blocked_families_educator_insert"
  ON public.blocked_families FOR INSERT
  TO authenticated
  WITH CHECK (educator_id IN (SELECT id FROM educator_profiles WHERE user_id = auth.uid()));

CREATE POLICY "blocked_families_educator_delete"
  ON public.blocked_families FOR DELETE
  TO authenticated
  USING (educator_id IN (SELECT id FROM educator_profiles WHERE user_id = auth.uid()));

-- ========================
-- blocked_users (PRIVE)
-- ========================
CREATE POLICY "blocked_users_own_read"
  ON public.blocked_users FOR SELECT
  TO authenticated
  USING (blocker_id = auth.uid());

CREATE POLICY "blocked_users_own_insert"
  ON public.blocked_users FOR INSERT
  TO authenticated
  WITH CHECK (blocker_id = auth.uid());

CREATE POLICY "blocked_users_own_delete"
  ON public.blocked_users FOR DELETE
  TO authenticated
  USING (blocker_id = auth.uid());

-- ========================
-- profile_views (educateur read, authenticated insert)
-- ========================
CREATE POLICY "profile_views_educator_read"
  ON public.profile_views FOR SELECT
  TO authenticated
  USING (educator_id IN (SELECT id FROM educator_profiles WHERE user_id = auth.uid()));

CREATE POLICY "profile_views_auth_insert"
  ON public.profile_views FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ========================
-- push_tokens (PRIVE)
-- ========================
CREATE POLICY "push_tokens_own_manage"
  ON public.push_tokens FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- ========================
-- subscriptions (educateur read own, public read status)
-- ========================
CREATE POLICY "subscriptions_own_read"
  ON public.subscriptions FOR SELECT
  TO authenticated
  USING (educator_id IN (SELECT id FROM educator_profiles WHERE user_id = auth.uid()));

CREATE POLICY "subscriptions_own_update"
  ON public.subscriptions FOR UPDATE
  TO authenticated
  USING (educator_id IN (SELECT id FROM educator_profiles WHERE user_id = auth.uid()));

CREATE POLICY "subscriptions_auth_insert"
  ON public.subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ========================
-- stripe_transfers (educateur read)
-- ========================
CREATE POLICY "stripe_transfers_educator_read"
  ON public.stripe_transfers FOR SELECT
  TO authenticated
  USING (educator_id IN (SELECT id FROM educator_profiles WHERE user_id = auth.uid()));

-- ========================
-- educator_stripe_accounts (educateur read)
-- ========================
CREATE POLICY "educator_stripe_accounts_own_read"
  ON public.educator_stripe_accounts FOR SELECT
  TO authenticated
  USING (educator_id IN (SELECT id FROM educator_profiles WHERE user_id = auth.uid()));

-- ========================
-- payment_transactions (educateur read)
-- ========================
CREATE POLICY "payment_transactions_educator_read"
  ON public.payment_transactions FOR SELECT
  TO authenticated
  USING (educator_id IN (SELECT id FROM educator_profiles WHERE user_id = auth.uid()));

-- ========================
-- session_confirmations (parties uniquement)
-- ========================
CREATE POLICY "session_confirmations_educator_manage"
  ON public.session_confirmations FOR ALL
  TO authenticated
  USING (appointment_id IN (
    SELECT id FROM appointments WHERE educator_id IN (SELECT id FROM educator_profiles WHERE user_id = auth.uid())
  ));

CREATE POLICY "session_confirmations_family_read"
  ON public.session_confirmations FOR SELECT
  TO authenticated
  USING (appointment_id IN (
    SELECT id FROM appointments WHERE family_id IN (SELECT id FROM family_profiles WHERE user_id = auth.uid())
  ));

CREATE POLICY "session_confirmations_family_update"
  ON public.session_confirmations FOR UPDATE
  TO authenticated
  USING (appointment_id IN (
    SELECT id FROM appointments WHERE family_id IN (SELECT id FROM family_profiles WHERE user_id = auth.uid())
  ));

-- ========================
-- appointment_disputes (parties uniquement)
-- ========================
CREATE POLICY "appointment_disputes_parties_read"
  ON public.appointment_disputes FOR SELECT
  TO authenticated
  USING (appointment_id IN (
    SELECT id FROM appointments
    WHERE family_id IN (SELECT id FROM family_profiles WHERE user_id = auth.uid())
    OR educator_id IN (SELECT id FROM educator_profiles WHERE user_id = auth.uid())
  ));

-- ========================
-- appointment_reports (PRIVE)
-- ========================
CREATE POLICY "appointment_reports_family_insert"
  ON public.appointment_reports FOR INSERT
  TO authenticated
  WITH CHECK (reporter_id IN (SELECT id FROM family_profiles WHERE user_id = auth.uid()));

CREATE POLICY "appointment_reports_family_read"
  ON public.appointment_reports FOR SELECT
  TO authenticated
  USING (reporter_id IN (SELECT id FROM family_profiles WHERE user_id = auth.uid()));

CREATE POLICY "appointment_reports_educator_read"
  ON public.appointment_reports FOR SELECT
  TO authenticated
  USING (educator_id IN (SELECT id FROM educator_profiles WHERE user_id = auth.uid()));

-- ========================
-- aid_attestations (parties uniquement)
-- ========================
CREATE POLICY "aid_attestations_family_read"
  ON public.aid_attestations FOR SELECT
  TO authenticated
  USING (family_id IN (SELECT id FROM family_profiles WHERE user_id = auth.uid()));

CREATE POLICY "aid_attestations_family_insert"
  ON public.aid_attestations FOR INSERT
  TO authenticated
  WITH CHECK (family_id IN (SELECT id FROM family_profiles WHERE user_id = auth.uid()));

CREATE POLICY "aid_attestations_educator_read"
  ON public.aid_attestations FOR SELECT
  TO authenticated
  USING (educator_id IN (SELECT id FROM educator_profiles WHERE user_id = auth.uid()));

-- ========================
-- diploma_verification_history (educateur + admin)
-- ========================
CREATE POLICY "diploma_history_educator_read"
  ON public.diploma_verification_history FOR SELECT
  TO authenticated
  USING (educator_id IN (SELECT id FROM educator_profiles WHERE user_id = auth.uid()));

CREATE POLICY "diploma_history_admin_read"
  ON public.diploma_verification_history FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin'));

-- ========================
-- user_feedback (PRIVE)
-- ========================
CREATE POLICY "user_feedback_own_read"
  ON public.user_feedback FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "user_feedback_own_insert"
  ON public.user_feedback FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "user_feedback_own_update"
  ON public.user_feedback FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- ========================
-- Tables child_* avec can_access_child()
-- ========================
DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['child_ppa', 'child_educational_goals', 'child_preferences', 'child_session_notes', 'child_skills']
  LOOP
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = t AND table_schema = 'public') THEN
      EXECUTE format('CREATE POLICY %I ON public.%I FOR ALL TO authenticated USING (can_access_child(child_id))', t || '_access', t);
    END IF;
  END LOOP;
END $$;

-- child_ppa_versions
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'child_ppa_versions' AND table_schema = 'public') THEN
    EXECUTE 'CREATE POLICY "child_ppa_versions_family_read" ON public.child_ppa_versions FOR SELECT TO authenticated USING (child_id IN (SELECT cp.id FROM child_profiles cp JOIN family_profiles fp ON cp.family_id = fp.id WHERE fp.user_id = auth.uid()))';
    EXECUTE 'CREATE POLICY "child_ppa_versions_family_insert" ON public.child_ppa_versions FOR INSERT TO authenticated WITH CHECK (child_id IN (SELECT cp.id FROM child_profiles cp JOIN family_profiles fp ON cp.family_id = fp.id WHERE fp.user_id = auth.uid()))';
  END IF;
END $$;

-- child_skill_history
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'child_skill_history' AND table_schema = 'public') THEN
    EXECUTE 'CREATE POLICY "child_skill_history_access" ON public.child_skill_history FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM child_skills cs WHERE cs.id = child_skill_history.skill_id AND can_access_child(cs.child_id)))';
  END IF;
END $$;

-- child_external_links
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'child_external_links' AND table_schema = 'public') THEN
    EXECUTE 'CREATE POLICY "child_external_links_family_manage" ON public.child_external_links FOR ALL TO authenticated USING (child_id IN (SELECT cp.id FROM child_profiles cp JOIN family_profiles fp ON cp.family_id = fp.id WHERE fp.user_id = auth.uid()))';
    EXECUTE 'CREATE POLICY "child_external_links_educator_read" ON public.child_external_links FOR SELECT TO authenticated USING (is_visible_to_educators = true AND child_id IN (SELECT DISTINCT a.child_id FROM appointments a JOIN educator_profiles ep ON a.educator_id = ep.id WHERE ep.user_id = auth.uid() AND a.status IN (''accepted'', ''completed'') AND a.child_id IS NOT NULL))';
  END IF;
END $$;

-- child_mdph_status
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'child_mdph_status' AND table_schema = 'public') THEN
    EXECUTE 'CREATE POLICY "child_mdph_family_read" ON public.child_mdph_status FOR SELECT TO authenticated USING (child_id IN (SELECT cp.id FROM child_profiles cp JOIN family_profiles fp ON cp.family_id = fp.id WHERE fp.user_id = auth.uid()))';
    EXECUTE 'CREATE POLICY "child_mdph_family_insert" ON public.child_mdph_status FOR INSERT TO authenticated WITH CHECK (child_id IN (SELECT cp.id FROM child_profiles cp JOIN family_profiles fp ON cp.family_id = fp.id WHERE fp.user_id = auth.uid()))';
    EXECUTE 'CREATE POLICY "child_mdph_family_update" ON public.child_mdph_status FOR UPDATE TO authenticated USING (child_id IN (SELECT cp.id FROM child_profiles cp JOIN family_profiles fp ON cp.family_id = fp.id WHERE fp.user_id = auth.uid()))';
  END IF;
END $$;

-- ========================
-- VERIFICATION FINALE
-- ========================
SELECT
  tablename,
  COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;
