-- Vérifier tous les éducateurs avec leurs diplômes
SELECT
  ep.id,
  ep.first_name,
  ep.last_name,
  ep.region,
  ep.diploma_url,
  ep.diploma_verification_status,
  ep.diploma_submitted_at,
  ep.dreets_verification_sent_at,
  ep.diploma_ocr_text IS NOT NULL as has_ocr,
  ep.diploma_ocr_confidence,
  au.email
FROM educator_profiles ep
LEFT JOIN auth.users au ON ep.user_id = au.id
WHERE ep.diploma_url IS NOT NULL
ORDER BY ep.diploma_submitted_at DESC;

-- Compter les diplômes par statut
SELECT
  diploma_verification_status,
  COUNT(*) as count
FROM educator_profiles
WHERE diploma_url IS NOT NULL
GROUP BY diploma_verification_status;
