# 🎯 Guide de Configuration - Inscription Utilisateurs

## 📋 Résumé de la Situation

L'application **Autisme Connect** est presque prête ! Il reste juste à configurer Supabase pour permettre aux utilisateurs de s'inscrire.

---

## ✅ Solution Simple (3 Étapes)

### Étape 1 : Désactiver la Confirmation d'Email

1. Allez sur **https://supabase.com**
2. Ouvrez votre projet
3. Allez dans **Authentication** → **Providers** → **Email**
4. **Décochez** l'option **"Confirm email"**
5. Cliquez sur **Save**

### Étape 2 : Désactiver RLS (Pour le développement uniquement)

1. Dans Supabase, allez dans **SQL Editor**
2. Créez une nouvelle query
3. Copiez-collez ce code :

```sql
-- Désactiver RLS pour le développement
ALTER TABLE educator_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE family_profiles DISABLE ROW LEVEL SECURITY;

-- Vérifier que c'est bien désactivé
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('educator_profiles', 'family_profiles');
```

4. Cliquez sur **Run**
5. Vous devriez voir dans les résultats : `rowsecurity = false` pour les deux tables

### Étape 3 : Tester l'Inscription

1. Ouvrez votre navigateur
2. Allez sur **http://localhost:3000/signup**
3. Inscrivez-vous avec :
   - Un email (ex: test@example.com)
   - Un mot de passe (min 6 caractères)
   - Choisissez "Famille" ou "Éducateur"
4. Remplissez le formulaire de profil
5. Cliquez sur **"Créer mon compte"**

✅ **Vous devriez être redirigé vers le dashboard !**

---

## 🔍 Vérification que tout fonctionne

### Dans Supabase :

1. Allez dans **Authentication** → **Users**
   - Vous devriez voir votre utilisateur créé

2. Allez dans **Table Editor** → Sélectionnez **educator_profiles** ou **family_profiles**
   - Vous devriez voir votre profil

---

## ⚠️ Important : RLS en Production

**Attention** : RLS (Row Level Security) a été désactivé pour faciliter le développement.

### Avant de déployer en production :

1. **Réactivez RLS** :
```sql
ALTER TABLE educator_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_profiles ENABLE ROW LEVEL SECURITY;
```

2. **Créez des politiques de sécurité** :
```sql
-- Politique : Les utilisateurs peuvent voir leur propre profil
CREATE POLICY "Users can view own educator profile"
ON educator_profiles FOR SELECT
USING (auth.uid() = user_id);

-- Politique : Les utilisateurs peuvent modifier leur propre profil
CREATE POLICY "Users can update own educator profile"
ON educator_profiles FOR UPDATE
USING (auth.uid() = user_id);

-- Même chose pour family_profiles
CREATE POLICY "Users can view own family profile"
ON family_profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own family profile"
ON family_profiles FOR UPDATE
USING (auth.uid() = user_id);
```

---

## 🐛 En Cas d'Erreur

### Erreur : "Email not confirmed"
➡️ Retournez à l'Étape 1 et vérifiez que "Confirm email" est bien décoché

### Erreur : "violates row-level security policy"
➡️ Retournez à l'Étape 2 et exécutez le script SQL pour désactiver RLS

### Erreur : "User already exists"
➡️ Utilisez un autre email ou supprimez l'utilisateur dans Supabase → Authentication → Users

### Erreur : "new row violates foreign key constraint"
➡️ Assurez-vous d'avoir exécuté le fichier `supabase-schema.sql` dans Supabase SQL Editor

---

## 📁 Fichiers Modifiés

Le code a été mis à jour pour utiliser l'approche simplifiée :

- ✅ `app/signup/page.tsx` - Page d'inscription mise à jour
- ✅ `app/api/create-profile-simple/route.ts` - API pour créer les profils
- ✅ `CONFIGURATION-SUPABASE.md` - Guide de configuration détaillé

---

## 🚀 Prochaines Étapes

Une fois l'inscription fonctionnelle :

1. ✅ Tester la connexion : http://localhost:3000/auth/login
2. ✅ Tester la recherche d'éducateurs
3. ✅ Tester la messagerie
4. ✅ Tester les réservations
5. 🎉 Déployer l'application !

---

## 📞 Besoin d'Aide ?

Si vous rencontrez des difficultés :

1. Vérifiez les logs dans la console du navigateur (F12)
2. Vérifiez les logs du serveur dans le terminal
3. Vérifiez les logs dans Supabase → Logs
4. Consultez la documentation Supabase : https://supabase.com/docs

Bon développement ! 🎉
