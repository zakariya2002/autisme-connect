-- Migration: Table des versions PPA (historique)
-- Date: 2025-12-06
-- Permet de conserver l'historique des modifications du PPA

-- ============================================
-- Table: child_ppa_versions (Historique des PPA)
-- ============================================
CREATE TABLE IF NOT EXISTS child_ppa_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ppa_id UUID NOT NULL,  -- Référence au PPA actuel (pas de FK car le PPA peut être supprimé)
  child_id UUID REFERENCES child_profiles(id) ON DELETE CASCADE NOT NULL,
  version_number INTEGER NOT NULL DEFAULT 1,
  version_label VARCHAR(100),  -- Label optionnel (ex: "Révision trimestrielle T1 2025")

  -- Section 1: Identification & Intervenant
  educator_name VARCHAR(255),
  educator_structure VARCHAR(255),
  evaluation_date DATE,
  evaluation_period_start DATE,
  evaluation_period_end DATE,

  -- Section 2: Anamnèse (données éducatives)
  previous_support TEXT,
  schooling_history TEXT,
  family_context TEXT,
  significant_events TEXT,
  life_events TEXT,

  -- Section 3: Contexte actuel
  school_info TEXT,
  other_professionals TEXT,
  family_expectations TEXT,

  -- Section 4: Évaluation - Communication
  comm_receptive TEXT,
  comm_expressive TEXT,
  comm_written TEXT,

  -- Évaluation - Autonomie
  autonomy_personal TEXT,
  autonomy_domestic TEXT,
  autonomy_community TEXT,

  -- Évaluation - Socialisation
  social_interpersonal TEXT,
  social_leisure TEXT,
  social_adaptation TEXT,

  -- Évaluation - Motricité
  motor_global TEXT,
  motor_fine TEXT,

  -- Évaluation - Profil sensoriel
  sensory_visual TEXT,
  sensory_auditory TEXT,
  sensory_gustatory TEXT,
  sensory_olfactory TEXT,
  sensory_tactile TEXT,
  sensory_proprioceptive TEXT,
  sensory_vestibular TEXT,

  -- Évaluation - Cognitif
  cognitive_facilitating_conditions TEXT,
  cognitive_position TEXT,
  cognitive_guidance TEXT,
  cognitive_material_structure TEXT,
  cognitive_attention_time TEXT,
  cognitive_max_tasks TEXT,
  cognitive_work_leads TEXT,

  -- Évaluation - Psycho-affectif & Comportements
  psycho_affective TEXT,
  problem_behaviors TEXT,

  -- Objectifs & Modalités
  priority_axes TEXT,
  session_frequency VARCHAR(50),
  intervention_locations TEXT[],
  resources_needed TEXT,

  -- Révision
  next_review_date DATE,
  review_frequency VARCHAR(50),
  observations TEXT,

  -- Métadonnées de la version originale
  original_created_at TIMESTAMPTZ,
  original_updated_at TIMESTAMPTZ,
  original_created_by UUID,
  original_last_updated_by UUID,

  -- Métadonnées de l'archivage
  archived_at TIMESTAMPTZ DEFAULT NOW(),
  archived_by UUID REFERENCES auth.users(id)
);

-- Index pour recherche rapide
CREATE INDEX idx_ppa_versions_child ON child_ppa_versions(child_id);
CREATE INDEX idx_ppa_versions_ppa ON child_ppa_versions(ppa_id);
CREATE INDEX idx_ppa_versions_archived ON child_ppa_versions(archived_at DESC);

-- RLS
ALTER TABLE child_ppa_versions ENABLE ROW LEVEL SECURITY;

-- Politique d'accès (même que PPA)
CREATE POLICY "Accès aux versions PPA" ON child_ppa_versions
  FOR ALL USING (can_access_child(child_id));

-- Commentaires
COMMENT ON TABLE child_ppa_versions IS 'Historique des versions du PPA - Conserve les anciennes versions avant chaque mise à jour';
COMMENT ON COLUMN child_ppa_versions.version_number IS 'Numéro séquentiel de la version (1, 2, 3...)';
COMMENT ON COLUMN child_ppa_versions.version_label IS 'Label optionnel pour identifier la version (ex: Révision T1 2025)';
COMMENT ON COLUMN child_ppa_versions.archived_at IS 'Date à laquelle cette version a été archivée';
