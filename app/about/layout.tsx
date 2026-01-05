import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Qui sommes-nous ? | NeuroCare',
  description: 'Découvrez l\'équipe NeuroCare. Notre mission : faciliter la rencontre entre les familles concernées par l\'autisme et les éducateurs spécialisés qualifiés.',
  openGraph: {
    title: 'Qui sommes-nous ? | NeuroCare',
    description: 'Découvrez l\'équipe NeuroCare. Notre mission : faciliter la rencontre entre les familles concernées par l\'autisme et les éducateurs spécialisés qualifiés.',
    url: 'https://neuro-care.fr/about',
  },
  alternates: {
    canonical: '/about',
  },
}

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
