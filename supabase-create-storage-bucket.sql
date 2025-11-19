-- CRÉER LE BUCKET DE STOCKAGE POUR LES PHOTOS DE PROFIL
-- Ce script crée le bucket et configure les politiques d'accès

-- 1. Créer le bucket 'profiles' s'il n'existe pas
INSERT INTO storage.buckets (id, name, public)
VALUES ('profiles', 'profiles', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Public can view profile photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own profile photo" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own profile photo" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own profile photo" ON storage.objects;

-- 3. Politique : Permettre à tout le monde de voir les photos de profil (lecture publique)
CREATE POLICY "Public can view profile photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'profiles');

-- 4. Politique : Permettre aux utilisateurs authentifiés d'uploader leurs propres photos
CREATE POLICY "Users can upload their own profile photo"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'profiles'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 5. Politique : Permettre aux utilisateurs de mettre à jour leurs propres photos
CREATE POLICY "Users can update their own profile photo"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'profiles'
  AND auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'profiles'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 6. Politique : Permettre aux utilisateurs de supprimer leurs propres photos
CREATE POLICY "Users can delete their own profile photo"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'profiles'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

SELECT '✅ Bucket "profiles" créé avec succès !' as status;

-- Structure recommandée pour les fichiers :
-- profiles/{user_id}/avatar.jpg
-- profiles/{user_id}/avatar.png
-- etc.
