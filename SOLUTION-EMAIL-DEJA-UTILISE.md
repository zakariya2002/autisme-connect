# 🔧 Solution : Email Déjà Utilisé

## Erreur : "A user with this email address has already been registered"

Vous voyez cette erreur car cet email existe déjà dans Supabase.

---

## ✅ Solution en 3 Étapes

### **Étape 1 : Aller dans Supabase SQL Editor**

1. Ouvrez https://supabase.com
2. Sélectionnez votre projet
3. Cliquez sur **SQL Editor** dans le menu de gauche
4. Cliquez sur **New query**

### **Étape 2 : Copier le Script de Nettoyage**

Ouvrez le fichier `nettoyage-comptes-test.sql` et copiez tout son contenu.

Ou copiez directement ce code :

```sql
-- Supprimer tous les profils et utilisateurs de test
DELETE FROM certifications;
DELETE FROM availability_slots;
DELETE FROM bookings;
DELETE FROM messages;
DELETE FROM conversations;
DELETE FROM reviews;
DELETE FROM educator_profiles;
DELETE FROM family_profiles;
DELETE FROM auth.users;

-- Vérifier que tout est vide
SELECT 'Utilisateurs restants' as "Type", COUNT(*) as "Nombre" FROM auth.users
UNION ALL
SELECT 'Profils éducateurs', COUNT(*) FROM educator_profiles
UNION ALL
SELECT 'Profils familles', COUNT(*) FROM family_profiles;
```

### **Étape 3 : Exécuter le Script**

1. Collez le code dans l'éditeur SQL
2. Cliquez sur **Run** (ou Ctrl + Enter)
3. Vérifiez que les résultats montrent `0` partout

---

## 🎉 Terminé !

Maintenant retournez sur **http://localhost:3000/signup** et créez votre compte.

L'email devrait fonctionner maintenant !

---

## 💡 Alternative : Utiliser un Autre Email

Si vous ne voulez pas supprimer les comptes existants, utilisez simplement un autre email pour tester :

- test1@example.com
- test2@example.com
- test3@example.com
- etc.

---

## 🔒 Pour Supprimer UN SEUL Utilisateur

Si vous voulez juste supprimer un utilisateur spécifique :

1. Dans Supabase, allez dans **Authentication** → **Users**
2. Trouvez l'utilisateur
3. Cliquez sur les **...** à droite
4. Sélectionnez **Delete user**
5. Confirmez

⚠️ **Note** : Cela ne supprime que l'utilisateur, pas son profil. Il faut aussi supprimer le profil dans **Table Editor**.

---

## 📞 Toujours Bloqué ?

Si le problème persiste, vérifiez :

1. Que vous avez bien désactivé RLS (voir GUIDE-INSCRIPTION.md)
2. Que la confirmation d'email est désactivée dans Supabase
3. Que le serveur est bien démarré (http://localhost:3000)
