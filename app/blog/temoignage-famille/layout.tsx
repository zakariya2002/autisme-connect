import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Portrait de famille : "NeuroCare a changé notre quotidien" | NeuroCare',
  description: 'Témoignage d\'Émilie et Thomas, parents de Théo diagnostiqué TSA et TDAH. Découvrez comment ils ont trouvé les professionnels adaptés grâce à NeuroCare.',
  openGraph: {
    title: 'Portrait de famille : "NeuroCare a changé notre quotidien"',
    description: 'Témoignage d\'une famille accompagnée par NeuroCare. Parcours, difficultés et solutions trouvées.',
    url: 'https://neuro-care.fr/blog/temoignage-famille',
    type: 'article',
    images: [
      {
        url: 'https://neuro-care.fr/images/articles/temoignage-famille.jpg',
        width: 1200,
        height: 630,
        alt: 'Témoignage famille NeuroCare',
      },
    ],
  },
  alternates: {
    canonical: 'https://neuro-care.fr/blog/temoignage-famille',
  },
}

export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
