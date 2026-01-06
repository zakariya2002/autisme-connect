import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Agrément SAP pour Professionnels | NeuroCare',
  description: 'Guide complet sur l\'agrément Services à la Personne (SAP) pour les professionnels du neurodéveloppement. Démarches, avantages et accompagnement.',
  openGraph: {
    title: 'Agrément SAP pour Professionnels | NeuroCare',
    description: 'Guide sur l\'agrément SAP pour les professionnels. Démarches et avantages.',
    url: 'https://neuro-care.fr/pro/sap-accreditation',
  },
  alternates: {
    canonical: 'https://neuro-care.fr/pro/sap-accreditation',
  },
}

export default function ProSapAccreditationLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
