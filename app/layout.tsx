import type { Metadata } from 'next'
import './globals.css'
import { TndProvider } from '@/contexts/TndContext'
import CookieBanner from '@/components/CookieBanner'

export const metadata: Metadata = {
  title: 'neurocare - Professionnels du Neuro Développement près de chez vous',
  description: 'Plateforme gratuite pour les familles. Trouvez des professionnels diplômés et vérifiés : psychologues, psychomotriciens, orthophonistes, éducateurs spécialisés. Accompagnement TND, TSA et troubles du neurodéveloppement.',
  keywords: [
    'TND',
    'troubles du neurodéveloppement',
    'autisme',
    'TSA',
    'trouble du spectre autistique',
    'psychologue TND',
    'psychomotricien',
    'orthophoniste',
    'éducateur spécialisé',
    'ergothérapeute',
    'neuropsychologue',
    'accompagnement TND',
    'accompagnement autisme',
    'professionnel autisme',
    'professionnel TND',
    'TDAH',
    'troubles dys',
    'dyslexie',
    'dyspraxie',
    'rendez-vous professionnel TND',
    'soutien famille autisme'
  ],
  authors: [{ name: 'neurocare' }],
  creator: 'neurocare',
  publisher: 'neurocare',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://www.neuro-care.fr'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'neurocare - Professionnels du Neuro Développement',
    description: 'Trouvez des professionnels diplômés et vérifiés près de chez vous : psychologues, psychomotriciens, orthophonistes, éducateurs spécialisés. Accompagnement TND et troubles du neurodéveloppement.',
    url: 'https://www.neuro-care.fr',
    siteName: 'neurocare',
    locale: 'fr_FR',
    type: 'website',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'neurocare - Professionnels du Neuro Développement',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'neurocare - Professionnels du Neuro Développement',
    description: 'Trouvez des professionnels diplômés et vérifiés près de chez vous. Accompagnement TND et troubles du neurodéveloppement.',
    images: ['/opengraph-image'],
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
  icons: {
    icon: '/icon.svg',
    apple: '/apple-icon.svg',
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
    name: 'neurocare',
    description: 'Plateforme de mise en relation entre professionnels du neuro développement (psychologues, psychomotriciens, orthophonistes, éducateurs spécialisés) et familles',
    url: 'https://www.neuro-care.fr',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://www.neuro-care.fr/search?q={search_term_string}'
      },
      'query-input': 'required name=search_term_string'
    },
    publisher: {
      '@type': 'Organization',
      name: 'neurocare',
      url: 'https://www.neuro-care.fr',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.neuro-care.fr/icon-512.png'
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
        description: 'Découvrez l\'équipe et la mission de neurocare',
        url: 'https://www.neuro-care.fr/about'
      },
      {
        '@type': 'SiteNavigationElement',
        name: 'Trouver un professionnel',
        description: 'Recherchez un professionnel du neuro développement près de chez vous : psychologue, psychomotricien, orthophoniste, éducateur spécialisé',
        url: 'https://www.neuro-care.fr/search'
      },
      {
        '@type': 'SiteNavigationElement',
        name: 'Connexion',
        description: 'Connectez-vous à votre espace famille ou professionnel',
        url: 'https://www.neuro-care.fr/auth/login'
      },
      {
        '@type': 'SiteNavigationElement',
        name: 'Tarifs',
        description: 'Découvrez nos offres pour les professionnels du neuro développement',
        url: 'https://www.neuro-care.fr/pricing'
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
        <meta name="theme-color" content="#ffffff" />
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
        {/* Skip link pour accessibilité RGAA */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary-600 focus:text-white focus:rounded-lg focus:font-semibold focus:shadow-lg"
        >
          Aller au contenu principal
        </a>
        <TndProvider>
          <main id="main-content" className="min-h-screen">
            {children}
          </main>
          <CookieBanner />
        </TndProvider>
      </body>
    </html>
  )
}
