-- Migration complémentaire pour OCR et vérification DREETS
-- Date: 2025-11-21
-- À exécuter APRÈS supabase-diploma-verification.sql

-- 1. Ajouter les colonnes pour l'OCR et la vérification DREETS
ALTER TABLE educator_profiles
ADD COLUMN IF NOT EXISTS diploma_number TEXT,
ADD COLUMN IF NOT EXISTS diploma_delivery_date TEXT,
ADD COLUMN IF NOT EXISTS diploma_ocr_text TEXT,
ADD COLUMN IF NOT EXISTS diploma_ocr_confidence FLOAT,
ADD COLUMN IF NOT EXISTS diploma_ocr_analysis TEXT,
ADD COLUMN IF NOT EXISTS dreets_verification_sent_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS dreets_verification_response TEXT,
ADD COLUMN IF NOT EXISTS dreets_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS dreets_response_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS region TEXT;

-- 2. Créer un index pour les recherches par numéro de diplôme
CREATE INDEX IF NOT EXISTS idx_diploma_number
ON educator_profiles(diploma_number)
WHERE diploma_number IS NOT NULL;

-- 3. Créer un index pour le statut de vérification DREETS
CREATE INDEX IF NOT EXISTS idx_dreets_verified
ON educator_profiles(dreets_verified)
WHERE dreets_verified = true;

-- 4. Mettre à jour la table d'historique pour inclure les actions OCR et DREETS
ALTER TABLE diploma_verification_history
ADD COLUMN IF NOT EXISTS ocr_confidence FLOAT,
ADD COLUMN IF NOT EXISTS dreets_verification_sent BOOLEAN DEFAULT FALSE;

-- 5. Créer une vue pour les statistiques OCR
CREATE OR REPLACE VIEW diploma_ocr_stats AS
SELECT
  COUNT(*) FILTER (WHERE diploma_ocr_text IS NOT NULL) as ocr_analyzed_count,
  COUNT(*) FILTER (WHERE diploma_ocr_confidence >= 80) as high_confidence_count,
  COUNT(*) FILTER (WHERE diploma_ocr_confidence < 80 AND diploma_ocr_confidence > 0) as low_confidence_count,
  AVG(diploma_ocr_confidence) as average_confidence,
  COUNT(*) FILTER (WHERE dreets_verification_sent_at IS NOT NULL) as dreets_requests_sent,
  COUNT(*) FILTER (WHERE dreets_verified = true) as dreets_verified_count,
  COUNT(*) FILTER (WHERE dreets_verified = false AND dreets_verification_sent_at IS NOT NULL) as dreets_pending_count
FROM educator_profiles;

-- 6. Permission pour voir les stats OCR
GRANT SELECT ON diploma_ocr_stats TO authenticated;

