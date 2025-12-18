# Configuration Resend pour l'Envoi d'Emails

Ce guide vous explique comment configurer Resend pour envoyer les emails de vérification DREETS et les notifications.

---

## 🎯 Pourquoi Resend ?

✅ **Simple** : API très facile à utiliser
✅ **Fiable** : Taux de délivrabilité élevé
✅ **Gratuit** : 3,000 emails/mois gratuits
✅ **Rapide** : Configuration en 5 minutes
✅ **Support** : Excellent support technique

---

## 📝 Étape 1 : Créer un Compte Resend

### 1.1 Inscription

1. Allez sur **https://resend.com**
2. Cliquez sur "Sign Up" (ou "Get Started")
3. Inscrivez-vous avec :
   - Votre email professionnel
   - Ou via GitHub
4. Vérifiez votre email
5. Connectez-vous

### 1.2 Vérifier votre Domaine (IMPORTANT)

**Option A : Utiliser votre propre domaine (Recommandé)**

1. Dans le dashboard Resend, allez dans **"Domains"**
2. Cliquez sur **"Add Domain"**
3. Entrez votre domaine : `neuro-care.fr`
4. Resend vous donnera des enregistrements DNS à configurer :

**Enregistrements DNS à ajouter** :

```
Type: TXT
Nom: @
Valeur: v=DKIM1; k=rsa; p=... (copier la valeur fournie)

Type: CNAME
Nom: resend._domainkey
Valeur: resend._domainkey.resend.com

Type: MX
Nom: @
Priorité: 10
Valeur: feedback-smtp.resend.com
```

