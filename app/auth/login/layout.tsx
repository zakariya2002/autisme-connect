import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Connexion | NeuroCare',
  description: 'Connectez-vous à votre espace NeuroCare. Accédez à votre tableau de bord famille ou éducateur pour gérer vos rendez-vous et messages.',
  openGraph: {
    title: 'Connexion | NeuroCare',
    description: 'Connectez-vous à votre espace NeuroCare. Accédez à votre tableau de bord famille ou éducateur.',
    url: 'https://www.neuro-care.fr/auth/login',
  },
  alternates: {
    canonical: '/auth/login',
  },
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
