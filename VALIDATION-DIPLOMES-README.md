# 🎓 Système de Validation des Diplômes

## ✅ Ce qui a été mis en place

### 1. **Numéro de diplôme obligatoire**
- ✓ Obligatoire pour les diplômes d'État (DEES, DEME)
- ✓ Optionnel pour les autres certifications (ABA, TEACCH, etc.)
- ✓ Bordure rouge si le champ est vide pour les DEES/DEME
- ✓ Message d'aide affiché selon le type de diplôme

### 2. **Validation du format**
- ✓ Format requis: `ANNÉE-RÉGION-NUMÉRO` (ex: `2023-IDF-12345`)
- ✓ Validation automatique avant sauvegarde
- ✓ Vérification de la cohérence de l'année (entre 1950 et année actuelle)
- ✓ Conversion automatique en majuscules lors de la saisie

### 3. **Détection de doublons**
- ✓ Vérification automatique après sauvegarde
- ✓ Alerte affichée si le numéro est déjà utilisé
- ✓ Trigger SQL automatique qui détecte les doublons
- ✓ Message d'avertissement dans les notes de vérification

### 4. **Base locale des diplômes vérifiés**
- ✓ Table `verified_diplomas` pour stocker les diplômes déjà vérifiés
- ✓ Fonction `register_verified_diploma()` pour enregistrer après vérification
- ✓ Fonction `is_diploma_already_verified()` pour vérifier rapidement

### 5. **Interface Admin améliorée**
- ✓ Section "Alertes de doublons" en haut de la page
- ✓ Affichage du nombre de doublons détectés
- ✓ Liste détaillée des certifications utilisant le même numéro
- ✓ Information sur le statut de chaque certification en doublon

---

## 📋 Scripts SQL à exécuter

Dans **Supabase SQL Editor**, exécutez dans l'ordre :

### 1. `supabase-add-dees-deme-types.sql`
Ajoute les types DEES et DEME aux certifications

### 2. `supabase-fix-certification-storage.sql`
Configure le bucket de storage pour les documents

### 3. `supabase-certification-verification-system.sql`
Crée l'infrastructure de vérification des certifications

### 4. `supabase-certification-email-notifications.sql`
Met en place les notifications email automatiques

### 5. **`supabase-diploma-number-validation.sql`** (NOUVEAU)
Crée le système de validation des numéros de diplômes

---

## 🎯 Formats de numéros attendus

| Type de diplôme | Format | Exemple | Obligatoire |
|-----------------|--------|---------|-------------|
| **DEES** | ANNÉE-RÉGION-NUMÉRO | `2023-IDF-12345` | ✅ OUI |
| **DEME** | ANNÉE-RÉGION-NUMÉRO | `2022-ARA-56789` | ✅ OUI |
| **ABA** | Libre (min 5 car.) | `ABA-2023-001` | ❌ NON |
| **TEACCH** | Libre (min 5 car.) | `TEACCH-FR-2023` | ❌ NON |
| **Autres** | Libre (min 5 car.) | `CERT-12345` | ❌ NON |

### Codes régions (exemples) :
- `IDF` : Île-de-France
- `ARA` : Auvergne-Rhône-Alpes
- `PACA` : Provence-Alpes-Côte d'Azur
- `OCC` : Occitanie
- `HDF` : Hauts-de-France

---

## 🔍 Fonctionnalités SQL

### Vérifier les doublons manuellement

```sql
-- Voir tous les numéros en doublon
SELECT * FROM diploma_duplicates_alert;

-- Vérifier un numéro spécifique
SELECT * FROM check_diploma_number_duplicate('2023-IDF-12345');
```

### Valider un format de numéro

```sql
-- Valider un numéro DEES
SELECT validate_diploma_number_format('DEES', '2023-IDF-12345');
-- Retourne: true ou false
```

### Enregistrer un diplôme vérifié

```sql
-- Après vérification par l'admin
SELECT register_verified_diploma(
  'certification-id-uuid',
  'document', -- ou 'dreets' ou 'manual'
  'admin-user-id-uuid',
  'Document vérifié visuellement, conforme'
);
```

### Vérifier si un diplôme existe déjà

```sql
-- Chercher dans la base des diplômes vérifiés
SELECT * FROM is_diploma_already_verified('2023-IDF-12345');
```

