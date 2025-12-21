-- Table pour stocker les feedbacks utilisateurs (phase de test)
CREATE TABLE IF NOT EXISTS user_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('family', 'educator')),
  responses JSONB NOT NULL,
  overall_score DECIMAL(4,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour les requêtes fréquentes
CREATE INDEX idx_user_feedback_user_id ON user_feedback(user_id);
CREATE INDEX idx_user_feedback_user_type ON user_feedback(user_type);
CREATE INDEX idx_user_feedback_created_at ON user_feedback(created_at DESC);

-- RLS policies
ALTER TABLE user_feedback ENABLE ROW LEVEL SECURITY;

-- Les utilisateurs peuvent voir leurs propres feedbacks
CREATE POLICY "Users can view own feedback" ON user_feedback
  FOR SELECT USING (auth.uid() = user_id);

-- Les utilisateurs peuvent créer un feedback
CREATE POLICY "Users can create feedback" ON user_feedback
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Les utilisateurs peuvent mettre à jour leur propre feedback
CREATE POLICY "Users can update own feedback" ON user_feedback
  FOR UPDATE USING (auth.uid() = user_id);

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_user_feedback_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour updated_at
CREATE TRIGGER trigger_user_feedback_updated_at
  BEFORE UPDATE ON user_feedback
  FOR EACH ROW
  EXECUTE FUNCTION update_user_feedback_updated_at();
