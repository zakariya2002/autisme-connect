-- =====================================================
-- NOTIFICATIONS EMAIL AUTOMATIQUES POUR VÉRIFICATION DES CERTIFICATIONS
-- =====================================================
-- Ce script crée un système de notification par email automatique
-- quand le statut d'une certification change (approuvé ou rejeté)

-- =====================================================
-- 1. CRÉER LA TABLE DES NOTIFICATIONS EMAIL
-- =====================================================

CREATE TABLE IF NOT EXISTS email_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipient_email VARCHAR(255) NOT NULL,
  recipient_name VARCHAR(255),
  subject VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- pending, sent, failed
  certification_id UUID REFERENCES certifications(id),
  created_at TIMESTAMP DEFAULT NOW(),
  sent_at TIMESTAMP,
  error_message TEXT
);

-- Index pour les recherches
CREATE INDEX IF NOT EXISTS idx_email_notifications_status ON email_notifications(status);
CREATE INDEX IF NOT EXISTS idx_email_notifications_created ON email_notifications(created_at);

COMMENT ON TABLE email_notifications IS 'File d''attente des emails à envoyer pour les notifications de certification';
COMMENT ON COLUMN email_notifications.status IS 'Statut: pending (en attente), sent (envoyé), failed (échec)';

-- =====================================================
-- 2. FONCTION POUR CRÉER UNE NOTIFICATION EMAIL
-- =====================================================

CREATE OR REPLACE FUNCTION create_certification_notification_email(
  cert_id UUID,
  new_status VARCHAR(20)
) RETURNS VOID AS $$
DECLARE
  cert RECORD;
  educator RECORD;
  email_subject TEXT;
  email_body TEXT;
  educator_email TEXT;
BEGIN
  -- Récupérer les infos de la certification
  SELECT * INTO cert FROM certifications WHERE id = cert_id;

  -- Récupérer les infos de l'éducateur
  SELECT * INTO educator FROM educator_profiles WHERE id = cert.educator_id;

  -- Récupérer l'email de l'éducateur depuis auth.users
  SELECT email INTO educator_email
  FROM auth.users
  WHERE id = educator.user_id;

  -- Ne rien faire si pas d'email
  IF educator_email IS NULL THEN
    RETURN;
  END IF;

  -- Construire le contenu de l'email selon le statut
  IF new_status = 'document_verified' THEN
    email_subject := '✅ Votre certification a été vérifiée - Autisme Connect';
    email_body := format(
      E'Bonjour %s %s,\n\n' ||
      'Bonne nouvelle ! Votre certification a été vérifiée avec succès.\n\n' ||
      '📜 Certification : %s\n' ||
      '🏛️ Organisme : %s\n' ||
      '✅ Statut : Document vérifié\n\n' ||
      'Votre certification est maintenant visible sur votre profil public avec un badge "Vérifié".\n\n' ||
      'Les familles pourront voir cette certification et auront davantage confiance en vos qualifications.\n\n' ||
      'Si vous souhaitez obtenir une vérification officielle supplémentaire (badge "Certifié Officiellement"), ' ||
      'notre équipe contactera directement la DREETS pour confirmer l''authenticité de votre diplôme.\n\n' ||
      'Merci de votre confiance,\n' ||
      'L''équipe Autisme Connect\n\n' ||
      '---\n' ||
      'Gérer mes certifications : https://autisme-connect.fr/dashboard/educator/profile',
      educator.first_name,
      educator.last_name,
      cert.name,
      cert.issuing_organization
    );

  ELSIF new_status = 'officially_confirmed' THEN
    email_subject := '⭐ Votre certification a été officiellement confirmée - Autisme Connect';
    email_body := format(
      E'Bonjour %s %s,\n\n' ||
      'Excellente nouvelle ! Votre certification a été officiellement confirmée par les autorités compétentes.\n\n' ||
      '📜 Certification : %s\n' ||
      '🏛️ Organisme : %s\n' ||
      '⭐ Statut : Certification officiellement confirmée\n\n' ||
      'Votre diplôme a été vérifié auprès de la DREETS et son authenticité a été confirmée.\n\n' ||
      'Cette certification est maintenant affichée sur votre profil avec un badge "Certifié Officiellement" (étoile bleue), ' ||
      'ce qui renforce considérablement la confiance des familles.\n\n' ||
      'Félicitations pour cette certification de haut niveau !\n\n' ||
      'Cordialement,\n' ||
      'L''équipe Autisme Connect\n\n' ||
      '---\n' ||
      'Voir mon profil public : https://autisme-connect.fr/educator/%s',
      educator.first_name,
      educator.last_name,
      cert.name,
      cert.issuing_organization,
      educator.id
    );

  ELSIF new_status = 'rejected' THEN
    email_subject := '⚠️ Votre certification nécessite une révision - Autisme Connect';
    email_body := format(
      E'Bonjour %s %s,\n\n' ||
      'Nous vous informons que la certification que vous avez soumise n''a pas pu être validée.\n\n' ||
      '📜 Certification : %s\n' ||
      '🏛️ Organisme : %s\n' ||
      '❌ Statut : Non validée\n\n' ||
      'Raison :\n%s\n\n' ||
      'Que faire maintenant ?\n' ||
      '1. Vérifiez que le document est bien lisible et de bonne qualité\n' ||
      '2. Assurez-vous que toutes les informations sont visibles (nom, date, cachet, signature)\n' ||
      '3. Vérifiez que le numéro de diplôme est correct\n' ||
      '4. Vous pouvez uploader un nouveau document depuis votre profil\n\n' ||
      'Si vous pensez qu''il s''agit d''une erreur, n''hésitez pas à nous contacter à support@autisme-connect.fr\n\n' ||
      'Notre équipe reste à votre disposition pour vous aider.\n\n' ||
      'Cordialement,\n' ||
      'L''équipe Autisme Connect\n\n' ||
      '---\n' ||
      'Modifier ma certification : https://autisme-connect.fr/dashboard/educator/profile',
      educator.first_name,
      educator.last_name,
      cert.name,
      cert.issuing_organization,
      COALESCE(cert.verification_notes, 'Aucune information spécifique fournie')
    );
  ELSE
    -- Statut inconnu, ne rien faire
    RETURN;
  END IF;

  -- Insérer l'email dans la file d'attente
  INSERT INTO email_notifications (
    recipient_email,
    recipient_name,
    subject,
    body,
    certification_id,
    status
  ) VALUES (
    educator_email,
    educator.first_name || ' ' || educator.last_name,
    email_subject,
    email_body,
    cert_id,
    'pending'
  );

