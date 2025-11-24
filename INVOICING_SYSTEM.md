# 💼 Système de Facturation Automatique - Autisme Connect

## 📋 Vue d'ensemble

Système de génération automatique de factures conformes URSSAF pour les éducateurs et reçus pour les familles.

---

## ✨ Fonctionnalités

### Pour les Éducateurs:
- ✅ **Facture automatique** après chaque prestation
- ✅ **Conforme URSSAF** avec tous les champs obligatoires
- ✅ **Numérotation unique** FACT-YYYYMM-NNNN
- ✅ **Montants détaillés**: Total HT, Commission, Net à percevoir
- ✅ **SIRET** (si renseigné)
- ✅ **Mentions TVA** (franchise de TVA pour auto-entrepreneurs)
- ✅ **Téléchargement PDF**

### Pour les Familles:
- ✅ **Reçu de paiement** automatique
- ✅ **Numérotation unique** RECU-YYYYMM-NNNN
- ✅ **Détail de la prestation**
- ✅ **Confirmation de paiement**
- ✅ **Téléchargement PDF**

---

## 🗂️ Structure des fichiers

```
supabase/migrations/
  └─ 20250124_add_invoices_table.sql    # Table invoices + fonctions SQL

lib/
  └─ invoice-generator.ts                # Génération PDF avec PDFKit

app/api/invoices/
  └─ generate/route.ts                   # API génération factures

app/api/appointments/[id]/
  └─ complete/route.ts                   # Intégration auto-génération
```

---

## 📊 Table `invoices`

### Colonnes principales:

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID | Identifiant unique |
| `appointment_id` | UUID | Lien vers le rendez-vous |
| `educator_id` | UUID | Éducateur (prestataire) |
| `family_id` | UUID | Famille (client) |
| `type` | TEXT | `educator_invoice` ou `family_receipt` |
| `invoice_number` | TEXT | Numéro unique (FACT-202501-0001) |
| `invoice_date` | DATE | Date d'émission |
| `amount_total` | INTEGER | Montant total TTC (centimes) |
| `amount_ht` | INTEGER | Montant HT (centimes) |
| `amount_commission` | INTEGER | Commission plateforme (10%) |
| `amount_net` | INTEGER | Net éducateur |
| `client_siret` | TEXT | SIRET éducateur (URSSAF) |
| `pdf_url` | TEXT | URL publique du PDF |
| `status` | TEXT | `generated`, `sent`, `paid`, `cancelled` |

---

## 🔄 Flux de génération

```
1. Rendez-vous terminé
   └─> API /appointments/[id]/complete

2. Paiement capturé
   └─> Transaction créée

3. Génération automatique des factures
   └─> Appel /api/invoices/generate
       ├─> Récupération données RDV
       ├─> Génération numéros uniques
       ├─> Création PDF éducateur
       ├─> Création PDF famille
       ├─> Upload Supabase Storage
       └─> Insertion en BDD

4. Factures disponibles
   ├─> Éducateur: Facture URSSAF
   └─> Famille: Reçu de paiement
```

---

## 📄 Exemple de facture éducateur

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FACTURE
N° FACT-202501-0042
Date: 24/01/2025
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PRESTATAIRE                 CLIENT
───────────────────────────────────────
Zakariya Nebbache          Marie Dupont
12 rue de la Paix          45 av. des Champs
75001 Paris                75008 Paris
SIRET: 123 456 789 00012
Email: zakariya@example.fr

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DÉTAIL DE LA PRESTATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DESCRIPTION                  DATE        DURÉE    MONTANT HT
─────────────────────────────────────────────────────────────
Séance d'accompagnement     24/01/2025  120 min  100,00 €
éducatif

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

                            Total HT      100,00 €
                            TVA non applicable (Art. 293 B CGI)
                            Total TTC     100,00 €

                            Commission    - 10,00 €
                            NET À PERCEVOIR  90,00 €

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MENTIONS LÉGALES