5. Ajoutez ces enregistrements dans votre gestionnaire DNS (OVH, Cloudflare, etc.)
6. Attendez la vérification (peut prendre jusqu'à 24h, généralement 5-10 min)
7. Une fois vérifié, vous pouvez envoyer depuis `nom@neuro-care.fr`

**Option B : Utiliser le domaine Resend (Pour les tests)**

Si vous voulez tester rapidement :
- Vous pouvez utiliser `onboarding@resend.dev`
- Limité à 100 emails/jour
- Pas recommandé pour la production

---

## 🔑 Étape 2 : Obtenir votre Clé API

1. Dans le dashboard Resend, allez dans **"API Keys"**
2. Cliquez sur **"Create API Key"**
3. Donnez-lui un nom : `Production NeuroCare`
4. Permissions : **Full Access** (ou au minimum "Sending Access")
5. Cliquez sur **"Create"**
6. **COPIEZ LA CLÉ IMMÉDIATEMENT** (elle ne sera plus visible après)
   - Format : `re_xxxxxxxxxxxxxxxxxxxxxx`

⚠️ **IMPORTANT** : Ne partagez JAMAIS cette clé. Elle donne accès complet à votre compte Resend.

---

## ⚙️ Étape 3 : Configurer les Variables d'Environnement

### 3.1 Fichier `.env.local`

Ouvrez (ou créez) le fichier `.env.local` à la racine du projet :

```bash
# Resend Email Service
RESEND_API_KEY=re_VotreCléAPIResend
RESEND_FROM_EMAIL=NeuroCare <verification@neuro-care.fr>

# Admin Email (pour recevoir les copies)
ADMIN_EMAIL=admin@neuro-care.fr

# URL de l'application
NEXT_PUBLIC_APP_URL=https://neuro-care.fr
```

### 3.2 Vérifier le fichier `.gitignore`

Assurez-vous que `.env.local` est bien dans `.gitignore` :

```gitignore
# .gitignore
.env.local
.env.development.local
.env.test.local
.env.production.local
```

---

## 🧪 Étape 4 : Tester l'Envoi d'Emails

### 4.1 Créer une API de Test

Créez le fichier `app/api/test-resend/route.ts` :

```typescript
import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function GET() {
  try {
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({
        error: 'RESEND_API_KEY non configurée'
      }, { status: 500 });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'NeuroCare <onboarding@resend.dev>',
      to: process.env.ADMIN_EMAIL || 'votre-email@example.com',
      subject: 'Test Resend - NeuroCare',
      html: `
        <h1>✅ Resend fonctionne !</h1>
        <p>Ceci est un email de test depuis NeuroCare.</p>
        <p>Si vous recevez cet email, Resend est correctement configuré.</p>
        <hr>
        <p><small>Date: ${new Date().toLocaleString('fr-FR')}</small></p>
      `
    });

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Email envoyé avec succès !',
      data
    });

  } catch (error: any) {
    return NextResponse.json({
      error: error.message
    }, { status: 500 });
  }
}
```

### 4.2 Tester

1. Lancez votre serveur de développement :
```bash
npm run dev
```

2. Ouvrez votre navigateur et allez sur :
```
http://localhost:3000/api/test-resend
```

3. Vérifiez :
   - ✅ Réponse : `{"success": true, ...}`
   - ✅ Email reçu dans votre boîte
   - ✅ Pas de spam

Si ça fonctionne, **Resend est configuré !** 🎉

---

## 📧 Étape 5 : Configuration Emails Spécifiques

### 5.1 Email de Vérification DREETS

Déjà configuré dans `lib/dreets-verification.ts` ✅

### 5.2 Email de Notification Éducateur

Déjà configuré dans `lib/email-notifications.ts` ✅

---

## 🚀 Étape 6 : Passer en Production

### 6.1 Vérifier le Domaine en Production

1. Assurez-vous que votre domaine est vérifié dans Resend
2. Testez l'envoi d'un email en production
3. Vérifiez que les emails n'arrivent pas en spam

### 6.2 Configurer les Variables sur Vercel

Si vous déployez sur Vercel :

1. Allez dans **Settings** > **Environment Variables**
2. Ajoutez :
   ```
   RESEND_API_KEY = re_VotreCléAPIResend
   RESEND_FROM_EMAIL = NeuroCare <verification@neuro-care.fr>
   ADMIN_EMAIL = admin@neuro-care.fr
   NEXT_PUBLIC_APP_URL = https://neuro-care.fr
   ```
3. Redéployez votre application

### 6.3 Monitoring

Dans le dashboard Resend :
- **Logs** : Voir tous les emails envoyés
- **Analytics** : Taux de délivrabilité
- **Webhooks** : Recevoir des notifications (bounces, ouvertures, clics)

---

## 🔧 Dépannage

### Problème : "Invalid API key"

**Solution** :
1. Vérifiez que la clé API est correcte
2. Assurez-vous qu'elle commence par `re_`
3. Vérifiez qu'elle est bien dans `.env.local`
4. Redémarrez le serveur (`npm run dev`)

### Problème : Emails en spam

**Solutions** :
1. Vérifiez que votre domaine est vérifié
2. Ajoutez les enregistrements SPF, DKIM, DMARC
3. Évitez les mots "spam" dans le sujet
4. Utilisez un contenu équilibré texte/images
5. Ne pas envoyer trop d'emails d'un coup

### Problème : "Domain not verified"

**Solution** :
1. Allez dans Resend > Domains
2. Vérifiez les enregistrements DNS
3. Utilisez un outil comme https://mxtoolbox.com pour vérifier
4. Attendez jusqu'à 24h pour la propagation DNS

### Problème : Rate limit dépassé

**Solution** :
- Plan gratuit : 3,000 emails/mois, 100/jour
- Ajoutez un délai entre les envois :
```typescript
await new Promise(resolve => setTimeout(resolve, 1000)); // 1 seconde
```

---

## 💰 Tarification Resend

### Plan Gratuit (Free)
- ✅ 3,000 emails/mois
- ✅ 100 emails/jour
- ✅ 1 domaine vérifié
- ✅ Support par email

### Plan Pro ($20/mois)
- ✅ 50,000 emails/mois
- ✅ 1,000 emails/jour
- ✅ Domaines illimités
- ✅ Support prioritaire
- ✅ Webhooks avancés

**Pour démarrer** : Le plan gratuit est largement suffisant !

---

## 📊 Suivi des Emails

### Dashboard Resend

Vous pouvez voir :
- Nombre d'emails envoyés
- Taux de délivrabilité
- Bounces (emails rejetés)
- Opens (ouvertures)
- Clicks (clics)

### Webhooks (Optionnel)

Pour recevoir des notifications en temps réel :

```typescript
// app/api/webhooks/resend/route.ts
export async function POST(request: Request) {
  const payload = await request.json();

  // Traiter les événements
  switch (payload.type) {
    case 'email.delivered':
      console.log('✅ Email délivré:', payload.data.email_id);
      break;
    case 'email.bounced':
      console.log('❌ Email bounce:', payload.data.email_id);
      break;
  }

  return Response.json({ received: true });
}
```

---

## ✅ Checklist de Vérification

Avant de passer en production :

- [ ] Compte Resend créé
- [ ] Domaine vérifié (enregistrements DNS configurés)
- [ ] Clé API obtenue et stockée en sécurité
- [ ] Variables d'environnement configurées
- [ ] Email de test envoyé et reçu
- [ ] Emails ne vont pas en spam
- [ ] Logs Resend vérifiés
- [ ] Variables configurées sur Vercel (si applicable)
- [ ] Documentation équipe complétée
- [ ] Plan d'urgence en cas de problème

---

## 🆘 Support

**Resend** :
- Documentation : https://resend.com/docs
- Support : support@resend.com
- Discord : https://discord.gg/resend

**Problème avec ce guide** :
- Vérifiez `DIPLOMA_OCR_DREETS.md`
- Contactez l'équipe technique

---

## 📚 Ressources Utiles

- **Documentation Resend** : https://resend.com/docs/send-with-nextjs
- **Vérifier DNS** : https://mxtoolbox.com
- **Tester les emails** : https://www.mail-tester.com
- **SPF/DKIM Generator** : https://easydmarc.com/tools/spf-record-generator

---

**Dernière mise à jour** : 21/11/2025
**Temps d'installation** : ~15 minutes
**Difficulté** : ⭐⭐ (Facile)
