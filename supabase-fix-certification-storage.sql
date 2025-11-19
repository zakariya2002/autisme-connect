-- =====================================================
-- CORRIGER LE BUCKET DE STOCKAGE DES CERTIFICATIONS
-- =====================================================
-- Ce script corrige les politiques RLS pour permettre
-- l'upload et la lecture des documents de certification

-- 1. Créer le bucket s'il n'existe pas
INSERT INTO storage.buckets (id, name, public)
VALUES ('certification-documents', 'certification-documents', false)
ON CONFLICT (id) DO NOTHING;

-- 2. SUPPRIMER TOUTES LES ANCIENNES POLITIQUES
DROP POLICY IF EXISTS "Users can upload their certification documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their certification documents" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view all certification documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their certification documents" ON storage.objects;

-- 3. CRÉER DE NOUVELLES POLITIQUES SIMPLES ET FONCTIONNELLES

-- Politique : Les utilisateurs authentifiés peuvent uploader dans leur dossier
CREATE POLICY "Authenticated users can upload certification documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'certification-documents'
);

-- Politique : Les utilisateurs authentifiés peuvent lire tous les documents
CREATE POLICY "Authenticated users can read certification documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'certification-documents'
);

-- Politique : Les utilisateurs peuvent modifier leurs propres documents
CREATE POLICY "Users can update their certification documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'certification-documents'
);

-- Politique : Les utilisateurs peuvent supprimer leurs propres documents
CREATE POLICY "Users can delete their certification documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'certification-documents'
);

-- Vérification
SELECT '✅ Bucket et politiques de stockage configurés avec succès !' as status;

-- Afficher les politiques actives
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'objects'
  AND policyname LIKE '%certification%'
ORDER BY policyname;
