# 💳 Système de Paiement avec Code PIN - Documentation

## 📋 Vue d'ensemble

Système de paiement sécurisé type Doctolib avec validation par code PIN pour Autisme Connect.

### Flux complet

```
1. Famille réserve RDV
   ↓
2. Éducateur accepte → Code PIN généré
   ↓
3. Famille reçoit le code par email
   ↓
4. Jour du RDV : Éducateur demande le code
   ↓
5. Code validé → RDV démarre
   ↓
6. Éducateur termine → Paiement capturé
   ↓
7. Famille et éducateur reçoivent emails + factures
```

---

## 🗄️ Tables créées

### `transactions`
Gère tous les paiements entre familles et éducateurs.

```sql
- id (UUID)
- appointment_id (FK)
- family_id (FK)
- educator_id (FK)
- amount_total (INTEGER) -- En centimes
- amount_educator (INTEGER)
- amount_commission (INTEGER)
- amount_stripe_fees (INTEGER)
- payment_intent_id (TEXT)
- status (TEXT)
- created_at, updated_at
```

### `invoices`
Factures PDF pour familles et éducateurs.

```sql
- id (UUID)
- transaction_id (FK)
- type ('family_receipt' | 'educator_invoice')
- invoice_number (TEXT UNIQUE)
- pdf_url (TEXT)
- status (TEXT)
```

### `educator_reputation`
Système de réputation pour débloquer validation automatique.

```sql
- educator_id (FK)
- total_appointments (INTEGER)
- validated_appointments (INTEGER)
- reputation_level (TEXT)
- requires_family_confirmation (BOOLEAN)
```

### Colonnes ajoutées à `appointments`

```sql
ALTER TABLE appointments ADD:
- pin_code VARCHAR(4)
- pin_code_expires_at TIMESTAMPTZ
- pin_code_entered_at TIMESTAMPTZ
- pin_code_attempts INTEGER
- pin_code_validated BOOLEAN
- pin_locked_until TIMESTAMPTZ
- started_at TIMESTAMPTZ
- completed_at TIMESTAMPTZ
```

---

## 🔌 APIs créées

### 1. POST `/api/appointments/[id]/accept`

**Accepte un RDV et génère le code PIN**

```typescript
// Request
POST /api/appointments/73bfc2a8-a052-4fc3-b75d-d18593115128/accept

// Response
{
  "success": true,
  "pinCode": "7834",  // À retirer en prod
  "expiresAt": "2025-11-24T16:00:00Z"
}
```

**Ce que ça fait :**
- ✅ Génère code PIN sécurisé (4 chiffres, évite 0000, 1234, etc.)
- ✅ Définit expiration 2h après heure de début
- ✅ Met à jour RDV → status: 'confirmed'
- ✅ Email famille avec CODE PIN
- ✅ Email éducateur (sans code)

---

### 2. POST `/api/appointments/[id]/validate-pin`

**Valide le code PIN au début du RDV**

```typescript
// Request
POST /api/appointments/73bfc2a8-a052-4fc3-b75d-d18593115128/validate-pin
Content-Type: application/json

{
  "pinCode": "7834"
}

// Response Success
{
  "success": true,
  "message": "Rendez-vous démarré avec succès",
  "appointment": {
    "id": "...",
    "status": "in_progress",
    "started_at": "2025-11-24T14:05:32Z"
  }
}

// Response Error - Code incorrect
{
  "error": "Code PIN incorrect",
  "code": "INVALID_PIN",
  "attemptsLeft": 2
}

// Response Error - Trop de tentatives
{
  "error": "Trop de tentatives. Réessayez dans 10 minutes",
  "code": "TOO_MANY_ATTEMPTS",
  "lockedUntil": "2025-11-24T14:15:00Z"
}
```

**Sécurités :**
- ⚠️ 3 tentatives maximum
- ⚠️ Blocage 10 minutes après 3 échecs
- ⚠️ Code expire 2h après début prévu
- ⚠️ Vérification statut RDV

---

### 3. POST `/api/appointments/[id]/complete`

**Termine le RDV et capture le paiement**

```typescript
// Request
POST /api/appointments/73bfc2a8-a052-4fc3-b75d-d18593115128/complete

// Response
{
  "success": true,
  "message": "Rendez-vous terminé et paiement effectué",
  "transaction": {
    "id": "...",
    "amount_total": 10000,  // 100.00€
    "amount_educator": 8800,  // 88.00€
    "amount_commission": 1000,  // 10.00€
    "status": "captured"
  }
}
```

