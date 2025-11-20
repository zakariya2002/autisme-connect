import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Autisme Connect - Plateforme de mise en relation',
  description: 'Plateforme de mise en relation entre éducateurs spécialisés et familles de personnes avec TSA',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