---

## 🖥️ Interface utilisateur

### Page profil éducateur (`/dashboard/educator/profile`)

**Avant la sauvegarde :**
- Validation du format selon le type
- Message d'erreur clair si format invalide
- Bordure rouge si champ obligatoire vide

**Après la sauvegarde :**
- Vérification automatique des doublons
- Alerte affichée si le numéro est déjà utilisé :
  ```
  ⚠️ ALERTE: Le numéro 2023-IDF-12345 est utilisé par 1 autre(s) personne(s).
  Cette alerte a été transmise à l'équipe de modération.
  ```

### Page admin (`/admin/certifications`)

**Section "Alertes de doublons" :**
- Affichage du nombre total de doublons
- Bouton "Afficher/Masquer" pour voir les détails
- Pour chaque doublon :
  - Numéro de diplôme (en grand)
  - Type de diplôme
  - Nombre d'utilisations
  - Liste des éducateurs utilisant ce numéro
  - Statut de chaque certification

---

## 🔄 Workflow de validation

### 1. Éducateur ajoute une certification

```
Éducateur → Remplit le formulaire
         → Saisit le numéro : "2023-IDF-12345"
         → Clique "Enregistrer"
         → Validation automatique du format
         → Vérification des doublons
         → Alerte si doublon détecté
```

### 2. Admin modère

```
Admin → Va sur /admin/certifications
      → Voit une alerte : "2 numéros en doublon"
      → Clique "Afficher"
      → Voit que "2023-IDF-12345" est utilisé 2 fois
      → Investigue les 2 certifications
      → Approuve la vraie, rejette la fausse
```

### 3. Enregistrement dans la base vérifiée

```
Admin → Approuve certification
      → Fonction SQL enregistre automatiquement dans verified_diplomas
      → Prochaine fois qu'un éducateur saisit ce numéro
      → Système peut vérifier rapidement s'il existe déjà
```

---

## ⚠️ Cas d'usage des doublons

### Doublon légitime
- Même personne a créé 2 comptes par erreur
- **Action** : Fusionner les comptes ou supprimer le doublon

### Doublon frauduleux
- Personne A utilise le diplôme de personne B
- **Action** : Rejeter la fausse certification, contacter DREETS

### Doublon d'erreur de saisie
- Numéro mal saisi par erreur
- **Action** : Demander correction du numéro

---

## 🛡️ Sécurité

### Ce qui protège contre la fraude :

1. **Validation du format** → Réduit les erreurs de saisie
2. **Détection de doublons** → Identifie les numéros réutilisés
3. **Base locale vérifiée** → Référence des diplômes authentiques
4. **Trigger automatique** → Impossible de passer outre
5. **Interface admin** → Vue d'ensemble des anomalies

### Ce qui ne protège PAS encore :

- ❌ Validation API auprès de la DREETS (pas d'API publique)
- ❌ Vérification d'identité de la personne
- ❌ Cross-référence avec bases de données officielles

---

## 📊 Statistiques disponibles

```sql
-- Nombre total de diplômes vérifiés
SELECT COUNT(*) FROM verified_diplomas;

-- Diplômes par type
SELECT diploma_type, COUNT(*)
FROM verified_diplomas
GROUP BY diploma_type;

-- Nombre de doublons actuels
SELECT COUNT(*) FROM diploma_duplicates_alert;

-- Certifications avec numéros suspects
SELECT * FROM certifications
WHERE diploma_number IS NOT NULL
  AND verification_status = 'pending'
  AND type IN ('DEES', 'DEME');
```

---

## 🎉 Résumé

✅ **Numéro obligatoire** pour DEES/DEME
✅ **Validation automatique** du format
✅ **Détection de doublons** en temps réel
✅ **Base locale** des diplômes vérifiés
✅ **Interface admin** avec alertes
✅ **Trigger SQL** automatique
✅ **Messages d'erreur** clairs et explicites

Le système est maintenant prêt à être utilisé ! 🚀

---

## 🔧 Prochaines améliorations possibles

1. **Export des doublons** en CSV pour investigation
2. **Statistiques par région** des diplômes
3. **Blacklist** de numéros frauduleux connus
4. **OCR automatique** des documents PDF pour extraire le numéro
5. **API de vérification DREETS** (si disponible à l'avenir)
