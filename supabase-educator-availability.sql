-- =====================================================
-- CRÉER LES TABLES DE DISPONIBILITÉS DES ÉDUCATEURS
-- =====================================================
-- Ce script crée les tables pour gérer les disponibilités
-- des éducateurs (horaires récurrents et exceptions)

-- =====================================================
-- 1. TABLE DES CRÉNEAUX RÉCURRENTS HEBDOMADAIRES
-- =====================================================

CREATE TABLE IF NOT EXISTS educator_weekly_availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  educator_id UUID REFERENCES educator_profiles(id) ON DELETE CASCADE NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  -- 0 = Dimanche, 1 = Lundi, 2 = Mardi, 3 = Mercredi, 4 = Jeudi, 5 = Vendredi, 6 = Samedi
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- =====================================================
-- 2. TABLE DES EXCEPTIONS (JOURS BLOQUÉS/VACANCES)
-- =====================================================

CREATE TABLE IF NOT EXISTS educator_availability_exceptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  educator_id UUID REFERENCES educator_profiles(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  exception_type VARCHAR(20) NOT NULL CHECK (exception_type IN ('blocked', 'available', 'vacation')),
  -- blocked = jour/créneau bloqué, available = créneau supplémentaire, vacation = vacances
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_exception_time CHECK (
    (start_time IS NULL AND end_time IS NULL) OR
    (start_time IS NOT NULL AND end_time IS NOT NULL AND end_time > start_time)
  )
);

-- =====================================================
-- 3. INDEX POUR AMÉLIORER LES PERFORMANCES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_weekly_availability_educator
ON educator_weekly_availability(educator_id);

CREATE INDEX IF NOT EXISTS idx_weekly_availability_day
ON educator_weekly_availability(day_of_week);

CREATE INDEX IF NOT EXISTS idx_exceptions_educator
ON educator_availability_exceptions(educator_id);

CREATE INDEX IF NOT EXISTS idx_exceptions_date
ON educator_availability_exceptions(date);

-- =====================================================
-- 4. FONCTION POUR METTRE À JOUR updated_at
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_weekly_availability_updated_at
  BEFORE UPDATE ON educator_weekly_availability
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 5. POLITIQUES RLS (ROW LEVEL SECURITY)
-- =====================================================

ALTER TABLE educator_weekly_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE educator_availability_exceptions ENABLE ROW LEVEL SECURITY;

-- Les éducateurs peuvent voir toutes les disponibilités
CREATE POLICY "Educators can view all availability"
  ON educator_weekly_availability FOR SELECT
  USING (true);

CREATE POLICY "Educators can view all exceptions"
  ON educator_availability_exceptions FOR SELECT
  USING (true);

-- Les éducateurs peuvent modifier uniquement leurs propres disponibilités
CREATE POLICY "Educators can manage their own weekly availability"
  ON educator_weekly_availability
  FOR ALL
  USING (
    educator_id IN (
      SELECT id FROM educator_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Educators can manage their own exceptions"
  ON educator_availability_exceptions
  FOR ALL
  USING (
    educator_id IN (
      SELECT id FROM educator_profiles WHERE user_id = auth.uid()
    )
  );

-- =====================================================
-- 6. COMMENTAIRES POUR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE educator_weekly_availability IS 'Horaires récurrents hebdomadaires des éducateurs';
COMMENT ON COLUMN educator_weekly_availability.day_of_week IS 'Jour de la semaine (0=Dimanche, 1=Lundi, ..., 6=Samedi)';
COMMENT ON COLUMN educator_weekly_availability.is_active IS 'Permet de désactiver un créneau sans le supprimer';

COMMENT ON TABLE educator_availability_exceptions IS 'Exceptions aux horaires récurrents (vacances, jours bloqués, créneaux supplémentaires)';
COMMENT ON COLUMN educator_availability_exceptions.exception_type IS 'Type : blocked (bloqué), available (disponible exceptionnellement), vacation (vacances)';

-- =====================================================
-- RÉSUMÉ
-- =====================================================

SELECT '✅ Tables de disponibilités créées avec succès !' as status;

SELECT
  'Configuration' as info,
  'Tables créées : educator_weekly_availability, educator_availability_exceptions' as tables,
  'Index créés pour les recherches optimisées' as indexes,
  'RLS activé pour sécuriser les données' as security;
