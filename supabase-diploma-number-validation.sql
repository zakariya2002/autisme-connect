-- =====================================================
-- VALIDATION AVANCÉE DES NUMÉROS DE DIPLÔMES
-- =====================================================
-- Ce script met en place :
-- 1. Validation du format des numéros de diplômes
-- 2. Détection de doublons
-- 3. Base locale des diplômes vérifiés

-- =====================================================
-- 1. TABLE DE RÉFÉRENCE DES DIPLÔMES VÉRIFIÉS
-- =====================================================

CREATE TABLE IF NOT EXISTS verified_diplomas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  diploma_number VARCHAR(100) NOT NULL UNIQUE,
  diploma_type VARCHAR(50) NOT NULL,
  holder_name VARCHAR(255) NOT NULL,
  issuing_organization VARCHAR(255) NOT NULL,
  issue_date DATE NOT NULL,
  issuing_region VARCHAR(100),
  verification_method VARCHAR(50), -- 'dreets', 'document', 'manual'
  verified_at TIMESTAMP DEFAULT NOW(),
  verified_by UUID REFERENCES auth.users(id),
  notes TEXT,
  CONSTRAINT unique_diploma_number UNIQUE (diploma_number)
);

CREATE INDEX IF NOT EXISTS idx_verified_diplomas_number ON verified_diplomas(diploma_number);
CREATE INDEX IF NOT EXISTS idx_verified_diplomas_type ON verified_diplomas(diploma_type);

COMMENT ON TABLE verified_diplomas IS 'Base locale des diplômes déjà vérifiés pour référence future';
COMMENT ON COLUMN verified_diplomas.verification_method IS 'Méthode : dreets (DREETS confirmé), document (vérif visuelle), manual (vérif manuelle)';

-- =====================================================
-- 2. FONCTION DE VALIDATION DU FORMAT DES NUMÉROS
-- =====================================================

CREATE OR REPLACE FUNCTION validate_diploma_number_format(
  diploma_type VARCHAR(50),
  diploma_number VARCHAR(100)
) RETURNS BOOLEAN AS $$
BEGIN
  -- Si pas de numéro fourni, retourner false
  IF diploma_number IS NULL OR diploma_number = '' THEN
    RETURN false;
  END IF;

  -- Validation selon le type de diplôme
  CASE diploma_type
    -- DEES : Format attendu : année + région + numéro séquentiel (ex: 2023-IDF-12345)
    WHEN 'DEES' THEN
      RETURN diploma_number ~ '^[0-9]{4}-[A-Z]{2,4}-[0-9]{4,6}$';

    -- DEME : Format similaire au DEES
    WHEN 'DEME' THEN
      RETURN diploma_number ~ '^[0-9]{4}-[A-Z]{2,4}-[0-9]{4,6}$';

    -- Autres diplômes : validation basique (au moins 5 caractères alphanumériques)
    ELSE
      RETURN length(diploma_number) >= 5;
  END CASE;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION validate_diploma_number_format IS 'Valide le format du numéro de diplôme selon son type';

-- =====================================================
-- 3. FONCTION DE DÉTECTION DE DOUBLONS
-- =====================================================

CREATE OR REPLACE FUNCTION check_diploma_number_duplicate(
  diploma_number VARCHAR(100),
  current_certification_id UUID DEFAULT NULL
) RETURNS TABLE(
  is_duplicate BOOLEAN,
  duplicate_count INTEGER,
  existing_certifications JSON
) AS $$
DECLARE
  dup_count INTEGER;
  duplicates JSON;
