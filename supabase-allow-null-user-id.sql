-- PERMETTRE LES PROFILS DE TEST SANS user_id
-- Ce script retire la contrainte NOT NULL sur user_id pour permettre la création de profils de test

-- 1. Retirer la contrainte NOT NULL sur user_id
ALTER TABLE educator_profiles
ALTER COLUMN user_id DROP NOT NULL;

-- 2. Faire la même chose pour family_profiles (pour cohérence)
ALTER TABLE family_profiles
ALTER COLUMN user_id DROP NOT NULL;

SELECT '✅ Contrainte NOT NULL retirée sur user_id. Vous pouvez maintenant créer des profils de test !' as status;

-- Note: Les profils sans user_id sont des profils de démonstration/test uniquement.
-- Ils ne peuvent pas se connecter à l'application.
