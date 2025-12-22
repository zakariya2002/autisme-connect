import { NextResponse } from 'next/server';

/**
 * API Route désactivée - Abonnements supprimés
 *
 * Le système d'abonnement premium a été supprimé.
 * Tous les professionnels bénéficient de toutes les fonctionnalités gratuitement.
 * Le modèle économique repose uniquement sur les commissions (12%) sur les rendez-vous.
 */
export async function POST() {
  return NextResponse.json(
    {
      error: 'Les abonnements ont été désactivés.',
      info: 'Toutes les fonctionnalités sont désormais gratuites.'
    },
    { status: 410 } // 410 Gone - La ressource n'est plus disponible
  );
}

export async function GET() {
  return NextResponse.json(
    {
      error: 'Les abonnements ont été désactivés.',
      info: 'Toutes les fonctionnalités sont désormais gratuites.'
    },
    { status: 410 }
  );
}
