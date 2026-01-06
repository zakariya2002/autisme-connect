import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Comment ça marche ? | Espace Pro NeuroCare',
  description: 'Découvrez comment fonctionne NeuroCare pour les professionnels. Créez votre profil, recevez des demandes et développez votre activité facilement.',
  openGraph: {
    title: 'Comment ça marche ? | Espace Pro NeuroCare',
    description: 'Comment fonctionne NeuroCare pour les professionnels. Créez votre profil et développez votre activité.',
    url: 'https://neuro-care.fr/pro/how-it-works',
  },
  alternates: {
    canonical: 'https://neuro-care.fr/pro/how-it-works',
  },
}

export default function HowItWorksLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
