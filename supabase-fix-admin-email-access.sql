-- =====================================================
-- CORRIGER L'ACCÈS AUX EMAILS POUR L'ADMIN
-- =====================================================
-- Ce script crée une fonction sécurisée pour récupérer
-- les emails des éducateurs sans accès direct à auth.users

-- =====================================================
-- 1. FONCTION POUR RÉCUPÉRER L'EMAIL D'UN ÉDUCATEUR
-- =====================================================

CREATE OR REPLACE FUNCTION get_educator_email(educator_user_id UUID)
RETURNS TEXT
SECURITY DEFINER -- Exécute avec les permissions du créateur
SET search_path = public
AS $$
DECLARE
  user_email TEXT;
BEGIN
  -- Récupérer l'email depuis auth.users
  SELECT email INTO user_email
  FROM auth.users
  WHERE id = educator_user_id;

  RETURN user_email;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_educator_email IS 'Récupère l''email d''un éducateur de manière sécurisée';

-- =====================================================
-- 2. VUE POUR LES CERTIFICATIONS AVEC EMAILS
-- =====================================================

CREATE OR REPLACE VIEW certifications_with_educator_details AS
SELECT
  c.*,
  ep.first_name as educator_first_name,
  ep.last_name as educator_last_name,
  ep.user_id as educator_user_id,
  (SELECT email FROM auth.users WHERE id = ep.user_id) as educator_email
FROM certifications c
LEFT JOIN educator_profiles ep ON c.educator_id = ep.id;

COMMENT ON VIEW certifications_with_educator_details IS 'Certifications avec détails éducateurs incluant email';

-- =====================================================
-- 3. FONCTION RPC POUR RÉCUPÉRER LES CERTIFICATIONS
-- =====================================================

CREATE OR REPLACE FUNCTION get_certifications_for_admin(
  filter_status TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  educator_id UUID,
  type VARCHAR(50),
  name VARCHAR(255),
  issuing_organization VARCHAR(255),
  issue_date DATE,
  diploma_number VARCHAR(100),
  issuing_region VARCHAR(100),
  document_url TEXT,
  verification_status VARCHAR(20),
  verification_date TIMESTAMP,
  verification_notes TEXT,
  verified_by UUID,
  created_at TIMESTAMP,
  educator_first_name VARCHAR(100),
  educator_last_name VARCHAR(100),
  educator_email TEXT
)
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF filter_status IS NULL OR filter_status = 'all' THEN
    RETURN QUERY
    SELECT
      c.id,
      c.educator_id,
      c.type,
      c.name,
      c.issuing_organization,
      c.issue_date,
      c.diploma_number,
      c.issuing_region,
      c.document_url,
      c.verification_status,
      c.verification_date,
      c.verification_notes,
      c.verified_by,
      c.created_at,
      ep.first_name as educator_first_name,
      ep.last_name as educator_last_name,
      (SELECT email FROM auth.users WHERE auth.users.id = ep.user_id) as educator_email
    FROM certifications c
    LEFT JOIN educator_profiles ep ON c.educator_id = ep.id
    ORDER BY c.created_at DESC;
  ELSE
    RETURN QUERY
    SELECT
      c.id,
      c.educator_id,
      c.type,
      c.name,
      c.issuing_organization,
      c.issue_date,
      c.diploma_number,
      c.issuing_region,
      c.document_url,
      c.verification_status,
      c.verification_date,
      c.verification_notes,
      c.verified_by,
      c.created_at,
      ep.first_name as educator_first_name,
      ep.last_name as educator_last_name,
      (SELECT email FROM auth.users WHERE auth.users.id = ep.user_id) as educator_email
    FROM certifications c
    LEFT JOIN educator_profiles ep ON c.educator_id = ep.id
    WHERE c.verification_status = filter_status
    ORDER BY c.created_at DESC;
  END IF;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_certifications_for_admin IS 'Récupère les certifications avec emails pour l''admin';

-- =====================================================
-- RÉSUMÉ
-- =====================================================

SELECT '✅ Accès email admin configuré avec succès !' as status;

SELECT
  'Configuration' as info,
  '1. Fonction get_educator_email() pour récupérer un email' as step_1,
  '2. Vue certifications_with_educator_details avec emails' as step_2,
  '3. Fonction get_certifications_for_admin() pour l''interface admin' as step_3;
