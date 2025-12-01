# Autisme Connect - Besoin en Fonds de Roulement (BFR)

**Date :** 30 novembre 2024
**Document :** Analyse du BFR

---

## Qu'est-ce que le BFR ?

Le **Besoin en Fonds de Roulement** représente l'argent nécessaire pour financer le décalage entre :
- Le moment où vous payez vos charges
- Le moment où vous encaissez vos revenus

**Formule :**
```
BFR = Créances clients + Stocks - Dettes fournisseurs
```

---

## Analyse du BFR pour Autisme Connect

### 1. Créances clients (ce qu'on vous doit)

| Élément | Délai d'encaissement | Montant en attente |
|---------|---------------------|-------------------|
| Abonnements éducateurs | Immédiat (Stripe) | 0€ |
| Commissions RDV | Immédiat (Stripe) | 0€ |
| Délai virement Stripe | 2-7 jours | ~1 semaine de CA |

**Créances moyennes :** ~500€ à 2 000€ (selon phase)

### 2. Stocks

| Élément | Valeur |
|---------|--------|
| Produits physiques | 0€ |
| Matières premières | 0€ |
| En-cours | 0€ |

**Stock total : 0€** (activité 100% digitale)

### 3. Dettes fournisseurs (ce que vous devez)

| Fournisseur | Montant/mois | Délai paiement |
|-------------|--------------|----------------|
| Vercel | 20-50€ | Prélèvement mensuel |
| Supabase | 25-75€ | Prélèvement mensuel |
| Google Workspace | 5€ | Prélèvement mensuel |
| Marketing (Ads) | 100-500€ | Prélèvement immédiat |
| Freelances | 500-2600€ | Paiement fin de mois |

**Dettes fournisseurs moyennes :** ~500€ à 1 500€

---

## Calcul du BFR par phase

### Phase 1 : Lancement (Mois 1-6)

| Élément | Montant |
|---------|---------|
| Créances clients (1 sem CA) | +250€ |
| Stocks | 0€ |
| Dettes fournisseurs | -200€ |
| **BFR** | **~50€** |

### Phase 2 : Croissance (Mois 7-12)

| Élément | Montant |
|---------|---------|
| Créances clients (1 sem CA) | +850€ |
| Stocks | 0€ |
| Dettes fournisseurs | -600€ |
| **BFR** | **~250€** |

### Phase 3 : Accélération (Mois 13-18)

| Élément | Montant |
|---------|---------|
| Créances clients (1 sem CA) | +2 300€ |
| Stocks | 0€ |
| Dettes fournisseurs | -1 500€ |
| **BFR** | **~800€** |

---

## Synthèse du BFR sur 18 mois

| Phase | CA mensuel | BFR | BFR en jours de CA |
|-------|------------|-----|-------------------|
| Mois 1-6 | ~1 000€ | ~50€ | 1,5 jour |
| Mois 7-12 | ~3 700€ | ~250€ | 2 jours |
| Mois 13-18 | ~9 300€ | ~800€ | 2,5 jours |

---

## Comparaison avec d'autres modèles économiques

| Type d'activité | BFR typique | Autisme Connect |
|-----------------|-------------|-----------------|
| Commerce de détail | 60-90 jours de CA | **2 jours** |
| Prestation B2B | 45-60 jours de CA | **2 jours** |
| Restaurant | 15-30 jours de CA | **2 jours** |
| E-commerce | 30-45 jours de CA | **2 jours** |
| **SaaS B2C (vous)** | **0-5 jours de CA** | **2 jours** |

---

## Avantages du modèle Autisme Connect

### 1. Encaissement immédiat
- Paiement Stripe instantané
- Pas d'attente de règlement client
- Pas de factures impayées

### 2. Aucun stock
- Pas d'immobilisation de trésorerie
- Pas de risque d'invendus
- Pas de coût de stockage

### 3. Charges prévisibles
- Abonnements mensuels fixes
- Pas de gros investissements ponctuels
- Scalabilité sans surcoût proportionnel

---

## Trésorerie nécessaire au démarrage

| Poste | Montant | Justification |
|-------|---------|---------------|
| BFR initial | 50€ | Décalage encaissement/paiement |
| Réserve de sécurité | 500€ | 1 mois de charges mini |
| Marketing lancement | 200€ | Premières campagnes |
| **Total recommandé** | **750€** | Trésorerie de départ |

---

## Évolution du BFR avec la croissance

```
BFR (€)
│
800 │                              ████
    │                         █████
    │                    █████
250 │               █████
    │          █████
 50 │     █████
    │█████
    └─────────────────────────────────── Mois
         3     6     9    12    15   18
```

**Constat :** Le BFR reste très faible et croît moins vite que le CA.

---

## Financement du BFR

### Option 1 : Autofinancement (recommandé)
- BFR couvert par les premiers encaissements
- Pas besoin d'emprunt
- Pas de frais financiers

### Option 2 : Apport personnel
- 750€ suffisent pour démarrer sereinement
- Récupérable dès le mois 2-3

### Option 3 : Emprunt bancaire
- **Non nécessaire** pour ce projet
- BFR trop faible pour justifier un emprunt

---

## Indicateurs clés

| Indicateur | Valeur | Interprétation |
|------------|--------|----------------|
| BFR en jours de CA | 2 jours | Excellent |
| Délai encaissement | 2-7 jours | Très rapide |
| Délai paiement fournisseurs | 0-30 jours | Standard |
| Ratio BFR/CA annuel | <1% | Optimal |

---

## Conclusion

**Autisme Connect bénéficie d'un BFR quasi nul** grâce à :

1. **Modèle SaaS** : Paiement immédiat par carte bancaire
2. **Activité digitale** : Aucun stock à financer
3. **Charges légères** : Pas de gros décalages de trésorerie

### Recommandation

- **Trésorerie de démarrage :** 750€ suffisent
- **Pas besoin d'emprunt** pour le BFR
- **Autofinancement** dès les premiers clients

Le modèle économique est **sain et peu risqué** du point de vue de la trésorerie.

---

*Document généré le 30 novembre 2024*
*Autisme Connect - Analyse du Besoin en Fonds de Roulement*
