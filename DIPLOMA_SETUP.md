# Configuration du Système de Vérification des Diplômes

## 1. Configuration de la Base de Données

### Exécuter le script SQL
1. Ouvrez votre dashboard Supabase
2. Allez dans **SQL Editor**
3. Copiez et exécutez le contenu de `supabase-diploma-verification.sql`

Cela va créer :
- ✅ Colonnes pour la vérification des diplômes dans `educator_profiles`
- ✅ Table d'historique `diploma_verification_history`
- ✅ Politiques RLS appropriées
- ✅ Triggers automatiques pour l'audit
- ✅ Vue des statistiques pour les admins

## 2. Configuration du Storage Supabase

### Créer le bucket pour les diplômes

1. Dans le dashboard Supabase, allez dans **Storage**
2. Cliquez sur **New Bucket**
3. Configurez comme suit :
   - **Name**: `diplomas`
   - **Public bucket**: ❌ NON (désactivé pour la sécurité)
   - **Allowed MIME types**: `image/jpeg, image/jpg, image/png, application/pdf`
   - **Max file size**: `5 MB`

### Configurer les politiques RLS du Storage

Dans **Storage** > **Policies** pour le bucket `diplomas`, ajoutez :

#### Policy 1 : Upload
```sql
-- Les éducateurs peuvent uploader leur propre diplôme
CREATE POLICY "Educators can upload their diploma"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'diplomas'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

#### Policy 2 : Update
```sql
-- Les éducateurs peuvent mettre à jour leur diplôme
CREATE POLICY "Educators can update their diploma"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'diplomas'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

#### Policy 3 : Select (View)
```sql
-- Les éducateurs peuvent voir leur diplôme + les admins peuvent tout voir
CREATE POLICY "Educators and admins can view diplomas"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'diplomas'
  AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  )
);
```

#### Policy 4 : Delete
```sql
-- Les éducateurs peuvent supprimer leur diplôme (pour re-upload)
CREATE POLICY "Educators can delete their diploma"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'diplomas'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

## 3. Créer un Compte Admin

### Via SQL Editor
```sql
-- Mettez à jour le rôle de votre compte pour le rendre admin
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'VOTRE_EMAIL@exemple.com';
```

Remplacez `VOTRE_EMAIL@exemple.com` par votre email.

## 4. Variables d'Environnement

Ajoutez à votre `.env.local` :
```env
NEXT_PUBLIC_SUPABASE_URL=votre_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_key
SUPABASE_SERVICE_ROLE_KEY=votre_service_role_key
```

## 5. Configuration des Emails (Optionnel)

Pour les notifications automatiques par email :

### Via Supabase Edge Functions
1. Créez une Edge Function pour envoyer des emails
2. Utilisez un service comme SendGrid, Resend, ou Mailgun
3. Configurez les webhooks pour les changements de statut

### Ou via Database Triggers
Utilisez `pg_net` pour envoyer des requêtes HTTP à un service d'email externe.

## 6. Test de l'Installation

### Vérifier la base de données
```sql
-- Vérifier que les colonnes existent
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'educator_profiles'
AND column_name LIKE 'diploma%';

-- Vérifier les statistiques
SELECT * FROM diploma_verification_stats;
```

### Vérifier le Storage
1. Allez dans Storage > diplomas
2. Le bucket devrait être créé et privé
3. Les policies devraient être visibles

## 7. Workflow de Vérification

1. **Éducateur** inscrit et upload son diplôme
   - Status: `pending`
   - Email automatique: "Diplôme reçu, vérification sous 48h"

2. **Admin** vérifie dans le dashboard `/admin/verify-diplomas`
   - Voit le diplôme uploadé
   - Peut Accepter ou Refuser

3. **Si Accepté**:
   - Status: `verified`
   - Le profil apparaît dans les recherches
   - Email: "Diplôme validé - profil maintenant visible"

4. **Si Refusé**:
   - Status: `rejected`
   - Email avec la raison du refus
   - L'éducateur peut re-soumettre

## 8. Sécurité

✅ Les diplômes sont stockés dans un bucket privé
✅ Seuls les éducateurs et admins peuvent voir les diplômes
✅ RLS activée sur toutes les tables
✅ Historique complet des actions
✅ Validation des types de fichiers (PDF, JPG, PNG)
✅ Limite de taille (5MB)

## Notes Importantes

- Les profils non vérifiés ne doivent PAS apparaître dans la recherche
- Objectif de vérification : **24-48h maximum**
- Notifications à l'admin pour chaque nouveau diplôme
- Badge "Diplôme Vérifié ✓" visible sur les profils
