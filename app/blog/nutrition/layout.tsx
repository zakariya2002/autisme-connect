import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Nutrition et TND : alimentation adaptée pour les enfants | NeuroCare',
  description: 'Conseils nutritionnels pour les enfants avec TND, TSA ou TDAH. Gérer la sélectivité alimentaire, les régimes spécifiques et favoriser une alimentation équilibrée.',
  openGraph: {
    title: 'Nutrition et TND : alimentation adaptée pour les enfants',
    description: 'Conseils nutritionnels pour les enfants avec TND. Gérer la sélectivité alimentaire et favoriser une alimentation équilibrée.',
    url: 'https://neuro-care.fr/blog/nutrition',
    type: 'article',
  },
  alternates: {
    canonical: 'https://neuro-care.fr/blog/nutrition',
  },
}

export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
