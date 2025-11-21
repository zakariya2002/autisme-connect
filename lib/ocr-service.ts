/**
 * Service OCR pour l'analyse automatique des diplômes
 *
 * Utilise Tesseract.js pour extraire le texte des images de diplômes
 * et valider automatiquement leur contenu.
 */

import Tesseract from 'tesseract.js';

// Mots-clés requis pour valider un diplôme ME ou ES
const REQUIRED_KEYWORDS = {
  diploma_types: [
    'moniteur-éducateur',
    'moniteur éducateur',
    'moniteur educateur',
    'éducateur spécialisé',
    'educateur spécialisé',
    'éducateur specialise',
    'educateur specialise',
    'deme', // Diplôme d'État de Moniteur-Éducateur
    'dees', // Diplôme d'État d'Éducateur Spécialisé
  ],
  authorities: [
    'dreets',
    'drjscs', // Ancien nom
    'ministère',
    'ministere',
    'république française',
    'republique francaise',
    'état',
    'etat',
  ],
  diploma_related: [
    'diplôme',
    'diplome',
    'certificat',
    'attestation',
  ]
};

export interface OCRResult {
  success: boolean;
  text: string;
  confidence: number;
  validation: {
    hasDiplomaType: boolean;
    hasAuthority: boolean;
    hasDiplomaKeyword: boolean;
    isValid: boolean;
    matchedKeywords: string[];
    warnings: string[];
  };
}

/**
 * Analyse un fichier image de diplôme avec OCR
 */
export async function analyzeDiploma(file: File): Promise<OCRResult> {
  try {
    console.log('🔍 Démarrage de l\'analyse OCR...');

    // Convertir le fichier en image URL pour Tesseract
    const imageUrl = URL.createObjectURL(file);

    // Lancer l'OCR avec Tesseract.js (langue française)
    const { data } = await Tesseract.recognize(
      imageUrl,
      'fra', // Langue française
      {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
          }
        }
      }
    );

    // Nettoyer l'URL object
    URL.revokeObjectURL(imageUrl);

    const extractedText = data.text.toLowerCase();
    const confidence = data.confidence;

    console.log('📄 Texte extrait:', extractedText.substring(0, 200) + '...');
    console.log('📊 Confiance OCR:', confidence + '%');

    // Valider le contenu
    const validation = validateDiplomaText(extractedText);

    return {
      success: true,
      text: extractedText,
      confidence,
      validation
    };

  } catch (error) {
    console.error('❌ Erreur OCR:', error);
    return {
      success: false,
      text: '',
      confidence: 0,
      validation: {
        hasDiplomaType: false,
        hasAuthority: false,
        hasDiplomaKeyword: false,
        isValid: false,
        matchedKeywords: [],
        warnings: ['Erreur lors de l\'analyse OCR']
      }
    };
  }
}

/**
 * Valide le texte extrait d'un diplôme
 */
function validateDiplomaText(text: string): OCRResult['validation'] {
  const matchedKeywords: string[] = [];
  const warnings: string[] = [];

  // Vérifier le type de diplôme (ME ou ES)
  const hasDiplomaType = REQUIRED_KEYWORDS.diploma_types.some(keyword => {
    if (text.includes(keyword)) {
      matchedKeywords.push(keyword);
      return true;
    }
    return false;
  });

  // Vérifier l'autorité émettrice (DREETS, Ministère, etc.)
  const hasAuthority = REQUIRED_KEYWORDS.authorities.some(keyword => {
    if (text.includes(keyword)) {
      matchedKeywords.push(keyword);
      return true;
    }
    return false;
  });

  // Vérifier les mots-clés liés aux diplômes
  const hasDiplomaKeyword = REQUIRED_KEYWORDS.diploma_related.some(keyword => {
    if (text.includes(keyword)) {
      matchedKeywords.push(keyword);
      return true;
    }
    return false;
  });

  // Générer des warnings si manque des éléments
  if (!hasDiplomaType) {
    warnings.push('Type de diplôme (ME ou ES) non détecté');
  }
  if (!hasAuthority) {
    warnings.push('Autorité émettrice (DREETS, Ministère) non détectée');
  }
  if (!hasDiplomaKeyword) {
    warnings.push('Mot-clé "diplôme" ou "certificat" non détecté');
  }

  // Le diplôme est valide si au moins le type ET un mot-clé diplôme sont présents
  const isValid = hasDiplomaType && hasDiplomaKeyword;

  return {
    hasDiplomaType,
    hasAuthority,
    hasDiplomaKeyword,
    isValid,
    matchedKeywords,
    warnings
  };
}

/**
 * Extrait le numéro de diplôme si présent
 */
export function extractDiplomaNumber(text: string): string | null {
  // Patterns courants pour les numéros de diplôme
  const patterns = [
    /n[°\s]*(\d{4,})/i, // N° 123456
    /numéro[:\s]*(\d{4,})/i, // Numéro: 123456
    /numero[:\s]*(\d{4,})/i, // Numero: 123456
    /diplôme[:\s]*n[°\s]*(\d{4,})/i, // Diplôme N° 123456
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Extrait la date de délivrance si présente
 */
export function extractDeliveryDate(text: string): string | null {
  // Patterns pour les dates françaises
  const patterns = [
    /(\d{1,2})[\/\s-](\d{1,2})[\/\s-](\d{4})/,
    /(\d{1,2})\s+(janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)\s+(\d{4})/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return match[0];
    }
  }

  return null;
}

/**
 * Génère un rapport d'analyse complet
 */
export function generateAnalysisReport(ocrResult: OCRResult): string {
  const { validation } = ocrResult;

  let report = '## Analyse automatique du diplôme\n\n';

  if (ocrResult.success) {
    report += `**Confiance OCR:** ${ocrResult.confidence.toFixed(1)}%\n\n`;

    if (validation.isValid) {
      report += '✅ **Résultat:** Diplôme valide (pré-vérification)\n\n';
    } else {
      report += '⚠️ **Résultat:** Vérification manuelle requise\n\n';
    }

    report += '**Éléments détectés:**\n';
    report += `- Type de diplôme (ME/ES): ${validation.hasDiplomaType ? '✓' : '✗'}\n`;
    report += `- Autorité émettrice: ${validation.hasAuthority ? '✓' : '✗'}\n`;
    report += `- Mot-clé "diplôme": ${validation.hasDiplomaKeyword ? '✓' : '✗'}\n\n`;

    if (validation.matchedKeywords.length > 0) {
      report += `**Mots-clés trouvés:** ${validation.matchedKeywords.join(', ')}\n\n`;
    }

    if (validation.warnings.length > 0) {
      report += '**Avertissements:**\n';
      validation.warnings.forEach(w => {
        report += `- ${w}\n`;
      });
    }

    // Extraire infos supplémentaires
    const diplomaNumber = extractDiplomaNumber(ocrResult.text);
    const deliveryDate = extractDeliveryDate(ocrResult.text);

    if (diplomaNumber || deliveryDate) {
      report += '\n**Informations extraites:**\n';
      if (diplomaNumber) report += `- Numéro de diplôme: ${diplomaNumber}\n`;
      if (deliveryDate) report += `- Date de délivrance: ${deliveryDate}\n`;
    }

  } else {
    report += '❌ **Erreur:** Impossible d\'analyser le document\n';
    report += 'Vérification manuelle requise.\n';
  }

  return report;
}

// Export du service
export const ocrService = {
  analyzeDiploma,
  extractDiplomaNumber,
  extractDeliveryDate,
  generateAnalysisReport,
};
