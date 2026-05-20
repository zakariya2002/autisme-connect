// Types locaux pour le wizard d'annonces famille.
// L'unique source de verite pour le modele restera `types/index.ts` une fois la
// migration appliquee — ici on duplique le strict necessaire pour que la UI
// puisse fonctionner avant que les types globaux soient pousses.

export type AnnouncementStatus =
  | 'draft'
  | 'pending'
  | 'published'
  | 'rejected'
  | 'filled'
  | 'expired'
  | 'archived';

export type GenderPreference = 'any' | 'male' | 'female';
export type StartDateFlexibility = 'immediate' | 'flexible' | 'fixed';

export interface AnnouncementFormData {
  title: string;
  description: string;
  accompaniment_types: string[];
  desired_professions: string[];
  tnd_context: string[];

  child_id: string | null;
  person_age: number | null;
  gender_preference: GenderPreference;

  location_label: string;
  city: string;
  postal_code: string;
  latitude: number | null;
  longitude: number | null;
  radius_km: number;
  place_types: string[];
  hours_per_week: number | null;
  schedule_preferences: string[];
  start_date: string;
  start_date_flexibility: StartDateFlexibility;
}

export interface FamilyAnnouncement extends AnnouncementFormData {
  id: string;
  family_id: string;
  status: AnnouncementStatus;
  rejection_reason?: string | null;
  response_count?: number;
  created_at: string;
  updated_at: string;
  published_at?: string | null;
  expires_at?: string | null;
}

export interface AnnouncementResponse {
  id: string;
  announcement_id: string;
  educator_id: string;
  message: string;
  proposed_hourly_rate?: number | null;
  status: 'pending' | 'read' | 'shortlisted' | 'accepted' | 'declined' | 'withdrawn';
  created_at: string;
  educator?: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url?: string | null;
    profile_image_url?: string | null;
    profession_type?: string | null;
    location?: string | null;
    hourly_rate?: number | null;
    rating?: number | null;
    total_reviews?: number | null;
    verification_badge?: boolean | null;
  };
}

export interface ChildProfileLite {
  id: string;
  first_name: string;
  last_name: string | null;
  age: number | null;
  birth_date: string | null;
}

export const ACCOMPANIMENT_OPTIONS = [
  { value: 'educatif', label: 'Éducatif' },
  { value: 'scolaire', label: 'Scolaire' },
  { value: 'sport_adapte', label: 'Sport adapté' },
  { value: 'guidance_parentale', label: 'Guidance parentale' },
  { value: 'comportemental', label: 'Comportemental' },
  { value: 'liberal', label: 'Libéral' },
];

export const PROFESSION_OPTIONS = [
  { value: 'educateur_specialise', label: 'Éducateur spécialisé' },
  { value: 'psychomotricien', label: 'Psychomotricien' },
  { value: 'psychologue', label: 'Psychologue' },
  { value: 'ergotherapeute', label: 'Ergothérapeute' },
  { value: 'orthophoniste', label: 'Orthophoniste' },
  { value: 'aes_aesh', label: 'AES/AESH' },
  { value: 'sportif_adapte', label: 'Sportif adapté' },
  { value: 'autre', label: 'Autre' },
];

export const TND_OPTIONS = [
  { value: 'TSA', label: 'TSA' },
  { value: 'TDAH', label: 'TDAH' },
  { value: 'DYS', label: 'DYS' },
  { value: 'HPI', label: 'HPI' },
  { value: 'TDI', label: 'TDI' },
  { value: 'AUTRE', label: 'Autre' },
];

export const PLACE_OPTIONS = [
  { value: 'domicile', label: 'Domicile' },
  { value: 'cabinet', label: 'Cabinet' },
  { value: 'ecole', label: 'École' },
  { value: 'institut', label: 'Institut' },
  { value: 'club_sport', label: 'Club de sport' },
  { value: 'autre', label: 'Autre' },
];

export const SCHEDULE_OPTIONS = [
  { value: 'matin', label: 'Matin' },
  { value: 'apres_midi', label: 'Après-midi' },
  { value: 'soir', label: 'Soir' },
  { value: 'week_end', label: 'Week-end' },
];

export const STATUS_LABELS: Record<AnnouncementStatus, string> = {
  draft: 'Brouillon',
  pending: 'En attente',
  published: 'Publiée',
  rejected: 'Refusée',
  filled: 'Pourvue',
  expired: 'Expirée',
  archived: 'Archivée',
};

export const STATUS_COLORS: Record<AnnouncementStatus, { bg: string; text: string; border: string }> = {
  draft: { bg: 'rgba(107, 114, 128, 0.1)', text: '#4b5563', border: 'rgba(107, 114, 128, 0.3)' },
  pending: { bg: 'rgba(245, 158, 11, 0.1)', text: '#b45309', border: 'rgba(245, 158, 11, 0.3)' },
  published: { bg: 'rgba(2, 126, 126, 0.1)', text: '#027e7e', border: 'rgba(2, 126, 126, 0.3)' },
  rejected: { bg: 'rgba(220, 38, 38, 0.1)', text: '#b91c1c', border: 'rgba(220, 38, 38, 0.3)' },
  filled: { bg: 'rgba(34, 197, 94, 0.1)', text: '#15803d', border: 'rgba(34, 197, 94, 0.3)' },
  expired: { bg: 'rgba(107, 114, 128, 0.1)', text: '#6b7280', border: 'rgba(107, 114, 128, 0.3)' },
  archived: { bg: 'rgba(107, 114, 128, 0.1)', text: '#6b7280', border: 'rgba(107, 114, 128, 0.3)' },
};

export function emptyForm(): AnnouncementFormData {
  return {
    title: '',
    description: '',
    accompaniment_types: [],
    desired_professions: [],
    tnd_context: [],
    child_id: null,
    person_age: null,
    gender_preference: 'any',
    location_label: '',
    city: '',
    postal_code: '',
    latitude: null,
    longitude: null,
    radius_km: 10,
    place_types: [],
    hours_per_week: null,
    schedule_preferences: [],
    start_date: '',
    start_date_flexibility: 'flexible',
  };
}
