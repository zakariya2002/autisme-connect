import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Qui sommes-nous ? | Autisme Connect',
  description: 'Découvrez l\'équipe Autisme Connect. Notre mission : faciliter la rencontre entre les familles concernées par l\'autisme et les éducateurs spécialisés qualifiés.',
  openGraph: {
    title: 'Qui sommes-nous ? | Autisme Connect',
    description: 'Découvrez l\'équipe Autisme Connect. Notre mission : faciliter la rencontre entre les familles concernées par l\'autisme et les éducateurs spécialisés qualifiés.',
    url: 'https://www.autismeconnect.fr/about',
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
