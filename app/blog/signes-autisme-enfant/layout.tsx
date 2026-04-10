import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Quels sont les signes de l\'autisme chez l\'enfant ? Guide pour les parents | NeuroCare',
  description: 'Repérez les premiers signes de l\'autisme chez votre enfant : signaux à 6 mois, 12 mois, 2 ans et 3 ans. Quand consulter et quelles démarches entreprendre.',
  keywords: ['signes autisme enfant', 'premiers signes autisme bébé', 'détecter autisme enfant', 'symptômes TSA enfant'],
  openGraph: {
    title: 'Quels sont les signes de l\'autisme chez l\'enfant ? Guide pour les parents',
    description: 'Repérez les premiers signes de l\'autisme chez votre enfant : signaux à 6 mois, 12 mois, 2 ans et 3 ans.',
    url: 'https://neuro-care.fr/blog/signes-autisme-enfant',
    type: 'article',
    images: [
      {
        url: 'https://neuro-care.fr/images/articles/signes-autisme.jpg',
        width: 1200,
        height: 630,
        alt: 'Signes précoces de l\'autisme chez l\'enfant',
      },
    ],
  },
  alternates: {
    canonical: 'https://neuro-care.fr/blog/signes-autisme-enfant',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
