import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Créer un compte | NeuroCare',
  description: 'Créez votre compte NeuroCare gratuit. Rejoignez notre communauté de familles et professionnels du neurodéveloppement. Inscription simple et rapide.',
  openGraph: {
    title: 'Créer un compte | NeuroCare',
    description: 'Créez votre compte NeuroCare gratuit. Rejoignez notre communauté de familles et professionnels.',
    url: 'https://neuro-care.fr/auth/signup',
  },
  alternates: {
    canonical: 'https://neuro-care.fr/auth/signup',
  },
}

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
