# 💳 Système de Paiement pour Rendez-vous - Documentation

## 📋 Vue d'ensemble

Système de paiement avec autorisation différée (capture manuelle) pour les rendez-vous entre familles et éducateurs. Les fonds sont bloqués lors de la réservation et capturés uniquement quand l'éducateur marque le rendez-vous comme terminé.

## 🔄 Flux complet

```
1. Famille réserve un RDV sur la page de réservation
   ↓
2. Famille est redirigée vers Stripe Checkout pour payer
   ↓
3. Stripe bloque les fonds (autorisation, pas de capture)
   ↓
4. Webhook Stripe crée le RDV en BDD avec statut "pending"
   ↓
5. Éducateur accepte le RDV → Code PIN généré et envoyé
   ↓
6. Jour du RDV : Éducateur entre le code PIN pour démarrer
   ↓
7. Éducateur termine le RDV
   ↓
8. Le paiement est capturé via Stripe (avec 10% de commission)
   ↓
9. Famille et éducateur reçoivent des emails de confirmation
```

## 📁 Fichiers créés/modifiés

### Nouvelles APIs

1. **`/api/appointments/create-with-payment/route.ts`**
   - Crée une session Stripe Checkout
   - Mode: `payment` avec `capture_method: 'manual'`
   - Calcule automatiquement les montants (commission 10%, frais Stripe ~2%)
   - Stocke toutes les infos dans les métadonnées

2. **`/api/webhooks/stripe-appointments/route.ts`**
   - Écoute l'événement `checkout.session.completed`
   - Crée le rendez-vous dans la BDD après paiement autorisé
   - Stocke le `payment_intent_id` pour capture ultérieure

3. **`/api/appointments/[id]/complete/route.ts` (modifié)**
   - Capture le paiement Stripe quand le RDV est terminé
   - Utilise `stripe.paymentIntents.capture()`
   - Crée une transaction avec répartition des montants
   - Envoie des emails de confirmation

### Modifications frontend

4. **`/app/educator/[id]/book-appointment/page.tsx`**
   - Calcule le prix basé sur durée × tarif horaire
   - Redirige vers Stripe Checkout au lieu de créer le RDV directement
   - Gère la redirection après paiement

### Migration BDD

5. **`supabase/migrations/add_payment_fields_to_appointments.sql`**
   - Ajoute `payment_intent_id` à la table appointments
   - Ajoute `payment_status` (pending, authorized, captured, refunded)

## 💰 Calcul des montants

```javascript
// Exemple pour un rendez-vous de 2h à 50€/h = 100€

const price = 100 * 100; // 10000 centimes
const commission = 10000 * 0.10; // 1000 centimes (10€)
const stripeFees = 10000 * 0.014 + 25; // 165 centimes (1.65€)
const educatorAmount = 10000 - 1000 - 165; // 8835 centimes (88.35€)

// Répartition finale:
// - Famille paie: 100.00€
// - Commission plateforme: 10.00€ (10%)
// - Frais Stripe: 1.65€
// - Éducateur reçoit: 88.35€
```

## 🔧 Configuration requise

### Variables d'environnement

```bash
# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET_APPOINTMENTS=whsec_...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://...
SUPABASE_SERVICE_ROLE_KEY=...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Emails
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=verification@autismeconnect.fr
```

### Configuration Stripe

1. **Activer les webhooks**
   - URL: `https://votre-domaine.com/api/webhooks/stripe-appointments`
   - Événements: `checkout.session.completed`, `checkout.session.expired`

2. **Obtenir la clé webhook**
   ```bash
   # Pour le dev local avec Stripe CLI
   stripe listen --forward-to localhost:3000/api/webhooks/stripe-appointments
   ```

## 🧪 Test du flux complet

### Étape 1: Créer un rendez-vous

1. Connectez-vous en tant que famille
2. Allez sur le profil d'un éducateur
3. Cliquez sur "Réserver un rendez-vous"
4. Choisissez une date et un créneau horaire
5. Cliquez sur "Continuer vers le paiement"

### Étape 2: Payer avec Stripe Test

