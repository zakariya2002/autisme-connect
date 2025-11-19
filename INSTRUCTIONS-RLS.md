# Solution au Problème RLS (Row Level Security)

## 🔴 Erreur : "new row violates row-level security policy"

Cette erreur se produit car Supabase bloque l'insertion de données dans les tables avec des politiques de sécurité RLS.

## ✅ Solutions (par ordre de priorité)

### Solution 1 : Désactiver la Confirmation d'Email (Recommandé pour le développement)

1. **Allez dans Supabase** : https://supabase.com
2. Ouvrez votre projet
3. Allez dans **Authentication** → **Providers** → **Email**
4. **DÉSACTIVEZ** l'option **"Confirm email"**
5. Sauvegardez

Cela permettra aux utilisateurs de se connecter immédiatement après l'inscription.

---

### Solution 2 : Exécuter le Script de Correction RLS

Si la solution 1 ne suffit pas :

1. **Allez dans Supabase** → **SQL Editor**
2. **Ouvrez le fichier** `fix-rls-policies.sql`
3. **Copiez tout son contenu**
4. **Collez-le** dans l'éditeur SQL de Supabase
5. Cliquez sur **"Run"**

Ce script va corriger les politiques de sécurité.

---

### Solution 3 : Désactiver Temporairement RLS (UNIQUEMENT pour le développement)

⚠️ **ATTENTION** : À utiliser UNIQUEMENT en développement, PAS en production !

Dans Supabase → SQL Editor, exécutez :

```sql
-- Désactiver RLS temporairement
ALTER TABLE educator_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE family_profiles DISABLE ROW LEVEL SECURITY;
```

Pour réactiver plus tard :

```sql
-- Réactiver RLS
ALTER TABLE educator_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_profiles ENABLE ROW LEVEL SECURITY;
```

---

## 🔍 Vérification

Après avoir appliqué une solution, essayez de vous inscrire sur :

👉 **http://localhost:3000/signup**

Si l'erreur persiste, vérifiez :

1. **La session** : L'utilisateur est-il bien connecté après inscription ?
2. **Les logs** : Consultez les logs Supabase dans Dashboard → Logs
3. **Les politiques** : Vérifiez dans Table Editor → educator_profiles → Policies

---

## 📧 Configuration Email (Important)

Pour éviter les problèmes d'authentification :

### Dans Supabase → Authentication → Settings :

1. **Email Templates** : Vérifiez que les templates sont configurés
2. **SMTP Settings** : Pour l'instant, utilisez le SMTP intégré de Supabase
3. **Confirm email** : Désactivez pour le développement

---

## ✅ Configuration Recommandée pour le Développement

```
Authentication → Providers → Email
├─ Enable Email provider: ✅ ON
├─ Confirm email: ❌ OFF (désactivé)
├─ Secure email change: ❌ OFF
└─ Enable email OTP: ❌ OFF
```

---

## 🚀 Une Fois Configuré

Retournez sur **http://localhost:3000/signup** et créez votre compte !

Tout devrait fonctionner maintenant. 🎉
