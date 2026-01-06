import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'MDPH : constituer son dossier efficacement | NeuroCare',
  description: 'Guide complet pour constituer votre dossier MDPH. Documents nécessaires, délais, conseils pour obtenir la reconnaissance du handicap et les aides associées.',
  openGraph: {
    title: 'MDPH : constituer son dossier efficacement',
    description: 'Guide complet pour constituer votre dossier MDPH. Documents nécessaires, délais et conseils pratiques.',
    url: 'https://neuro-care.fr/blog/mdph-dossier',
    type: 'article',
    images: [
      {
        url: 'https://neuro-care.fr/images/articles/mdph.jpg',
        width: 1200,
        height: 630,
        alt: 'Constituer son dossier MDPH',
      },
    ],
  },
  alternates: {
    canonical: 'https://neuro-care.fr/blog/mdph-dossier',
  },
}

export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