END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION create_certification_notification_email IS 'Crée un email de notification selon le statut de vérification';

-- =====================================================
-- 3. TRIGGER POUR ENVOYER L'EMAIL AUTOMATIQUEMENT
-- =====================================================

CREATE OR REPLACE FUNCTION trigger_certification_status_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Vérifier si le statut a changé
  IF (TG_OP = 'UPDATE' AND OLD.verification_status IS DISTINCT FROM NEW.verification_status) THEN

    -- Envoyer une notification si le statut est approuvé ou rejeté
    IF NEW.verification_status IN ('document_verified', 'officially_confirmed', 'rejected') THEN
      PERFORM create_certification_notification_email(NEW.id, NEW.verification_status);
    END IF;

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Supprimer le trigger s'il existe déjà
DROP TRIGGER IF EXISTS certification_status_change_notification ON certifications;

-- Créer le trigger
CREATE TRIGGER certification_status_change_notification
  AFTER UPDATE ON certifications
  FOR EACH ROW
  EXECUTE FUNCTION trigger_certification_status_notification();

COMMENT ON TRIGGER certification_status_change_notification ON certifications IS
  'Envoie automatiquement un email quand le statut de vérification change';

-- =====================================================
-- 4. FONCTION POUR MARQUER UN EMAIL COMME ENVOYÉ
-- =====================================================

CREATE OR REPLACE FUNCTION mark_email_as_sent(email_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE email_notifications
  SET status = 'sent',
      sent_at = NOW()
  WHERE id = email_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION mark_email_as_failed(email_id UUID, error_msg TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE email_notifications
  SET status = 'failed',
      error_message = error_msg
  WHERE id = email_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 5. VUE POUR VOIR LES EMAILS EN ATTENTE
-- =====================================================

CREATE OR REPLACE VIEW pending_email_notifications AS
SELECT
  e.id,
  e.recipient_email,
  e.recipient_name,
  e.subject,
  e.created_at,
  c.name as certification_name,
  c.verification_status,
  ep.first_name || ' ' || ep.last_name as educator_name
FROM email_notifications e
LEFT JOIN certifications c ON e.certification_id = c.id
LEFT JOIN educator_profiles ep ON c.educator_id = ep.id
WHERE e.status = 'pending'
ORDER BY e.created_at ASC;

COMMENT ON VIEW pending_email_notifications IS 'Liste des emails en attente d''envoi avec contexte';

-- =====================================================
-- RÉSUMÉ
-- =====================================================

SELECT '✅ Système de notification email créé avec succès !' as status;

SELECT
  'Configuration' as info,
  '1. Les emails sont créés automatiquement quand une certification est vérifiée/rejetée' as step_1,
  '2. Consultez la vue pending_email_notifications pour voir les emails en attente' as step_2,
  '3. Utilisez un service externe (API route, cron job) pour envoyer les emails' as step_3,
  '4. Appelez mark_email_as_sent(id) ou mark_email_as_failed(id, error) après envoi' as step_4;
