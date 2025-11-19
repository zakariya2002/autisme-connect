-- Autisme Connect - Schéma de base de données Supabase

-- ============================================
-- TABLES UTILISATEURS ET PROFILS
-- ============================================

-- Extension pour UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table des profils éducateurs
CREATE TABLE educator_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  bio TEXT,
  profile_image_url TEXT,
  phone VARCHAR(20),
  location VARCHAR(255) NOT NULL,
  years_of_experience INTEGER NOT NULL DEFAULT 0,
  hourly_rate DECIMAL(10, 2),
  specializations TEXT[] DEFAULT '{}',
  languages TEXT[] DEFAULT '{}',
  rating DECIMAL(3, 2) DEFAULT 0.00,
  total_reviews INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des certifications
CREATE TABLE certifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  educator_id UUID REFERENCES educator_profiles(id) ON DELETE CASCADE NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('ABA', 'TEACCH', 'PECS', 'OTHER')),
  name VARCHAR(255) NOT NULL,
  issuing_organization VARCHAR(255) NOT NULL,
  issue_date DATE NOT NULL,
  expiry_date DATE,
  document_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des profils familles
CREATE TABLE family_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  location VARCHAR(255) NOT NULL,
  profile_image_url TEXT,
  relationship VARCHAR(50) CHECK (relationship IN ('parent', 'guardian', 'self', 'other')),
  person_with_autism_age INTEGER,
  support_level_needed VARCHAR(20) CHECK (support_level_needed IN ('level_1', 'level_2', 'level_3')),
  specific_needs TEXT[] DEFAULT '{}',
  preferred_certifications TEXT[] DEFAULT '{}',
  budget_min DECIMAL(10, 2),
  budget_max DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- DISPONIBILITÉS ET RÉSERVATIONS
-- ============================================

-- Table des disponibilités
CREATE TABLE availability_slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  educator_id UUID REFERENCES educator_profiles(id) ON DELETE CASCADE NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des réservations
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  educator_id UUID REFERENCES educator_profiles(id) ON DELETE CASCADE NOT NULL,
  family_id UUID REFERENCES family_profiles(id) ON DELETE CASCADE NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  notes TEXT,
  location VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- MESSAGERIE
-- ============================================

-- Table des conversations
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  educator_id UUID REFERENCES educator_profiles(id) ON DELETE CASCADE NOT NULL,
  family_id UUID REFERENCES family_profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(educator_id, family_id)
);

-- Table des messages
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ÉVALUATIONS ET AVIS
-- ============================================

-- Table des évaluations
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  educator_id UUID REFERENCES educator_profiles(id) ON DELETE CASCADE NOT NULL,
  family_id UUID REFERENCES family_profiles(id) ON DELETE CASCADE NOT NULL,
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(booking_id)
);

-- ============================================
-- INDEX POUR PERFORMANCE
-- ============================================

CREATE INDEX idx_educator_location ON educator_profiles(location);
CREATE INDEX idx_educator_rating ON educator_profiles(rating);
CREATE INDEX idx_certifications_educator ON certifications(educator_id);
CREATE INDEX idx_certifications_type ON certifications(type);
CREATE INDEX idx_family_location ON family_profiles(location);
CREATE INDEX idx_availability_educator ON availability_slots(educator_id);
CREATE INDEX idx_bookings_educator ON bookings(educator_id);
CREATE INDEX idx_bookings_family ON bookings(family_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_receiver ON messages(receiver_id);
CREATE INDEX idx_reviews_educator ON reviews(educator_id);

-- ============================================
-- FONCTIONS ET TRIGGERS
-- ============================================

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour updated_at
CREATE TRIGGER update_educator_profiles_updated_at BEFORE UPDATE ON educator_profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_family_profiles_updated_at BEFORE UPDATE ON family_profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour mettre à jour la note moyenne de l'éducateur
CREATE OR REPLACE FUNCTION update_educator_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE educator_profiles
  SET
    rating = (SELECT AVG(rating)::DECIMAL(3,2) FROM reviews WHERE educator_id = NEW.educator_id),
    total_reviews = (SELECT COUNT(*) FROM reviews WHERE educator_id = NEW.educator_id)
  WHERE id = NEW.educator_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour la note après un avis
CREATE TRIGGER update_rating_after_review AFTER INSERT OR UPDATE ON reviews
FOR EACH ROW EXECUTE FUNCTION update_educator_rating();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Activer RLS sur toutes les tables
ALTER TABLE educator_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Politiques pour educator_profiles
CREATE POLICY "Les profils éducateurs sont visibles par tous" ON educator_profiles
  FOR SELECT USING (true);

CREATE POLICY "Les éducateurs peuvent modifier leur propre profil" ON educator_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Les éducateurs peuvent créer leur profil" ON educator_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Politiques pour certifications
CREATE POLICY "Les certifications sont visibles par tous" ON certifications
  FOR SELECT USING (true);

CREATE POLICY "Les éducateurs peuvent gérer leurs certifications" ON certifications
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM educator_profiles
      WHERE id = certifications.educator_id AND user_id = auth.uid()
    )
  );

-- Politiques pour family_profiles
CREATE POLICY "Les familles peuvent voir leur propre profil" ON family_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Les familles peuvent modifier leur profil" ON family_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Les familles peuvent créer leur profil" ON family_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Politiques pour availability_slots
CREATE POLICY "Les disponibilités sont visibles par tous" ON availability_slots
  FOR SELECT USING (true);

CREATE POLICY "Les éducateurs gèrent leurs disponibilités" ON availability_slots
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM educator_profiles
      WHERE id = availability_slots.educator_id AND user_id = auth.uid()
    )
  );

-- Politiques pour bookings
CREATE POLICY "Les réservations sont visibles par les parties concernées" ON bookings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM educator_profiles WHERE id = bookings.educator_id AND user_id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM family_profiles WHERE id = bookings.family_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Les familles peuvent créer des réservations" ON bookings
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM family_profiles WHERE id = bookings.family_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Les parties concernées peuvent modifier les réservations" ON bookings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM educator_profiles WHERE id = bookings.educator_id AND user_id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM family_profiles WHERE id = bookings.family_id AND user_id = auth.uid()
    )
  );

-- Politiques pour conversations
CREATE POLICY "Les conversations sont visibles par les participants" ON conversations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM educator_profiles WHERE id = conversations.educator_id AND user_id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM family_profiles WHERE id = conversations.family_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Les utilisateurs peuvent créer des conversations" ON conversations
  FOR INSERT WITH CHECK (true);

-- Politiques pour messages
CREATE POLICY "Les messages sont visibles par les participants" ON messages
  FOR SELECT USING (
    auth.uid() = sender_id OR auth.uid() = receiver_id
  );

CREATE POLICY "Les utilisateurs peuvent envoyer des messages" ON messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Les utilisateurs peuvent modifier leurs messages" ON messages
  FOR UPDATE USING (auth.uid() = receiver_id);

-- Politiques pour reviews
CREATE POLICY "Les avis sont visibles par tous" ON reviews
  FOR SELECT USING (true);

CREATE POLICY "Les familles peuvent créer des avis" ON reviews
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM family_profiles WHERE id = reviews.family_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Les familles peuvent modifier leurs avis" ON reviews
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM family_profiles WHERE id = reviews.family_id AND user_id = auth.uid()
    )
  );
