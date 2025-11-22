-- ============================================
-- Création du bucket diplomas et des policies
-- Date: 2025-11-22
-- ============================================

-- 1. Créer le bucket diplomas (privé)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'diplomas',
  'diplomas',
  false,
  5242880,  -- 5 MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- 2. Policy : Users can upload their own diplomas
CREATE POLICY "Users can upload their own diplomas"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'diplomas'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 3. Policy : Admins can read all diplomas
CREATE POLICY "Admins can read all diplomas"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'diplomas'
  AND (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'admin'
);

-- 4. Policy : Users can read their own diplomas
CREATE POLICY "Users can read their own diplomas"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'diplomas'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 5. Policy : Users can delete their own diplomas
CREATE POLICY "Users can delete their own diplomas"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'diplomas'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 6. Policy : Users can update their own diplomas
CREATE POLICY "Users can update their own diplomas"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'diplomas'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 7. Vérifier que le bucket a été créé
SELECT * FROM storage.buckets WHERE id = 'diplomas';

-- 8. Vérifier les policies
SELECT * FROM pg_policies WHERE tablename = 'objects' AND policyname LIKE '%diplomas%';
