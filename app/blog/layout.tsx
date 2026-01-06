import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blog NeuroCare | Conseils TND, TSA et accompagnement',
  description: 'Articles et conseils pour accompagner les enfants avec troubles du neurodéveloppement (TND, TSA, TDAH). Guides pratiques, témoignages et ressources pour les familles.',
  openGraph: {
    title: 'Blog NeuroCare | Conseils TND, TSA et accompagnement',
    description: 'Articles et conseils pour accompagner les enfants avec troubles du neurodéveloppement. Guides pratiques et ressources pour les familles.',
    url: 'https://neuro-care.fr/blog',
    type: 'website',
  },
  alternates: {
    canonical: 'https://neuro-care.fr/blog',
  },
}

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
