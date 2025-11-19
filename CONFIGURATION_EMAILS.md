# 📧 Configuration du Système d'Emails Automatiques

## ✅ Ce qui a été créé

1. **Script SQL** : `supabase-certification-email-notifications.sql`
   - Table `email_notifications` pour stocker les emails en attente
   - Trigger automatique qui crée un email quand le statut change
   - Fonctions pour marquer les emails comme envoyés/échoués

2. **API Route** : `/api/send-certification-emails`
   - Récupère les emails en attente
   - Les envoie via Resend (ou SMTP)
   - Marque les emails comme envoyés

---

## 🚀 Configuration (3 options)

### **Option 1 : Resend (RECOMMANDÉ - 100% GRATUIT)**

**Avantages :**
- ✅ 3,000 emails/mois GRATUITS
- ✅ Simple à configurer
- ✅ Excellent deliverability
- ✅ Pas de serveur SMTP à gérer

**Étapes :**

1. **Créer un compte Resend**
   - Aller sur https://resend.com
   - S'inscrire gratuitement
   - Vérifier votre email

2. **Obtenir votre clé API**
   - Dashboard → API Keys
   - Créer une nouvelle clé
   - Copier la clé

3. **Ajouter à `.env.local`**
   ```bash
   RESEND_API_KEY=re_xxxxxxxxxxxxxxxxx
   ```

4. **Configurer le domaine d'envoi (optionnel)**
   - Si vous avez un domaine : suivre les instructions Resend pour ajouter les DNS
   - Sinon : utiliser `onboarding@resend.dev` (limité mais gratuit)

---

### **Option 2 : SMTP (Gmail, Outlook, etc.)**

**Si vous avez déjà un compte email professionnel :**

1. **Installer nodemailer**
   ```bash
   npm install nodemailer
   ```

2. **Ajouter à `.env.local`**
   ```bash
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=votre-email@gmail.com
   SMTP_PASSWORD=votre-mot-de-passe-app
   ```

   > **Note Gmail** : Utilisez un "mot de passe d'application", pas votre mot de passe principal

3. **Modifier l'API route** (décommenter la section nodemailer)

---

### **Option 3 : Mode Développement (GRATUIT)**

**Pour tester sans envoyer d'emails :**

- Les emails seront affichés dans la console
- Automatiquement marqués comme "envoyés" en dev
- **Aucune configuration nécessaire !**

---

## ⚙️ Automatisation de l'Envoi

### **Méthode 1 : Cron Job (Recommandé pour production)**

Utiliser un service gratuit comme **Cron-job.org** ou **EasyCron** :

1. Créer un compte sur https://cron-job.org (gratuit)
2. Ajouter un nouveau cron job :
   - URL : `https://votre-domaine.com/api/send-certification-emails`
   - Fréquence : Toutes les 5 minutes (ou selon vos besoins)
   - Méthode : POST

**Alternative : Vercel Cron** (si vous déployez sur Vercel)
```json
// vercel.json
{
  "crons": [{
    "path": "/api/send-certification-emails",
    "schedule": "*/5 * * * *"
  }]
}
```

---

### **Méthode 2 : Trigger Supabase Webhook**

Utiliser un webhook Supabase pour déclencher l'envoi immédiatement :

1. Dans Supabase Dashboard → Database → Webhooks
2. Créer un nouveau webhook :
   - Table : `email_notifications`
   - Events : INSERT
   - URL : `https://votre-domaine.com/api/send-certification-emails`
   - Méthode : POST

---

### **Méthode 3 : Manuel (pour démarrer)**

Appeler l'endpoint manuellement quand vous validez une certification :

```bash
curl -X POST https://localhost:3000/api/send-certification-emails
```

Ou via le navigateur :
```
http://localhost:3000/api/send-certification-emails
```

---

## 📝 Workflow Complet

### **1. Éducateur upload son diplôme**
```
Éducateur → Upload DEES → Status: "pending"
```

### **2. Admin vérifie et approuve**
```sql
UPDATE certifications
SET verification_status = 'document_verified',
    verification_date = NOW()
WHERE id = 'xxx';
```

### **3. Trigger SQL crée automatiquement l'email**
```
Trigger détecte le changement → Insère dans email_notifications
```

### **4. Cron job envoie l'email**
```
Toutes les 5 min → API /send-certification-emails
→ Récupère les emails pending
→ Envoie via Resend
→ Marque comme "sent"
```

