-- ============================================
-- Script de vérification du système de diplômes
-- Date: 2025-11-22
-- ============================================

-- 1. Vérifier les éducateurs avec diplôme uploadé
SELECT
  id,
  first_name,
  last_name,
  region,
  diploma_url,
  diploma_number,
  diploma_delivery_date,
  diploma_verification_status,
  diploma_ocr_text IS NOT NULL as ocr_done,
  diploma_ocr_confidence,
  dreets_verification_sent_at,
  dreets_verified,
  created_at
FROM educator_profiles
WHERE diploma_url IS NOT NULL
ORDER BY diploma_submitted_at DESC;

-- 2. Vérifier l'historique des vérifications
SELECT
  h.id,
  h.educator_id,
  e.first_name,
  e.last_name,
  h.action,
  h.reason,
  h.ocr_confidence,
  h.dreets_verification_sent,
  h.created_at
FROM diploma_verification_history h
JOIN educator_profiles e ON h.educator_id = e.id
ORDER BY h.created_at DESC
LIMIT 20;

-- 3. Statistiques globales
SELECT
  COUNT(*) FILTER (WHERE diploma_verification_status = 'pending') as pending,
  COUNT(*) FILTER (WHERE diploma_verification_status = 'verified') as verified,
  COUNT(*) FILTER (WHERE diploma_verification_status = 'rejected') as rejected,
  COUNT(*) FILTER (WHERE diploma_url IS NULL) as no_diploma,
  COUNT(*) FILTER (WHERE dreets_verification_sent_at IS NOT NULL) as dreets_sent,
  COUNT(*) FILTER (WHERE dreets_verified = true) as dreets_verified
FROM educator_profiles;

-- 4. Vérifier le bucket storage
SELECT * FROM storage.buckets WHERE id = 'diplomas';

-- 5. Vérifier les policies du bucket
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'objects'
  AND policyname LIKE '%diplomas%';
