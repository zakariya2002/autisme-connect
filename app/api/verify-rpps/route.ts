import { NextResponse } from 'next/server';

// API ANS Annuaire Santé - FHIR
const ANS_API_BASE_URL = 'https://gateway.api.esante.gouv.fr/fhir/v2';

export async function POST(request: Request) {
  try {
    const { rppsNumber } = await request.json();

    // Validation du format RPPS (11 chiffres)
    if (!rppsNumber || !/^\d{11}$/.test(rppsNumber)) {
      return NextResponse.json(
        {
          valid: false,
          error: 'Le numéro RPPS doit contenir exactement 11 chiffres'
        },
        { status: 400 }
      );
    }

    // Vérifier si la clé API est configurée
    const apiKey = process.env.ANS_API_KEY;

    if (!apiKey) {
      // Mode dégradé : on valide juste le format
      console.warn('ANS_API_KEY non configurée - vérification RPPS en mode dégradé');
      return NextResponse.json({
        valid: true,
        verified: false,
        message: 'Format RPPS valide (vérification API non disponible)',
        data: null
      });
    }

    // Appel à l'API ANS pour vérifier le RPPS
    const response = await fetch(
      `${ANS_API_BASE_URL}/Practitioner?identifier=${rppsNumber}`,
      {
        headers: {
          'Accept': 'application/fhir+json',
          'GRAVITEE-API-KEY': apiKey,
        },
      }
    );

    if (!response.ok) {
      console.error('Erreur API ANS:', response.status, response.statusText);

      // Si l'API est indisponible, on accepte quand même (vérification manuelle plus tard)
      if (response.status === 403 || response.status === 401) {
        return NextResponse.json({
          valid: true,
          verified: false,
          message: 'Format RPPS valide - sera vérifié par notre équipe',
          data: null
        });
      }

      return NextResponse.json({
        valid: true,
        verified: false,
        message: 'Service de vérification temporairement indisponible',
        data: null
      });
    }

    const data = await response.json();

    // Vérifier si un professionnel a été trouvé
    if (data.total === 0 || !data.entry || data.entry.length === 0) {
      return NextResponse.json({
        valid: false,
        verified: true,
        message: 'Aucun professionnel trouvé avec ce numéro RPPS',
        data: null
      });
    }

    // Extraire les informations du professionnel
    const practitioner = data.entry[0].resource;
    const name = practitioner.name?.[0];
    const qualification = practitioner.qualification?.[0];

    return NextResponse.json({
      valid: true,
      verified: true,
      message: 'Numéro RPPS vérifié avec succès',
      data: {
        rpps: rppsNumber,
        firstName: name?.given?.join(' ') || null,
        lastName: name?.family || null,
        profession: qualification?.code?.coding?.[0]?.display || null,
        active: practitioner.active ?? true,
      }
    });

  } catch (error: any) {
    console.error('Erreur vérification RPPS:', error);

    // En cas d'erreur, on accepte quand même (vérification manuelle plus tard)
    return NextResponse.json({
      valid: true,
      verified: false,
      message: 'Erreur lors de la vérification - le profil sera vérifié manuellement',
      data: null
    });
  }
}
