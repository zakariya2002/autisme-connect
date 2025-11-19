# 📸 Configuration de la Fonctionnalité Photo de Profil

## ✅ Ce qui a été implémenté

1. **Upload de photos** avec validation (JPG, PNG, WEBP, max 2MB)
2. **Stockage dans Supabase Storage** (bucket "avatars")
3. **Système de modération** avec 3 statuts :
   - ⏳ **Pending** : En attente de validation
   - ✅ **Approved** : Photo approuvée et visible
   - ❌ **Rejected** : Photo rejetée avec raison
4. **Interface utilisateur** :
   - Preview de la photo
   - Badge de statut de modération
   - Messages d'information clairs
5. **Historique de modération** dans la table `avatar_moderation_logs`

---

## 🚀 Étapes de configuration

### Étape 1 : Résoudre l'erreur "duplicate key"

**Problème** : Vous avez déjà un profil dans la base avec un mauvais `user_id`.

**Solution** :

1. Ouvrez le fichier : `supabase-delete-my-profile.sql`
2. Allez sur **Supabase Dashboard** → **SQL Editor**
3. Créez une **New query**
4. Copiez-collez tout le contenu du fichier SQL
5. Cliquez sur **Run**
6. Votre profil sera supprimé

### Étape 2 : Ajouter les colonnes avatar dans la base de données

**Fichier** : `supabase-add-avatar-feature.sql`

1. Ouvrez Supabase Dashboard → **SQL Editor**
2. Créez une **New query**
3. Copiez-collez tout le contenu du fichier
4. Cliquez sur **Run**

Ce script va :
- Ajouter les colonnes `avatar_url`, `avatar_moderation_status`, `avatar_moderation_reason`
- Créer la table `avatar_moderation_logs`
- Créer les triggers pour logger les changements

### Étape 3 : Créer le bucket de stockage Supabase

1. Allez sur **Supabase Dashboard** → **Storage**
2. Cliquez sur **New bucket**
3. Configurez :
   - **Nom** : `avatars`
   - **Public** : ✅ **Activé** (cochez la case)
   - **File size limit** : 2MB (optionnel)
   - **Allowed MIME types** : image/jpeg, image/png, image/webp (optionnel)
4. Cliquez sur **Create bucket**

### Étape 4 : Configurer les politiques de sécurité du bucket

1. Allez sur **Storage** → **avatars** → **Policies**
2. Cliquez sur **New Policy**

#### Politique 1 : Lecture publique (SELECT)
- **Name** : Public avatar access
- **Policy definition** :
  ```sql
  (bucket_id = 'avatars'::text)
  ```
- **Allowed operation** : SELECT
- Cliquez sur **Review** puis **Save policy**

#### Politique 2 : Upload (INSERT)
- **Name** : Users can upload their own avatar
- **Policy definition** :
  ```sql
  ((bucket_id = 'avatars'::text) AND ((auth.uid())::text = (storage.foldername(name))[1]))
  ```
- **Allowed operation** : INSERT
- Cliquez sur **Review** puis **Save policy**

#### Politique 3 : Mise à jour (UPDATE)
- **Name** : Users can update their own avatar
- **Policy definition** :
  ```sql
  ((bucket_id = 'avatars'::text) AND ((auth.uid())::text = (storage.foldername(name))[1]))
  ```
- **Allowed operation** : UPDATE
- Cliquez sur **Review** puis **Save policy**

#### Politique 4 : Suppression (DELETE)
- **Name** : Users can delete their own avatar
- **Policy definition** :
  ```sql
  ((bucket_id = 'avatars'::text) AND ((auth.uid())::text = (storage.foldername(name))[1]))
  ```
- **Allowed operation** : DELETE
- Cliquez sur **Review** puis **Save policy**

### Étape 5 : Recréer votre profil

1. Allez sur : **http://localhost:3000/create-profile**
2. Choisissez votre rôle (Famille ou Éducateur)
3. Remplissez le formulaire
4. Cliquez sur **Créer mon profil**

### Étape 6 : Tester l'upload de photo

1. Allez sur votre page de profil :
   - Éducateur : **http://localhost:3000/dashboard/educator/profile**
   - Famille : **http://localhost:3000/dashboard/family/profile**

