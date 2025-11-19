-- =====================================================
-- CRÉER LE BUCKET POUR LES PHOTOS DE PROFIL (AVATARS)
-- =====================================================
-- Ce script crée le bucket de stockage pour les photos de profil
-- et configure les politiques d'accès

-- =====================================================
-- 1. CRÉER LE BUCKET AVATARS
-- =====================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- =====================================================
-- 2. SUPPRIMER LES ANCIENNES POLITIQUES (si elles existent)
-- =====================================================

DROP POLICY IF EXISTS "Public can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete avatars" ON storage.objects;

-- =====================================================
-- 3. CRÉER LES POLITIQUES D'ACCÈS
-- =====================================================

-- Tout le monde peut voir les avatars (public)
CREATE POLICY "Public can view avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Les utilisateurs authentifiés peuvent uploader des avatars
CREATE POLICY "Authenticated users can upload avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars');

-- Les utilisateurs authentifiés peuvent mettre à jour leurs avatars
CREATE POLICY "Authenticated users can update avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars');

-- Les utilisateurs authentifiés peuvent supprimer leurs avatars
CREATE POLICY "Authenticated users can delete avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatars');

-- =====================================================
-- RÉSUMÉ
-- =====================================================

SELECT '✅ Bucket avatars créé avec succès !' as status;

SELECT
  'Configuration' as info,
  'Bucket: avatars (public)' as bucket,
  'Les utilisateurs peuvent uploader, modifier et supprimer leurs photos' as permissions,
  'Tout le monde peut voir les photos de profil' as visibilite;

-- Vérifier que le bucket existe
SELECT
  id,
  name,
  public,
  created_at
FROM storage.buckets
WHERE id = 'avatars';
