# Système de Vérification Automatique des Diplômes
## OCR + Vérification DREETS

Ce système combine l'analyse automatique par OCR et la vérification officielle auprès de la DREETS pour garantir l'authenticité des diplômes ME et ES.

---

## 🎯 Vue d'ensemble

### Workflow complet

```
┌─────────────────────────────────────────────────────────────────┐
│  1. ÉDUCATEUR UPLOAD DIPLÔME                                     │
│     • Sélectionne le fichier (JPG, PNG ou PDF)                   │
│     • Remplit numéro, date, région                               │
└───────────────────┬─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────────────┐
│  2. ANALYSE OCR AUTOMATIQUE (Tesseract.js)                       │
│     • Extraction du texte                                         │
│     • Détection type de diplôme (ME/ES)                          │
│     • Vérification autorité (DREETS, Ministère)                 │
│     • Extraction automatique numéro + date                      │
│     • Score de confiance calculé                                │
└───────────────────┬─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────────────┐
│  3. ENVOI AUTOMATIQUE À LA DREETS                                │
│     • Email envoyé à la DREETS de la région                      │
│     • Pièce jointe: diplôme                                      │
│     • Contenu: infos éducateur + analyse OCR                    │
│     • CC à l'admin de la plateforme                             │
└───────────────────┬─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────────────┐
│  4. ATTENTE RÉPONSE DREETS (5-10 jours ouvrés)                   │
│     • Statut: "Vérification DREETS en cours"                     │
│     • Profil NON visible dans recherche                          │
│     • Notifications email à l'éducateur                          │
└───────────────────┬─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────────────┐
│  5. RÉPONSE DREETS                                                │
│     ├─ ✅ VÉRIFIÉ                                                 │
│     │    • Profil activé et visible                               │
│     │    • Email de confirmation éducateur                        │
│     │    • Badge "Diplôme vérifié DREETS"                         │
│     │                                                              │
│     └─ ❌ NON RECONNU                                             │
│          • Profil reste invisible                                 │
│          • Email avec raison du refus                             │
│          • Possibilité de re-soumettre                            │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📦 Installation

### 1. Installer les dépendances

```bash
npm install tesseract.js
```

### 2. Exécuter les migrations SQL

Dans le dashboard Supabase > SQL Editor :

**Étape 1** : Exécuter `supabase-diploma-verification.sql`
```bash
# Crée les colonnes de base, l'historique, les policies RLS
```

**Étape 2** : Exécuter `supabase-diploma-ocr-dreets.sql`
```bash
# Ajoute les colonnes OCR et DREETS
# Crée les fonctions et triggers
```

### 3. Configurer Supabase Storage

Voir `DIPLOMA_SETUP.md` pour créer le bucket `diplomas` et configurer les policies.

### 4. Configurer le service d'email

Choisir un service (Resend recommandé) :

```bash
npm install resend
```

Dans `.env.local` :
```env
RESEND_API_KEY=re_...
ADMIN_EMAIL=admin@neuro-care.fr
NEXT_PUBLIC_APP_URL=https://neuro-care.fr
```

Décommenter le code dans :
- `lib/email-notifications.ts`
- `lib/dreets-verification.ts`

---

## 🔍 Fonctionnalités OCR

### Analyse automatique

Le service OCR (`lib/ocr-service.ts`) analyse automatiquement :

✅ **Type de diplôme détecté** :
- Moniteur-Éducateur (ME / DEME)
- Éducateur Spécialisé (ES / DEES)

✅ **Autorité émettrice** :
- DREETS
- DRJSCS (ancien nom)
- Ministère
- République Française

✅ **Informations extraites** :
- Numéro de diplôme
- Date de délivrance
- Texte complet

✅ **Score de confiance** :
- 0-100% (basé sur la qualité OCR)
- Seuil recommandé : 80%

### Validation automatique

```typescript
{
  hasDiplomaType: boolean,     // ME ou ES détecté
  hasAuthority: boolean,        // DREETS/Ministère détecté
  hasDiplomaKeyword: boolean,   // "diplôme" trouvé
  isValid: boolean,             // Combinaison des 3
  matchedKeywords: string[],    // Mots-clés trouvés
  warnings: string[]            // Alertes éventuelles
}
```

---

## 📧 Système DREETS

### Emails DREETS par région

Définis dans `lib/dreets-verification.ts` :

```typescript
{
  'Île-de-France': 'dreets-idf-diplomes@travail.gouv.fr',
  'Auvergne-Rhône-Alpes': 'dreets-ara-diplomes@travail.gouv.fr',
  // ... autres régions
}
```

**⚠️ IMPORTANT** : Ces emails sont des exemples. Vous devez les remplacer par les vrais emails officiels des DREETS.

### Template d'email DREETS

L'email envoyé contient :

1. **Informations éducateur**
   - Nom, prénom
   - Email, téléphone
   - Numéro de diplôme
   - Date de délivrance
   - Région

2. **Analyse OCR**
   - Score de confiance
   - Éléments détectés
   - Warnings éventuels

3. **Pièce jointe**
   - Diplôme en PDF/Image

4. **Instructions réponse**
   - Format de réponse attendu
   - Contact de retour

---

## 💾 Schéma de Base de Données

### Table `educator_profiles` (colonnes ajoutées)

```sql
-- Diplôme de base
diploma_url                       TEXT
diploma_verification_status       TEXT (pending|verified|rejected)
diploma_verified_at               TIMESTAMP
diploma_rejected_reason           TEXT
diploma_submitted_at              TIMESTAMP

