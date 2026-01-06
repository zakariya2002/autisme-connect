import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tarifs Professionnels | NeuroCare',
  description: 'Découvrez nos offres pour les professionnels du neurodéveloppement. Offre Découverte gratuite ou Pro à 29€/mois. Développez votre activité avec NeuroCare.',
  openGraph: {
    title: 'Tarifs Professionnels | NeuroCare',
    description: 'Nos offres pour les professionnels : Découverte gratuite ou Pro à 29€/mois.',
    url: 'https://neuro-care.fr/pro/pricing',
  },
  alternates: {
    canonical: 'https://neuro-care.fr/pro/pricing',
  },
}

export default function ProPricingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
