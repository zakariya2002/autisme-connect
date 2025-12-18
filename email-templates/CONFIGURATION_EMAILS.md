# 📧 Configuration des emails personnalisés avec admin@neuro-care.fr

## Étape 1️⃣ : Vérifier le domaine sur Resend

### 1.1 Accéder à Resend
1. Aller sur https://resend.com/domains
2. Se connecter avec votre compte

### 1.2 Ajouter le domaine neuro-care.fr
1. Cliquer sur "Add Domain"
2. Entrer : `neuro-care.fr`
3. Cliquer sur "Add"

### 1.3 Configurer les enregistrements DNS
Resend va vous donner 3 enregistrements à ajouter. Vous devez les ajouter chez votre hébergeur DNS (OVH, Cloudflare, etc.) :

**Enregistrements à ajouter** :
```
Type: TXT
Name: @
Value: [fourni par Resend]

Type: MX
Name: @
Value: feedback-smtp.eu-west-1.amazonses.com
Priority: 10

Type: TXT
Name: _dmarc
Value: [fourni par Resend]
```

⏳ **Attendre 5-30 minutes** pour la propagation DNS

### 1.4 Vérifier le domaine
Une fois les DNS propagés, Resend vérifiera automatiquement le domaine ✅

---

## Étape 2️⃣ : Configurer Supabase SMTP

### 2.1 Accéder aux paramètres Supabase
1. Aller sur https://supabase.com/dashboard
2. Sélectionner votre projet
3. Aller dans : **Project Settings** (icône roue dentée) → **Auth**

### 2.2 Configurer le SMTP personnalisé
1. Défiler jusqu'à la section **"SMTP Settings"**
2. Activer **"Enable Custom SMTP"** ✅
3. Remplir les champs :

```
Sender name: NeuroCare
Sender email: admin@neuro-care.fr

Host: smtp.resend.com
Port number: 587
Username: resend
Password: re_32KAQ9Hr_7VDuUc8U6nhczWoBQu3Hvf3k
```

4. Cliquer sur **"Save"**

---

## Étape 3️⃣ : Personnaliser le template d'email de confirmation

### 3.1 Accéder aux templates
1. Toujours dans **Project Settings** → **Auth**
2. Défiler jusqu'à **"Email Templates"**
3. Sélectionner **"Confirm signup"**

### 3.2 Copier le template HTML

**Copier tout le contenu du fichier** `email-templates/confirmation-email.html` et le coller dans l'éditeur Supabase.

**Variables Supabase disponibles** :
- `{{ .ConfirmationURL }}` - Lien de confirmation
- `{{ .Email }}` - Email de l'utilisateur
- `{{ .SiteURL }}` - URL du site

### 3.3 Personnaliser le sujet de l'email

**Sujet** : `Confirmez votre adresse email - NeuroCare ✓`

### 3.4 Sauvegarder
Cliquer sur **"Save"**

---

## Étape 4️⃣ : Tester l'envoi d'email

### 4.1 Test depuis votre application
1. Aller sur https://www.neuro-care.fr/auth/signup
2. Créer un nouveau compte avec un email de test
3. Vérifier la réception de l'email

### 4.2 Vérifier dans Resend
1. Aller sur https://resend.com/emails
2. Vérifier que l'email apparaît avec le statut "Delivered" ✅

### 4.3 Points à vérifier
- ✅ Email reçu dans la boîte de réception (pas spam)
- ✅ Expéditeur : "NeuroCare <admin@neuro-care.fr>"
- ✅ Design correct avec les couleurs bleues
- ✅ Bouton de confirmation fonctionne
- ✅ Lien alternatif fonctionne

---

## 📋 Autres templates à personnaliser

Vous pouvez également personnaliser d'autres emails dans Supabase :

### 1. Magic Link (Connexion sans mot de passe)
**Template** : `Magic Link`
**Utilisation** : Connexion rapide par email

### 2. Password Reset (Réinitialisation mot de passe)
**Template** : `Reset Password`
**Utilisation** : Quand un utilisateur oublie son mot de passe

### 3. Email Change (Changement d'email)
**Template** : `Change Email Address`
**Utilisation** : Confirmation du nouveau email

### 4. Invite User (Invitation)
**Template** : `Invite User`
**Utilisation** : Inviter de nouveaux utilisateurs

---

## 🎨 Personnalisation du design

Le template utilise :
- **Couleurs** : Dégradé bleu (#0284c7 → #0369a1)
- **Logo** : Icône de groupe (SVG)
- **Police** : System font (Arial, Helvetica)
- **Responsive** : S'adapte aux mobiles

### Modifier les couleurs
Remplacer dans le HTML :
```html
<!-- Couleur principale -->
#0284c7 → VOTRE_COULEUR

<!-- Couleur secondaire -->
#0369a1 → VOTRE_COULEUR
```

### Ajouter votre logo
Remplacer le SVG par :
```html
<img src="https://www.neuro-care.fr/logo.png" alt="NeuroCare" width="60" height="60" style="border-radius: 12px;">
```

---

## 🔒 Sécurité des emails

### Bonnes pratiques
- ✅ SPF, DKIM, DMARC configurés via Resend
- ✅ TLS/SSL pour le SMTP (port 587)
- ✅ Lien de confirmation unique et temporaire
- ✅ Message de sécurité dans l'email

### Éviter le spam
- ✅ Domaine vérifié sur Resend
- ✅ Enregistrements DNS corrects
- ✅ Pas de mots "spam" dans le contenu
- ✅ Ratio texte/images équilibré

---

## 🆘 Dépannage

### Email non reçu
1. Vérifier dans les **spams**
2. Vérifier le domaine sur Resend (statut "Verified")
3. Vérifier les logs Supabase : Dashboard → Logs → Auth Logs
4. Vérifier les logs Resend : https://resend.com/emails

### Email reçu mais design cassé
1. Tester dans différents clients email (Gmail, Outlook, etc.)
2. Utiliser un validateur HTML email : https://www.htmlemailcheck.com/check/
3. Vérifier que le template est bien copié-collé (pas de caractères manquants)

### Expéditeur incorrect
1. Vérifier le "Sender email" dans Supabase SMTP Settings
2. Vérifier que le domaine est vérifié sur Resend
3. Attendre quelques minutes pour la propagation

---

## 💰 Limites Resend (Plan gratuit)

- **100 emails/jour** gratuits
- **3 000 emails/mois** gratuits
- Au-delà : $0.10 pour 1000 emails

Pour augmenter : Passer au plan payant sur https://resend.com/pricing

---

## ✅ Checklist finale

- [ ] Domaine ajouté sur Resend
- [ ] Enregistrements DNS configurés
- [ ] Domaine vérifié (statut "Verified")
- [ ] SMTP configuré dans Supabase
- [ ] Template HTML copié dans Supabase
- [ ] Sujet de l'email personnalisé
- [ ] Test d'inscription effectué
- [ ] Email reçu avec le bon design
- [ ] Lien de confirmation fonctionne

---

🎉 **Vos emails sont maintenant configurés avec admin@neuro-care.fr !**
