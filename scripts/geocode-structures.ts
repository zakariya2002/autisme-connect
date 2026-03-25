/**
 * Géocodage des structures TND à partir du code postal
 * Utilise l'API geo.api.gouv.fr (gratuit, pas de clé)
 *
 * Usage : npx tsx scripts/geocode-structures.ts
 */

import * as fs from 'fs';
import * as path from 'path';

const INPUT = path.join(__dirname, '..', 'data', 'structures-tnd.json');
const OUTPUT = INPUT; // On écrase le fichier

interface Structure {
  id: string;
  finess: string;
  nom: string;
  type: string;
  type_code: string;
  adresse: string;
  code_postal: string;
  ville: string;
  departement: string;
  region: string;
  telephone: string | null;
  lat: number | null;
  lng: number | null;
  source: string;
}

// Cache code postal → coordonnées pour éviter les appels redondants
const cache: Record<string, { lat: number; lng: number } | null> = {};

async function geocodeByPostcode(cp: string, ville: string): Promise<{ lat: number; lng: number } | null> {
  const key = `${cp}-${ville}`;
  if (cache[key] !== undefined) return cache[key];

  try {
    // Essayer d'abord avec code postal + nom de ville
    const url = `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(ville)}&postcode=${cp}&limit=1&type=municipality`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.features && data.features.length > 0) {
      const [lng, lat] = data.features[0].geometry.coordinates;
      cache[key] = { lat, lng };
      return cache[key];
    }

    // Fallback : juste le code postal
    const url2 = `https://api-adresse.data.gouv.fr/search/?q=${cp}&limit=1`;
    const res2 = await fetch(url2);
    const data2 = await res2.json();

    if (data2.features && data2.features.length > 0) {
      const [lng, lat] = data2.features[0].geometry.coordinates;
      cache[key] = { lat, lng };
      return cache[key];
    }

    cache[key] = null;
    return null;
  } catch {
    cache[key] = null;
    return null;
  }
}

async function main() {
  console.log('═══════════════════════════════════════');
  console.log('  Géocodage des structures TND');
  console.log('═══════════════════════════════════════\n');

  const structures: Structure[] = JSON.parse(fs.readFileSync(INPUT, 'utf-8'));
  const toGeocode = structures.filter(s => !s.lat || !s.lng);
  console.log(`📍 ${toGeocode.length} structures à géocoder (sur ${structures.length} total)\n`);

  let success = 0;
  let fail = 0;

  // Traitement par batch pour ne pas surcharger l'API
  const BATCH_SIZE = 20;
  for (let i = 0; i < toGeocode.length; i += BATCH_SIZE) {
    const batch = toGeocode.slice(i, i + BATCH_SIZE);

    await Promise.all(batch.map(async (s) => {
      if (!s.code_postal) { fail++; return; }
      const coords = await geocodeByPostcode(s.code_postal, s.ville);
      if (coords) {
        s.lat = coords.lat;
        s.lng = coords.lng;
        success++;
      } else {
        fail++;
      }
    }));

    // Afficher la progression
    const done = Math.min(i + BATCH_SIZE, toGeocode.length);
    process.stdout.write(`\r   ${done}/${toGeocode.length} traités (${success} OK, ${fail} échecs, ${Object.keys(cache).length} codes postaux en cache)`);

    // Petit délai entre les batches
    if (i + BATCH_SIZE < toGeocode.length) {
      await new Promise(r => setTimeout(r, 100));
    }
  }

  console.log(`\n\n✅ Géocodage terminé : ${success} réussis, ${fail} échoués`);

  // Sauvegarder
  fs.writeFileSync(OUTPUT, JSON.stringify(structures, null, 2), 'utf-8');
  const withCoords = structures.filter(s => s.lat && s.lng).length;
  console.log(`💾 ${OUTPUT} — ${withCoords}/${structures.length} structures avec coordonnées`);
}

main().catch(e => { console.error('❌', e); process.exit(1); });
