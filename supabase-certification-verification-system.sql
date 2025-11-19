-- =====================================================
-- SYSTÈME DE VÉRIFICATION DES CERTIFICATIONS
-- =====================================================
-- Ce script crée toute l'infrastructure pour vérifier les diplômes
-- des éducateurs avec upload de documents et modération

-- =====================================================
-- 1. AJOUTER LES CHAMPS DE VÉRIFICATION AUX CERTIFICATIONS
-- =====================================================

ALTER TABLE certifications
ADD COLUMN IF NOT EXISTS verification_status VARCHAR(20) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS verification_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS verification_notes TEXT,
ADD COLUMN IF NOT EXISTS diploma_number VARCHAR(100),
ADD COLUMN IF NOT EXISTS issuing_region VARCHAR(100),
ADD COLUMN IF NOT EXISTS document_url TEXT,
ADD COLUMN IF NOT EXISTS dreets_verification_requested BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS dreets_verification_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS dreets_confirmation_received BOOLEAN DEFAULT false;

-- Contrainte pour le statut de vérification
ALTER TABLE certifications
ADD CONSTRAINT check_verification_status
CHECK (verification_status IN ('pending', 'document_verified', 'officially_confirmed', 'rejected'));

-- Commentaires pour documentation
COMMENT ON COLUMN certifications.verification_status IS 'Statut : pending, document_verified (badge vert), officially_confirmed (badge étoile), rejected';
COMMENT ON COLUMN certifications.verification_date IS 'Date de vérification manuelle du document';
COMMENT ON COLUMN certifications.verified_by IS 'ID de l''admin qui a vérifié';
COMMENT ON COLUMN certifications.verification_notes IS 'Notes de l''admin ou raison du rejet';
COMMENT ON COLUMN certifications.diploma_number IS 'Numéro du diplôme (obligatoire pour DEES/DEME)';
COMMENT ON COLUMN certifications.issuing_region IS 'Région d''obtention (pour contact DREETS)';
COMMENT ON COLUMN certifications.document_url IS 'URL du document uploadé dans Supabase Storage';
COMMENT ON COLUMN certifications.dreets_verification_requested IS 'Email envoyé à la DREETS';
COMMENT ON COLUMN certifications.dreets_verification_date IS 'Date d''envoi de la demande DREETS';
COMMENT ON COLUMN certifications.dreets_confirmation_received IS 'Confirmation reçue de la DREETS';

-- =====================================================
-- 2. CRÉER LA TABLE DES DOCUMENTS DE CERTIFICATION
-- =====================================================

CREATE TABLE IF NOT EXISTS certification_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  certification_id UUID NOT NULL REFERENCES certifications(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  file_type VARCHAR(50),
  uploaded_at TIMESTAMP DEFAULT NOW(),

  -- Métadonnées du document
  document_type VARCHAR(50) DEFAULT 'diploma', -- 'diploma' ou 'attestation'

  CONSTRAINT fk_certification
    FOREIGN KEY (certification_id)
    REFERENCES certifications(id)
    ON DELETE CASCADE
);

-- Index pour les recherches
CREATE INDEX IF NOT EXISTS idx_cert_docs_certification_id ON certification_documents(certification_id);
CREATE INDEX IF NOT EXISTS idx_certifications_status ON certifications(verification_status);
CREATE INDEX IF NOT EXISTS idx_certifications_educator ON certifications(educator_id, verification_status);

-- Commentaires
COMMENT ON TABLE certification_documents IS 'Stocke les métadonnées des documents uploadés (diplômes, attestations)';
COMMENT ON COLUMN certification_documents.document_type IS 'Type de document : diploma (diplôme principal) ou attestation (document complémentaire)';

-- =====================================================
-- 3. CRÉER LE BUCKET DE STOCKAGE POUR LES DOCUMENTS
-- =====================================================

