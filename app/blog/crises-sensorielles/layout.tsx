import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Gérer les crises sensorielles : techniques et outils pratiques | NeuroCare',
  description: 'Découvrez comment gérer les crises sensorielles chez les enfants TSA, TDAH et TND. Techniques d\'apaisement, outils pratiques et conseils pour les parents.',
  openGraph: {
    title: 'Gérer les crises sensorielles : techniques et outils pratiques',
    description: 'Découvrez comment gérer les crises sensorielles chez les enfants TSA, TDAH et TND. Techniques d\'apaisement et conseils pour les parents.',
    url: 'https://neuro-care.fr/blog/crises-sensorielles',
    type: 'article',
    images: [
      {
        url: 'https://neuro-care.fr/images/articles/crises-sensorielles.jpg',
        width: 1200,
        height: 630,
        alt: 'Gérer les crises sensorielles',
      },
    ],
  },
  alternates: {
    canonical: 'https://neuro-care.fr/blog/crises-sensorielles',
  },
}

export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
