/**
 * Système de modération automatisée des messages
 *
 * Ce module fournit des fonctions pour détecter et filtrer les contenus inappropriés
 * dans les messages échangés sur la plateforme.
 */

// Liste de mots/expressions interdits (insultes, contenu offensant)
// Cette liste est intentionnellement en français et adaptée au contexte
const FORBIDDEN_WORDS = [
  // Insultes générales
  'connard', 'connasse', 'salaud', 'salope', 'enfoiré', 'enculé',
  'putain', 'pute', 'bordel', 'merde', 'nique', 'niquer',
  'batard', 'bâtard', 'fdp', 'ntm', 'tg', 'ta gueule',
  'crétin', 'débile', 'abruti', 'idiot', 'imbécile', 'con ',

  // Termes discriminatoires
  'nègre', 'negro', 'arabe de merde', 'sale arabe', 'sale noir',
  'bougnoule', 'youpin', 'chinetoque', 'bridé', 'bamboula',
  'pd', 'pédé', 'tapette', 'gouine', 'travelo',
  'handicapé mental', 'mongol', 'attardé', 'trisomique',

  // Menaces
  'je vais te tuer', 'je vais te frapper', 'je vais te massacrer',
  'tu vas mourir', 'crève', 'va crever', 'suicide-toi',

  // Harcèlement
  'harcèle', 'te traquer', 'te retrouver', 'je sais où tu habites',

  // Spam et arnaques
  'gagnez de l\'argent', 'gagner de l\'argent facilement',
  'bitcoin gratuit', 'crypto gratuit', 'investissement garanti',
  'cliquez ici', 'clique ici', 'www.', 'http://', 'https://',
];

// Patterns regex pour détecter du contenu suspect
const SUSPICIOUS_PATTERNS = [
  // Numéros de téléphone (protection des données personnelles en premier message)
  /(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}/g,

  // Emails (protection en premier échange)
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,

  // URLs
  /https?:\/\/[^\s]+/gi,
  /www\.[^\s]+/gi,

  // Contournements courants (lettres avec chiffres)
  /c0nn(a|@)rd/gi,
  /s(a|@)l(o|0)p/gi,
  /put(a|@)in/gi,
  /m(e|3)rd(e|3)/gi,
];

// Expressions avec contenu potentiellement inapproprié pour un contexte professionnel
const INAPPROPRIATE_CONTEXT = [
  'tu es beau', 'tu es belle', 'tu es mignon', 'tu es mignonne',
  'on peut se voir', 'on peut se rencontrer', 'ton numéro',
  'donne ton numéro', 'donne ton adresse', 'ton adresse',
  'en dehors de la plateforme', 'hors plateforme',
];

export interface ModerationResult {
  isAcceptable: boolean;
  score: number; // 0-100, plus c'est élevé plus c'est suspect
  reasons: string[];
  flaggedWords: string[];
  suggestions?: string[];
}

/**
 * Analyse un message et retourne un résultat de modération
 */
export function moderateMessage(content: string, isFirstMessage = false): ModerationResult {
  const result: ModerationResult = {
    isAcceptable: true,
    score: 0,
    reasons: [],
    flaggedWords: [],
    suggestions: [],
  };

  const contentLower = content.toLowerCase().trim();

  // 1. Vérification des mots interdits
  for (const word of FORBIDDEN_WORDS) {
    if (contentLower.includes(word.toLowerCase())) {
      result.isAcceptable = false;
      result.score += 50;
      result.flaggedWords.push(word);
      result.reasons.push(`Contenu offensant détecté: "${word}"`);
    }
  }

  // 2. Vérification des patterns suspects
  for (const pattern of SUSPICIOUS_PATTERNS) {
    const matches = content.match(pattern);
    if (matches) {
      if (isFirstMessage) {
        // Plus strict pour les premiers messages
        result.score += 30;
        result.reasons.push('Partage d\'informations personnelles dans le premier message');
        result.suggestions?.push('Évitez de partager des coordonnées personnelles dans votre premier message.');
      } else {
        result.score += 10;
      }
    }
  }

  // 3. Vérification du contexte inapproprié
  for (const phrase of INAPPROPRIATE_CONTEXT) {
    if (contentLower.includes(phrase.toLowerCase())) {
      result.score += 15;
      result.reasons.push(`Contexte potentiellement inapproprié: "${phrase}"`);
      result.suggestions?.push('Ce type de message peut sembler inapproprié dans un contexte professionnel.');
    }
  }

  // 4. Vérification de la longueur (spam potentiel)
  if (content.length < 3) {
    result.score += 5;
    result.reasons.push('Message trop court');
  }

  if (content.length > 5000) {
    result.score += 10;
    result.reasons.push('Message très long');
  }

  // 5. Vérification des majuscules excessives (crier)
  const uppercaseRatio = (content.match(/[A-Z]/g) || []).length / content.length;
  if (content.length > 20 && uppercaseRatio > 0.7) {
    result.score += 20;
    result.reasons.push('Utilisation excessive de majuscules');
    result.suggestions?.push('Évitez d\'écrire en majuscules, cela peut être perçu comme agressif.');
  }

  // 6. Vérification des caractères répétés (spaaaam)
  if (/(.)\1{4,}/g.test(content)) {
    result.score += 15;
    result.reasons.push('Caractères répétés de manière excessive');
  }

  // Déterminer si le message est acceptable basé sur le score
  if (result.score >= 50) {
    result.isAcceptable = false;
  }

  return result;
}

/**
 * Version simplifiée pour une vérification rapide
 */
export function quickCheck(content: string): boolean {
  const contentLower = content.toLowerCase();

  // Vérification rapide des mots les plus offensants
  const criticalWords = [
    'nègre', 'negro', 'pute', 'salope', 'enculé',
    'va crever', 'suicide', 'je vais te tuer'
  ];

  return !criticalWords.some(word => contentLower.includes(word));
}

/**
 * Nettoie un message en masquant les mots offensants
 * Utile si on veut quand même afficher le message mais censuré
 */
export function sanitizeMessage(content: string): string {
  let sanitized = content;

  for (const word of FORBIDDEN_WORDS) {
    const regex = new RegExp(word, 'gi');
    sanitized = sanitized.replace(regex, '*'.repeat(word.length));
  }

  return sanitized;
}

/**
 * Génère un message d'avertissement personnalisé
 */
export function generateWarningMessage(result: ModerationResult): string {
  if (result.isAcceptable) {
    return '';
  }

  if (result.flaggedWords.length > 0) {
    return 'Votre message contient des termes inappropriés. Veuillez reformuler votre message de manière respectueuse.';
  }

  if (result.score >= 50) {
    return 'Votre message a été signalé comme potentiellement inapproprié. Veuillez le reformuler.';
  }

  if (result.suggestions && result.suggestions.length > 0) {
    return result.suggestions[0];
  }

  return 'Veuillez vérifier le contenu de votre message.';
}

/**
 * Type pour stocker les signalements de messages
 */
export interface MessageReport {
  messageId: string;
  reporterId: string;
  reason: 'offensive' | 'spam' | 'harassment' | 'inappropriate' | 'other';
  description?: string;
  createdAt: string;
}

/**
 * Catégories de raisons de signalement
 */
export const REPORT_REASONS = {
  offensive: 'Contenu offensant ou vulgaire',
  spam: 'Spam ou publicité non sollicitée',
  harassment: 'Harcèlement ou menaces',
  inappropriate: 'Contenu inapproprié pour la plateforme',
  other: 'Autre raison',
} as const;
