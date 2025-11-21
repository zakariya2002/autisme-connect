-- Créer une table pour tracker les vues de profil d'éducateurs
CREATE TABLE IF NOT EXISTS profile_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  educator_id UUID NOT NULL REFERENCES educator_profiles(id) ON DELETE CASCADE,
  viewer_ip TEXT, -- IP du visiteur (optionnel pour éviter les doubles comptages)
  viewer_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Si l'utilisateur est connecté
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_view_per_day UNIQUE (educator_id, viewer_ip, DATE(viewed_at))
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_profile_views_educator ON profile_views(educator_id);
CREATE INDEX IF NOT EXISTS idx_profile_views_date ON profile_views(viewed_at);

-- Ajouter une colonne total_views dans educator_profiles pour un accès rapide
ALTER TABLE educator_profiles ADD COLUMN IF NOT EXISTS total_views INTEGER DEFAULT 0;

-- Function pour incrémenter automatiquement le compteur
CREATE OR REPLACE FUNCTION increment_profile_views()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE educator_profiles
  SET total_views = total_views + 1
  WHERE id = NEW.educator_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour automatiquement total_views
DROP TRIGGER IF EXISTS trigger_increment_views ON profile_views;
CREATE TRIGGER trigger_increment_views
AFTER INSERT ON profile_views
FOR EACH ROW
EXECUTE FUNCTION increment_profile_views();

-- RLS (Row Level Security)
ALTER TABLE profile_views ENABLE ROW LEVEL SECURITY;

-- Policy : tout le monde peut insérer une vue
CREATE POLICY "Anyone can insert profile views"
ON profile_views FOR INSERT
WITH CHECK (true);

-- Policy : seul l'éducateur peut voir ses propres vues détaillées
CREATE POLICY "Educators can view their own profile views"
ON profile_views FOR SELECT
USING (educator_id IN (
  SELECT id FROM educator_profiles WHERE user_id = auth.uid()
));
