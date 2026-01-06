import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Support et Aide | NeuroCare',
  description: 'Besoin d\'aide ? Consultez notre centre de support NeuroCare. FAQ, guides d\'utilisation et contact avec notre équipe pour toute question.',
  openGraph: {
    title: 'Support et Aide | NeuroCare',
    description: 'Centre de support NeuroCare. FAQ et guides pour vous accompagner.',
    url: 'https://neuro-care.fr/support',
  },
  alternates: {
    canonical: 'https://neuro-care.fr/support',
  },
}

export default function SupportLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
