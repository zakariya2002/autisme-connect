import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Que fait un psychomotricien ? Zoom sur cette profession | NeuroCare',
  description: 'Découvrez le rôle du psychomotricien dans l\'accompagnement des enfants TND et TSA. Formation, méthodes de travail et bénéfices pour votre enfant.',
  openGraph: {
    title: 'Que fait un psychomotricien ? Zoom sur cette profession',
    description: 'Découvrez le rôle du psychomotricien dans l\'accompagnement des enfants TND et TSA. Formation et méthodes de travail.',
    url: 'https://neuro-care.fr/blog/psychomotricien',
    type: 'article',
    images: [
      {
        url: 'https://neuro-care.fr/images/articles/psychomotricien.jpg',
        width: 1200,
        height: 630,
        alt: 'Le métier de psychomotricien',
      },
    ],
  },
  alternates: {
    canonical: 'https://neuro-care.fr/blog/psychomotricien',
  },
}

export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
