# NeuroCare 🌟

Plateforme SaaS de mise en relation entre éducateurs spécialisés et familles de personnes avec Troubles du Spectre de l'Autisme (TSA).

## 📋 Fonctionnalités MVP

### ✅ Profils Éducateurs
- Informations professionnelles complètes
- Diplômes et certifications (ABA, TEACCH, PECS, etc.)
- Années d'expérience
- Spécialisations et langues parlées
- Tarifs horaires
- Note moyenne et avis clients

### ✅ Profils Familles/Personnes TSA
- Informations de contact
- Besoins spécifiques détaillés
- Niveau de soutien requis (selon DSM-5)
- Préférences de certifications
- Budget

### ✅ Système de Recherche et Filtrage
- Recherche par localisation
- Filtrage par certifications
- Filtrage par expérience
- Filtrage par tarif
- Filtrage par note

### ✅ Messagerie Sécurisée
- Conversations en temps réel
- Historique des messages
- Notifications de nouveaux messages
- Interface intuitive

### ✅ Système de Réservation/Planification
- Création de réservations
- Confirmation par l'éducateur
- Gestion des statuts (en attente, confirmée, annulée, terminée)
- Notes et détails de séance

### ✅ Évaluations et Avis
- Notation sur 5 étoiles
- Commentaires détaillés
- Calcul automatique de la note moyenne
- Affichage sur les profils

## 🛠️ Stack Technique

- **Frontend & Backend**: Next.js 14 (App Router)
- **Base de données**: Supabase (PostgreSQL)
- **Authentification**: Supabase Auth
- **Styling**: Tailwind CSS
- **TypeScript**: Pour un code type-safe
- **Temps réel**: Supabase Realtime

## 🚀 Installation

### Prérequis

⚠️ **IMPORTANT**: Ce projet nécessite Node.js version 20.9.0 ou supérieure.

Vérifiez votre version actuelle :
```bash
node --version
```

Si vous avez une version inférieure à v20.9.0, mettez à jour Node.js :

**Avec nvm (recommandé):**
```bash
# Installer nvm si vous ne l'avez pas
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Installer Node.js 20
nvm install 20
nvm use 20
```

**Ou téléchargez directement depuis:**
https://nodejs.org/

### Étapes d'installation

1. **Cloner le projet**
```bash
cd neuro-care
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configurer Supabase**

   a. Créez un compte sur [Supabase](https://supabase.com)

   b. Créez un nouveau projet

   c. Dans l'éditeur SQL de Supabase, exécutez le fichier `supabase-schema.sql` pour créer toutes les tables et configurations

   d. Récupérez vos clés API :
      - Allez dans Settings > API
      - Copiez l'URL du projet et la clé `anon/public`

4. **Configurer les variables d'environnement**

Créez un fichier `.env.local` à la racine du projet :

```bash
cp .env.example .env.local
```

Puis éditez `.env.local` avec vos clés Supabase :

```env
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-cle-anon
```

5. **Lancer le serveur de développement**

```bash
npm run dev
```

Le site sera accessible sur [http://localhost:3000](http://localhost:3000)

## 📁 Structure du Projet

```
neuro-care/
├── app/
│   ├── auth/                 # Pages d'authentification
│   │   ├── login/
│   │   └── register/
│   ├── profile/              # Création de profils
│   │   ├── educator/create/
│   │   └── family/create/
│   ├── dashboard/            # Tableaux de bord
│   │   ├── educator/
│   │   └── family/
│   ├── search/               # Recherche d'éducateurs
│   ├── messages/             # Messagerie
│   ├── bookings/             # Réservations
│   ├── reviews/              # Évaluations
│   ├── layout.tsx
│   └── page.tsx
├── components/               # Composants réutilisables
├── lib/
│   ├── supabase.ts          # Configuration Supabase
│   └── auth.ts              # Fonctions d'authentification
├── types/
│   └── index.ts             # Types TypeScript
├── supabase-schema.sql      # Schéma de base de données
└── README.md
```

## 🗄️ Schéma de Base de Données

Le schéma complet est dans `supabase-schema.sql` et inclut :

- **educator_profiles** : Profils des éducateurs
- **certifications** : Certifications des éducateurs
- **family_profiles** : Profils des familles
- **availability_slots** : Disponibilités des éducateurs
- **bookings** : Réservations
- **conversations** : Conversations entre utilisateurs
- **messages** : Messages individuels
- **reviews** : Évaluations et avis

Toutes les tables incluent :
- Row Level Security (RLS) activé
- Politiques de sécurité appropriées
- Triggers pour les mises à jour automatiques
- Index pour les performances

## 🌐 Déploiement

### Option 1: Vercel (Recommandé)

1. Créez un compte sur [Vercel](https://vercel.com)

2. Installez la CLI Vercel :
```bash
npm i -g vercel
```

3. Déployez :
```bash
vercel
```

4. Configurez les variables d'environnement dans le dashboard Vercel :
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Option 2: Netlify

1. Créez un compte sur [Netlify](https://netlify.com)

2. Installez la CLI Netlify :
```bash
npm install -g netlify-cli
```

3. Build le projet :
```bash
npm run build
```

4. Déployez :
```bash
netlify deploy --prod
```

### Option 3: Docker

```bash
# Build l'image
docker build -t neuro-care .

