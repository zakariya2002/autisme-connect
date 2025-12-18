# 📋 Guide Complet : Système de Vérification des Diplômes
## NeuroCare - Documentation Technique et Fonctionnelle

**Date** : 22 Novembre 2025
**Version** : 1.0
**Projet** : NeuroCare
**Auteur** : Claude Code pour Zakariya Nebbache

---

## 📑 Table des Matières

1. [Vue d'ensemble du système](#1-vue-densemble-du-système)
2. [Architecture technique](#2-architecture-technique)
3. [Processus de vérification](#3-processus-de-vérification)
4. [OCR Automatique](#4-ocr-automatique)
5. [Système DREETS](#5-système-dreets)
6. [Dashboard Administrateur](#6-dashboard-administrateur)
7. [Configuration et Installation](#7-configuration-et-installation)
8. [Guide d'utilisation](#8-guide-dutilisation)
9. [Dépannage](#9-dépannage)
10. [Évolutions futures](#10-évolutions-futures)

---

## 1. Vue d'ensemble du système

### 1.1 Objectif

Le système de vérification des diplômes d'NeuroCare garantit que seuls les éducateurs qualifiés et certifiés peuvent apparaître dans les résultats de recherche de la plateforme. Cela protège les familles et assure la qualité des services proposés.

### 1.2 Principes de fonctionnement

```
┌─────────────────┐
│   Éducateur     │
│  Upload diplôme │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  OCR Automatique│ ◄── Tesseract.js (reconnaissance de texte)
│   + Validation  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Email DREETS  │ ◄── Resend API
│  (vérification  │
│   officielle)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Dashboard Admin │ ◄── Validation manuelle
│  Approuve/Refuse│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Éducateur     │
│    visible      │ ◄── Apparaît dans les recherches
│  sur plateforme │
└─────────────────┘
```

### 1.3 États du diplôme

| État      | Description                                      | Visible dans recherche |
|-----------|--------------------------------------------------|------------------------|
| `pending` | En attente de vérification par l'admin          | ❌ Non                 |
| `verified`| Diplôme vérifié et approuvé                     | ✅ Oui                 |
| `rejected`| Diplôme refusé (document invalide, illisible...) | ❌ Non                 |
| `null`    | Aucun diplôme uploadé                           | ❌ Non                 |

---

## 2. Architecture technique

### 2.1 Stack technologique

| Composant            | Technologie                | Rôle                                    |
|----------------------|----------------------------|-----------------------------------------|
| **Frontend**         | Next.js 14.2.33            | Interface utilisateur (App Router)      |
| **Backend**          | Next.js API Routes         | Logique serveur                         |
| **Base de données**  | Supabase (PostgreSQL)      | Stockage des données                    |
| **Authentification** | Supabase Auth              | Gestion des utilisateurs                |
| **Stockage fichiers**| Supabase Storage           | Upload et stockage des diplômes         |
| **OCR**              | Tesseract.js               | Reconnaissance optique de caractères    |
| **Emails**           | Resend API                 | Envoi d'emails automatiques             |
| **Langage**          | TypeScript                 | Type safety                             |

### 2.2 Structure de la base de données

#### Table `educator_profiles`

```sql
CREATE TABLE educator_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  specialization TEXT,

  -- Diplôme
  diploma_url TEXT,
  diploma_submitted_at TIMESTAMP WITH TIME ZONE,
  diploma_verification_status TEXT DEFAULT 'pending',
  diploma_verified_at TIMESTAMP WITH TIME ZONE,
  diploma_rejected_reason TEXT,

  -- OCR
  diploma_number TEXT,
  diploma_delivery_date TEXT,
  diploma_ocr_text TEXT,
  diploma_ocr_confidence FLOAT,
  diploma_ocr_analysis TEXT,

  -- DREETS
  dreets_verification_sent_at TIMESTAMP WITH TIME ZONE,
  dreets_verification_response TEXT,
  dreets_verified BOOLEAN DEFAULT FALSE,
  dreets_response_date TIMESTAMP WITH TIME ZONE,
  region TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Table `diploma_verification_history`

Enregistre toutes les actions effectuées sur les diplômes (audit trail).

```sql
CREATE TABLE diploma_verification_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  educator_id UUID REFERENCES educator_profiles(id),
  action TEXT, -- 'submitted', 'verified', 'rejected'
  performed_by UUID REFERENCES auth.users(id),
  reason TEXT,
  ocr_confidence FLOAT,
  dreets_verification_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2.3 Fichiers clés du projet

```
neuro-care/
├── app/
│   ├── dashboard/educator/diploma/
│   │   └── page.tsx                    # Upload et gestion du diplôme (éducateur)
│   ├── admin/verify-diplomas/
│   │   └── page.tsx                    # Dashboard de vérification (admin)
│   ├── search/
│   │   └── page.tsx                    # Recherche (filtre diplômes vérifiés)
│   └── api/
│       └── test-resend/
│           └── route.ts                # Test de l'envoi d'emails
├── lib/
│   ├── ocr-service.ts                  # Service OCR Tesseract.js
│   └── dreets-verification.ts          # Service envoi emails DREETS
├── components/
│   ├── EducatorMobileMenu.tsx          # Menu mobile éducateur
│   └── FamilyMobileMenu.tsx            # Menu mobile famille
├── supabase-diploma-verification.sql   # Migration base diplômes
├── supabase-diploma-ocr-dreets.sql     # Migration OCR et DREETS
├── reset-admin-role.sql                # Configuration compte admin
├── DREETS_CONTACTS.md                  # Contacts officiels DREETS
├── RESEND_SETUP.md                     # Guide configuration Resend
└── .env.local                          # Variables d'environnement
```

---

## 3. Processus de vérification

### 3.1 Étape 1 : Upload du diplôme par l'éducateur

**Page** : `/dashboard/educator/diploma`

**Processus :**

1. L'éducateur upload son diplôme (PDF, JPG, PNG)
2. Le fichier est envoyé vers Supabase Storage
3. Le statut passe à `pending`
4. L'OCR se lance automatiquement

**Champs obligatoires :**
- Fichier diplôme (max 5 MB)
- Région de délivrance du diplôme (18 régions françaises)

**Champs optionnels (pré-remplis par OCR) :**
- Numéro de diplôme
- Date de délivrance

### 3.2 Étape 2 : Analyse OCR automatique

**Service** : `lib/ocr-service.ts`

**Technologies :**
- Tesseract.js (reconnaissance optique de caractères)
- Langage : Français (`fra`)
- Confiance : Score de 0 à 100%

**Validation automatique :**

```typescript
const DIPLOMA_TYPES = [
  'Moniteur Éducateur', 'ME',
  'Éducateur Spécialisé', 'ES',
  'DEME', 'DEES'
];

const AUTHORITIES = [
  'DREETS', 'DRIEETS', 'DIRECCTE',
  'Ministère', 'République Française',
  'Préfet'
];
```

**Extraction automatique :**
- Numéro de diplôme (format : lettres + chiffres)
- Date de délivrance (formats DD/MM/YYYY, DD.MM.YYYY, etc.)

**Résultat de l'analyse :**

```json
{
  "success": true,
  "text": "RÉPUBLIQUE FRANÇAISE MINISTÈRE...",
  "confidence": 87.5,
  "validation": {
    "hasDiplomaType": true,
    "hasAuthority": true,
    "hasDiplomaKeyword": true,
    "isValid": true,
    "matchedKeywords": ["DEME", "DREETS", "diplôme"],
    "warnings": []
  },
  "extractedNumber": "ME2024-001234",
  "extractedDate": "15/06/2024"
}
```

### 3.3 Étape 3 : Envoi automatique à la DREETS

**Service** : `lib/dreets-verification.ts`

**Processus :**

1. Après l'upload, un email est automatiquement envoyé à la DREETS régionale
2. L'email contient :
   - Informations de l'éducateur
   - Lien de téléchargement du diplôme
   - Analyse OCR
   - Numéro et date du diplôme

**Template d'email :**

```html
Madame, Monsieur,

Dans le cadre de notre plateforme de mise en relation familles-éducateurs
spécialisés en autisme, nous effectuons une vérification systématique des
diplômes des professionnels inscrits.

📋 INFORMATIONS ÉDUCATEUR
━━━━━━━━━━━━━━━━━━━━━━━━
Nom : [Nom] [Prénom]
Email : [email]
Téléphone : [téléphone]
Région : [région]

📄 DIPLÔME À VÉRIFIER
━━━━━━━━━━━━━━━━━━━━━━━━
Numéro : [numéro diplôme]
Date de délivrance : [date]
Télécharger : [lien vers le diplôme]

🤖 ANALYSE OCR AUTOMATIQUE
━━━━━━━━━━━━━━━━━━━━━━━━
[Rapport d'analyse]

Pourriez-vous nous confirmer l'authenticité de ce diplôme ?

Cordialement,
L'équipe NeuroCare
```

**Routage régional :**

| Région                    | Email DREETS                           |
|---------------------------|----------------------------------------|
| Île-de-France             | drieets-idf@drieets.gouv.fr           |
| Auvergne-Rhône-Alpes      | dreets-ara@dreets.gouv.fr             |
| Provence-Alpes-Côte d'Azur| dreets-paca@dreets.gouv.fr            |
| Nouvelle-Aquitaine        | dreets-nouvelle-aquitaine@dreets.gouv.fr |
| Occitanie                 | dreets-occitanie@dreets.gouv.fr       |
| Hauts-de-France           | dreets-hdf@dreets.gouv.fr             |
| Grand Est                 | dreets-grand-est@dreets.gouv.fr       |
| Bretagne                  | dreets-bretagne@dreets.gouv.fr        |
| Normandie                 | dreets-normandie@dreets.gouv.fr       |
| Pays de la Loire          | dreets-pdl@dreets.gouv.fr             |
| Centre-Val de Loire       | dreets-cvl@dreets.gouv.fr             |
| Bourgogne-Franche-Comté   | dreets-bfc@dreets.gouv.fr             |
| Corse                     | dreets-corse@dreets.gouv.fr           |

**Note importante :** L'email est envoyé en copie à `zakariyanebbache@gmail.com` pour suivi.

### 3.4 Étape 4 : Validation manuelle par l'administrateur

**Page** : `/admin/verify-diplomas`

**Accès** : Uniquement les comptes avec `role = 'admin'`

**Fonctionnalités :**

✅ **Tableau de bord avec statistiques**
- En attente
- Vérifiés
- Refusés
- Sans diplôme

✅ **Filtres**
- Afficher seulement les diplômes en attente
- Afficher seulement les diplômes vérifiés
- Afficher seulement les diplômes refusés
- Afficher tous

✅ **Actions sur chaque diplôme**
- Voir le diplôme (dans un modal)
- Accepter
- Refuser (avec raison obligatoire)

**Workflow de validation :**

```
1. Admin clique sur "Voir le diplôme"
   ↓
2. Modal s'ouvre avec aperçu du diplôme
   ↓
3. Admin examine le document
   ↓
4a. Si valide : Clic "✓ Accepter le diplôme"
    → Statut = 'verified'
    → Éducateur visible dans recherche

4b. Si invalide :
    → Saisie raison du refus (obligatoire)
    → Clic "✗ Refuser le diplôme"
    → Statut = 'rejected'
    → Éducateur non visible
```

### 3.5 Étape 5 : Visibilité dans la recherche

**Page** : `/search`

**Filtre appliqué automatiquement :**

```typescript
let query = supabase
  .from('educator_profiles')
  .select('*')
  .eq('diploma_verification_status', 'verified')  // ⚠️ IMPORTANT
  .order('rating', { ascending: false });
```

**Résultat :** Seuls les éducateurs avec diplôme vérifié apparaissent dans les résultats de recherche.

---

## 4. OCR Automatique

### 4.1 Fonctionnement de Tesseract.js

**Tesseract.js** est une bibliothèque JavaScript de reconnaissance optique de caractères (OCR) basée sur Tesseract Engine de Google.

**Installation :**
```bash
npm install tesseract.js
```

**Configuration :**
```typescript
import Tesseract from 'tesseract.js';

const { data } = await Tesseract.recognize(
  imageUrl,
  'fra',  // Langue française
  {
    logger: (m) => console.log(m.progress)
  }
);
```

### 4.2 Service OCR (`lib/ocr-service.ts`)

**Fonctions principales :**

#### `analyzeDiploma(file: File)`

Analyse complète d'un fichier diplôme.

**Paramètres :**
- `file` : Fichier image (JPG, PNG) ou PDF

**Retour :**
```typescript
interface OCRResult {
  success: boolean;
  text: string;              // Texte extrait
  confidence: number;        // 0-100
  validation: {
    hasDiplomaType: boolean; // Contient ME ou ES
    hasAuthority: boolean;   // Contient DREETS, Ministère...
    hasDiplomaKeyword: boolean;
    isValid: boolean;
    matchedKeywords: string[];
    warnings: string[];
  };
  extractedNumber?: string;
  extractedDate?: string;
}
```

#### `extractDiplomaNumber(text: string)`

Extrait le numéro de diplôme du texte OCR.

**Formats reconnus :**
- ME2024-001234
- DEME/2024/001234
- ES-2024-001234
- 2024-ME-001234

**Regex :**
```typescript
/[A-Z]{2,4}[-\/]?\d{4}[-\/]?\d{4,6}/gi
```

#### `extractDeliveryDate(text: string)`

Extrait la date de délivrance.

**Formats reconnus :**
- 15/06/2024
- 15.06.2024
- 15-06-2024
- 2024-06-15

**Regex :**
```typescript
/\d{1,2}[\/\.\-]\d{1,2}[\/\.\-]\d{4}|\d{4}[\/\.\-]\d{1,2}[\/\.\-]\d{1,2}/g
```

#### `validateDiplomaText(text: string)`

Valide que le texte contient les éléments d'un diplôme valide.

**Critères de validation :**

1. ✅ **Type de diplôme** : Contient "ME", "ES", "DEME" ou "DEES"
2. ✅ **Autorité** : Contient "DREETS", "Ministère" ou "République Française"
3. ✅ **Mot-clé diplôme** : Contient "diplôme", "certificat" ou "attestation"

**Score de confiance :**

```typescript
let confidence = 0;
if (hasDiplomaType) confidence += 40;
if (hasAuthority) confidence += 30;
if (hasDiplomaKeyword) confidence += 30;
```

### 4.3 Limitations et améliorations possibles

**Limitations actuelles :**

❌ PDF de mauvaise qualité (scan flou)
❌ Diplômes manuscrits
❌ Images très basse résolution (< 300 DPI)
❌ Diplômes avec beaucoup de logo/filigranes

**Améliorations futures :**

✅ Prétraitement d'image (contraste, rotation)
✅ Support multi-langues (diplômes étrangers)
✅ Machine Learning pour améliorer la précision
✅ OCR cloud (Google Cloud Vision, AWS Textract)

---

## 5. Système DREETS

### 5.1 Qu'est-ce que la DREETS ?

**DREETS** = Direction Régionale de l'Économie, de l'Emploi, du Travail et des Solidarités

**Rôle :**
- Délivre et certifie les diplômes d'État (DEME, DEES)
- Vérifie l'authenticité des diplômes
- Gère le répertoire national des certifications professionnelles (RNCP)

**18 DREETS en France :**
- 13 en métropole
- 5 en outre-mer

### 5.2 Contacts DREETS (fichier `DREETS_CONTACTS.md`)

Chaque région a une DREETS avec :
- Email officiel
- Téléphone
- Adresse postale
- Site web

**Exemple :**

```markdown
## Île-de-France (DRIEETS)

📧 **Email** : drieets-idf@drieets.gouv.fr
📞 **Téléphone** : 01 70 96 50 00
🌐 **Site web** : https://idf.dreets.gouv.fr
📍 **Adresse** : 19 rue Madeleine Vionnet, 93300 Aubervilliers

**Service concerné** : Certification professionnelle
**Contact diplômes** : certification@drieets-idf.gouv.fr
```

### 5.3 Service d'envoi (`lib/dreets-verification.ts`)

**Interface de requête :**

```typescript
interface DREETSVerificationRequest {
  educatorId: string;
  educatorFirstName: string;
  educatorLastName: string;
  educatorEmail: string;
  educatorPhone: string;
  diplomaUrl: string;
  diplomaNumber?: string;
  deliveryDate?: string;
  region: string;
  ocrAnalysis?: string;
}
```

**Fonction principale :**

```typescript
export async function sendDREETSVerificationRequest(
  request: DREETSVerificationRequest
): Promise<{ success: boolean; message: string }>
```

**Processus :**

1. Vérification que la région existe
2. Récupération de l'email DREETS correspondant
3. Génération du template HTML
4. Envoi via Resend API
5. Enregistrement dans l'historique (Supabase)
6. Retour de confirmation

**Gestion des erreurs :**

```typescript
try {
  await resend.emails.send({ ... });
  return { success: true, message: 'Email envoyé' };
} catch (error) {
  console.error('Erreur envoi DREETS:', error);
  return { success: false, message: error.message };
}
```

### 5.4 Template d'email professionnel

**Structure :**

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    /* Styles professionnels */
    body { font-family: Arial, sans-serif; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
    .info-box { background: #f3f4f6; padding: 15px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Demande de Vérification de Diplôme</h1>
    </div>

    <div class="content">
      <!-- Informations éducateur -->
      <!-- Diplôme à vérifier -->
      <!-- Analyse OCR -->
      <!-- Lien de téléchargement -->
    </div>

    <div class="footer">
      <p>NeuroCare<br>
      www.neuro-care.fr</p>
    </div>
  </div>
</body>
</html>
```

**Personnalisation :**
- Logo NeuroCare
- Couleurs de la marque
- Informations complètes
- Lien de téléchargement sécurisé

---

## 6. Dashboard Administrateur

### 6.1 Accès et sécurité

**Page** : `/admin/verify-diplomas`

**Contrôle d'accès :**

```typescript
const checkAdminAuth = async () => {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.user) {
    router.push('/auth/login');
    return;
  }

  const isAdmin = userData?.user?.user_metadata?.role === 'admin';

  if (!isAdmin) {
    alert('Accès non autorisé');
    router.push('/');
    return;
  }
};
```

**Compte admin :**
- Email : `admin@neuro-care.fr`
- Rôle : `admin` (dans `user_metadata`)

### 6.2 Interface utilisateur

#### Statistiques en temps réel

```
┌──────────────┬──────────────┬──────────────┬──────────────┐
│  En attente  │   Vérifiés   │   Refusés    │ Sans diplôme │
│      5       │      42      │      3       │      8       │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

#### Filtres

```
[ En attente (5) ] [ Vérifiés (42) ] [ Refusés (3) ] [ Tous ]
```

#### Liste des éducateurs

```
╔══════════════════════════════════════════════════════════╗
║ Jean Dupont                          [En attente]        ║
║ ─────────────────────────────────────────────────────── ║
║ Email: jean.dupont@email.com                            ║
║ Téléphone: 06 12 34 56 78                               ║
║ Spécialisation: Autisme infantile                        ║
║ Soumis le: 20/11/2025                                   ║
║                                                          ║
║ [📄 Voir le diplôme] [✓ Accepter] [✗ Refuser]          ║
╚══════════════════════════════════════════════════════════╝
```

### 6.3 Modal de visualisation

**Fonctionnalités :**

✅ Affichage du diplôme (image ou PDF intégré)
✅ Lien pour ouvrir dans un nouvel onglet
✅ Zone de texte pour raison du refus
✅ Boutons d'action (Accepter/Refuser)
✅ Désactivation pendant le traitement

**Code :**

```typescript
<div className="fixed inset-0 bg-black/50 z-50">
  <div className="bg-white rounded-lg max-w-4xl">
    {/* En-tête */}
    <h2>Diplôme de {educator.first_name} {educator.last_name}</h2>

    {/* Aperçu */}
    {diploma_url.endsWith('.pdf') ? (
      <iframe src={diploma_url} className="w-full h-96" />
    ) : (
      <img src={diploma_url} alt="Diplôme" />
    )}

    {/* Actions */}
    <textarea
      placeholder="Raison du refus..."
      value={rejectReason}
      onChange={e => setRejectReason(e.target.value)}
    />

    <button onClick={() => handleVerify(id, 'verified')}>
      ✓ Accepter
    </button>
    <button onClick={() => handleVerify(id, 'rejected')}>
      ✗ Refuser
    </button>
  </div>
</div>
```

### 6.4 Gestion des actions

**Fonction de validation :**

```typescript
const handleVerify = async (
  educatorId: string,
  status: 'verified' | 'rejected'
) => {
  // Vérifier raison si refus
  if (status === 'rejected' && !rejectReason.trim()) {
    alert('Veuillez indiquer une raison');
    return;
  }

  setProcessing(true);

  try {
    // Mise à jour Supabase
    await supabase
      .from('educator_profiles')
      .update({
        diploma_verification_status: status,
        diploma_verified_at: status === 'verified' ? new Date() : null,
        diploma_rejected_reason: status === 'rejected' ? rejectReason : null
      })
      .eq('id', educatorId);

    // Rafraîchir la liste
    await fetchEducators();
    await fetchStats();

    // Fermer le modal
    setSelectedEducator(null);
    setRejectReason('');

    alert(`Diplôme ${status === 'verified' ? 'accepté' : 'refusé'} !`);
  } catch (error) {
    alert('Erreur: ' + error.message);
  } finally {
    setProcessing(false);
  }
};
```

**Historique automatique :**

Chaque action est enregistrée dans `diploma_verification_history` via un trigger PostgreSQL.

---

## 7. Configuration et Installation

### 7.1 Prérequis

**Logiciels :**
- Node.js 18+
- npm ou yarn
- Git
- Compte Supabase
- Compte Resend

**Compétences :**
- Bases de React/Next.js
- SQL (PostgreSQL)
- Ligne de commande

### 7.2 Installation du projet

```bash
# Cloner le projet
git clone https://github.com/zakariya2002/neuro-care.git
cd neuro-care

# Installer les dépendances
npm install

# Installer les dépendances spécifiques à la vérification
npm install tesseract.js
npm install resend
npm install @react-email/render

# Copier le fichier d'environnement
cp .env.local.example .env.local

# Éditer les variables d'environnement
nano .env.local
```

### 7.3 Configuration Supabase

#### Étape 1 : Créer un projet Supabase

1. Allez sur https://supabase.com
2. Créez un compte (gratuit)
3. Créez un nouveau projet
4. Notez l'URL et les clés API

#### Étape 2 : Configuration des variables

Dans `.env.local` :

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SECRET_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Étape 3 : Exécuter les migrations SQL

Dans Supabase Dashboard → SQL Editor :

1. **Exécuter** `supabase-diploma-verification.sql`
   - Crée les colonnes de base pour les diplômes
   - Crée la table d'historique
   - Configure les RLS policies

2. **Exécuter** `supabase-diploma-ocr-dreets.sql`
   - Ajoute les colonnes OCR
   - Ajoute les colonnes DREETS
   - Crée les fonctions de logging
   - Crée les vues statistiques

3. **Exécuter** `reset-admin-role.sql`
   - Configure le compte admin

#### Étape 4 : Configurer le Storage

1. Dans Supabase Dashboard → Storage
2. Créer un bucket `diplomas`
3. Configurer les RLS policies :

```sql
-- Permettre aux utilisateurs de upload leurs diplômes
CREATE POLICY "Users can upload their own diplomas"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'diplomas' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Permettre aux admins de lire tous les diplômes
CREATE POLICY "Admins can read all diplomas"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'diplomas' AND (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'admin');

-- Permettre aux utilisateurs de lire leurs propres diplômes
CREATE POLICY "Users can read their own diplomas"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'diplomas' AND auth.uid()::text = (storage.foldername(name))[1]);
```

### 7.4 Configuration Resend

#### Étape 1 : Créer un compte Resend

1. Allez sur https://resend.com
2. Créez un compte (gratuit : 3000 emails/mois)
3. Vérifiez votre email

#### Étape 2 : Obtenir une clé API

1. Dashboard Resend → API Keys
2. Créez une nouvelle clé
3. Copiez la clé (elle ne s'affichera qu'une fois)

#### Étape 3 : Configurer les variables

Dans `.env.local` :

```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=NeuroCare <verification@neuro-care.fr>
ADMIN_EMAIL=zakariyanebbache@gmail.com
```

#### Étape 4 : Vérifier votre domaine (optionnel mais recommandé)

1. Dashboard Resend → Domains
2. Ajoutez votre domaine `neuro-care.fr`
3. Configurez les DNS (SPF, DKIM, DMARC)
4. Vérifiez le domaine

**Avantages de la vérification :**
✅ Meilleure délivrabilité
✅ Pas de mention "via resend.dev"
✅ Emails moins susceptibles d'être en spam

#### Étape 5 : Tester l'envoi

```bash
# Lancer le serveur de développement
npm run dev

# Ouvrir dans le navigateur
http://localhost:3000/api/test-resend
```

Vous devriez recevoir un email de test à `ADMIN_EMAIL`.

### 7.5 Configuration du compte admin

#### Méthode 1 : Via SQL (recommandée)

1. Créez d'abord le compte sur `/auth/signup` :
   - Email : `admin@neuro-care.fr`
   - Mot de passe : (choisissez un mot de passe fort)

2. Exécutez ce SQL dans Supabase :

```sql
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE email = 'admin@neuro-care.fr';

-- Vérifier
SELECT email, raw_user_meta_data->>'role' as role
FROM auth.users
WHERE email = 'admin@neuro-care.fr';
```

#### Méthode 2 : Via script automatique

```bash
# Exécuter le script de configuration
npm run setup:admin
```

(Ce script n'existe pas encore mais pourrait être créé)

### 7.6 Démarrage du projet

```bash
# Développement
npm run dev

# Production
npm run build
npm start

# Linting
npm run lint
```

**URLs importantes :**
- 🏠 Accueil : http://localhost:3000
- 🔐 Connexion : http://localhost:3000/auth/login
- 👤 Inscription : http://localhost:3000/auth/signup
- 📄 Upload diplôme : http://localhost:3000/dashboard/educator/diploma
- 👨‍💼 Admin dashboard : http://localhost:3000/admin/verify-diplomas
- 🔍 Recherche : http://localhost:3000/search

---

## 8. Guide d'utilisation

### 8.1 Pour les éducateurs

#### Créer un compte

1. Allez sur https://www.neuro-care.fr/auth/signup
2. Choisissez "Je suis un éducateur"
3. Remplissez le formulaire :
   - Prénom, Nom
   - Email, Mot de passe
   - Téléphone
4. Vérifiez votre email
5. Connectez-vous

#### Compléter son profil

1. Dashboard → Compléter mon profil
2. Remplissez :
   - Spécialisation
   - Description
   - Tarifs
   - Localisation
   - Disponibilités

#### Uploader son diplôme

1. Dashboard → Mon diplôme
2. Sélectionnez votre fichier (PDF, JPG, PNG - max 5 MB)
3. Choisissez la région de délivrance
4. (Optionnel) Remplissez le numéro et la date
5. Cliquez sur "Télécharger mon diplôme"

**Ce qui se passe ensuite :**
- ✅ Analyse OCR automatique (30-60 secondes)
- ✅ Email envoyé à la DREETS
- ⏳ Attente de validation admin

#### Suivre l'état de son diplôme

**Statuts possibles :**

🟡 **En attente** : Votre diplôme est en cours de vérification

```
Votre diplôme a été soumis le 20/11/2025.
Il est actuellement en cours de vérification par notre équipe.
Vous recevrez une notification par email une fois vérifié.
```

✅ **Vérifié** : Diplôme approuvé, vous êtes visible

```
Félicitations ! Votre diplôme a été vérifié.
Vous apparaissez maintenant dans les résultats de recherche.
```

❌ **Refusé** : Diplôme rejeté

```
Votre diplôme a été refusé.
Raison : Document illisible

Veuillez uploader un nouveau document de meilleure qualité.
```

### 8.2 Pour les administrateurs

#### Se connecter

1. Allez sur https://www.neuro-care.fr/auth/login
2. Connectez-vous avec `admin@neuro-care.fr`
3. Vous êtes redirigé vers `/admin/verify-diplomas`

#### Consulter les statistiques

Le dashboard affiche en temps réel :
- 📊 Nombre de diplômes en attente
- ✅ Nombre de diplômes vérifiés
- ❌ Nombre de diplômes refusés
- 🚫 Nombre d'éducateurs sans diplôme

#### Filtrer les diplômes

Cliquez sur les boutons de filtre :
- **En attente** : Affiche uniquement les diplômes à vérifier
- **Vérifiés** : Historique des diplômes approuvés
- **Refusés** : Historique des diplômes rejetés
- **Tous** : Tous les éducateurs

#### Vérifier un diplôme

1. Cliquez sur "📄 Voir le diplôme"
2. Le modal s'ouvre avec l'aperçu
3. Examinez le document :
   - Est-il lisible ?
   - Est-ce un vrai diplôme DEME/DEES ?
   - L'autorité est-elle officielle (DREETS) ?
   - Les informations correspondent-elles à l'éducateur ?

4a. **Si valide** :
   - Cliquez sur "✓ Accepter le diplôme"
   - Confirmation

4b. **Si invalide** :
   - Remplissez la raison du refus
   - Cliquez sur "✗ Refuser le diplôme"
   - Confirmation

**Exemples de raisons de refus :**

❌ Document illisible ou de mauvaise qualité
❌ Diplôme non reconnu par l'État
❌ Informations ne correspondent pas à l'éducateur
❌ Document suspect ou falsifié
❌ Diplôme étranger non équivalent
❌ Scan incomplet

#### Bonnes pratiques

✅ Vérifier régulièrement (au moins 1x/semaine)
✅ Traiter les diplômes en attente rapidement
✅ Être précis dans les raisons de refus
✅ En cas de doute, attendre la réponse DREETS
✅ Conserver les preuves (captures d'écran)

### 8.3 Pour les familles

Les familles ne voient **QUE** les éducateurs vérifiés.

#### Rechercher un éducateur

1. Allez sur https://www.neuro-care.fr/search
2. Filtrez par :
   - Localisation
   - Spécialisation
   - Tarif
   - Disponibilité

**Résultats affichés :**
- ✅ UNIQUEMENT les éducateurs avec diplôme vérifié
- Badge "Diplôme vérifié" visible
- Informations du profil

#### Contacter un éducateur

1. Cliquez sur le profil
2. Consultez les détails
3. Cliquez sur "Prendre rendez-vous"
4. Remplissez le formulaire de contact

#### Faire confiance aux éducateurs

🔒 **Garanties NeuroCare :**

✅ Tous les éducateurs visibles ont un diplôme vérifié
✅ Vérification manuelle par notre équipe
✅ Vérification DREETS (organisme officiel)
✅ Analyse OCR automatique
✅ Historique des vérifications conservé

---

## 9. Dépannage

### 9.1 Problèmes courants

#### Erreur : "RESEND_API_KEY non configurée"

**Solution :**

1. Vérifiez que `.env.local` contient :
```env
RESEND_API_KEY=re_xxxxx
```

2. Redémarrez le serveur :
```bash
# Arrêtez le serveur (Ctrl+C)
npm run dev
```

#### Erreur : "Module not found: Can't resolve '@react-email/render'"

**Solution :**

```bash
npm install @react-email/render
```

#### Erreur : "Accès non autorisé" sur /admin

**Cause :** Votre compte n'a pas le rôle `admin`.

**Solution :**

```sql
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE email = 'votre-email@example.com';
```

#### OCR ne fonctionne pas / Confiance à 0%

**Causes possibles :**
- Document de mauvaise qualité
- Format non supporté
- Image trop grande (> 10 MB)

**Solution :**

1. Vérifiez la qualité de l'image
2. Convertissez en JPG si PDF volumineux
3. Augmentez la résolution (min 300 DPI)
4. Assurez-vous que le texte est horizontal

#### Email DREETS non envoyé

**Causes possibles :**
- Clé API Resend invalide
- Email DREETS incorrect
- Limite d'envoi atteinte (3000/mois)

**Solution :**

1. Testez avec `/api/test-resend`
2. Vérifiez les logs serveur :
```bash
npm run dev
# Consultez la console
```

3. Vérifiez le compte Resend :
https://resend.com/dashboard

#### Upload de diplôme échoue

**Causes possibles :**
- Fichier trop volumineux (> 5 MB)
- Format non supporté
- Problème de connexion Supabase

**Solution :**

1. Compressez le fichier
2. Formats acceptés : PDF, JPG, PNG
3. Vérifiez la connexion Supabase

### 9.2 Logs et debugging

#### Activer les logs détaillés

Dans `.env.local` :

```env
NEXT_PUBLIC_DEBUG=true
NODE_ENV=development
```

#### Consulter les logs Supabase

1. Dashboard Supabase → Logs
2. Filtrez par type :
   - Auth
   - Database
   - Storage

#### Consulter les logs Resend

1. Dashboard Resend → Logs
2. Vérifiez les emails envoyés
3. Consultez les erreurs éventuelles

#### Debugging local

```bash
# Lancer en mode debug
npm run dev

# Ouvrir la console du navigateur (F12)
# Onglet "Console" pour les erreurs JavaScript
# Onglet "Network" pour les requêtes HTTP
```

### 9.3 Performances

#### OCR trop lent

**Optimisations :**

1. Réduire la taille de l'image avant OCR
2. Utiliser un worker dédié
3. Envisager une solution cloud (Google Cloud Vision)

```typescript
// Redimensionner l'image avant OCR
const resizeImage = (file: File, maxWidth: 1200) => {
  // ... code de redimensionnement
};
```

#### Dashboard admin lent

**Optimisations :**

1. Pagination des résultats
2. Lazy loading des images
3. Cache des requêtes

```typescript
// Exemple de pagination
const ITEMS_PER_PAGE = 20;
const [page, setPage] = useState(1);

let query = supabase
  .from('educator_profiles')
  .select('*')
  .range((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
```

---

## 10. Évolutions futures

### 10.1 Court terme (1-3 mois)

#### Notifications email automatiques

**Objectif :** Informer l'éducateur du statut de son diplôme

**Fonctionnalités :**
✅ Email quand diplôme vérifié
✅ Email quand diplôme refusé (avec raison)
✅ Rappel si diplôme non uploadé après 7 jours

**Template email (vérifié) :**

```html
Bonjour [Prénom],

Bonne nouvelle ! Votre diplôme a été vérifié et approuvé.

Vous êtes maintenant visible dans les résultats de recherche.
Les familles peuvent vous contacter et prendre rendez-vous.

Prochaines étapes :
1. Complétez votre profil (description, disponibilités)
2. Ajoutez vos tarifs
3. Consultez votre dashboard pour voir les demandes

À bientôt sur NeuroCare !
```

#### Tableau de bord éducateur amélioré

**Fonctionnalités :**
✅ Timeline du processus de vérification
✅ Notification en temps réel
✅ Possibilité de re-soumettre un diplôme refusé
✅ Historique des soumissions

#### API publique pour les DREETS

**Objectif :** Permettre aux DREETS de répondre directement via API

**Endpoint :**

```
POST /api/dreets/verify-diploma
Body: {
  "educatorId": "xxx",
  "verified": true,
  "response": "Diplôme authentique"
}
```

### 10.2 Moyen terme (3-6 mois)

#### OCR Cloud (Google Cloud Vision)

**Avantages :**
✅ Meilleure précision (99% vs 85%)
✅ Plus rapide
✅ Support multi-langues natif
✅ Détection de fraude intégrée

**Coûts :**
- Gratuit jusqu'à 1000 images/mois
- 1.50$ par 1000 images après

**Intégration :**

```typescript
import vision from '@google-cloud/vision';

const client = new vision.ImageAnnotatorClient();

const [result] = await client.textDetection(imageUrl);
const detections = result.textAnnotations;
```

#### Machine Learning anti-fraude

**Objectif :** Détecter automatiquement les diplômes suspects

**Critères :**
- Analyse des métadonnées du fichier
- Détection de copier-coller Photoshop
- Comparaison avec base de données de vrais diplômes
- Analyse des fonts (Arial vs fonts officielles)

**Outils :**
- TensorFlow.js
- Modèle pré-entraîné sur vrais/faux diplômes

#### Blockchain pour certificats

**Objectif :** Certificats de vérification infalsifiables

**Fonctionnement :**

1. Admin vérifie le diplôme
2. Hash du diplôme stocké sur blockchain
3. Certificat unique généré
4. Vérifiable par n'importe qui via QR code

**Avantages :**
✅ Infalsifiable
✅ Vérifiable instantanément
✅ Preuve horodatée
✅ Décentralisé

### 10.3 Long terme (6-12 mois)

#### Intégration avec RNCP

**RNCP** = Répertoire National des Certifications Professionnelles

**Objectif :** Vérification automatique via l'API officielle

**Fonctionnement :**

```typescript
const verifyWithRNCP = async (diplomaNumber: string) => {
  const response = await fetch(
    `https://api.francecompetences.fr/rncp/verify`,
    {
      method: 'POST',
      body: JSON.stringify({ diplomaNumber })
    }
  );

  return response.json(); // { valid: true, holder: "..." }
};
```

**Avantages :**
✅ Vérification instantanée
✅ 100% fiable (source officielle)
✅ Pas d'intervention humaine

#### IA pour validation automatique

**Objectif :** Réduire le travail manuel de l'admin

**Fonctionnement :**

1. OCR extrait les informations
2. IA compare avec base de données de vrais diplômes
3. Score de confiance calculé (0-100%)
4. Si > 95% : Auto-validation
5. Si 70-95% : Validation admin
6. Si < 70% : Refus automatique

**Modèle ML :**

```python
# Entraînement du modèle
from sklearn.ensemble import RandomForestClassifier

features = ['ocr_confidence', 'has_official_logo', 'has_signature', 'format_valid']
X_train = diploma_features[features]
y_train = diploma_features['is_valid']

model = RandomForestClassifier()
model.fit(X_train, y_train)

# Prédiction
prediction = model.predict(new_diploma_features)
confidence = model.predict_proba(new_diploma_features)
```

#### Application mobile

**Objectif :** App mobile pour admin (validation en déplacement)

**Fonctionnalités :**
✅ Notifications push pour nouveaux diplômes
✅ Validation rapide (swipe gauche/droite)
✅ Scan OCR natif (caméra du téléphone)
✅ Géolocalisation (vérifier région diplôme)

**Technologies :**
- React Native / Flutter
- Firebase Cloud Messaging (notifications)
- TensorFlow Lite (OCR mobile)

---

## 📊 Annexes

### A. Statistiques du système

**Métriques à suivre :**

| Métrique                          | Objectif   | Suivi     |
|-----------------------------------|------------|-----------|
| Temps moyen de vérification       | < 48h      | Dashboard |
| Taux d'acceptation                | > 90%      | SQL       |
| Confiance OCR moyenne             | > 85%      | SQL       |
| Taux de réponse DREETS            | > 50%      | Manuel    |
| Délai de réponse DREETS           | < 15 jours | SQL       |

**Requête SQL pour statistiques :**

```sql
SELECT
  COUNT(*) FILTER (WHERE diploma_verification_status = 'verified') as verified,
  COUNT(*) FILTER (WHERE diploma_verification_status = 'rejected') as rejected,
  COUNT(*) FILTER (WHERE diploma_verification_status = 'pending') as pending,
  AVG(diploma_ocr_confidence) as avg_ocr_confidence,
  AVG(EXTRACT(EPOCH FROM (diploma_verified_at - diploma_submitted_at))/3600) as avg_hours_to_verify
FROM educator_profiles
WHERE diploma_submitted_at IS NOT NULL;
```

### B. Checklist de déploiement

**Avant la mise en production :**

- [ ] Variables d'environnement configurées
- [ ] Domaine Resend vérifié
- [ ] Migrations SQL exécutées
- [ ] Compte admin créé et testé
- [ ] Storage Supabase configuré avec RLS
- [ ] Tests OCR effectués (au moins 10 diplômes)
- [ ] Tests DREETS effectués (au moins 1 email)
- [ ] Dashboard admin testé (approve/reject)
- [ ] Page recherche teste (filtre verified)
- [ ] Logs d'erreur configurés (Sentry ou équivalent)
- [ ] Monitoring configuré (Vercel Analytics)
- [ ] Documentation à jour
- [ ] Formation admin effectuée

### C. Contacts utiles

**Support technique :**
- Email : zakariyanebbache@gmail.com
- GitHub : https://github.com/zakariya2002/neuro-care

**Services utilisés :**
- Supabase Support : https://supabase.com/support
- Resend Support : support@resend.com
- Vercel Support : https://vercel.com/support

**Ressources DREETS :**
- Portail national : https://dreets.gouv.fr
- RNCP : https://www.francecompetences.fr/recherche_certificationprofessionnelle/

### D. Glossaire

| Terme               | Définition                                                                 |
|---------------------|---------------------------------------------------------------------------|
| **OCR**             | Optical Character Recognition - Reconnaissance optique de caractères      |
| **DREETS**          | Direction Régionale de l'Économie, de l'Emploi, du Travail et des Solidarités |
| **DEME**            | Diplôme d'État de Moniteur Éducateur                                     |
| **DEES**            | Diplôme d'État d'Éducateur Spécialisé                                    |
| **RNCP**            | Répertoire National des Certifications Professionnelles                  |
| **RLS**             | Row Level Security - Sécurité au niveau des lignes (Supabase)           |
| **Tesseract**       | Moteur OCR open-source développé par Google                              |
| **Resend**          | Service d'envoi d'emails transactionnels                                  |
| **Supabase**        | Backend-as-a-Service (BaaS) basé sur PostgreSQL                         |
| **Next.js**         | Framework React pour applications web                                     |
| **Confidence**      | Score de confiance de l'OCR (0-100%)                                     |
| **Audit trail**     | Journal d'audit des actions effectuées                                    |

---

## 📝 Notes finales

### Auteur

Ce système a été conçu et développé par **Claude Code** (Anthropic) en collaboration avec **Zakariya Nebbache** pour la plateforme **NeuroCare**.

### Licence

Ce document et le code associé sont propriété d'NeuroCare.

### Mises à jour

**Version 1.0** - 22 Novembre 2025
- Création du document
- Documentation complète du système de vérification
- Guide d'installation et d'utilisation

### Remerciements

- **Tesseract.js** pour l'OCR gratuit et performant
- **Resend** pour le service d'emailing fiable
- **Supabase** pour le backend complet
- **Toutes les DREETS** pour leur travail de certification

---

**Pour toute question ou suggestion d'amélioration, contactez : zakariyanebbache@gmail.com**

---

*Document généré automatiquement par Claude Code*
*NeuroCare © 2025*
