export type UserType = 'family' | 'educator';

export interface FeedbackQuestion {
  id: string;
  question: string;
  category: string;
}

export interface FeedbackResponse {
  questionId: string;
  score: number | null;
  comment: string;
}

export interface UserFeedback {
  id: string;
  user_id: string;
  user_type: UserType;
  responses: FeedbackResponse[];
  overall_score: number | null;
  created_at: string;
  updated_at: string;
}

// Questions pour les familles
export const FAMILY_QUESTIONS: FeedbackQuestion[] = [
  {
    id: 'family_search',
    question: 'Dans quelle mesure la recherche de professionnels répond-elle à vos besoins ?',
    category: 'Recherche',
  },
  {
    id: 'family_profiles',
    question: 'Les profils des professionnels sont-ils suffisamment détaillés et clairs ?',
    category: 'Profils',
  },
  {
    id: 'family_booking',
    question: 'Le processus de réservation est-il simple et intuitif ?',
    category: 'Réservation',
  },
  {
    id: 'family_appointments',
    question: 'La gestion de vos rendez-vous (confirmation, annulation) est-elle facile ?',
    category: 'Rendez-vous',
  },
  {
    id: 'family_children',
    question: "L'espace \"Mes proches\" (dossier enfant, PPA) répond-il à vos attentes ?",
    category: 'Dossier',
  },
  {
    id: 'family_communication',
    question: 'La communication avec les professionnels est-elle fluide ?',
    category: 'Communication',
  },
  {
    id: 'family_pricing',
    question: 'Les informations sur les tarifs sont-elles claires et transparentes ?',
    category: 'Tarifs',
  },
  {
    id: 'family_nps',
    question: 'Recommanderiez-vous NeuroCare à d\'autres familles ?',
    category: 'NPS',
  },
];

// Questions pour les professionnels
export const EDUCATOR_QUESTIONS: FeedbackQuestion[] = [
  {
    id: 'educator_profile',
    question: 'La création et gestion de votre profil est-elle simple ?',
    category: 'Profil',
  },
  {
    id: 'educator_availability',
    question: 'Le système de gestion des disponibilités est-il pratique ?',
    category: 'Disponibilités',
  },
  {
    id: 'educator_appointments',
    question: 'La gestion des rendez-vous (validation, annulation) est-elle efficace ?',
    category: 'Rendez-vous',
  },
  {
    id: 'educator_payments',
    question: 'Le système de paiement et facturation est-il clair ?',
    category: 'Paiements',
  },
  {
    id: 'educator_dossier',
    question: "L'accès au dossier des enfants pendant les séances est-il utile ?",
    category: 'Dossier',
  },
  {
    id: 'educator_communication',
    question: 'La communication avec les familles est-elle fluide ?',
    category: 'Communication',
  },
  {
    id: 'educator_visibility',
    question: 'Êtes-vous satisfait de votre visibilité sur la plateforme ?',
    category: 'Visibilité',
  },
  {
    id: 'educator_nps',
    question: 'Recommanderiez-vous NeuroCare à d\'autres professionnels ?',
    category: 'NPS',
  },
];

export const getQuestionsForUserType = (userType: UserType): FeedbackQuestion[] => {
  return userType === 'family' ? FAMILY_QUESTIONS : EDUCATOR_QUESTIONS;
};
