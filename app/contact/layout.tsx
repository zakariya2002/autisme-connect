import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact | NeuroCare',
  description: 'Contactez l\'équipe NeuroCare. Une question ? Un besoin d\'accompagnement ? Nous vous répondons sous 24h. Support disponible du lundi au vendredi.',
  openGraph: {
    title: 'Contact | NeuroCare',
    description: 'Contactez l\'équipe NeuroCare. Une question ? Un besoin d\'accompagnement ? Nous vous répondons sous 24h.',
    url: 'https://neuro-care.fr/contact',
  },
  alternates: {
    canonical: 'https://neuro-care.fr/contact',
  },
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
