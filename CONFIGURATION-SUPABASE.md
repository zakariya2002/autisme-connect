# Configuration Supabase - Guide Complet

## ⚠️ Problème Actuel

L'inscription des utilisateurs échoue avec l'erreur "user_id not present in table users" ou "violates row-level security policy".

## ✅ Deux Solutions Possibles

### **Solution 1 : Approche Simplifiée (RECOMMANDÉE)**

Cette solution utilise l'authentification standard de Supabase. **Aucune clé service_role nécessaire !**

#### Étapes à suivre :

1. **Désactiver la confirmation d'email dans Supabase** :
   - Allez sur https://supabase.com
   - Ouvrez votre projet → **Authentication** → **Providers** → **Email**
   - **Décochez** "Confirm email"
   - Sauvegardez

2. **Désactiver RLS (Seulement pour le développement)** :
   - Allez dans **SQL Editor**
   - Exécutez ce script :
   ```sql
   ALTER TABLE educator_profiles DISABLE ROW LEVEL SECURITY;
   ALTER TABLE family_profiles DISABLE ROW LEVEL SECURITY;
   ```

3. **C'est tout !** Le code a déjà été mis à jour pour utiliser cette approche.

---

### **Solution 2 : Approche Admin API (Avancée)**

Cette solution nécessite la clé service_role de Supabase.

## ✅ Obtenir la Clé Service Role

### Étapes :

1. **Allez sur Supabase** : https://supabase.com
2. Ouvrez votre projet
3. Allez dans **Project Settings** (icône engrenage en bas à gauche)
4. Cliquez sur **API** dans le menu de gauche
5. Descendez jusqu'à trouver **Project API keys**
6. Vous verrez plusieurs clés :
   - `anon` / `public` - Clé publique
   - **`service_role`** - ⚠️ **C'EST CELLE-CI QU'IL FAUT !**

### 🔑 Copier la Clé Service Role

1. Cliquez sur **Reveal** / **Afficher** à côté de `service_role`
2. **Copiez cette clé** (elle commence généralement par `eyJ...`)
3. Remplacez la valeur de `SUPABASE_SECRET_KEY` dans `.env.local` par cette clé

### Fichier .env.local mis à jour

```env
# Configuration Supabase
NEXT_PUBLIC_SUPABASE_URL=https://ghfymwjclzacriswqxme.supabase.co

# Clé publique (anon/public key)
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_N8-lqG1kJnSPusOAQJI-cQ_P_K4nq6L

# ⚠️ IMPORTANT : Remplacer par la clé SERVICE_ROLE de Supabase
# (Project Settings → API → service_role)
SUPABASE_SECRET_KEY=eyJ... (votre clé service_role ici)
```

### ⚠️ Attention !

La clé `service_role` a **tous les pouvoirs** sur votre base de données :
- ✅ Bypass de toutes les politiques RLS
- ✅ Création/modification/suppression de données
- ⚠️ **NE JAMAIS l'exposer côté client**
- ⚠️ **Utiliser UNIQUEMENT dans les API routes** (côté serveur)

## 🔄 Après avoir mis à jour .env.local

1. **Redémarrez le serveur** : Ctrl+C puis `npm run dev`
2. **Testez l'inscription** : http://localhost:3000/signup
3. Tout devrait fonctionner maintenant !

## 📋 Vérification

Pour vérifier que vous avez la bonne clé :
- La clé `service_role` est **très longue** (plusieurs centaines de caractères)
- Elle commence souvent par `eyJ`
- Elle a un avertissement de sécurité dans Supabase Dashboard
