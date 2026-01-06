import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Simulateur d\'aides financières | NeuroCare',
  description: 'Estimez les aides financières auxquelles vous avez droit pour votre enfant TND. Simulateur gratuit : AEEH, PCH, crédit d\'impôt et autres aides.',
  openGraph: {
    title: 'Simulateur d\'aides financières | NeuroCare',
    description: 'Estimez gratuitement les aides financières pour votre enfant TND : AEEH, PCH, crédit d\'impôt.',
    url: 'https://neuro-care.fr/familles/simulateur-aides',
  },
  alternates: {
    canonical: 'https://neuro-care.fr/familles/simulateur-aides',
  },
}

export default function SimulateurAidesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
