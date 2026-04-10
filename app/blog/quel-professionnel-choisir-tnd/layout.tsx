import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Quel professionnel pour votre enfant autiste ou TDAH ? Le guide complet | NeuroCare',
  description: 'Psychologue, orthophoniste, psychomotricien, éducateur spécialisé, ergothérapeute, neuropsychologue : quel professionnel choisir pour accompagner un enfant autiste, TDAH ou DYS ? Comparatif et conseils.',
  keywords: ['quel professionnel autisme', 'psychologue ou éducateur autisme', 'psychomotricien TDAH', 'orthophoniste DYS', 'choisir professionnel TND'],
  openGraph: {
    title: 'Quel professionnel pour votre enfant autiste ou TDAH ? Le guide complet',
    description: 'Psychologue, orthophoniste, psychomotricien, éducateur spécialisé : quel professionnel choisir pour un enfant TND ?',
    url: 'https://neuro-care.fr/blog/quel-professionnel-choisir-tnd',
    type: 'article',
    images: [
      {
        url: 'https://neuro-care.fr/images/articles/choisir-professionnel.jpg',
        width: 1200,
        height: 630,
        alt: 'Choisir un professionnel pour un enfant TND',
      },
    ],
  },
  alternates: {
    canonical: 'https://neuro-care.fr/blog/quel-professionnel-choisir-tnd',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