Cette facture est conforme aux exigences de
l'URSSAF pour les auto-entrepreneurs.

Paiement effectué via Autisme Connect (Stripe).
```

---

## 🧪 Test du système

### 1. Exécuter la migration SQL:

```bash
# Via Supabase Dashboard
# SQL Editor → New Query → Copier le contenu de:
supabase/migrations/20250124_add_invoices_table.sql
```

### 2. Tester la génération manuelle:

```bash
curl -X POST http://localhost:3000/api/invoices/generate \
  -H "Content-Type: application/json" \
  -d '{"appointmentId": "VOTRE_APPOINTMENT_ID"}'
```

**Résultat attendu:**
```json
{
  "success": true,
  "invoices": {
    "educator": {
      "id": "uuid...",
      "number": "FACT-202501-0001",
      "url": "https://...supabase.co/storage/v1/..."
    },
    "family": {
      "id": "uuid...",
      "number": "RECU-202501-0001",
      "url": "https://...supabase.co/storage/v1/..."
    }
  }
}
```

### 3. Vérifier en BDD:

```sql
SELECT
  id,
  type,
  invoice_number,
  amount_total / 100.0 as montant_euros,
  amount_net / 100.0 as net_educateur,
  status,
  pdf_url
FROM invoices
ORDER BY created_at DESC
LIMIT 5;
```

---

## 📦 Configuration Supabase Storage

### Créer le bucket `documents`:

```sql
-- Via Supabase Dashboard → Storage → Create bucket
Bucket name: documents
Public: Yes (pour téléchargement direct)
```

### Structure des fichiers:

```
documents/
  ├─ invoices/
  │   ├─ educators/
  │   │   └─ {appointment_id}_{invoice_number}.pdf
  │   └─ families/
  │       └─ {appointment_id}_{invoice_number}.pdf
```

---

## 🔒 Sécurité & RLS

### Policies activées:

✅ **Éducateurs** peuvent voir uniquement leurs factures
✅ **Familles** peuvent voir uniquement leurs reçus
✅ **Service role** peut tout gérer

```sql
-- Exemple policy
CREATE POLICY "Educators can view their own invoices"
  ON invoices FOR SELECT
  USING (
    educator_id IN (
      SELECT id FROM educator_profiles
      WHERE user_id = auth.uid()
    )
  );
```

---

## 📈 Améliorations futures

### Phase 1 (Court terme):
- [ ] Envoi automatique par email (pièce jointe PDF)
- [ ] Page dashboard `/dashboard/educator/invoices`
- [ ] Filtres par date, statut
- [ ] Export comptable (CSV)

### Phase 2 (Moyen terme):
- [ ] Génération automatique de relevés mensuels
- [ ] Récapitulatif annuel pour déclaration URSSAF
- [ ] Support TVA (si éducateur dépasse seuil)
- [ ] Factures d'avoir (remboursements)

### Phase 3 (Long terme):
- [ ] Intégration comptabilité (ex: Pennylane, QuickBooks)
- [ ] Export Chorus Pro (secteur public)
- [ ] Signature électronique
- [ ] Archivage légal (10 ans)

---

## 🆘 Dépannage

### Erreur: "generate_invoice_number does not exist"
**Solution:** Exécuter la migration SQL complète

### Erreur: "Storage bucket not found"
**Solution:** Créer le bucket `documents` dans Supabase Storage

### PDF vide ou corrompu
**Solution:** Vérifier que PDFKit est bien installé: `npm list pdfkit`

### Factures non générées après RDV
**Solution:** Vérifier les logs dans `/api/appointments/[id]/complete`

---

## 📞 Support

Pour toute question:
- Code: Voir les commentaires dans `lib/invoice-generator.ts`
- SQL: Voir `supabase/migrations/20250124_add_invoices_table.sql`
- API: Voir `app/api/invoices/generate/route.ts`

---

**Système créé le 24/11/2025** 🚀
**Conforme URSSAF** ✅
**Prêt pour production** ✨
