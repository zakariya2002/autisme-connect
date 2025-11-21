-- Migration pour le système de vérification des diplômes
-- Date: 2025-11-21

-- 1. Ajouter les colonnes nécessaires à la table educator_profiles
ALTER TABLE educator_profiles
ADD COLUMN IF NOT EXISTS diploma_url TEXT,
ADD COLUMN IF NOT EXISTS diploma_verification_status TEXT DEFAULT 'pending' CHECK (diploma_verification_status IN ('pending', 'verified', 'rejected')),
ADD COLUMN IF NOT EXISTS diploma_verified_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS diploma_rejected_reason TEXT,
ADD COLUMN IF NOT EXISTS diploma_submitted_at TIMESTAMP WITH TIME ZONE;

-- 2. Créer un index pour accélérer les recherches de profils vérifiés
CREATE INDEX IF NOT EXISTS idx_educator_profiles_verified
ON educator_profiles(diploma_verification_status)
WHERE diploma_verification_status = 'verified';

-- 3. Créer une table pour l'historique des vérifications de diplômes
CREATE TABLE IF NOT EXISTS diploma_verification_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  educator_id UUID REFERENCES educator_profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('submitted', 'verified', 'rejected', 'resubmitted')),
  performed_by UUID REFERENCES auth.users(id),
  reason TEXT,
  diploma_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Activer RLS sur la table d'historique
ALTER TABLE diploma_verification_history ENABLE ROW LEVEL SECURITY;

-- 5. Politique RLS : Les éducateurs peuvent voir leur propre historique
CREATE POLICY "Educators can view their own verification history"
ON diploma_verification_history
FOR SELECT
USING (
  educator_id IN (
    SELECT id FROM educator_profiles WHERE user_id = auth.uid()
  )
);

-- 6. Politique RLS : Les admins peuvent voir tout l'historique
CREATE POLICY "Admins can view all verification history"
ON diploma_verification_history
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND raw_user_meta_data->>'role' = 'admin'
  )
);

-- 7. Politique RLS : Le système peut insérer dans l'historique
CREATE POLICY "System can insert verification history"
ON diploma_verification_history
FOR INSERT
WITH CHECK (true);

-- 8. Créer une fonction pour enregistrer automatiquement les changements de statut
CREATE OR REPLACE FUNCTION log_diploma_verification_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Quand le statut change, enregistrer dans l'historique
  IF (TG_OP = 'UPDATE' AND OLD.diploma_verification_status != NEW.diploma_verification_status) THEN
    INSERT INTO diploma_verification_history (
      educator_id,
      action,
      performed_by,
      reason,
      diploma_url
    ) VALUES (
      NEW.id,
      NEW.diploma_verification_status,
      auth.uid(),
      NEW.diploma_rejected_reason,
      NEW.diploma_url
    );
  END IF;

  -- Quand un diplôme est soumis pour la première fois
  IF (TG_OP = 'UPDATE' AND OLD.diploma_url IS NULL AND NEW.diploma_url IS NOT NULL) THEN
    INSERT INTO diploma_verification_history (
      educator_id,
      action,
      performed_by,
      diploma_url
    ) VALUES (
      NEW.id,
      'submitted',
      auth.uid(),
      NEW.diploma_url
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Créer le trigger pour l'historique
DROP TRIGGER IF EXISTS on_diploma_verification_change ON educator_profiles;
CREATE TRIGGER on_diploma_verification_change
  AFTER UPDATE ON educator_profiles
  FOR EACH ROW
  EXECUTE FUNCTION log_diploma_verification_change();

-- 10. Mettre à jour les profils existants qui ont déjà un diplôme vérifié manuellement
-- (Si vous aviez une ancienne colonne 'diploma_verified' booléenne)
-- UPDATE educator_profiles
-- SET diploma_verification_status = 'verified',
--     diploma_verified_at = NOW()
-- WHERE diploma_verified = true;

-- 11. Créer une vue pour les statistiques admin
CREATE OR REPLACE VIEW diploma_verification_stats AS
SELECT
  COUNT(*) FILTER (WHERE diploma_verification_status = 'pending') as pending_count,
  COUNT(*) FILTER (WHERE diploma_verification_status = 'verified') as verified_count,
  COUNT(*) FILTER (WHERE diploma_verification_status = 'rejected') as rejected_count,
  COUNT(*) FILTER (WHERE diploma_url IS NULL) as no_diploma_count,
  COUNT(*) as total_count
FROM educator_profiles;

-- 12. Permission pour les admins de voir les stats
GRANT SELECT ON diploma_verification_stats TO authenticated;

-- 13. Commentaires pour documentation
COMMENT ON COLUMN educator_profiles.diploma_url IS 'URL du fichier diplôme uploadé dans Supabase Storage';
COMMENT ON COLUMN educator_profiles.diploma_verification_status IS 'Statut de vérification: pending, verified, rejected';
COMMENT ON COLUMN educator_profiles.diploma_verified_at IS 'Date de validation du diplôme';
COMMENT ON COLUMN educator_profiles.diploma_rejected_reason IS 'Raison du rejet si status = rejected';
COMMENT ON COLUMN educator_profiles.diploma_submitted_at IS 'Date de soumission du diplôme';
