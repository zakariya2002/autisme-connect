import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tarifs Éducateurs | NeuroCare',
  description: 'Découvrez nos offres pour les éducateurs spécialisés. Offre découverte gratuite ou offre Pro à 29€/mois. Développez votre activité et trouvez de nouvelles familles.',
  openGraph: {
    title: 'Tarifs Éducateurs | NeuroCare',
    description: 'Découvrez nos offres pour les éducateurs spécialisés. Offre découverte gratuite ou offre Pro à 29€/mois.',
    url: 'https://neuro-care.fr/pricing',
  },
  alternates: {
    canonical: 'https://neuro-care.fr/pricing',
  },
}

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