-- OCR
diploma_number                    TEXT
diploma_delivery_date             TEXT
diploma_ocr_text                  TEXT
diploma_ocr_confidence            FLOAT
diploma_ocr_analysis              TEXT

-- DREETS
dreets_verification_sent_at       TIMESTAMP
dreets_verification_response      TEXT
dreets_verified                   BOOLEAN
dreets_response_date              TIMESTAMP
region                            TEXT
```

### Table `diploma_verification_history`

Historique complet de toutes les actions :
- Soumission diplôme
- Analyse OCR
- Envoi DREETS
- Réponse DREETS
- Acceptation/refus

### Vues SQL

**diploma_ocr_stats** : Statistiques OCR
```sql
SELECT * FROM diploma_ocr_stats;
```

**diplomas_pending_dreets_response** : Diplômes en attente de réponse
```sql
SELECT * FROM diplomas_pending_dreets_response;
```

---

## 🛠️ Utilisation Admin

### Dashboard Admin

URL : `/admin/verify-diplomas`

**Fonctionnalités** :
- 📊 Statistiques en temps réel
- 🔍 Visualisation des diplômes
- 📧 Statut envoi DREETS
- ✅❌ Actions manuelles si besoin

### Réception réponse DREETS

Quand la DREETS répond par email :

1. **Admin reçoit l'email** (en CC)
2. **Admin va dans le dashboard**
3. **Admin met à jour le statut** :
   ```sql
   SELECT log_dreets_response(
     'educator_id',
     'Réponse de la DREETS: Diplôme valide',
     true  -- vérifié
   );
   ```
4. **Automatiquement** :
   - Statut du diplôme mis à jour
   - Profil activé (si vérifié)
   - Email envoyé à l'éducateur

### SQL Manuel (si besoin)

**Marquer comme vérifié DREETS** :
```sql
UPDATE educator_profiles
SET
  dreets_verified = true,
  dreets_response_date = NOW(),
  diploma_verification_status = 'verified',
  diploma_verified_at = NOW()
WHERE id = 'educator_id';
```

**Marquer comme refusé** :
```sql
UPDATE educator_profiles
SET
  dreets_verified = false,
  dreets_response_date = NOW(),
  diploma_verification_status = 'rejected',
  diploma_rejected_reason = 'Diplôme non reconnu par la DREETS'
WHERE id = 'educator_id';
```

---

## 🔒 Sécurité

### Protections en place

✅ **RLS (Row Level Security)** activée
✅ **Bucket Storage privé** (diplomas)
✅ **Authentification requise** pour l'upload
✅ **Validation côté client** (type, taille fichier)
✅ **Validation côté serveur** (Supabase Storage)
✅ **OCR local** (pas d'envoi à API externe)
✅ **Historique complet** des actions (audit trail)

### Données sensibles

**⚠️ IMPORTANT** :

Les diplômes contiennent des données personnelles sensibles.

**Mesures** :
- Stockage chiffré (Supabase)
- Accès restreint (éducateur + admin uniquement)
- Transmission sécurisée (HTTPS)
- Suppression possible (RGPD)

---

## 📊 Monitoring

### Statistiques à surveiller

**Via SQL** :
```sql
-- Diplômes en attente
SELECT COUNT(*) FROM educator_profiles
WHERE diploma_verification_status = 'pending';