BEGIN
  -- Compter les occurrences du même numéro (en excluant la certification actuelle)
  SELECT COUNT(*)
  INTO dup_count
  FROM certifications
  WHERE certifications.diploma_number = check_diploma_number_duplicate.diploma_number
    AND (current_certification_id IS NULL OR certifications.id != current_certification_id);

  -- Récupérer les détails des doublons
  SELECT json_agg(
    json_build_object(
      'certification_id', c.id,
      'educator_id', c.educator_id,
      'educator_name', ep.first_name || ' ' || ep.last_name,
      'type', c.type,
      'verification_status', c.verification_status,
      'created_at', c.created_at
    )
  )
  INTO duplicates
  FROM certifications c
  LEFT JOIN educator_profiles ep ON c.educator_id = ep.id
  WHERE c.diploma_number = check_diploma_number_duplicate.diploma_number
    AND (current_certification_id IS NULL OR c.id != current_certification_id);

  -- Retourner les résultats
  RETURN QUERY SELECT
    (dup_count > 0)::BOOLEAN as is_duplicate,
    dup_count as duplicate_count,
    COALESCE(duplicates, '[]'::json) as existing_certifications;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION check_diploma_number_duplicate IS 'Vérifie si un numéro de diplôme est déjà utilisé par d''autres certifications';

-- =====================================================
-- 4. FONCTION POUR ENREGISTRER UN DIPLÔME VÉRIFIÉ
-- =====================================================

CREATE OR REPLACE FUNCTION register_verified_diploma(
  cert_id UUID,
  verification_method VARCHAR(50),
  verified_by_user_id UUID,
  verification_notes TEXT DEFAULT NULL
) RETURNS VOID AS $$
DECLARE
  cert RECORD;
  educator RECORD;
BEGIN
  -- Récupérer les infos de la certification
  SELECT * INTO cert FROM certifications WHERE id = cert_id;

  -- Récupérer les infos de l'éducateur
  SELECT * INTO educator FROM educator_profiles WHERE id = cert.educator_id;

  -- Vérifier que le numéro de diplôme existe
  IF cert.diploma_number IS NULL OR cert.diploma_number = '' THEN
    RAISE EXCEPTION 'Pas de numéro de diplôme à enregistrer';
  END IF;

  -- Insérer dans la base des diplômes vérifiés (ou mettre à jour si existe)
  INSERT INTO verified_diplomas (
    diploma_number,
    diploma_type,
    holder_name,
    issuing_organization,
    issue_date,
    issuing_region,
    verification_method,
    verified_by,
    notes
  ) VALUES (
    cert.diploma_number,
    cert.type,
    educator.first_name || ' ' || educator.last_name,
    cert.issuing_organization,
    cert.issue_date,
    cert.issuing_region,
    verification_method,
    verified_by_user_id,
    verification_notes
  )
  ON CONFLICT (diploma_number) DO UPDATE SET
    verification_method = EXCLUDED.verification_method,
    verified_at = NOW(),
    verified_by = EXCLUDED.verified_by,
    notes = EXCLUDED.notes;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION register_verified_diploma IS 'Enregistre un diplôme dans la base des diplômes vérifiés';

-- =====================================================
-- 5. VUE POUR VOIR LES ALERTES DE DOUBLONS
-- =====================================================

CREATE OR REPLACE VIEW diploma_duplicates_alert AS
SELECT
  c.diploma_number,
  c.type as diploma_type,
  COUNT(*) as usage_count,
  json_agg(
    json_build_object(
      'certification_id', c.id,
      'educator_id', c.educator_id,
      'educator_name', ep.first_name || ' ' || ep.last_name,
      'verification_status', c.verification_status,
      'created_at', c.created_at
    )
  ) as certifications_using_this_number
FROM certifications c
LEFT JOIN educator_profiles ep ON c.educator_id = ep.id
WHERE c.diploma_number IS NOT NULL
  AND c.diploma_number != ''
GROUP BY c.diploma_number, c.type
HAVING COUNT(*) > 1
ORDER BY usage_count DESC, c.diploma_number;

COMMENT ON VIEW diploma_duplicates_alert IS 'Affiche les numéros de diplômes utilisés par plusieurs certifications (doublons suspects)';

-- =====================================================
-- 6. TRIGGER POUR DÉTECTER LES DOUBLONS À L'INSERTION
-- =====================================================

