import type { Metadata } from 'next'
import './globals.css'
import { TndProvider } from '@/contexts/TndContext'

export const metadata: Metadata = {
  title: 'Autisme Connect - Trouvez le professionnel adapté au TSA de votre enfant',
  description: 'Plateforme gratuite pour les familles. Trouvez un éducateur spécialisé diplômé et vérifié près de chez vous. Accompagnement personnalisé autisme et TSA. Prise de rendez-vous en ligne simplifiée.',
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
    title: 'Autisme Connect - Trouvez le professionnel adapté au TSA de votre enfant',
    description: 'Plateforme gratuite pour les familles. Trouvez un éducateur spécialisé diplômé et vérifié près de chez vous. Accompagnement personnalisé autisme et TSA.',
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
    title: 'Autisme Connect - Trouvez le professionnel adapté au TSA de votre enfant',
    description: 'Plateforme gratuite pour les familles. Trouvez un éducateur spécialisé diplômé et vérifié près de chez vous.',
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

  const siteNavigationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SiteNavigationElement',
    name: 'Navigation principale',
    hasPart: [
      {
        '@type': 'SiteNavigationElement',
        name: 'Qui sommes-nous ?',
        description: 'Découvrez l\'équipe et la mission d\'Autisme Connect',
        url: 'https://www.autismeconnect.fr/about'
      },
      {
        '@type': 'SiteNavigationElement',
        name: 'Trouver un éducateur',
        description: 'Recherchez un éducateur spécialisé en autisme près de chez vous',
        url: 'https://www.autismeconnect.fr/search'
      },
      {
        '@type': 'SiteNavigationElement',
        name: 'Connexion',
        description: 'Connectez-vous à votre espace famille ou éducateur',
        url: 'https://www.autismeconnect.fr/auth/login'
      },
      {
        '@type': 'SiteNavigationElement',
        name: 'Tarifs',
        description: 'Découvrez nos offres pour les éducateurs spécialisés',
        url: 'https://www.autismeconnect.fr/pricing'
      }
    ]
  }

  return (
    <html lang="fr">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#7c3aed" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteNavigationJsonLd) }}
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