-- Diplômes DREETS en attente de réponse
SELECT * FROM diplomas_pending_dreets_response;

-- Score OCR moyen
SELECT AVG(diploma_ocr_confidence) FROM educator_profiles
WHERE diploma_ocr_confidence IS NOT NULL;
```

**Via Dashboard** :
- Temps moyen de réponse DREETS
- Taux de vérification réussie
- Qualité OCR moyenne

---

## 🐛 Dépannage

### Problème : OCR ne détecte rien

**Causes possibles** :
- Image de mauvaise qualité
- PDF scanné (pas de texte)
- Langue incorrecte

**Solutions** :
- Demander re-upload meilleure qualité
- Activer OCR pour PDF
- Vérifier langue Tesseract ('fra')

### Problème : Email DREETS non reçu

**Vérifications** :
1. Service email configuré ?
2. API key valide ?
3. Email DREETS correct ?
4. Logs de l'erreur ?

**Workaround** :
- Envoi manuel par admin
- Email direct à la DREETS

### Problème : DREETS ne répond pas

**Actions** :
- Vérifier boîte spam
- Relancer après 10 jours
- Contacter DREETS par téléphone
- Vérification manuelle alternative

---

## 🚀 Améliorations Futures

### Court terme

1. **Interface admin réponse DREETS**
   - Formulaire dédié
   - Upload réponse DREETS
   - Historique emails

2. **Notifications automatiques**
   - Rappel admin si pas de réponse après 10 jours
   - Notification éducateur à chaque étape

3. **Dashboard statistiques**
   - Graphiques temps de réponse
   - Taux de succès OCR
   - Taux de vérification

### Moyen terme

1. **OCR avancé**
   - Support multi-pages PDF
   - OCR plus précis (Google Cloud Vision)
   - Extraction automatique photo d'identité

2. **API DREETS** (si disponible)
   - Vérification en temps réel
   - Base de données diplômes officielle

3. **Multi-langue**
   - Support diplômes étrangers
   - Équivalences européennes

### Long terme

1. **IA de vérification**
   - Détection automatique faux diplômes
   - Analyse de cohérence
   - Score de confiance avancé

2. **Blockchain**
   - Certificats numériques
   - Vérification décentralisée

---

## 📞 Support

### Contacts DREETS

Annuaire officiel : https://travail-emploi.gouv.fr/ministere/organisation/dreets

**Pour chaque région** :
- Site web régional
- Email de contact
- Téléphone

### Documentation

- **Tesseract.js** : https://tesseract.projectnaptha.com/
- **Supabase Storage** : https://supabase.com/docs/guides/storage
- **Resend** : https://resend.com/docs

---

## ✅ Checklist de Déploiement

Avant de passer en production :

- [ ] ✅ Tesseract.js installé (`npm install tesseract.js`)
- [ ] ✅ Migrations SQL exécutées (2 fichiers)
- [ ] ✅ Bucket Supabase `diplomas` créé
- [ ] ✅ Policies RLS Storage configurées
- [ ] ✅ Service email configuré (Resend/SendGrid)
- [ ] ✅ Variables d'environnement définies
- [ ] ✅ Emails DREETS vérifiés et corrects
- [ ] ✅ Test complet du workflow effectué
- [ ] ✅ Dashboard admin testé
- [ ] ✅ Compte admin créé
- [ ] ✅ Documentation équipe complétée
- [ ] ✅ Plan de réponse DREETS défini
- [ ] ✅ Monitoring mis en place

---

## 🎓 Formation Équipe

**Admin doit savoir** :
1. Accéder au dashboard `/admin/verify-diplomas`
2. Interpréter les résultats OCR
3. Traiter les réponses DREETS
4. Gérer les cas limites
5. Contacter les DREETS si besoin

**Support doit savoir** :
1. Expliquer le processus aux éducateurs
2. Gérer les questions sur les délais
3. Aider au re-upload si refus
4. Escalader vers admin si problème

---

**Documentation créée le 21/11/2025**
**Version 1.0**