-- 7. Fonction pour enregistrer une analyse OCR
CREATE OR REPLACE FUNCTION log_ocr_analysis(
  p_educator_id UUID,
  p_ocr_text TEXT,
  p_confidence FLOAT,
  p_analysis TEXT,
  p_diploma_number TEXT DEFAULT NULL,
  p_delivery_date TEXT DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  UPDATE educator_profiles
  SET
    diploma_ocr_text = p_ocr_text,
    diploma_ocr_confidence = p_confidence,
    diploma_ocr_analysis = p_analysis,
    diploma_number = COALESCE(p_diploma_number, diploma_number),
    diploma_delivery_date = COALESCE(p_delivery_date, diploma_delivery_date)
  WHERE id = p_educator_id;

  -- Enregistrer dans l'historique
  INSERT INTO diploma_verification_history (
    educator_id,
    action,
    performed_by,
    reason,
    ocr_confidence
  ) VALUES (
    p_educator_id,
    'submitted',
    auth.uid(),
    'Analyse OCR effectuée',
    p_confidence
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Fonction pour enregistrer l'envoi à la DREETS
CREATE OR REPLACE FUNCTION log_dreets_verification_sent(
  p_educator_id UUID
)
RETURNS void AS $$
BEGIN
  UPDATE educator_profiles
  SET dreets_verification_sent_at = NOW()
  WHERE id = p_educator_id;

  -- Enregistrer dans l'historique
  INSERT INTO diploma_verification_history (
    educator_id,
    action,
    performed_by,
    reason,
    dreets_verification_sent
  ) VALUES (
    p_educator_id,
    'submitted',
    auth.uid(),
    'Demande de vérification envoyée à la DREETS',
    true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Fonction pour enregistrer la réponse de la DREETS
CREATE OR REPLACE FUNCTION log_dreets_response(
  p_educator_id UUID,
  p_response TEXT,
  p_verified BOOLEAN
)
RETURNS void AS $$
BEGIN
  UPDATE educator_profiles
  SET
    dreets_verification_response = p_response,
    dreets_verified = p_verified,
    dreets_response_date = NOW(),
    -- Si vérifié par la DREETS, mettre à jour le statut du diplôme
    diploma_verification_status = CASE WHEN p_verified THEN 'verified' ELSE 'rejected' END,
    diploma_verified_at = CASE WHEN p_verified THEN NOW() ELSE NULL END,
    diploma_rejected_reason = CASE
      WHEN NOT p_verified THEN 'Diplôme non reconnu par la DREETS: ' || p_response
      ELSE NULL
    END
  WHERE id = p_educator_id;

  -- Enregistrer dans l'historique
  INSERT INTO diploma_verification_history (
    educator_id,
    action,
    performed_by,
    reason,
    dreets_verification_sent
  ) VALUES (
    p_educator_id,
    CASE WHEN p_verified THEN 'verified' ELSE 'rejected' END,
    auth.uid(),
    'Réponse DREETS: ' || p_response,
    true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Vue pour les diplômes en attente de réponse DREETS
CREATE OR REPLACE VIEW diplomas_pending_dreets_response AS
SELECT
  id,
  first_name,
  last_name,
  email,
  phone,
  diploma_number,
  diploma_url,
  dreets_verification_sent_at,
  EXTRACT(DAY FROM NOW() - dreets_verification_sent_at) as days_waiting
FROM educator_profiles
WHERE dreets_verification_sent_at IS NOT NULL
  AND dreets_response_date IS NULL
ORDER BY dreets_verification_sent_at ASC;

-- 11. Permission pour voir les diplômes en attente DREETS
GRANT SELECT ON diplomas_pending_dreets_response TO authenticated;

-- 12. Trigger pour mettre à jour automatiquement le statut quand la DREETS répond
CREATE OR REPLACE FUNCTION update_status_on_dreets_response()
RETURNS TRIGGER AS $$
BEGIN
  -- Si la DREETS a répondu et que le statut n'a pas encore été mis à jour
  IF NEW.dreets_verified IS NOT NULL AND NEW.dreets_response_date IS NOT NULL THEN
    NEW.diploma_verification_status := CASE
      WHEN NEW.dreets_verified THEN 'verified'
      ELSE 'rejected'
    END;

    IF NEW.dreets_verified THEN
      NEW.diploma_verified_at := NOW();
      NEW.diploma_rejected_reason := NULL;
    ELSE
      NEW.diploma_verified_at := NULL;
      NEW.diploma_rejected_reason := 'Diplôme non reconnu par la DREETS';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_dreets_response ON educator_profiles;
CREATE TRIGGER on_dreets_response
  BEFORE UPDATE ON educator_profiles
  FOR EACH ROW
  WHEN (OLD.dreets_response_date IS NULL AND NEW.dreets_response_date IS NOT NULL)
  EXECUTE FUNCTION update_status_on_dreets_response();

-- 13. Commentaires pour documentation
COMMENT ON COLUMN educator_profiles.diploma_number IS 'Numéro du diplôme extrait par OCR ou saisi manuellement';
COMMENT ON COLUMN educator_profiles.diploma_delivery_date IS 'Date de délivrance du diplôme';
COMMENT ON COLUMN educator_profiles.diploma_ocr_text IS 'Texte complet extrait du diplôme par OCR';
COMMENT ON COLUMN educator_profiles.diploma_ocr_confidence IS 'Score de confiance de l\'OCR (0-100)';
COMMENT ON COLUMN educator_profiles.diploma_ocr_analysis IS 'Rapport d\'analyse OCR automatique';
COMMENT ON COLUMN educator_profiles.dreets_verification_sent_at IS 'Date d\'envoi de la demande de vérification à la DREETS';
COMMENT ON COLUMN educator_profiles.dreets_verification_response IS 'Réponse de la DREETS à notre demande';
COMMENT ON COLUMN educator_profiles.dreets_verified IS 'Diplôme vérifié et validé par la DREETS';
COMMENT ON COLUMN educator_profiles.dreets_response_date IS 'Date de réponse de la DREETS';
COMMENT ON COLUMN educator_profiles.region IS 'Région de délivrance du diplôme (pour contacter la bonne DREETS)';
