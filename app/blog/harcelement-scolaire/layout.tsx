import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Harcèlement scolaire et TND : comprendre et agir | NeuroCare',
  description: 'Les enfants avec TND sont plus vulnérables au harcèlement scolaire. Découvrez comment le repérer, accompagner votre enfant et quelles démarches entreprendre.',
  openGraph: {
    title: 'Harcèlement scolaire et TND : comprendre et agir',
    description: 'Les enfants avec TND sont plus vulnérables au harcèlement scolaire. Comment le repérer et accompagner votre enfant.',
    url: 'https://neuro-care.fr/blog/harcelement-scolaire',
    type: 'article',
  },
  alternates: {
    canonical: 'https://neuro-care.fr/blog/harcelement-scolaire',
  },
}

export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
