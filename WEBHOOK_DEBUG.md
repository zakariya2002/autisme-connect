# 🔍 Vérification Webhook Stripe

## Problème
Le webhook Stripe ne se déclenche pas automatiquement lors de la création d'un abonnement.

## Étapes de vérification

### 1. Vérifier que le webhook est configuré sur Stripe

1. Allez sur https://dashboard.stripe.com/webhooks
2. Vérifiez qu'il existe un webhook pointant vers votre site :
   ```
   https://www.autismeconnect.fr/api/webhooks/stripe
   ```

### 2. Vérifier les événements écoutés

Le webhook doit écouter ces événements :
- ✅ `checkout.session.completed`
- ✅ `customer.subscription.created`
- ✅ `customer.subscription.updated`
- ✅ `customer.subscription.deleted`
- ✅ `invoice.payment_succeeded`
- ✅ `invoice.payment_failed`

### 3. Vérifier le webhook secret

1. Sur Stripe Dashboard → Webhooks
2. Cliquez sur votre webhook
3. Cliquez sur "Reveal" à côté de "Signing secret"
4. Copiez la valeur (commence par `whsec_...`)
5. Comparez avec la variable `STRIPE_WEBHOOK_SECRET` sur Vercel

### 4. Tester le webhook manuellement

Sur la page du webhook dans Stripe :
1. Cliquez sur l'onglet "Send test webhook"
2. Sélectionnez `customer.subscription.created`
3. Cliquez sur "Send test webhook"
4. Regardez la réponse (doit être 200 OK)

### 5. Voir l'historique des webhooks

1. Sur Stripe Dashboard → Webhooks
2. Cliquez sur votre webhook
3. Allez dans l'onglet "Events"
4. Regardez s'il y a des événements récents
5. Si erreur, cliquez dessus pour voir les détails

## Solutions si le webhook n'existe pas

### Option A : Créer le webhook manuellement

1. Allez sur https://dashboard.stripe.com/webhooks
2. Cliquez sur "+ Add endpoint"
3. Endpoint URL : `https://www.autismeconnect.fr/api/webhooks/stripe`
4. Description : `Autisme Connect - Production`
5. Sélectionnez "Latest API version"
6. Dans "Select events to listen to", ajoutez :
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
7. Cliquez sur "Add endpoint"
8. Copiez le **Signing secret** (whsec_...)
9. Allez sur Vercel → Projet → Settings → Environment Variables
10. Modifiez `STRIPE_WEBHOOK_SECRET` avec la nouvelle valeur
11. Redéployez l'application

### Option B : Utiliser Stripe CLI en local (pour tester)

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Ceci vous donnera un webhook secret temporaire pour tester en local.

## Vérification des logs

### Sur Vercel

1. Allez sur https://vercel.com/dashboard
2. Sélectionnez votre projet
3. Allez dans "Deployments" → Cliquez sur le dernier
4. Allez dans "Functions" ou "Runtime Logs"
5. Cherchez des logs avec "🔔 Webhook Stripe reçu"

### Sur Stripe

1. Dashboard → Webhooks → Votre webhook
2. Onglet "Events"
3. Cliquez sur un événement récent
4. Regardez la "Response" (doit être 200)

## Test complet du flux

1. Créez un nouvel abonnement de test :
   ```
   https://www.autismeconnect.fr/pricing
   ```

2. Complétez le paiement avec une carte de test :
   ```
   4242 4242 4242 4242
   Date : n'importe quelle date future
   CVC : n'importe quel 3 chiffres
   ```

3. Vérifiez immédiatement sur Stripe :
   - Dashboard → Webhooks → Events
   - Devrait voir `checkout.session.completed`

4. Vérifiez sur Supabase :
   - Table `subscriptions`
   - Devrait voir la nouvelle ligne

## Si rien ne fonctionne

Utilisez la **synchronisation manuelle** :

1. Cliquez sur le bouton "Synchroniser" sur le dashboard
2. Ou appelez directement l'API :
   ```javascript
   fetch('/api/sync-subscription', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ educatorId: 'VOTRE_ID' })
   })
   ```

## Checklist

- [ ] Webhook configuré sur Stripe
- [ ] URL correcte : `https://www.autismeconnect.fr/api/webhooks/stripe`
- [ ] Événements sélectionnés (6 événements)
- [ ] Webhook secret copié dans Vercel
- [ ] Application redéployée après modification
- [ ] Test webhook réussi (200 OK)
- [ ] Logs visibles sur Vercel
