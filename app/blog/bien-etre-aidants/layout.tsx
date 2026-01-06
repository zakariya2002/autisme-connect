import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Prendre soin de soi quand on est parent aidant | NeuroCare',
  description: 'Conseils pour les parents aidants d\'enfants TND. L\'importance du répit, prévenir l\'épuisement et trouver du soutien. Prendre soin de soi n\'est pas un luxe.',
  openGraph: {
    title: 'Prendre soin de soi quand on est parent aidant',
    description: 'Conseils pour les parents aidants d\'enfants TND. L\'importance du répit et prévenir l\'épuisement.',
    url: 'https://neuro-care.fr/blog/bien-etre-aidants',
    type: 'article',
    images: [
      {
        url: 'https://neuro-care.fr/images/articles/bien-etre-aidants.jpg',
        width: 1200,
        height: 630,
        alt: 'Bien-être des parents aidants',
      },
    ],
  },
  alternates: {
    canonical: 'https://neuro-care.fr/blog/bien-etre-aidants',
  },
}

export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