### **5. Éducateur reçoit l'email**
```
📧 "✅ Votre certification a été vérifiée !"
```

---

## 📋 Templates d'Emails

### **Email de vérification (document_verified)**
```
Sujet: ✅ Votre certification a été vérifiée - Autisme Connect

Bonjour [Prénom] [Nom],

Bonne nouvelle ! Votre certification a été vérifiée avec succès.

📜 Certification : Diplôme d'État d'Éducateur Spécialisé
🏛️ Organisme : IRTS Paris Île-de-France
✅ Statut : Document vérifié

Votre certification est maintenant visible sur votre profil public avec un badge "Vérifié".

Les familles pourront voir cette certification et auront davantage confiance en vos qualifications.

Merci de votre confiance,
L'équipe Autisme Connect
```

### **Email de confirmation officielle (officially_confirmed)**
```
Sujet: ⭐ Votre certification a été officiellement confirmée - Autisme Connect

Bonjour [Prénom] [Nom],

Excellente nouvelle ! Votre certification a été officiellement confirmée.

📜 Certification : DEES
⭐ Statut : Certification officiellement confirmée

Votre diplôme a été vérifié auprès de la DREETS.

Cette certification est affichée avec un badge "Certifié Officiellement" (étoile bleue).

Félicitations !
L'équipe Autisme Connect
```

### **Email de rejet (rejected)**
```
Sujet: ⚠️ Votre certification nécessite une révision - Autisme Connect

Bonjour [Prénom] [Nom],

Nous vous informons que la certification soumise n'a pas pu être validée.

📜 Certification : DEES
❌ Statut : Non validée

Raison : Le document est illisible / Les informations ne correspondent pas / etc.

Que faire ?
1. Vérifiez la qualité du document
2. Assurez-vous que toutes les infos sont visibles
3. Uploadez un nouveau document

Support : support@autisme-connect.fr

Cordialement,
L'équipe Autisme Connect
```

---

## 🧪 Tests

### **Tester le système complet :**

1. **Exécuter le script SQL**
   ```sql
   -- Dans Supabase SQL Editor
   -- Copier-coller supabase-certification-email-notifications.sql
   ```

2. **Créer une certification de test**
   ```sql
   INSERT INTO certifications (educator_id, name, type, verification_status)
   VALUES ('xxx', 'Test DEES', 'DEES', 'pending');
   ```

3. **Changer le statut** (pour déclencher l'email)
   ```sql
   UPDATE certifications
   SET verification_status = 'document_verified'
   WHERE name = 'Test DEES';
   ```

4. **Vérifier l'email créé**
   ```sql
   SELECT * FROM pending_email_notifications;
   ```

5. **Envoyer les emails**
   ```bash
   curl -X POST http://localhost:3000/api/send-certification-emails
   ```

6. **Vérifier l'envoi**
   ```sql
   SELECT * FROM email_notifications WHERE status = 'sent';
   ```

---

## 💰 Coûts

| Service | Gratuit | Payant |
|---------|---------|--------|
| **Resend** | 3,000 emails/mois | $20/mois pour 50k emails |
| **Cron-job.org** | 1 job gratuit | $4.99/mois illimité |
| **Supabase** | Inclus | - |
| **SMTP Gmail** | 500 emails/jour | - |

**Total pour démarrer : 0€/mois** 🎉

---

## 🔧 Variables d'Environnement

Ajouter à `.env.local` :

```bash
# Requis (déjà présent normalement)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Email - Choisir UNE option

# Option 1: Resend (recommandé)
RESEND_API_KEY=re_xxxxxxxxx

# Option 2: SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Option 3: Rien (mode dev - logs uniquement)
```

---

## ✅ Checklist d'Installation

- [ ] Exécuter `supabase-certification-email-notifications.sql` dans Supabase
- [ ] Choisir un service d'envoi (Resend / SMTP / Dev)
- [ ] Ajouter les variables d'environnement dans `.env.local`
- [ ] Redémarrer le serveur Next.js (`npm run dev`)
- [ ] Tester avec une certification de test
- [ ] Configurer le cron job (ou webhook) pour l'automatisation
- [ ] Tester en production

---

## 📞 Support

Si vous rencontrez un problème :
1. Vérifier les logs dans la console Next.js
2. Vérifier la table `email_notifications` dans Supabase
3. Tester l'endpoint manuellement : `/api/send-certification-emails`

---

**Tout est prêt ! Il suffit juste de choisir votre méthode d'envoi préférée** 🚀
