import type { Metadata } from 'next'
import './globals.css'
import { TndProvider } from '@/contexts/TndContext'

export const metadata: Metadata = {
  title: 'Autisme Connect - Éducateurs Spécialisés en Autisme TSA',
  description: 'Trouvez un éducateur spécialisé qualifié en autisme et TSA près de chez vous. Plateforme de mise en relation entre familles et professionnels de l\'accompagnement autisme. Prise de rendez-vous simplifiée.',
  keywords: [
    'éducateur spécialisé',
    'éducateur spécialisé autisme',
    'autisme',
    'TSA',
    'trouble du spectre autistique',
    'accompagnement autisme',
    'éducateur TSA',
    'professionnel autisme',
    'accompagnement éducatif',
    'éducateur ABA',
    'intervention autisme',
    'soutien famille autisme',
    'rendez-vous éducateur',
    'trouver éducateur spécialisé'
  ],
  authors: [{ name: 'Autisme Connect' }],
  creator: 'Autisme Connect',
  publisher: 'Autisme Connect',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://www.autismeconnect.fr'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Autisme Connect - Éducateurs Spécialisés en Autisme',
    description: 'Trouvez un éducateur spécialisé qualifié en autisme et TSA. Mise en relation simplifiée entre familles et professionnels.',
    url: 'https://www.autismeconnect.fr',
    siteName: 'Autisme Connect',
    locale: 'fr_FR',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Autisme Connect - Éducateurs Spécialisés',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Autisme Connect - Éducateurs Spécialisés en Autisme',
    description: 'Trouvez un éducateur spécialisé qualifié en autisme et TSA près de chez vous.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'ZWXam3zHuJvyShnghKP8bKHlmgAo6DwpwOyHcOkT_hI',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Autisme Connect',
    description: 'Plateforme de mise en relation entre éducateurs spécialisés en autisme et familles',
    url: 'https://www.autismeconnect.fr',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://www.autismeconnect.fr/search?q={search_term_string}'
      },
      'query-input': 'required name=search_term_string'
    },
    publisher: {
      '@type': 'Organization',
      name: 'Autisme Connect',
      url: 'https://www.autismeconnect.fr',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.autismeconnect.fr/icon-512.png'
      }
    }
  }

  return (
    <html lang="fr">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-sans antialiased">
        <TndProvider>
          <div className="min-h-screen">
            {children}
          </div>
        </TndProvider>
      </body>
    </html>
  )
}
