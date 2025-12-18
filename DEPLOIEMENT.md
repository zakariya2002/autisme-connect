# Guide de déploiement - NeuroCare

Ce guide vous accompagne dans le déploiement de votre SaaS sur Vercel avec un nom de domaine personnalisé.

## 📋 Prérequis

- [ ] Compte GitHub (https://github.com)
- [ ] Compte Vercel (https://vercel.com) - gratuit
- [ ] Nom de domaine (optionnel, peut être acheté après)
- [ ] Accès à votre projet Supabase

## 🚀 Étape 1 : Pousser le code sur GitHub

Votre code est déjà commité localement. Il faut maintenant le pousser sur GitHub.

### Option A : Push avec authentification (recommandé)

1. **Créer un Personal Access Token GitHub** :
   - Allez sur https://github.com/settings/tokens
   - Cliquez sur "Generate new token" → "Generate new token (classic)"
   - Donnez un nom : "NeuroCare Deploy"
   - Sélectionnez les permissions : `repo` (toutes les sous-options)
   - Durée : 90 jours ou "No expiration"
   - Cliquez sur "Generate token"
   - **IMPORTANT** : Copiez le token maintenant (vous ne pourrez plus le voir après)

2. **Pousser le code** :
   ```bash
   git push -u origin main
   ```
   - Username : `zakariya2002`
   - Password : collez votre token GitHub (pas votre mot de passe GitHub !)

### Option B : Vérifier que le repository existe

Vérifiez que votre repository https://github.com/zakariya2002/neuro-care existe bien et est accessible.

---

## 🌐 Étape 2 : Déployer sur Vercel

### 2.1 Créer un compte Vercel

1. Allez sur https://vercel.com
2. Cliquez sur "Sign Up"
3. Choisissez "Continue with GitHub"
4. Autorisez Vercel à accéder à vos repositories

### 2.2 Importer votre projet

1. Sur le dashboard Vercel, cliquez sur **"Add New..."** → **"Project"**
2. Cherchez et sélectionnez le repository `neuro-care`
3. Cliquez sur **"Import"**

### 2.3 Configuration du projet

**Framework Preset** : Next.js (détecté automatiquement)

**Build Settings** :
- Build Command : `npm run build` (par défaut)
- Output Directory : `.next` (par défaut)
- Install Command : `npm install` (par défaut)

**NE CLIQUEZ PAS ENCORE SUR "Deploy"** ! Il faut d'abord configurer les variables d'environnement.

---

## 🔐 Étape 3 : Configurer les variables d'environnement

### 3.1 Dans l'interface Vercel

Avant de déployer, cliquez sur **"Environment Variables"** et ajoutez ces variables :

#### Variables Supabase (OBLIGATOIRES)

| Nom | Valeur | Environnement |
|-----|--------|---------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://ghfymwjclzacriswqxme.supabase.co` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_N8-lqG1kJnSPusOAQJI-cQ_P_K4nq6L` | Production, Preview, Development |
| `SUPABASE_SECRET_KEY` | `sb_secret_MumEttAtfQBVqhs17vqFbw_xBp-hB7F` | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | `sb_secret_MumEttAtfQBVqhs17vqFbw_xBp-hB7F` | Production, Preview, Development |

#### Variable Resend (Email - OPTIONNEL)

| Nom | Valeur | Environnement |
|-----|--------|---------------|
| `RESEND_API_KEY` | `re_32KAQ9Hr_7VDuUc8U6nhczWoBQu3Hvf3k` | Production, Preview, Development |

### 3.2 Cliquez sur "Deploy"

Une fois toutes les variables ajoutées, cliquez sur **"Deploy"** !

Le déploiement prendra environ 2-3 minutes.

---

## 🎯 Étape 4 : Vérifier le déploiement

1. Attendez que le déploiement se termine (statut "Ready")
2. Cliquez sur le bouton **"Visit"** ou sur l'URL générée (ex: `neuro-care.vercel.app`)
3. Testez votre application :
   - Créez un compte
   - Connectez-vous
   - Vérifiez que les données Supabase fonctionnent

---

## 🌍 Étape 5 : Ajouter un nom de domaine personnalisé

### 5.1 Acheter un nom de domaine (si vous n'en avez pas)

Recommandations de registrars :
- **Namecheap** (https://www.namecheap.com) - Simple et abordable
- **OVH** (https://www.ovh.com) - Français, bon support
- **Google Domains** (https://domains.google) - Simple d'utilisation
- **Vercel Domains** (https://vercel.com/domains) - Intégration automatique

Prix moyen : 10-15€/an pour un .com, 5-10€/an pour un .fr

### 5.2 Configurer le domaine dans Vercel

1. Dans votre projet Vercel, allez dans l'onglet **"Settings"**
2. Cliquez sur **"Domains"** dans le menu latéral
3. Cliquez sur **"Add"**
4. Entrez votre nom de domaine (ex: `neuro-care.fr` ou `www.neuro-care.fr`)
5. Cliquez sur **"Add"**

### 5.3 Configurer les DNS chez votre registrar

Vercel vous donnera des instructions spécifiques, mais voici les étapes générales :

#### Option A : Configuration avec un domaine racine (neuro-care.fr)

Ajoutez un enregistrement **A** :
- Type : `A`
- Nom/Host : `@`
- Valeur : `76.76.21.21`
- TTL : Automatique ou 3600

#### Option B : Configuration avec www (www.neuro-care.fr)

Ajoutez un enregistrement **CNAME** :
- Type : `CNAME`
- Nom/Host : `www`
- Valeur : `cname.vercel-dns.com`
- TTL : Automatique ou 3600

#### Recommandation : Les deux !

Ajoutez les deux configurations pour que votre site fonctionne avec et sans www.

### 5.4 Attendre la propagation DNS

- La propagation DNS peut prendre de **quelques minutes à 48 heures**
- En général, c'est fonctionnel en 15-30 minutes
- Vérifiez avec https://dnschecker.org

---

## 🔒 Étape 6 : Configurer Supabase pour le domaine personnalisé

Une fois votre domaine configuré, mettez à jour Supabase :

1. Allez sur https://app.supabase.com
2. Sélectionnez votre projet
3. Allez dans **Authentication** → **URL Configuration**
4. Ajoutez vos URLs :
   - Site URL : `https://votredomaine.fr`
   - Redirect URLs :
     - `https://votredomaine.fr/auth/callback`
     - `https://votredomaine.fr/**`
     - `https://neuro-care.vercel.app/**` (gardez l'URL Vercel en backup)

---

## ✅ Checklist finale

- [ ] Code poussé sur GitHub
- [ ] Projet déployé sur Vercel
- [ ] Variables d'environnement configurées
- [ ] Application testée sur l'URL Vercel
- [ ] Nom de domaine acheté (si souhaité)
- [ ] DNS configurés
- [ ] Domaine ajouté dans Vercel
- [ ] Certificat SSL actif (automatique avec Vercel)
- [ ] URLs mises à jour dans Supabase
- [ ] Application testée sur le domaine personnalisé

---

## 📊 Monitoring et maintenance

### Vercel Analytics (optionnel mais recommandé)

1. Dans votre projet Vercel, allez dans **"Analytics"**
2. Activez les analytics pour suivre :
   - Nombre de visiteurs
   - Performance du site
   - Temps de chargement

### Logs et débogage

- **Logs en temps réel** : Vercel Dashboard → Deployments → Function Logs
- **Erreurs** : Onglet "Logs" de chaque déploiement

---

## 🆘 Problèmes courants

### Erreur 500 après déploiement
- Vérifiez que TOUTES les variables d'environnement sont configurées
- Consultez les logs dans Vercel

### Le site affiche une page blanche
- Vérifiez les logs de build
- Assurez-vous que le build s'est terminé sans erreur

### Les données Supabase ne chargent pas
- Vérifiez les variables NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
- Vérifiez que votre domaine est autorisé dans Supabase

### Le domaine ne fonctionne pas
- Vérifiez la propagation DNS sur https://dnschecker.org
- Attendez jusqu'à 48h maximum
- Vérifiez que les enregistrements DNS sont corrects

---

## 💰 Coûts estimés

- **Vercel** : Gratuit pour hobby (usage personnel) - 100GB de bande passante/mois
- **Supabase** : Gratuit jusqu'à 500MB de base de données et 2GB de stockage
- **Nom de domaine** : 10-15€/an (.com) ou 5-10€/an (.fr)
- **Total** : ~10-15€/an si vous restez dans les limites gratuites

---

## 🎉 Félicitations !

Votre SaaS est maintenant en ligne et accessible publiquement !

Pour des questions ou du support :
- Documentation Vercel : https://vercel.com/docs
- Documentation Next.js : https://nextjs.org/docs
- Documentation Supabase : https://supabase.com/docs
