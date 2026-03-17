-- ============================================================
-- FIX: Restrict anon access to sensitive columns
-- Problem: anon key can query ALL columns via REST API
-- Solution: Remove anon direct access, create a safe VIEW
-- ============================================================

-- 1. Drop the public read policy that lets anon see all columns
DROP POLICY IF EXISTS "educator_profiles_public_read" ON public.educator_profiles;

-- 2. Re-create the public read policy for AUTHENTICATED only
CREATE POLICY "educator_profiles_public_read"
  ON public.educator_profiles FOR SELECT
  TO authenticated
  USING (profile_visible = true);

-- 3. Create a secure VIEW with only public-safe columns
DROP VIEW IF EXISTS public.public_educator_profiles;

CREATE VIEW public.public_educator_profiles
  WITH (security_invoker = false)
AS
SELECT
  ep.id,
  ep.first_name,
  ep.last_name,
  ep.bio,
  ep.profile_image_url,
  ep.location,
  ep.years_of_experience,
  ep.hourly_rate,
  ep.specializations,
  ep.languages,
  ep.rating,
  ep.total_reviews,
  ep.created_at,
  ep.updated_at,
  ep.latitude,
  ep.longitude,
  ep.specialties,
  ep.certifications,
  ep.experience_years,
  ep.avatar_url,
  ep.avatar_moderation_status,
  ep.subscription_status,
  ep.total_views,
  ep.region,
  ep.verification_badge,
  ep.profile_visible,
  ep.cv_url,
  ep.profession_type,
  ep.linkedin_url,
  ep.suspended_until,
  ep.skills,
  ep.video_presentation_url,
  ep.video_duration_seconds,
  ep.video_uploaded_at,
  ep.sap_agreement_number,
  ep.sap_agreement_expiry,
  ep.is_conventioned_fip,
  ep.gender
FROM public.educator_profiles ep
WHERE ep.profile_visible = true;

-- 4. Grant SELECT on the VIEW to both anon and authenticated
GRANT SELECT ON public.public_educator_profiles TO anon;
GRANT SELECT ON public.public_educator_profiles TO authenticated;

-- 5. Revoke direct anon SELECT on ALL sensitive tables
REVOKE SELECT ON public.educator_profiles FROM anon;
REVOKE SELECT ON public.family_profiles FROM anon;
REVOKE SELECT ON public.subscriptions FROM anon;
REVOKE SELECT ON public.appointments FROM anon;
REVOKE SELECT ON public.payments FROM anon;
REVOKE SELECT ON public.stripe_transfers FROM anon;
REVOKE SELECT ON public.verification_documents FROM anon;
REVOKE SELECT ON public.criminal_record_verifications FROM anon;
REVOKE SELECT ON public.video_interviews FROM anon;
REVOKE SELECT ON public.child_profiles FROM anon;
REVOKE SELECT ON public.ppa_plans FROM anon;
REVOKE SELECT ON public.ppa_objectives FROM anon;
REVOKE SELECT ON public.ppa_sessions FROM anon;
REVOKE SELECT ON public.blocked_families FROM anon;
REVOKE SELECT ON public.notifications FROM anon;
REVOKE SELECT ON public.invoices FROM anon;
REVOKE SELECT ON public.educator_documents FROM anon;
REVOKE SELECT ON public.educator_certifications FROM anon;
REVOKE SELECT ON public.profile_views FROM anon;
REVOKE SELECT ON public.aid_attestations FROM anon;
REVOKE SELECT ON public.appointment_disputes FROM anon;
REVOKE SELECT ON public.appointment_reports FROM anon;
REVOKE SELECT ON public.availability_slots FROM anon;

-- 6. Verify after execution:
-- SELECT tablename, has_table_privilege('anon', 'public.' || tablename, 'SELECT') as anon_can_read
-- FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
