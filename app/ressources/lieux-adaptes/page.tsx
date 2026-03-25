import { Metadata } from 'next';
import Link from 'next/link';
import structuresData from '@/data/structures-tnd.json';
import LieuxClient from './LieuxClient';
import { REGION_LIST, filterByRegion } from './regions';

export const metadata: Metadata = {
  title: 'Lieux adapt\u00e9s TND | NeuroCare',
  description: 'Annuaire des lieux de prise en charge adapt\u00e9s pour les troubles du neurod\u00e9veloppement (autisme, TDAH, DYS) en France : CMP, CAMSP, SESSAD, CMPP, CRA.',
  keywords: [
    'CMP autisme', 'CAMSP', 'SESSAD', 'CMPP', 'CRA autisme',
    'lieux adapt\u00e9s TND', 'prise en charge autisme', 'structures autisme France',
    'annuaire TND', 'centre m\u00e9dico-psychologique',
  ],
};

export default function LieuxAdaptesPage() {
  const structures = structuresData as any[];

  // Schema.org ItemList JSON-LD for the main page
  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Annuaire des structures TND en France',
    description: `${structures.length} structures de prise en charge des troubles du neurod\u00e9veloppement en France`,
    numberOfItems: structures.length,
    itemListElement: REGION_LIST.map((r, index) => {
      const count = filterByRegion(structures, r).length;
      return {
        '@type': 'ListItem',
        position: index + 1,
        name: `Structures TND en ${r.name} (${count})`,
        url: `https://neuro-care.fr/ressources/lieux-adaptes/${r.slug}`,
      };
    }),
  };

  // BreadcrumbList JSON-LD
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Accueil',
        item: 'https://neuro-care.fr',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Lieux adapt\u00e9s TND',
        item: 'https://neuro-care.fr/ressources/lieux-adaptes',
      },
    ],
  };

  // Pre-compute region counts for the link section
  const regionCounts = REGION_LIST.map(r => ({
    ...r,
    count: filterByRegion(structures, r).length,
  }));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <LieuxClient structures={structures} />

      {/* Parcourir par région — SEO internal linking */}
      <div style={{ backgroundColor: '#fdf9f4' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
          <div className="bg-white rounded-xl border border-gray-100 p-6 sm:p-8">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">
              Parcourir par r&eacute;gion
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Acc&eacute;dez directement aux structures TND de votre r&eacute;gion
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {regionCounts.map(r => (
                <Link
                  key={r.slug}
                  href={`/ressources/lieux-adaptes/${r.slug}`}
                  className="flex items-center justify-between px-4 py-3 rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all no-underline group"
                >
                  <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                    {r.name}
                  </span>
                  <span
                    className="text-xs font-semibold px-2.5 py-1 rounded-full"
                    style={{ backgroundColor: '#e6f5f5', color: '#027e7e' }}
                  >
                    {r.count}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
