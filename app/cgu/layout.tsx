import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Conditions Générales d\'Utilisation | NeuroCare',
  description: 'Consultez les Conditions Générales d\'Utilisation de NeuroCare. Règles d\'utilisation de la plateforme pour les familles et les professionnels.',
  openGraph: {
    title: 'Conditions Générales d\'Utilisation | NeuroCare',
    description: 'Consultez les CGU de NeuroCare. Règles d\'utilisation de la plateforme.',
    url: 'https://neuro-care.fr/cgu',
  },
  alternates: {
    canonical: 'https://neuro-care.fr/cgu',
  },
}

export default function CGULayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
