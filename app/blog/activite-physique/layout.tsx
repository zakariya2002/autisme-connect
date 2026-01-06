import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Activité physique et TND : bienfaits et sports adaptés | NeuroCare',
  description: 'Les bienfaits de l\'activité physique pour les enfants avec TND, TSA ou TDAH. Quels sports choisir et comment adapter la pratique aux besoins de votre enfant.',
  openGraph: {
    title: 'Activité physique et TND : bienfaits et sports adaptés',
    description: 'Les bienfaits de l\'activité physique pour les enfants TND. Quels sports choisir et comment les adapter.',
    url: 'https://neuro-care.fr/blog/activite-physique',
    type: 'article',
  },
  alternates: {
    canonical: 'https://neuro-care.fr/blog/activite-physique',
  },
}

export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