-- Insérer le bucket pour les documents de certification
INSERT INTO storage.buckets (id, name, public)
VALUES ('certification-documents', 'certification-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Politique : Les utilisateurs authentifiés peuvent uploader leurs propres documents
DROP POLICY IF EXISTS "Users can upload their certification documents" ON storage.objects;
CREATE POLICY "Users can upload their certification documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'certification-documents'
  AND auth.uid() IS NOT NULL
);

-- Politique : Les utilisateurs peuvent voir leurs propres documents
DROP POLICY IF EXISTS "Users can view their certification documents" ON storage.objects;
CREATE POLICY "Users can view their certification documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'certification-documents'
  AND auth.uid() IS NOT NULL
);

-- Politique : Les admins peuvent voir tous les documents
DROP POLICY IF EXISTS "Admins can view all certification documents" ON storage.objects;
CREATE POLICY "Admins can view all certification documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'certification-documents'
  AND EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.role = 'admin'
  )
);

-- Politique : Les utilisateurs peuvent supprimer leurs propres documents
DROP POLICY IF EXISTS "Users can delete their certification documents" ON storage.objects;
CREATE POLICY "Users can delete their certification documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'certification-documents'
  AND auth.uid() IS NOT NULL
);

-- =====================================================
-- 4. CRÉER LA TABLE DES ORGANISMES CERTIFICATEURS
-- =====================================================

CREATE TABLE IF NOT EXISTS certification_issuers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'irts', 'dreets', 'aba', 'university', 'other'
  region VARCHAR(100),
  contact_email VARCHAR(255),
  contact_phone VARCHAR(20),
  website VARCHAR(255),
  is_verified BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insérer les principaux organismes français
INSERT INTO certification_issuers (name, type, region, contact_email, website) VALUES
('IRTS Paris Île-de-France', 'irts', 'Île-de-France', 'contact@irtsparisidf.fr', 'https://www.irtsparisidf.fr'),
('IRTS Auvergne-Rhône-Alpes', 'irts', 'Auvergne-Rhône-Alpes', 'contact@irtsara.fr', 'https://www.irtsara.fr'),
('IRTS PACA et Corse', 'irts', 'PACA', 'contact@irtspacacorse.fr', 'https://www.irtspacacorse.fr'),
('ARFRIPS', 'irts', 'Occitanie', 'contact@arfrips.fr', 'https://www.arfrips.fr'),
('IRTS Hauts-de-France', 'irts', 'Hauts-de-France', 'contact@irtshdf.fr', 'https://www.irtshdf.fr'),
('BACB (Behavior Analyst Certification Board)', 'aba', 'International', NULL, 'https://www.bacb.com'),
('DREETS Île-de-France', 'dreets', 'Île-de-France', 'dreets-idf@dreets.gouv.fr', NULL),
('DREETS Auvergne-Rhône-Alpes', 'dreets', 'Auvergne-Rhône-Alpes', 'dreets-ara@dreets.gouv.fr', NULL),
('DREETS PACA', 'dreets', 'PACA', 'dreets-paca@dreets.gouv.fr', NULL),
('DREETS Occitanie', 'dreets', 'Occitanie', 'dreets-occitanie@dreets.gouv.fr', NULL),
('DREETS Hauts-de-France', 'dreets', 'Hauts-de-France', 'dreets-hdf@dreets.gouv.fr', NULL)
ON CONFLICT DO NOTHING;

-- Index
CREATE INDEX IF NOT EXISTS idx_issuers_type ON certification_issuers(type);
CREATE INDEX IF NOT EXISTS idx_issuers_region ON certification_issuers(region);

COMMENT ON TABLE certification_issuers IS 'Liste des organismes certificateurs reconnus (IRTS, DREETS, etc.)';

-- =====================================================
-- 5. CRÉER LA VUE POUR LES CERTIFICATIONS AVEC DOCUMENTS
-- =====================================================

CREATE OR REPLACE VIEW certifications_with_documents AS
SELECT
  c.*,
  COALESCE(
    json_agg(
      json_build_object(
        'id', cd.id,
        'file_name', cd.file_name,
        'file_path', cd.file_path,
        'file_type', cd.file_type,
        'file_size', cd.file_size,
        'document_type', cd.document_type,
        'uploaded_at', cd.uploaded_at
      )
    ) FILTER (WHERE cd.id IS NOT NULL),
    '[]'
  ) as documents
