/**
 * Mapping between URL-friendly slugs and actual region names.
 * Handles accent variants in the data (e.g., "Auvergne-Rhone-Alpes" vs "Auvergne-Rhône-Alpes").
 */

export interface RegionInfo {
  slug: string;
  name: string;
  /** All possible name variants found in the JSON data */
  variants: string[];
}

export const REGION_LIST: RegionInfo[] = [
  {
    slug: 'auvergne-rhone-alpes',
    name: 'Auvergne-Rh\u00f4ne-Alpes',
    variants: ['Auvergne-Rh\u00f4ne-Alpes', 'Auvergne-Rhone-Alpes'],
  },
  {
    slug: 'bourgogne-franche-comte',
    name: 'Bourgogne-Franche-Comt\u00e9',
    variants: ['Bourgogne-Franche-Comt\u00e9', 'Bourgogne-Franche-Comte'],
  },
  {
    slug: 'bretagne',
    name: 'Bretagne',
    variants: ['Bretagne'],
  },
  {
    slug: 'centre-val-de-loire',
    name: 'Centre-Val de Loire',
    variants: ['Centre-Val de Loire'],
  },
  {
    slug: 'corse',
    name: 'Corse',
    variants: ['Corse'],
  },
  {
    slug: 'grand-est',
    name: 'Grand Est',
    variants: ['Grand Est'],
  },
  {
    slug: 'guadeloupe',
    name: 'Guadeloupe',
    variants: ['Guadeloupe'],
  },
  {
    slug: 'guyane',
    name: 'Guyane',
    variants: ['Guyane'],
  },
  {
    slug: 'hauts-de-france',
    name: 'Hauts-de-France',
    variants: ['Hauts-de-France'],
  },
  {
    slug: 'ile-de-france',
    name: '\u00cele-de-France',
    variants: ['\u00cele-de-France', 'Ile-de-France'],
  },
  {
    slug: 'la-reunion',
    name: 'La R\u00e9union',
    variants: ['La R\u00e9union'],
  },
  {
    slug: 'martinique',
    name: 'Martinique',
    variants: ['Martinique'],
  },
  {
    slug: 'mayotte',
    name: 'Mayotte',
    variants: ['Mayotte'],
  },
  {
    slug: 'normandie',
    name: 'Normandie',
    variants: ['Normandie'],
  },
  {
    slug: 'nouvelle-aquitaine',
    name: 'Nouvelle-Aquitaine',
    variants: ['Nouvelle-Aquitaine'],
  },
  {
    slug: 'occitanie',
    name: 'Occitanie',
    variants: ['Occitanie'],
  },
  {
    slug: 'pays-de-la-loire',
    name: 'Pays de la Loire',
    variants: ['Pays de la Loire'],
  },
  {
    slug: 'provence-alpes-cote-dazur',
    name: 'Provence-Alpes-C\u00f4te d\u2019Azur',
    variants: ['Provence-Alpes-C\u00f4te d\u2019Azur', "Provence-Alpes-Cote d'Azur", "Provence-Alpes-C\u00f4te d'Azur"],
  },
];

/** Map from slug to RegionInfo */
export const REGION_BY_SLUG = new Map<string, RegionInfo>(
  REGION_LIST.map(r => [r.slug, r])
);

/** Map from any region name variant to its slug */
export const SLUG_BY_NAME = new Map<string, string>(
  REGION_LIST.flatMap(r => r.variants.map(v => [v, r.slug]))
);

/** Get the RegionInfo for a given slug, or undefined if not found */
export function getRegionBySlug(slug: string): RegionInfo | undefined {
  return REGION_BY_SLUG.get(slug);
}

/** Filter structures by region, accounting for accent variants */
export function filterByRegion<T extends { region: string }>(
  structures: T[],
  regionInfo: RegionInfo
): T[] {
  const variantSet = new Set(regionInfo.variants);
  return structures.filter(s => variantSet.has(s.region));
}
