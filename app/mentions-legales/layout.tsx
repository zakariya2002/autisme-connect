import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mentions Légales | NeuroCare',
  description: 'Mentions légales de NeuroCare. Informations sur l\'éditeur, l\'hébergeur et les conditions d\'utilisation du site neuro-care.fr.',
  openGraph: {
    title: 'Mentions Légales | NeuroCare',
    description: 'Mentions légales de NeuroCare. Informations sur l\'éditeur et l\'hébergeur.',
    url: 'https://neuro-care.fr/mentions-legales',
  },
  alternates: {
    canonical: 'https://neuro-care.fr/mentions-legales',
  },
}

export default function MentionsLegalesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
