import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Aides financières pour les familles TND | NeuroCare',
  description: 'Découvrez toutes les aides financières disponibles pour les familles d\'enfants TND, TSA et TDAH : AEEH, PCH, crédit d\'impôt, mutuelles et aides locales.',
  openGraph: {
    title: 'Aides financières pour les familles TND | NeuroCare',
    description: 'Guide complet des aides financières : AEEH, PCH, crédit d\'impôt pour les familles d\'enfants TND.',
    url: 'https://neuro-care.fr/familles/aides-financieres',
  },
  alternates: {
    canonical: 'https://neuro-care.fr/familles/aides-financieres',
  },
}

export default function AidesFinancieresLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
