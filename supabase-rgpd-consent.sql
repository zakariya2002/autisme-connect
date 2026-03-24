-- Migration RGPD: Ajout des colonnes de suivi de consentement
-- Date: 2026-03-24

ALTER TABLE educator_profiles ADD COLUMN IF NOT EXISTS cgu_accepted_at TIMESTAMPTZ;
ALTER TABLE educator_profiles ADD COLUMN IF NOT EXISTS data_consent_at TIMESTAMPTZ;
ALTER TABLE educator_profiles ADD COLUMN IF NOT EXISTS health_data_consent_at TIMESTAMPTZ;
ALTER TABLE educator_profiles ADD COLUMN IF NOT EXISTS cgu_version VARCHAR(20);

ALTER TABLE family_profiles ADD COLUMN IF NOT EXISTS cgu_accepted_at TIMESTAMPTZ;
ALTER TABLE family_profiles ADD COLUMN IF NOT EXISTS data_consent_at TIMESTAMPTZ;
ALTER TABLE family_profiles ADD COLUMN IF NOT EXISTS health_data_consent_at TIMESTAMPTZ;
ALTER TABLE family_profiles ADD COLUMN IF NOT EXISTS cgu_version VARCHAR(20);
