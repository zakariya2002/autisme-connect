# Contacts DREETS par Région

Ce document liste les contacts des DREETS (Directions régionales de l'économie, de l'emploi, du travail et des solidarités) pour la vérification des diplômes ME/ES.

## 🔍 Comment trouver les emails DREETS

Les emails spécifiques ne sont pas tous publics. Voici comment les obtenir :

### Méthode 1 : Annuaire Service Public (Recommandé)
1. Allez sur https://lannuaire.service-public.fr
2. Recherchez "DREETS" + votre région
3. Vous trouverez email, téléphone et adresse

### Méthode 2 : Sites régionaux DREETS
1. Consultez le site de votre région (voir ci-dessous)
2. Section "Contact" ou "Nous contacter"
3. Cherchez le service "Formation / Certification" ou "Diplômes"

### Méthode 3 : Appel téléphonique (Plus rapide)
1. Appelez la DREETS de votre région
2. Demandez : "Service vérification diplômes éducateurs spécialisés"
3. Notez l'email de contact

---

## 📋 Liste des DREETS par Région

### 🗺️ France Métropolitaine

#### Auvergne-Rhône-Alpes
- **Site** : http://auvergne-rhone-alpes.dreets.gouv.fr
- **Email général** : dreets-ara@dreets.gouv.fr
- **Email diplômes** : À contacter via le site
- **Tél** : 04 72 68 29 00 (Lyon)
- **Service certification** : Voir contacts sur le site régional

#### Bourgogne-Franche-Comté
- **Site** : http://bourgogne-franche-comte.dreets.gouv.fr
- **Email** : dreets-bfc@dreets.gouv.fr
- **Directeur régional** : simon-pierre.eury@dreets.gouv.fr
- **Tél** : 03 81 25 52 00 (Besançon)

#### Bretagne
- **Site** : http://bretagne.dreets.gouv.fr
- **Email** : dreets-bretagne@dreets.gouv.fr
- **Tél** : 02 99 12 51 00 (Rennes)

#### Centre-Val de Loire
- **Site** : http://centre-val-de-loire.dreets.gouv.fr
- **Email** : dreets-cvl@dreets.gouv.fr
- **Tél** : 02 38 77 42 00 (Orléans)

#### Corse
- **Site** : http://corse.dreets.gouv.fr
- **Email** : dreets-corse@dreets.gouv.fr
- **Tél** : 04 95 51 11 11 (Ajaccio)

#### Grand Est
- **Site** : http://grand-est.dreets.gouv.fr
- **Email** : dreets-ge@dreets.gouv.fr
- **Email FSE** : dreets-ge.fseplus@dreets.gouv.fr
- **Tél** : 03 88 76 76 76 (Strasbourg)

#### Hauts-de-France
- **Site** : http://hauts-de-france.dreets.gouv.fr
- **Email direction** : dreets-hdf.direction@dreets.gouv.fr
- **Email général** : dreets-hdf@dreets.gouv.fr
- **Tél** : 03 20 96 42 00 (Lille)

#### Île-de-France (DRIEETS)
- **Site** : http://idf.drieets.gouv.fr
- **Email** : drieets-idf@drieets.gouv.fr
- **Contact certification** : helena.ossipoff@drieets.gouv.fr
- **Tél** : 01 70 96 11 00 (Paris)
- **Note** : Appelée DRIEETS en Île-de-France (avec un "I" pour Interministérielle)

#### Normandie
- **Site** : http://normandie.dreets.gouv.fr
- **Email** : dreets-normandie@dreets.gouv.fr
- **Tél** : 02 32 18 15 00 (Rouen)

#### Nouvelle-Aquitaine
- **Site** : http://nouvelle-aquitaine.dreets.gouv.fr
- **Email** : dreets-na@dreets.gouv.fr
- **Contacts certification** :
  - Bordeaux : Hélène Massol - 05 54 68 99 39
  - Limoges : Nathalie Vignau - 06 61 83 88 01
  - Poitiers : Nathalie Savigny - 05 49 50 10 35
- **Messagerie** : Formation Certification (via le site)

#### Occitanie
- **Site** : http://occitanie.dreets.gouv.fr
- **Email** : dreets-occitanie@dreets.gouv.fr
- **Tél** : 04 34 45 70 00 (Montpellier)

