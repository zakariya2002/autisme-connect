import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Préparer son enfant à une première consultation | NeuroCare',
  description: 'Comment préparer votre enfant TND à une première consultation avec un professionnel. Conseils pratiques pour réduire le stress et optimiser le rendez-vous.',
  openGraph: {
    title: 'Préparer son enfant à une première consultation',
    description: 'Comment préparer votre enfant TND à une première consultation. Conseils pratiques pour réduire le stress.',
    url: 'https://neuro-care.fr/blog/preparer-consultation',
    type: 'article',
    images: [
      {
        url: 'https://neuro-care.fr/images/articles/consultation.jpg',
        width: 1200,
        height: 630,
        alt: 'Préparer une consultation',
      },
    ],
  },
  alternates: {
    canonical: 'https://neuro-care.fr/blog/preparer-consultation',
  },
}

export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