2. Dans la section **Photo de profil** :
   - Cliquez sur **Ajouter une photo** (ou **Changer la photo**)
   - Sélectionnez une image (JPG, PNG, WEBP, max 2MB)
   - L'upload se fait automatiquement
   - Vous verrez un badge **⏳ En attente** (statut de modération)

---

## 🛠️ Modération des photos (pour les administrateurs)

### Option 1 : Modération manuelle via Supabase

1. Allez sur **Supabase Dashboard** → **Table Editor**
2. Sélectionnez `educator_profiles` ou `family_profiles`
3. Trouvez l'utilisateur à modérer
4. Modifiez les colonnes :
   - `avatar_moderation_status` : `approved` ou `rejected`
   - `avatar_moderation_reason` : (si rejected) "Photo inappropriée", "Qualité insuffisante", etc.

### Option 2 : Page de modération (à implémenter)

Pour créer une interface admin de modération, créez une page `/admin/moderation` qui :
- Liste tous les avatars avec statut "pending"
- Affiche les photos
- Permet d'approuver ou rejeter avec raison

---

## 📊 Structure des données

### Colonnes ajoutées aux profils

```sql
-- educator_profiles et family_profiles
avatar_url TEXT                                    -- URL de la photo
avatar_moderation_status TEXT DEFAULT 'pending'   -- pending | approved | rejected
avatar_moderation_reason TEXT                     -- Raison si rejeté
```

### Table de logs

```sql
-- avatar_moderation_logs
id UUID
profile_type TEXT              -- 'educator' ou 'family'
profile_id UUID               -- ID du profil
avatar_url TEXT               -- URL de l'avatar
status TEXT                   -- pending | approved | rejected
reason TEXT                   -- Raison de la décision
moderated_by UUID             -- ID de l'admin (NULL si auto)
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

---

## 🎨 Utilisation du composant AvatarUpload

Le composant est déjà intégré dans les pages de profil, mais vous pouvez l'utiliser ailleurs :

```tsx
import AvatarUpload from '@/components/AvatarUpload';

<AvatarUpload
  currentAvatarUrl={avatarUrl}
  userId={userId}
  profileType="educator" // ou "family"
  moderationStatus={moderationStatus}
  moderationReason={moderationReason}
  onAvatarChange={(newUrl) => setAvatarUrl(newUrl)}
/>
```

---

## 🔐 Sécurité

✅ **Validations implémentées** :
- Taille max : 2MB
- Formats autorisés : JPG, PNG, WEBP
- Un utilisateur ne peut modifier que son propre avatar
- Les avatars sont stockés dans un dossier par utilisateur : `avatars/{user_id}/`

✅ **Modération** :
- Toutes les photos sont en statut "pending" par défaut
- Nécessite une validation admin avant d'être visible publiquement
- Historique complet des décisions de modération

---

## ❓ FAQ

**Q : Puis-je changer de photo ?**
R : Oui, cliquez sur "Changer la photo". L'ancienne sera supprimée automatiquement.

**Q : Combien de temps prend la modération ?**
R : Cela dépend de votre processus. Pour l'instant, c'est manuel via Supabase.

**Q : Que se passe-t-il si ma photo est rejetée ?**
R : Vous verrez un message avec la raison et pourrez uploader une nouvelle photo.

**Q : Les photos sont-elles visibles publiquement ?**
R : Oui, le bucket est public, mais vous pouvez filtrer selon le statut de modération dans votre code.

---

## 📝 TODO (améliorations futures)

- [ ] Page admin de modération automatique
- [ ] Intégration d'une API de modération d'images (AWS Rekognition, Google Vision)
- [ ] Crop/resize automatique des images
- [ ] Notifications email lors de l'approbation/rejet
- [ ] Affichage de l'avatar dans les profils publics et recherches

---

## 🐛 Problèmes courants

### Erreur : "Bucket not found"
→ Vérifiez que vous avez créé le bucket "avatars" dans Storage

### Erreur : "Permission denied"
→ Vérifiez les politiques de sécurité du bucket

### Erreur : "File too large"
→ La limite est de 2MB, compressez votre image

### La photo ne s'affiche pas
→ Vérifiez que le bucket est bien configuré en **Public**

---

Besoin d'aide ? Vérifiez les fichiers :
- `lib/avatar.ts` : Fonctions d'upload
- `components/AvatarUpload.tsx` : Composant React
- Scripts SQL dans le dossier racine