#### Pays de la Loire
- **Site** : http://pays-de-la-loire.dreets.gouv.fr
- **Email** : dreets-pdl@dreets.gouv.fr
- **Tél** : 02 40 12 35 00 (Nantes)

#### Provence-Alpes-Côte d'Azur
- **Site** : http://paca.dreets.gouv.fr
- **Email** : dreets-paca@dreets.gouv.fr
- **Tél** : 04 91 57 96 00 (Marseille)

---

### 🌴 Territoires d'Outre-Mer (DEETS)

#### Guadeloupe
- **Site** : http://guadeloupe.deets.gouv.fr
- **Email** : deets-guadeloupe@deets.gouv.fr

#### Guyane
- **Site** : http://guyane.deets.gouv.fr
- **Email** : deets-guyane@deets.gouv.fr

#### La Réunion
- **Site** : http://reunion.deets.gouv.fr
- **Email** : deets-reunion@deets.gouv.fr

#### Martinique
- **Site** : http://martinique.deets.gouv.fr
- **Email** : deets-martinique@deets.gouv.fr

#### Mayotte
- **Site** : http://mayotte.deets.gouv.fr
- **Email** : deets-mayotte@deets.gouv.fr

---

## 📧 Format d'Email pour Vérification de Diplômes

Lorsque vous contactez une DREETS, utilisez ce format :

**Objet** : Demande de vérification de diplôme ME/ES - [NOM Prénom]

**Corps** :
```
Madame, Monsieur,

Dans le cadre de notre plateforme de mise en relation familles-éducateurs,
nous sollicitons votre expertise pour vérifier l'authenticité du diplôme
d'un éducateur.

Informations :
- Nom : [NOM]
- Prénom : [PRÉNOM]
- Numéro de diplôme : [NUMÉRO]
- Date de délivrance : [DATE]

Diplôme en pièce jointe.

Merci de nous confirmer la validité de ce diplôme.

Cordialement,
Autisme Connect
```

---

## ⚡ Actions Rapides

### Pour mettre à jour le code

Éditez `lib/dreets-verification.ts` et remplacez les emails :

```typescript
const DREETS_EMAILS: { [region: string]: string } = {
  'Île-de-France': 'drieets-idf@drieets.gouv.fr',
  'Auvergne-Rhône-Alpes': 'dreets-ara@dreets.gouv.fr',
  'Provence-Alpes-Côte d\'Azur': 'dreets-paca@dreets.gouv.fr',
  'Nouvelle-Aquitaine': 'dreets-na@dreets.gouv.fr',
  'Occitanie': 'dreets-occitanie@dreets.gouv.fr',
  'Hauts-de-France': 'dreets-hdf@dreets.gouv.fr',
  'Grand Est': 'dreets-ge@dreets.gouv.fr',
  'Bretagne': 'dreets-bretagne@dreets.gouv.fr',
  'Pays de la Loire': 'dreets-pdl@dreets.gouv.fr',
  'Normandie': 'dreets-normandie@dreets.gouv.fr',
  'Bourgogne-Franche-Comté': 'dreets-bfc@dreets.gouv.fr',
  'Centre-Val de Loire': 'dreets-cvl@dreets.gouv.fr',
  'Corse': 'dreets-corse@dreets.gouv.fr',
};
```

### Test de contact

Avant d'envoyer en masse, testez avec UN email de diplôme et vérifiez :
1. L'email est bien reçu par la DREETS
2. La DREETS peut ouvrir la pièce jointe
3. Le format convient à la DREETS

---

## ⚠️ Important

- Les emails génériques (dreets-region@dreets.gouv.fr) peuvent ne pas être surveillés quotidiennement
- Pour un traitement plus rapide, contactez le service "Formation/Certification" spécifique
- Les DREETS peuvent prendre 5-10 jours ouvrés pour répondre
- Certaines régions préfèrent le téléphone pour les demandes urgentes

---

## 📞 Numéros Nationaux

**Plateforme nationale d'information** : 3939 (Service Public)
**Ministère du Travail** : 01 44 38 38 38

---

**Dernière mise à jour** : 21/11/2025
**Source** : Sites officiels DREETS et Service Public
