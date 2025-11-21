-- =====================================================
-- SYSTÈME D'ABONNEMENTS POUR LES ÉDUCATEURS
-- =====================================================

-- 1. Table des abonnements
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  educator_id UUID REFERENCES educator_profiles(id) ON DELETE CASCADE NOT NULL,

  -- Stripe
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  stripe_price_id TEXT,

  -- Statut
  status VARCHAR(20) DEFAULT 'trialing' CHECK (status IN ('trialing', 'active', 'past_due', 'canceled', 'incomplete', 'incomplete_expired', 'unpaid')),

  -- Dates
  trial_start TIMESTAMP WITH TIME ZONE,
  trial_end TIMESTAMP WITH TIME ZONE,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at TIMESTAMP WITH TIME ZONE,
  canceled_at TIMESTAMP WITH TIME ZONE,

  -- Plan
  plan_type VARCHAR(20) DEFAULT 'monthly' CHECK (plan_type IN ('monthly', 'annual')),
  price_amount DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'eur',

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(educator_id)
);

-- 2. Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_subscriptions_educator ON subscriptions(educator_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription ON subscriptions(stripe_subscription_id);

-- 3. Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_subscription_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_subscription_updated_at();

-- 4. Politiques RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Les éducateurs peuvent voir leur propre abonnement
CREATE POLICY "Educators can view own subscription"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (
    educator_id IN (
      SELECT id FROM educator_profiles WHERE user_id = auth.uid()
    )
  );

-- Les éducateurs peuvent mettre à jour leur propre abonnement
CREATE POLICY "Educators can update own subscription"
  ON subscriptions FOR UPDATE
  TO authenticated
  USING (
    educator_id IN (
      SELECT id FROM educator_profiles WHERE user_id = auth.uid()
    )
  );

-- Seul le système peut créer des abonnements (via API)
CREATE POLICY "System can insert subscriptions"
  ON subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (
    educator_id IN (
      SELECT id FROM educator_profiles WHERE user_id = auth.uid()
    )
  );

-- 5. Fonction pour vérifier si un éducateur a un abonnement actif
CREATE OR REPLACE FUNCTION has_active_subscription(educator_profile_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  sub_status VARCHAR(20);
  trial_end_date TIMESTAMP WITH TIME ZONE;
  period_end_date TIMESTAMP WITH TIME ZONE;
BEGIN
  SELECT status, trial_end, current_period_end
  INTO sub_status, trial_end_date, period_end_date
  FROM subscriptions
  WHERE educator_id = educator_profile_id;

  -- Pas d'abonnement trouvé
  IF sub_status IS NULL THEN
    RETURN FALSE;
  END IF;

  -- En période d'essai et toujours valide
  IF sub_status = 'trialing' AND trial_end_date > NOW() THEN
    RETURN TRUE;
  END IF;

  -- Abonnement actif
  IF sub_status = 'active' AND period_end_date > NOW() THEN
    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- 6. Table des transactions de paiement
CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE,
  educator_id UUID REFERENCES educator_profiles(id) ON DELETE CASCADE NOT NULL,

  -- Stripe
  stripe_payment_intent_id TEXT,
  stripe_invoice_id TEXT,

  -- Montant
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'eur',

  -- Statut
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'succeeded', 'failed', 'refunded')),

  -- Métadonnées
  description TEXT,
  receipt_url TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_payment_transactions_subscription ON payment_transactions(subscription_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_educator ON payment_transactions(educator_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status);

-- RLS
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Educators can view own transactions"
  ON payment_transactions FOR SELECT
  TO authenticated
  USING (
    educator_id IN (
      SELECT id FROM educator_profiles WHERE user_id = auth.uid()
    )
  );

-- 7. Ajouter une colonne à educator_profiles pour indiquer l'abonnement
ALTER TABLE educator_profiles
ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(20) DEFAULT 'none';

-- 8. Fonction pour synchroniser le statut d'abonnement
CREATE OR REPLACE FUNCTION sync_educator_subscription_status()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE educator_profiles
  SET subscription_status = NEW.status
  WHERE id = NEW.educator_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sync_subscription_status
  AFTER INSERT OR UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION sync_educator_subscription_status();

-- 9. Commentaires
COMMENT ON TABLE subscriptions IS 'Abonnements des éducateurs pour accéder à la plateforme';
COMMENT ON TABLE payment_transactions IS 'Historique des transactions de paiement';
COMMENT ON COLUMN subscriptions.status IS 'trialing = essai gratuit, active = actif, past_due = paiement en retard, canceled = annulé';
COMMENT ON FUNCTION has_active_subscription IS 'Vérifie si un éducateur a un abonnement valide (essai ou payant)';

-- Résumé
SELECT '✅ Système d''abonnements créé avec succès !' as status;