Utilisez ces cartes de test:
- **Succès**: `4242 4242 4242 4242`
- **Échec**: `4000 0000 0000 0002`
- Date: n'importe quelle date future
- CVC: n'importe quel 3 chiffres

### Étape 3: Vérifier la création du RDV

```sql
-- Dans Supabase SQL Editor
SELECT
  id,
  status,
  payment_status,
  payment_intent_id,
  price,
  appointment_date,
  start_time
FROM appointments
WHERE family_id = 'VOTRE_FAMILY_ID'
ORDER BY created_at DESC
LIMIT 1;
```

**Résultat attendu:**
- status: `pending`
- payment_status: `authorized`
- payment_intent_id: `pi_xxx...`

### Étape 4: Accepter le RDV (éducateur)

1. Connectez-vous en tant qu'éducateur
2. Allez dans "Mes rendez-vous"
3. Cliquez sur "Accepter" pour le nouveau RDV

**Résultat:**
- Un code PIN est généré
- Email envoyé à la famille avec le code
- Email envoyé à l'éducateur

### Étape 5: Démarrer le RDV (code PIN)

```bash
curl -X POST http://localhost:3000/api/appointments/[ID]/validate-pin \
  -H "Content-Type: application/json" \
  -d '{"pinCode": "1234"}'
```

**Résultat:**
- status: `in_progress`
- pin_code_validated: `true`

### Étape 6: Terminer le RDV

```bash
curl -X POST http://localhost:3000/api/appointments/[ID]/complete
```

**Résultat:**
- ✅ Paiement capturé sur Stripe
- ✅ Transaction créée en BDD
- ✅ status: `completed`
- ✅ payment_status: `captured`
- ✅ Emails envoyés à la famille et l'éducateur

### Étape 7: Vérifier la transaction

```sql
SELECT
  t.id,
  t.amount_total / 100.0 as total_euros,
  t.amount_commission / 100.0 as commission_euros,
  t.amount_educator / 100.0 as educator_euros,
  t.status,
  t.captured_at
FROM transactions t
WHERE t.appointment_id = 'VOTRE_APPOINTMENT_ID';
```

## 🔒 Sécurité

### Validations implémentées

✅ Paiement requis avant création du RDV
✅ Capture manuelle (fonds bloqués, pas débités immédiatement)
✅ Code PIN requis pour démarrer le RDV
✅ Vérification du statut à chaque étape
✅ Signature webhook Stripe vérifiée
✅ Montants en centimes (pas d'erreurs d'arrondis)

### Protections contre la fraude

