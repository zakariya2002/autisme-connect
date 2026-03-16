import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Devenir éducateur libéral TND — Guide complet 2026',
  description: 'Guide complet pour devenir éducateur spécialisé libéral autisme/TDAH. Statut, charges URSSAF (25,6%), tarifs (50-65 €/h), ACRE, simulateur revenus. Passez de 1 800 € salarié à 4 800 € libéral.',
  keywords: [
    'devenir éducateur libéral',
    'éducateur spécialisé libéral autisme',
    'éducateur libéral TND',
    'tarif éducateur spécialisé libéral',
    'éducateur autisme indépendant',
    'charges URSSAF éducateur libéral',
    'micro-entreprise éducateur spécialisé',
    'revenus éducateur libéral',
    'ACRE éducateur',
    'devenir libéral paramédical',
  ],
  openGraph: {
    title: 'Devenir éducateur libéral TND — De 1 800 € à 4 800 €/mois',
    description: 'Guide 2026 : statut, charges, tarifs, aides ACRE/ARCE. Simulateur de revenus interactif. Lancez-vous en 90 jours.',
    url: 'https://neuro-care.fr/pro/devenir-liberal',
    type: 'article',
  },
  alternates: {
    canonical: 'https://neuro-care.fr/pro/devenir-liberal',
  },
}

export default function DevenirLiberalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children
}
