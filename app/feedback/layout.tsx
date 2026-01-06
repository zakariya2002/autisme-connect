import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Donnez votre avis | NeuroCare',
  description: 'Partagez votre expérience avec NeuroCare. Votre feedback nous aide à améliorer notre plateforme pour mieux accompagner les familles et professionnels.',
  openGraph: {
    title: 'Donnez votre avis | NeuroCare',
    description: 'Partagez votre expérience avec NeuroCare. Votre avis compte pour améliorer notre service.',
    url: 'https://neuro-care.fr/feedback',
  },
  alternates: {
    canonical: 'https://neuro-care.fr/feedback',
  },
}

export default function FeedbackLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
