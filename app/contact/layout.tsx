import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact | Autisme Connect',
  description: 'Contactez l\'équipe Autisme Connect. Une question ? Un besoin d\'accompagnement ? Nous vous répondons sous 24h. Support disponible du lundi au vendredi.',
  openGraph: {
    title: 'Contact | Autisme Connect',
    description: 'Contactez l\'équipe Autisme Connect. Une question ? Un besoin d\'accompagnement ? Nous vous répondons sous 24h.',
    url: 'https://www.autismeconnect.fr/contact',
  },
  alternates: {
    canonical: '/contact',
  },
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
