-- Mettre à jour le bucket diplomas pour le rendre public
-- (Les RLS policies contrôlent toujours l'accès)
UPDATE storage.buckets
SET public = true
WHERE id = 'diplomas';

-- Vérifier
SELECT id, name, public FROM storage.buckets WHERE id = 'diplomas';