# Lancer le conteneur
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=votre_url \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle \
  neuro-care
```

## 👥 Utilisation

### Pour les Familles

1. **S'inscrire** en tant que famille
2. **Créer son profil** avec les besoins spécifiques
3. **Rechercher des éducateurs** selon les critères
4. **Contacter** via la messagerie
5. **Réserver** des séances
6. **Évaluer** après les séances

### Pour les Éducateurs

1. **S'inscrire** en tant qu'éducateur
2. **Créer son profil** avec certifications et expérience
3. **Gérer les disponibilités**
4. **Recevoir et confirmer** les réservations
5. **Communiquer** avec les familles
6. **Accumuler des avis** positifs

## 🔒 Sécurité

- Authentification sécurisée via Supabase Auth
- Row Level Security (RLS) sur toutes les tables
- Validation des données côté serveur
- Protection CSRF
- Variables d'environnement pour les secrets
- HTTPS obligatoire en production

## 📈 Améliorations Futures

- [ ] Système de paiement intégré (Stripe)
- [ ] Visioconférence intégrée
- [ ] Application mobile (React Native)
- [ ] Tableau de bord analytics pour les éducateurs
- [ ] Système de recommandations IA
- [ ] Export de rapports PDF
- [ ] Multi-langue (i18n)
- [ ] Notifications push
- [ ] Calendrier synchronisé (Google Calendar, etc.)

## 🐛 Résolution de Problèmes

### Erreur: "Unsupported engine"
Votre version de Node.js est trop ancienne. Mettez à jour vers Node.js 20+.

### Erreur de connexion à Supabase
Vérifiez que vos variables d'environnement sont correctement configurées dans `.env.local`.

### Les styles ne s'affichent pas
Assurez-vous que Tailwind CSS est correctement configuré. Relancez `npm run dev`.

### Erreur lors de la création de profil
Vérifiez que le schéma SQL a été exécuté dans Supabase.

## 📝 Licence

Ce projet est sous licence MIT.

## 👨‍💻 Auteur

Créé avec ❤️ pour faciliter l'accès aux services d'éducation spécialisée pour les personnes avec TSA.

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :
1. Fork le projet
2. Créer une branche pour votre fonctionnalité
3. Commit vos changements
4. Push vers la branche
5. Ouvrir une Pull Request

## 📞 Support

Pour toute question ou problème :
- Ouvrez une issue sur GitHub
- Email: support@neuro-care.fr

---

**Note importante** : Ce projet est un MVP (Minimum Viable Product). Il est conçu pour être fonctionnel et évolutif, mais peut nécessiter des ajustements selon vos besoins spécifiques.
