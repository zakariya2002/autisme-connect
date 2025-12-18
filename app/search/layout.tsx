import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Trouver un professionnel spécialisé | NeuroCare',
  description: 'Recherchez et trouvez un éducateur spécialisé en autisme près de chez vous. Filtrez par localisation, certifications (ABA, TEACCH, PECS) et disponibilités. 100% gratuit pour les familles.',
  openGraph: {
    title: 'Trouver un professionnel spécialisé | NeuroCare',
    description: 'Recherchez et trouvez un éducateur spécialisé en autisme près de chez vous. Filtrez par localisation, certifications et disponibilités.',
    url: 'https://www.neuro-care.fr/search',
  },
  alternates: {
    canonical: '/search',
  },
}

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