**Ce que ça fait :**
- ✅ Vérifie que code PIN a été validé
- ✅ Calcule montants (commission 10%, frais Stripe ~2%)
- ✅ Crée transaction en BDD
- ✅ Met à jour RDV → status: 'completed'
- ✅ Met à jour réputation éducateur
- ✅ Emails famille + éducateur avec récap paiement
- ⏳ TODO: Capture Stripe réelle (pour l'instant mode test)

---

## 🎨 Composant React

### `<PinCodeModal />`

Modale élégante pour entrer le code PIN.

```tsx
import PinCodeModal from '@/components/PinCodeModal';

function AppointmentPage() {
  const [showPinModal, setShowPinModal] = useState(false);

  const handleValidatePin = async (pin: string) => {
    const res = await fetch(`/api/appointments/${appointmentId}/validate-pin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pinCode: pin })
    });

    const data = await res.json();

    if (data.success) {
      // RDV démarré !
      return { success: true };
    } else {
      return {
        success: false,
        error: data.error,
        attemptsLeft: data.attemptsLeft
      };
    }
  };

  return (
    <>
      <button onClick={() => setShowPinModal(true)}>
        Démarrer le RDV
      </button>

      <PinCodeModal
        isOpen={showPinModal}
        onClose={() => setShowPinModal(false)}
        onValidate={handleValidatePin}
        appointmentId={appointmentId}
      />
    </>
  );
}
```

**Fonctionnalités :**
- ✅ 4 inputs auto-focus
- ✅ Support copier-coller
- ✅ Navigation clavier (flèches, backspace)
- ✅ Validation automatique quand 4 chiffres
- ✅ Gestion erreurs avec compteur tentatives
- ✅ Design responsive et accessible

---

## 💰 Modèle économique

```
Prix séance : 100.00€
├─> Commission plateforme : 10.00€ (10%)
├─> Frais Stripe : ~2.00€ (1.4% + 0.25€)
└─> Net éducateur : 88.00€
```

Tous les montants sont stockés **en centimes** pour éviter les erreurs d'arrondis.

---

## 📧 Emails envoyés

### 1. Email Famille - Confirmation RDV
**Sujet :** ✅ Rendez-vous confirmé - Votre code PIN

**Contenu :**
- Date et heure du RDV
- Nom de l'éducateur
- **Code PIN à 4 chiffres** (ex: 7834)
- Instructions d'utilisation
- Montant qui sera débité

### 2. Email Éducateur - Nouveau RDV
**Sujet :** 🎉 Nouveau rendez-vous confirmé

**Contenu :**
- Date et heure du RDV
- Nom de la famille
- Instructions pour demander le code PIN
- Rémunération nette (88€)

### 3. Email Famille - RDV terminé
**Sujet :** ✅ Séance terminée - Votre reçu

**Contenu :**
- Récapitulatif de la séance
- Montant débité (100€)
- Lien vers facture PDF

### 4. Email Éducateur - Paiement effectué
**Sujet :** 💰 Paiement effectué - Séance terminée

**Contenu :**
- Détail des montants (100€ - 10€ - 2€ = 88€)
- Virement sous 48h
- Lien vers facture PDF

---

## 🧪 Test du flux complet

### Étape 1 : Créer un RDV test

```sql
-- Dans Supabase SQL Editor
INSERT INTO appointments (
  id,
  educator_id,
  family_id,
  scheduled_at,
  duration,
  price,
  status
) VALUES (
  'test-appointment-001',
  'EDUCATOR_ID_HERE',
  'FAMILY_ID_HERE',
  NOW() + INTERVAL '2 hours',
  60,
  10000,  -- 100€ en centimes
  'pending_educator_approval'
);
```

### Étape 2 : Accepter le RDV (générer PIN)

```bash
curl -X POST http://localhost:3000/api/appointments/test-appointment-001/accept
```

**Résultat attendu :**
- ✅ RDV passe à status: 'confirmed'
- ✅ Code PIN généré (ex: 7834)
- ✅ Emails envoyés

### Étape 3 : Valider le code PIN

```bash
curl -X POST http://localhost:3000/api/appointments/test-appointment-001/validate-pin \
  -H "Content-Type: application/json" \
  -d '{"pinCode": "7834"}'
