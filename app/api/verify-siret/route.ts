import { NextResponse } from 'next/server';

// API INSEE Sirene V3.11 (nouvelle URL depuis 2024)
const INSEE_API_BASE_URL = 'https://api.insee.fr/api-sirene/3.11';

export async function POST(request: Request) {
  try {
    const { siret } = await request.json();

    // Validation du format SIRET (14 chiffres)
    if (!siret || !/^\d{14}$/.test(siret)) {
      return NextResponse.json(
        {
          valid: false,
          error: 'Le numéro SIRET doit contenir exactement 14 chiffres'
        },
        { status: 400 }
      );
    }

    // Validation algorithmique (Luhn sur le SIREN)
    const siren = siret.substring(0, 9);
    let sum = 0;
    for (let i = 0; i < siren.length; i++) {
      let digit = parseInt(siren[i]);
      if ((siren.length - i) % 2 === 0) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
    }

    if (sum % 10 !== 0) {
      return NextResponse.json({
        valid: false,
        verified: true,
        message: 'Numéro SIRET invalide (ne passe pas la validation Luhn)',
        data: null
      });
    }

    // Obtenir la clé API INSEE
    const apiKey = process.env.INSEE_API_KEY;

    if (!apiKey) {
      // Mode dégradé : validation algorithmique seulement
      console.warn('INSEE API non configurée - vérification SIRET en mode dégradé');
      return NextResponse.json({
        valid: true,
        verified: false,
        message: 'Format SIRET valide (vérification API non disponible)',
        data: null
      });
    }

    // Appel à l'API INSEE Sirene
    const response = await fetch(
      `${INSEE_API_BASE_URL}/siret/${siret}`,
      {
        headers: {
          'X-INSEE-Api-Key-Integration': apiKey,
          'Accept': 'application/json',
        },
      }
    );

    if (response.status === 404) {
      return NextResponse.json({
        valid: false,
        verified: true,
        message: 'Ce numéro SIRET n\'existe pas dans le répertoire SIRENE',
        data: null
      });
    }

    if (response.status === 403) {
      // Entreprise non diffusible (a demandé à ne pas apparaître)
      return NextResponse.json({
        valid: true,
        verified: true,
        message: 'Établissement non diffusible (données protégées)',
        data: {
          siret,
          nonDiffusible: true,
        }
      });
    }

    if (!response.ok) {
      console.error('Erreur API INSEE:', response.status, response.statusText);
      return NextResponse.json({
        valid: true,
        verified: false,
        message: 'Service de vérification temporairement indisponible',
        data: null
      });
    }

    const data = await response.json();
    const etablissement = data.etablissement;

    // Vérifier si l'établissement est actif
    const isActive = etablissement.periodesEtablissement?.[0]?.etatAdministratifEtablissement === 'A';

    // Extraire les informations
    const uniteLegale = etablissement.uniteLegale;
    const adresse = etablissement.adresseEtablissement;

    // Construire le nom de l'entreprise
    let companyName = '';
    if (uniteLegale.denominationUniteLegale) {
      companyName = uniteLegale.denominationUniteLegale;
    } else if (uniteLegale.prenom1UniteLegale && uniteLegale.nomUniteLegale) {
      companyName = `${uniteLegale.prenom1UniteLegale} ${uniteLegale.nomUniteLegale}`;
    }

    // Construire l'adresse
    const addressParts = [
      adresse.numeroVoieEtablissement,
      adresse.typeVoieEtablissement,
      adresse.libelleVoieEtablissement,
    ].filter(Boolean).join(' ');

    const fullAddress = [
      addressParts,
      `${adresse.codePostalEtablissement || ''} ${adresse.libelleCommuneEtablissement || ''}`.trim(),
    ].filter(Boolean).join(', ');

    return NextResponse.json({
      valid: true,
      verified: true,
      message: isActive ? 'Établissement vérifié et actif' : 'Établissement fermé',
      data: {
        siret,
        siren: siret.substring(0, 9),
        companyName,
        address: fullAddress,
        postalCode: adresse.codePostalEtablissement,
        city: adresse.libelleCommuneEtablissement,
        activity: uniteLegale.activitePrincipaleUniteLegale,
        legalForm: uniteLegale.categorieJuridiqueUniteLegale,
        isActive,
        creationDate: etablissement.dateCreationEtablissement,
      }
    });

  } catch (error: any) {
    console.error('Erreur vérification SIRET:', error);

    return NextResponse.json({
      valid: true,
      verified: false,
      message: 'Erreur lors de la vérification - sera vérifié manuellement',
      data: null
    });
  }
}