CREATE OR REPLACE FUNCTION trigger_check_diploma_duplicate()
RETURNS TRIGGER AS $$
DECLARE
  dup_check RECORD;
BEGIN
  -- Vérifier uniquement si un numéro de diplôme est fourni
  IF NEW.diploma_number IS NOT NULL AND NEW.diploma_number != '' THEN

    -- Vérifier les doublons
    SELECT * INTO dup_check
    FROM check_diploma_number_duplicate(NEW.diploma_number, NEW.id);

    -- Si doublon détecté, ajouter une note dans les logs (ne pas bloquer)
    IF dup_check.is_duplicate THEN
      RAISE WARNING 'ALERTE DOUBLON : Le numéro de diplôme % est déjà utilisé par % autre(s) certification(s)',
        NEW.diploma_number,
        dup_check.duplicate_count;

      -- On peut ajouter une note automatique
      NEW.verification_notes = COALESCE(NEW.verification_notes || E'\n\n', '') ||
        '⚠️ ALERTE : Ce numéro de diplôme est déjà utilisé par ' ||
        dup_check.duplicate_count || ' autre(s) certification(s). Vérification approfondie nécessaire.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Supprimer le trigger s'il existe
DROP TRIGGER IF EXISTS check_diploma_duplicate_trigger ON certifications;

-- Créer le trigger
CREATE TRIGGER check_diploma_duplicate_trigger
  BEFORE INSERT OR UPDATE ON certifications
  FOR EACH ROW
  EXECUTE FUNCTION trigger_check_diploma_duplicate();

COMMENT ON TRIGGER check_diploma_duplicate_trigger ON certifications IS
  'Vérifie automatiquement les doublons de numéros de diplômes et ajoute une alerte';

-- =====================================================
-- 7. FONCTION POUR VÉRIFIER SI UN DIPLÔME EST DÉJÀ VÉRIFIÉ
-- =====================================================

CREATE OR REPLACE FUNCTION is_diploma_already_verified(
  diploma_number VARCHAR(100)
) RETURNS TABLE(
  is_verified BOOLEAN,
  verification_details JSON
) AS $$
DECLARE
  verified_diploma RECORD;
  details JSON;
BEGIN
  -- Chercher dans la base des diplômes vérifiés
  SELECT * INTO verified_diploma
  FROM verified_diplomas
  WHERE verified_diplomas.diploma_number = is_diploma_already_verified.diploma_number;

  IF FOUND THEN
    details := json_build_object(
      'diploma_number', verified_diploma.diploma_number,
      'holder_name', verified_diploma.holder_name,
      'issuing_organization', verified_diploma.issuing_organization,
      'issue_date', verified_diploma.issue_date,
      'verification_method', verified_diploma.verification_method,
      'verified_at', verified_diploma.verified_at
    );

    RETURN QUERY SELECT true::BOOLEAN, details;
  ELSE
    RETURN QUERY SELECT false::BOOLEAN, NULL::JSON;
  END IF;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION is_diploma_already_verified IS 'Vérifie si un numéro de diplôme existe déjà dans la base des diplômes vérifiés';

-- =====================================================
-- RÉSUMÉ
-- =====================================================

SELECT '✅ Système de validation des diplômes mis en place avec succès !' as status;

SELECT
  'Configuration' as info,
  '1. Table verified_diplomas créée pour stocker les diplômes vérifiés' as step_1,
  '2. Fonction validate_diploma_number_format() pour valider le format' as step_2,
  '3. Fonction check_diploma_number_duplicate() pour détecter les doublons' as step_3,
  '4. Vue diploma_duplicates_alert pour voir les doublons' as step_4,
  '5. Trigger automatique pour alerter en cas de doublon' as step_5;

-- Afficher les formats attendus
SELECT
  'Formats de numéros de diplômes' as info,
  'DEES : 2023-IDF-12345 (Année-Région-Numéro)' as format_dees,
  'DEME : 2022-ARA-56789 (Année-Région-Numéro)' as format_deme,
  'Autres : Au moins 5 caractères alphanumériques' as format_autres;
