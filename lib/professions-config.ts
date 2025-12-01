// Configuration centralisée des professions et diplômes
// Utilisée pour l'inscription et la vérification des diplômes

export interface ProfessionConfig {
  value: string;
  label: string;
  category: 'Éducatif' | 'Psychologie' | 'Thérapies' | 'Autres';
  requiresRpps: boolean;
  diplomas: string[];
  // Pour la vérification
  verificationMethod: 'dreets' | 'rpps' | 'manual';
  diplomaDescription: string;
}

export const professions: ProfessionConfig[] = [
  // Catégorie Éducatif - Vérification DREETS
  {
    value: 'educator',
    label: 'Éducateur spécialisé',
    category: 'Éducatif',
    requiresRpps: false,
    diplomas: ['DEES', 'CAFERUIS', 'OTHER'],
    verificationMethod: 'dreets',
    diplomaDescription: 'Diplôme d\'État d\'Éducateur Spécialisé (DEES)',
  },
  {
    value: 'moniteur_educateur',
    label: 'Moniteur éducateur',
    category: 'Éducatif',
    requiresRpps: false,
    diplomas: ['DEME', 'OTHER'],
    verificationMethod: 'dreets',
    diplomaDescription: 'Diplôme d\'État de Moniteur Éducateur (DEME)',
  },
  // Catégorie Psychologie - RPPS + vérification manuelle
  {
    value: 'psychologist',
    label: 'Psychologue',
    category: 'Psychologie',
    requiresRpps: true,
    diplomas: ['MASTER_PSY', 'OTHER'],
    verificationMethod: 'rpps',
    diplomaDescription: 'Master 2 Psychologie',
  },
  {
    value: 'psychiatrist',
    label: 'Psychiatre',
    category: 'Psychologie',
    requiresRpps: true,
    diplomas: ['DES_PSYCHIATRIE', 'OTHER'],
    verificationMethod: 'rpps',
    diplomaDescription: 'DES de Psychiatrie',
  },
  {
    value: 'child_psychiatrist',
    label: 'Pédopsychiatre',
    category: 'Psychologie',
    requiresRpps: true,
    diplomas: ['DES_PSYCHIATRIE', 'OTHER'],
    verificationMethod: 'rpps',
    diplomaDescription: 'DES de Psychiatrie',
  },
  // Catégorie Thérapies paramédicales - RPPS requis
  {
    value: 'psychomotricist',
    label: 'Psychomotricien',
    category: 'Thérapies',
    requiresRpps: true,
    diplomas: ['DE_PSYCHOMOT', 'OTHER'],
    verificationMethod: 'rpps',
    diplomaDescription: 'Diplôme d\'État de Psychomotricien',
  },
  {
    value: 'occupational_therapist',
    label: 'Ergothérapeute',
    category: 'Thérapies',
    requiresRpps: true,
    diplomas: ['DE_ERGO', 'OTHER'],
    verificationMethod: 'rpps',
    diplomaDescription: 'Diplôme d\'État d\'Ergothérapeute',
  },
  {
    value: 'speech_therapist',
    label: 'Orthophoniste',
    category: 'Thérapies',
    requiresRpps: true,
    diplomas: ['CCO', 'OTHER'],
    verificationMethod: 'rpps',
    diplomaDescription: 'Certificat de Capacité d\'Orthophoniste (CCO)',
  },
  {
    value: 'physiotherapist',
    label: 'Kinésithérapeute',
    category: 'Thérapies',
    requiresRpps: true,
    diplomas: ['DE_KINE', 'OTHER'],
    verificationMethod: 'rpps',
    diplomaDescription: 'Diplôme d\'État de Masseur-Kinésithérapeute',
  },
  // Catégorie Autres - Vérification manuelle
  {
    value: 'apa_teacher',
    label: 'Enseignant APA',
    category: 'Autres',
    requiresRpps: false,
    diplomas: ['LICENCE_STAPS_APA', 'MASTER_STAPS_APA', 'OTHER'],
    verificationMethod: 'manual',
    diplomaDescription: 'Licence ou Master STAPS mention APA-S',
  },
  {
    value: 'music_therapist',
    label: 'Musicothérapeute',
    category: 'Autres',
    requiresRpps: false,
    diplomas: ['DU_MUSICOTHERAPIE', 'CERTIFICATION_MUSICOTHERAPIE', 'OTHER'],
    verificationMethod: 'manual',
    diplomaDescription: 'DU Musicothérapie ou certification équivalente',
  },
];

// Labels des diplômes
export const diplomaLabels: { [key: string]: string } = {
  // Éducatif
  'DEES': 'Diplôme d\'État d\'Éducateur Spécialisé (DEES)',
  'DEME': 'Diplôme d\'État de Moniteur Éducateur (DEME)',
  'CAFERUIS': 'CAFERUIS',
  // Psychologie
  'MASTER_PSY': 'Master 2 Psychologie',
  'DES_PSYCHIATRIE': 'DES de Psychiatrie',
  // Thérapies paramédicales
  'DE_PSYCHOMOT': 'Diplôme d\'État de Psychomotricien',
  'DE_ERGO': 'Diplôme d\'État d\'Ergothérapeute',
  'CCO': 'Certificat de Capacité d\'Orthophoniste (CCO)',
  'DE_KINE': 'Diplôme d\'État de Masseur-Kinésithérapeute',
  // APA
  'LICENCE_STAPS_APA': 'Licence STAPS mention APA-S',
  'MASTER_STAPS_APA': 'Master STAPS APA-S',
  // Musicothérapie
  'DU_MUSICOTHERAPIE': 'DU Musicothérapie',
  'CERTIFICATION_MUSICOTHERAPIE': 'Certification Musicothérapeute',
  // Autre
  'OTHER': 'Autre diplôme / certification',
};

// Fonction utilitaire pour obtenir une profession par sa valeur
export function getProfessionByValue(value: string): ProfessionConfig | undefined {
  return professions.find(p => p.value === value);
}

// Fonction pour obtenir le label d'un diplôme
export function getDiplomaLabel(diplomaCode: string): string {
  return diplomaLabels[diplomaCode] || diplomaCode;
}

// Fonction pour vérifier si une profession nécessite la vérification DREETS
export function requiresDreetsVerification(professionValue: string): boolean {
  const profession = getProfessionByValue(professionValue);
  return profession?.verificationMethod === 'dreets';
}

// Fonction pour vérifier si une profession nécessite un numéro RPPS
export function requiresRpps(professionValue: string): boolean {
  const profession = getProfessionByValue(professionValue);
  return profession?.requiresRpps ?? false;
}
