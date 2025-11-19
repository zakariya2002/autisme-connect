-- =====================================================
-- AJOUTER LES TYPES DEES ET DEME AUX CERTIFICATIONS
-- =====================================================
-- Ce script modifie la contrainte CHECK pour accepter
-- les nouveaux types de diplômes d'État

-- Supprimer l'ancienne contrainte
ALTER TABLE certifications
DROP CONSTRAINT IF EXISTS certifications_type_check;

-- Créer la nouvelle contrainte avec DEES et DEME
ALTER TABLE certifications
ADD CONSTRAINT certifications_type_check
CHECK (type IN ('ABA', 'TEACCH', 'PECS', 'Makaton', 'DEES', 'DEME', 'OTHER'));

-- Vérification
SELECT '✅ Contrainte mise à jour avec succès !' as status;
SELECT 'Les types autorisés sont maintenant : ABA, TEACCH, PECS, Makaton, DEES, DEME, OTHER' as info;
