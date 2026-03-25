import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import structuresData from '@/data/structures-tnd.json';
import LieuxClient from '../LieuxClient';
import { REGION_LIST, getRegionBySlug, filterByRegion } from '../regions';

interface Props {
  params: { region: string };
}

export function generateStaticParams() {
  return REGION_LIST.map(r => ({ region: r.slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const regionInfo = getRegionBySlug(params.region);
  if (!regionInfo) return {};

  const structures = filterByRegion(structuresData as any[], regionInfo);
  const count = structures.length;
  const regionName = regionInfo.name;

  return {
    title: `Structures TND en ${regionName} \u2014 ${count} lieux | NeuroCare`,
    description: `Trouvez les ${count} CMP, CAMSP, SESSAD, CMPP et autres structures adapt\u00e9es aux troubles du neurod\u00e9veloppement en ${regionName}. Annuaire gratuit NeuroCare.`,
    keywords: [
      `structures TND ${regionName}`,
      `CMP ${regionName}`,
      `CAMSP ${regionName}`,
      `SESSAD ${regionName}`,
      `CMPP ${regionName}`,
      `CRA ${regionName}`,
      `autisme ${regionName}`,
      `TDAH ${regionName}`,
      `diagnostic TND ${regionName}`,
      'lieux adapt\u00e9s TND',
      'prise en charge autisme',
      'annuaire TND',
    ],
    openGraph: {
      title: `Structures TND en ${regionName} \u2014 ${count} lieux`,
      description: `Annuaire des ${count} structures de prise en charge TND en ${regionName} : CMP, CAMSP, SESSAD, CMPP, CRA et plus.`,
      type: 'website',
    },
    alternates: {
      canonical: `https://neuro-care.fr/ressources/lieux-adaptes/${params.region}`,
    },
  };
}

export default function RegionPage({ params }: Props) {
  const regionInfo = getRegionBySlug(params.region);
  if (!regionInfo) notFound();

  const structures = filterByRegion(structuresData as any[], regionInfo);
  const regionName = regionInfo.name;

  // Schema.org ItemList JSON-LD (limited to first 100 for performance)
  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Structures TND en ${regionName}`,
    description: `Liste des ${structures.length} structures de prise en charge des troubles du neurod\u00e9veloppement en ${regionName}`,
    numberOfItems: structures.length,
    itemListElement: structures.slice(0, 100).map((s: any, index: number) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'MedicalClinic',
        name: s.nom,
        address: {
          '@type': 'PostalAddress',
          streetAddress: s.adresse || undefined,
          postalCode: s.code_postal,
          addressLocality: s.ville,
          addressRegion: regionName,
          addressCountry: 'FR',
        },
        ...(s.telephone ? { telephone: s.telephone } : {}),
        ...(s.lat && s.lng
          ? {
              geo: {
                '@type': 'GeoCoordinates',
                latitude: s.lat,
                longitude: s.lng,
              },
            }
          : {}),
      },
    })),
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
      {
        '@type': 'ListItem',
        position: 3,
        name: regionName,
        item: `https://neuro-care.fr/ressources/lieux-adaptes/${params.region}`,
      },
    ],
  };

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
      <LieuxClient
        structures={structures as any}
        regionName={regionName}
        regionSlug={params.region}
      />
    </>
  );
}
