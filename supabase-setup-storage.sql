-- CONFIGURATION DU STOCKAGE SUPABASE POUR LES AVATARS
-- Ce script crée le bucket de stockage et configure les politiques d'accès

-- 1. Créer le bucket pour les avatars (si vous préférez l'interface Supabase, vous pouvez le faire manuellement)
-- Note: Cette partie est généralement faite via l'interface Supabase Storage
-- Allez sur: Supabase Dashboard → Storage → Create bucket
-- Nom du bucket: avatars
-- Public: true (pour que les images soient accessibles publiquement)

-- 2. Politiques de sécurité pour le bucket (à exécuter après avoir créé le bucket)
-- Ces politiques permettent:
-- - Tout le monde peut voir les avatars (lecture publique)
-- - Seuls les utilisateurs connectés peuvent uploader leurs propres avatars
-- - Seuls les utilisateurs peuvent supprimer leurs propres avatars

-- Note: Les politiques de storage se configurent dans l'interface Supabase
-- Allez sur: Storage → avatars → Policies

-- Politique de LECTURE (SELECT): Tout le monde peut voir
-- Name: Public avatar access
-- Policy: (bucket_id = 'avatars')

-- Politique d'INSERTION (INSERT): Utilisateurs authentifiés seulement
-- Name: Users can upload their own avatar
-- Policy: (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1])

-- Politique de MISE À JOUR (UPDATE): Utilisateurs authentifiés seulement
-- Name: Users can update their own avatar
-- Policy: (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1])

-- Politique de SUPPRESSION (DELETE): Utilisateurs authentifiés seulement
-- Name: Users can delete their own avatar
-- Policy: (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1])

SELECT 'Configuration du Storage:' as instruction;
SELECT '1. Allez sur Supabase Dashboard → Storage' as step_1;
SELECT '2. Cliquez sur "New bucket"' as step_2;
SELECT '3. Nom: avatars' as step_3;
SELECT '4. Public: Activé (cochez)' as step_4;
SELECT '5. Cliquez sur "Create bucket"' as step_5;
SELECT '6. Le bucket est créé!' as done;
