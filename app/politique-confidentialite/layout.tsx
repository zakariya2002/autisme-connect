import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Politique de Confidentialité | NeuroCare',
  description: 'Politique de confidentialité de NeuroCare. Découvrez comment nous collectons, utilisons et protégeons vos données personnelles conformément au RGPD.',
  openGraph: {
    title: 'Politique de Confidentialité | NeuroCare',
    description: 'Politique de confidentialité de NeuroCare. Protection de vos données personnelles conformément au RGPD.',
    url: 'https://neuro-care.fr/politique-confidentialite',
  },
  alternates: {
    canonical: 'https://neuro-care.fr/politique-confidentialite',
  },
}

export default function PolitiqueConfidentialiteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
