-- =====================================================
-- CRÉER LA TABLE DES RENDEZ-VOUS
-- =====================================================
-- Ce script crée la table pour gérer les demandes de
-- rendez-vous entre familles et éducateurs

-- =====================================================
-- 1. TABLE DES RENDEZ-VOUS
-- =====================================================

CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  educator_id UUID REFERENCES educator_profiles(id) ON DELETE CASCADE NOT NULL,
  family_id UUID REFERENCES family_profiles(id) ON DELETE CASCADE NOT NULL,
  appointment_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed', 'cancelled')),
  -- pending = en attente, accepted = accepté, rejected = refusé, completed = terminé, cancelled = annulé
  location_type VARCHAR(20) CHECK (location_type IN ('home', 'office', 'online')),
  -- home = à domicile, office = au cabinet, online = en ligne
  address TEXT,
  notes TEXT,
  family_notes TEXT,
  educator_notes TEXT,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_time_range CHECK (end_time > start_time),
  CONSTRAINT valid_future_date CHECK (appointment_date >= CURRENT_DATE)
);

-- =====================================================
-- 2. INDEX POUR AMÉLIORER LES PERFORMANCES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_appointments_educator
ON appointments(educator_id);

CREATE INDEX IF NOT EXISTS idx_appointments_family
ON appointments(family_id);

CREATE INDEX IF NOT EXISTS idx_appointments_date
ON appointments(appointment_date);

CREATE INDEX IF NOT EXISTS idx_appointments_status
ON appointments(status);

CREATE INDEX IF NOT EXISTS idx_appointments_educator_date
ON appointments(educator_id, appointment_date);

-- =====================================================
-- 3. FONCTION POUR METTRE À JOUR updated_at
-- =====================================================

CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 4. POLITIQUES RLS (ROW LEVEL SECURITY)
-- =====================================================

ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Les utilisateurs peuvent voir tous les rendez-vous (pour vérifier les créneaux disponibles)
CREATE POLICY "Anyone can view appointments"
  ON appointments FOR SELECT
  USING (true);

-- Les familles peuvent créer des demandes de rendez-vous
CREATE POLICY "Families can create appointments"
  ON appointments FOR INSERT
  TO authenticated
  WITH CHECK (
    family_id IN (
      SELECT id FROM family_profiles WHERE user_id = auth.uid()
    )
  );

-- Les familles peuvent modifier leurs propres rendez-vous (annuler)
CREATE POLICY "Families can update their appointments"
  ON appointments FOR UPDATE
  TO authenticated
  USING (
    family_id IN (
      SELECT id FROM family_profiles WHERE user_id = auth.uid()
    )
  );

-- Les éducateurs peuvent modifier les rendez-vous qui les concernent (accepter/refuser/compléter)
CREATE POLICY "Educators can update their appointments"
  ON appointments FOR UPDATE
  TO authenticated
  USING (
    educator_id IN (
      SELECT id FROM educator_profiles WHERE user_id = auth.uid()
    )
  );

-- Les utilisateurs peuvent supprimer leurs rendez-vous
CREATE POLICY "Users can delete their appointments"
  ON appointments FOR DELETE
  TO authenticated
  USING (
    family_id IN (SELECT id FROM family_profiles WHERE user_id = auth.uid())
    OR
    educator_id IN (SELECT id FROM educator_profiles WHERE user_id = auth.uid())
  );

-- =====================================================
-- 5. FONCTION POUR VÉRIFIER LES CONFLITS DE CRÉNEAUX
-- =====================================================

CREATE OR REPLACE FUNCTION check_appointment_conflict(
  p_educator_id UUID,
  p_date DATE,
  p_start_time TIME,
  p_end_time TIME,
  p_appointment_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  conflict_count INTEGER;
BEGIN
  -- Vérifier s'il existe un conflit avec un rendez-vous accepté
  SELECT COUNT(*) INTO conflict_count
  FROM appointments
  WHERE educator_id = p_educator_id
    AND appointment_date = p_date
    AND status IN ('accepted', 'pending')
    AND (id IS DISTINCT FROM p_appointment_id) -- Exclure le rendez-vous actuel si modification
    AND (
      (p_start_time >= start_time AND p_start_time < end_time)
      OR (p_end_time > start_time AND p_end_time <= end_time)
      OR (p_start_time <= start_time AND p_end_time >= end_time)
    );

  RETURN conflict_count > 0;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 6. COMMENTAIRES POUR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE appointments IS 'Demandes et rendez-vous entre familles et éducateurs';
COMMENT ON COLUMN appointments.status IS 'Statut : pending, accepted, rejected, completed, cancelled';
COMMENT ON COLUMN appointments.location_type IS 'Type de lieu : home (domicile), office (cabinet), online (en ligne)';
COMMENT ON COLUMN appointments.family_notes IS 'Notes ajoutées par la famille lors de la demande';
COMMENT ON COLUMN appointments.educator_notes IS 'Notes ajoutées par l''éducateur';
COMMENT ON COLUMN appointments.rejection_reason IS 'Raison du refus si status=rejected';

-- =====================================================
-- 7. VUE POUR LES RENDEZ-VOUS AVEC DÉTAILS
-- =====================================================

CREATE OR REPLACE VIEW appointments_with_details AS
SELECT
  a.*,
  ep.first_name as educator_first_name,
  ep.last_name as educator_last_name,
  ep.phone as educator_phone,
  ep.user_id as educator_user_id,
  fp.first_name as family_first_name,
  fp.last_name as family_last_name,
  fp.phone as family_phone,
  fp.user_id as family_user_id
FROM appointments a
LEFT JOIN educator_profiles ep ON a.educator_id = ep.id
LEFT JOIN family_profiles fp ON a.family_id = fp.id;

COMMENT ON VIEW appointments_with_details IS 'Rendez-vous avec détails complets des éducateurs et familles';

-- =====================================================
-- RÉSUMÉ
-- =====================================================

SELECT '✅ Table appointments créée avec succès !' as status;

SELECT
  'Configuration' as info,
  'Table créée : appointments' as table_name,
  'Statuts : pending, accepted, rejected, completed, cancelled' as statuts,
  'RLS activé pour sécuriser les données' as security,
  'Fonction de vérification des conflits de créneaux créée' as features;