```

**Résultat attendu :**
- ✅ RDV passe à status: 'in_progress'
- ✅ pin_code_validated = true
- ✅ started_at défini

### Étape 4 : Terminer le RDV

```bash
curl -X POST http://localhost:3000/api/appointments/test-appointment-001/complete
```

**Résultat attendu :**
- ✅ RDV passe à status: 'completed'
- ✅ Transaction créée (88€ éducateur, 10€ commission)
- ✅ Réputation éducateur +1
- ✅ Emails envoyés

---

## 🔒 Sécurité

### Validations implémentées

✅ Code PIN requis pour démarrer RDV
✅ 3 tentatives max avec blocage 10min
✅ Code expire 2h après heure de début
✅ Vérification statut RDV à chaque étape
✅ Montants en centimes (pas d'arrondis)
✅ Row Level Security (RLS) sur toutes les tables

### À ajouter (Phase 2)

⏳ Stripe Connect réel pour éducateurs
⏳ Autorisation bancaire différée (PaymentIntent)
⏳ Génération factures PDF
⏳ Gestion annulations avec remboursement
⏳ Système de litiges
⏳ Notifications temps réel (websocket)

---

## 🚀 Prochaines étapes

### Phase 1 : Stripe Connect (1 semaine)

1. **Onboarding éducateurs**
   - Créer endpoint `/api/educators/stripe-onboarding`
   - Page `/dashboard/educator/bank-account`
   - Connexion compte bancaire via Stripe Connect

2. **PaymentIntent avec capture différée**
   - Autorisation à la réservation
   - Capture réelle au RDV terminé
   - Transfer automatique vers éducateur

### Phase 2 : Factures PDF (3 jours)

1. Génération PDF avec jsPDF
2. Upload vers Supabase Storage
3. Endpoint `/api/invoices/[id]/download`
4. Envoi par email en pièce jointe

### Phase 3 : Annulations & Remboursements (2 jours)

1. Endpoint `/api/appointments/[id]/cancel`
2. Politique : Gratuit >48h, 30% <48h
3. Refund Stripe automatique
4. Emails de confirmation

### Phase 4 : Litiges (3 jours)

1. Bouton "Contester" pour famille
2. Interface admin médiation
3. Workflow résolution
4. Pénalités éducateurs

---

## 📁 Fichiers créés

```
supabase/migrations/
  └─ create_payment_system.sql

app/api/appointments/[id]/
  ├─ accept/route.ts
  ├─ validate-pin/route.ts
  └─ complete/route.ts

components/
  └─ PinCodeModal.tsx

PAYMENT_SYSTEM_README.md
```

---

## 🐛 Debug

### Vérifier qu'un RDV est prêt

```sql
SELECT
  id,
  status,
  pin_code,
  pin_code_validated,
  pin_code_expires_at,
  started_at,
  completed_at
FROM appointments
WHERE id = 'YOUR_APPOINTMENT_ID';
```

### Voir les transactions

```sql
SELECT
  id,
  appointment_id,
  amount_total / 100.0 as amount_euros,
  status,
  created_at
FROM transactions
ORDER BY created_at DESC
LIMIT 10;
```

### Réinitialiser un RDV pour re-tester

```sql
UPDATE appointments
SET
  status = 'confirmed',
  pin_code_validated = false,
  pin_code_attempts = 0,
  pin_locked_until = NULL,
  started_at = NULL,
  completed_at = NULL
WHERE id = 'YOUR_APPOINTMENT_ID';
```

---

## ✅ Checklist production

Avant de déployer en production :

- [ ] Activer Stripe Connect
- [ ] Configurer webhook Stripe
- [ ] Tester flux avec vraies cartes
- [ ] Générer factures PDF conformes
- [ ] Vérifier emails en production
- [ ] Tester annulations
- [ ] Documenter pour équipe support
- [ ] Former éducateurs au code PIN
- [ ] Ajouter analytics (Mixpanel/Amplitude)
- [ ] Tests de charge (10+ RDV simultanés)

---

## 💬 Support

Pour toute question :
- Code : Voir les commentaires dans les fichiers API
- Base de données : Voir `supabase/migrations/create_payment_system.sql`
- UI : Voir `components/PinCodeModal.tsx`

**Système créé le 24/11/2025 par Claude Code** 🤖