✅ PaymentIntent lié à un rendez-vous unique
✅ Impossible de capturer sans validation du code PIN
✅ Timeout du code PIN (2h après l'heure de début)
✅ Historique complet des transactions

## 📧 Emails envoyés

### 1. Email Famille - Confirmation de paiement
**Envoyé par:** Webhook Stripe (TODO)
**Sujet:** ✅ Paiement confirmé - En attente d'acceptation

**Contenu:**
- Confirmation du blocage des fonds
- Détails du RDV
- Montant qui sera débité
- "L'éducateur va recevoir votre demande"

### 2. Email Famille - RDV accepté avec code PIN
**Envoyé par:** `/api/appointments/[id]/accept`
**Sujet:** ✅ Rendez-vous confirmé - Votre code PIN

**Contenu:**
- Code PIN à 4 chiffres
- Instructions d'utilisation
- Date et heure du RDV

### 3. Email Famille - RDV terminé
**Envoyé par:** `/api/appointments/[id]/complete`
**Sujet:** ✅ Séance terminée - Votre reçu

**Contenu:**
- Confirmation du débit
- Montant payé
- Lien vers la facture (TODO)

### 4. Email Éducateur - Nouveau RDV
**Envoyé par:** `/api/appointments/[id]/accept`
**Sujet:** 🎉 Nouveau rendez-vous confirmé

**Contenu:**
- Détails du RDV
- Instructions pour le code PIN
- Rémunération nette

### 5. Email Éducateur - Paiement effectué
**Envoyé par:** `/api/appointments/[id]/complete`
**Sujet:** 💰 Paiement effectué - Séance terminée

**Contenu:**
- Récapitulatif des montants
- Commission et frais déduits
- "Virement sous 48h"

## 🚨 Gestion des erreurs

### Paiement échoué

- Webhook: `checkout.session.expired`
- Action: Rien (le RDV n'a jamais été créé)
- Email: Notification à la famille (TODO)

### Code PIN non validé

- Si l'éducateur termine sans valider le PIN
- Erreur: `PIN_NOT_VALIDATED`
- Action: Refus de capturer le paiement

### Capture échouée

- Si Stripe refuse la capture (ex: carte expirée)
- Action: Transaction marquée comme `failed`
- Email: Support notifié (TODO)

### RDV annulé

**TODO:** Implémenter la logique d'annulation
- Avant acceptation: Remboursement automatique
- Après acceptation: Politique de remboursement
  - >48h: Gratuit (100% remboursé)
  - <48h: 30% de frais
  - <24h: 50% de frais

## 📊 Monitoring

### Métriques à suivre

```sql
-- Taux de conversion (paiements → RDV complétés)
SELECT
  COUNT(CASE WHEN payment_status = 'authorized' THEN 1 END) as authorized_count,
  COUNT(CASE WHEN payment_status = 'captured' THEN 1 END) as captured_count,
  ROUND(
    COUNT(CASE WHEN payment_status = 'captured' THEN 1 END)::DECIMAL /
    COUNT(CASE WHEN payment_status = 'authorized' THEN 1 END) * 100,
    2
  ) as conversion_rate
FROM appointments
WHERE created_at >= NOW() - INTERVAL '30 days';
```

```sql
-- Revenus par mois
SELECT
  DATE_TRUNC('month', captured_at) as month,
  COUNT(*) as appointments,
  SUM(amount_total) / 100.0 as total_revenue,
  SUM(amount_commission) / 100.0 as platform_commission
FROM transactions
WHERE status = 'captured'
GROUP BY DATE_TRUNC('month', captured_at)
ORDER BY month DESC;
```

## 🔜 Prochaines étapes

### Phase 1: Stripe Connect pour éducateurs (priorité)

1. Créer endpoint `/api/educators/stripe-onboarding`
2. Page `/dashboard/educator/bank-account`
3. Utiliser Stripe Transfers pour payer les éducateurs
4. Ajouter `stripe_account_id` à `educator_profiles`

### Phase 2: Factures PDF

1. Génération avec jsPDF ou @react-pdf/renderer
2. Upload vers Supabase Storage
3. Lien dans les emails

### Phase 3: Annulations et remboursements

1. Endpoint `/api/appointments/[id]/cancel`
2. Logique de remboursement partiel
3. Stripe Refund automatique

### Phase 4: Dashboard admin

1. Vue des transactions
2. Gestion des litiges
3. Exports comptables

## 🐛 Debug

### Vérifier un paiement Stripe

```bash
# Avec Stripe CLI
stripe payment_intents retrieve pi_xxx

# Vérifier si capturé
stripe payment_intents retrieve pi_xxx | grep status
```

### Voir les webhooks reçus

```bash
# Stripe CLI
stripe listen
```

### Réinitialiser un RDV pour re-tester

```sql
UPDATE appointments
SET
  status = 'in_progress',
  payment_status = 'authorized'
WHERE id = 'APPOINTMENT_ID';

DELETE FROM transactions WHERE appointment_id = 'APPOINTMENT_ID';
```

## ✅ Checklist production

Avant de déployer:

- [ ] Configurer les webhooks Stripe en production
- [ ] Tester avec vraies cartes bancaires
- [ ] Activer Stripe Connect
- [ ] Implémenter les emails de confirmation de paiement
- [ ] Générer les factures PDF
- [ ] Ajouter la gestion des annulations
- [ ] Tester les remboursements
- [ ] Mettre en place le monitoring
- [ ] Former le support client
- [ ] Documenter la comptabilité

---

**Système créé le 24/11/2025** 🚀