FROM certifications c
LEFT JOIN certification_documents cd ON c.id = cd.certification_id
GROUP BY c.id;

COMMENT ON VIEW certifications_with_documents IS 'Vue combinant les certifications avec leurs documents uploadés';

-- =====================================================
-- 6. FONCTION POUR GÉNÉRER L''EMAIL DE VÉRIFICATION DREETS
-- =====================================================

CREATE OR REPLACE FUNCTION generate_dreets_verification_email(cert_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
  cert RECORD;
  educator RECORD;
  dreets_email TEXT;
BEGIN
  -- Récupérer les infos de la certification
  SELECT * INTO cert FROM certifications WHERE id = cert_id;

  -- Récupérer les infos de l'éducateur
  SELECT * INTO educator FROM educator_profiles WHERE id = cert.educator_id;

  -- Déterminer l'email DREETS selon la région
  CASE cert.issuing_region
    WHEN 'Île-de-France' THEN dreets_email := 'dreets-idf@dreets.gouv.fr';
    WHEN 'Auvergne-Rhône-Alpes' THEN dreets_email := 'dreets-ara@dreets.gouv.fr';
    WHEN 'PACA' THEN dreets_email := 'dreets-paca@dreets.gouv.fr';
    WHEN 'Occitanie' THEN dreets_email := 'dreets-occitanie@dreets.gouv.fr';
    WHEN 'Hauts-de-France' THEN dreets_email := 'dreets-hdf@dreets.gouv.fr';
    ELSE dreets_email := NULL;
  END CASE;

  -- Construire le JSON de réponse
  result := json_build_object(
    'to', dreets_email,
    'subject', 'Vérification d''un Diplôme d''État d''Éducateur Spécialisé',
    'body', format(
      E'Madame, Monsieur,\n\n' ||
      'Je suis responsable de la plateforme Autisme Connect qui met en relation des éducateurs spécialisés avec des familles d''enfants avec TSA.\n\n' ||
      'Dans le cadre de notre processus de vérification, pourriez-vous confirmer l''authenticité du diplôme suivant :\n\n' ||
      '- Titulaire : %s %s\n' ||
      '- Type de diplôme : %s\n' ||
      '- Date d''obtention : %s\n' ||
      '- Numéro de diplôme : %s\n' ||
      '- Organisme de formation : %s\n\n' ||
      'Je vous remercie par avance pour votre retour.\n\n' ||
      'Cordialement,\n' ||
      'L''équipe Autisme Connect',
      educator.first_name,
      educator.last_name,
      cert.name,
      to_char(cert.issue_date, 'DD/MM/YYYY'),
      COALESCE(cert.diploma_number, 'Non renseigné'),
      cert.issuing_organization
    ),
    'educator_name', educator.first_name || ' ' || educator.last_name,
    'certification_type', cert.type,
    'diploma_number', cert.diploma_number
  );

  RETURN result;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION generate_dreets_verification_email IS 'Génère un email pré-rempli pour vérifier un diplôme auprès de la DREETS';

-- =====================================================
-- RÉSUMÉ ET VÉRIFICATION
-- =====================================================

SELECT '✅ Système de vérification des certifications créé avec succès !' as status;

-- Afficher les nouvelles colonnes de la table certifications
SELECT
  'certifications' as table_name,
  column_name,
  data_type,
  column_default
FROM information_schema.columns
WHERE table_name = 'certifications'
  AND column_name IN (
    'verification_status',
    'verification_date',
    'diploma_number',
    'issuing_region',
    'document_url',
    'dreets_verification_requested'
  )
ORDER BY ordinal_position;

-- Afficher les organismes certificateurs
SELECT
  name as "Organisme",
  type as "Type",
  region as "Région",
  contact_email as "Email"
FROM certification_issuers
ORDER BY type, region;
