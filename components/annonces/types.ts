// Types & labels partagés pour les annonces familles (Phase 4)
// Note: la source de vérité côté DB est définie dans la migration Phase 1.
// Si les types/index.ts officiels arrivent plus tard, on pourra les importer ici.

export type AccompanimentType =
  | 'guidance_parentale'
  | 'soutien_scolaire'
  | 'aide_devoirs'
  | 'activites_loisirs'
  | 'autonomie_quotidien'
  | 'communication'
  | 'gestion_emotions'
  | 'socialisation'
  | 'remediation_cognitive'
  | 'sport_adapte'
  | 'transport_accompagnement'
  | 'autre';

export type TndContext = 'TSA' | 'TDAH' | 'DYS' | 'HPI' | 'TDI' | 'Autre';

export type PlaceType = 'domicile' | 'cabinet' | 'ecole' | 'institut' | 'club_sport' | 'autre';

export type GenderPreference = 'any' | 'male' | 'female';

export type AnnouncementStatus = 'draft' | 'published' | 'closed' | 'archived';

export type ResponseStatus =
  | 'pending'
  | 'read'
  | 'shortlisted'
  | 'accepted'
  | 'rejected'
  | 'withdrawn';

export interface FamilyAnnouncement {
  id: string;
  family_id: string;
  title: string;
  description: string;
  accompaniment_types: AccompanimentType[];
  desired_professions: string[];
  tnd_context: TndContext[];
  place_types: PlaceType[];
  gender_preference: GenderPreference;
  person_age: number | null;
  person_is_adult: boolean | null;
  city: string | null;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  radius_km: number | null;
  hours_per_week_min: number | null;
  hours_per_week_max: number | null;
  schedule_preferences: string | null;
  start_date: string | null;
  start_flexibility: string | null;
  status: AnnouncementStatus;
  response_count: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  family_first_name?: string;
  family_last_initial?: string;
}

export interface AnnouncementResponse {
  id: string;
  announcement_id: string;
  educator_id: string;
  message: string;
  proposed_hourly_rate: number | null;
  status: ResponseStatus;
  created_at: string;
  updated_at: string;
  announcement?: FamilyAnnouncement;
}

export const ACCOMPANIMENT_TYPE_LABELS: Record<AccompanimentType, string> = {
  guidance_parentale: 'Guidance parentale',
  soutien_scolaire: 'Soutien scolaire',
  aide_devoirs: 'Aide aux devoirs',
  activites_loisirs: 'Activités & loisirs',
  autonomie_quotidien: 'Autonomie au quotidien',
  communication: 'Communication',
  gestion_emotions: 'Gestion des émotions',
  socialisation: 'Socialisation',
  remediation_cognitive: 'Remédiation cognitive',
  sport_adapte: 'Sport adapté',
  transport_accompagnement: 'Transport / accompagnement',
  autre: 'Autre',
};

export const TND_CONTEXT_LABELS: Record<TndContext, string> = {
  TSA: 'TSA',
  TDAH: 'TDAH',
  DYS: 'DYS',
  HPI: 'HPI',
  TDI: 'TDI',
  Autre: 'Autre',
};

export const PLACE_TYPE_LABELS: Record<PlaceType, string> = {
  domicile: 'Domicile',
  cabinet: 'Cabinet',
  ecole: 'École',
  institut: 'Institut',
  club_sport: 'Club de sport',
  autre: 'Autre',
};

export const GENDER_PREFERENCE_LABELS: Record<GenderPreference, string> = {
  any: 'Indifférent',
  male: 'Masculin',
  female: 'Féminin',
};

export const RESPONSE_STATUS_LABELS: Record<ResponseStatus, string> = {
  pending: 'En attente',
  read: 'Lue',
  shortlisted: 'Présélectionnée',
  accepted: 'Acceptée',
  rejected: 'Refusée',
  withdrawn: 'Retirée',
};

export const RESPONSE_STATUS_COLORS: Record<ResponseStatus, { bg: string; text: string; border: string }> = {
  pending: { bg: 'rgba(245, 158, 11, 0.1)', text: '#b45309', border: 'rgba(245, 158, 11, 0.3)' },
  read: { bg: 'rgba(59, 130, 246, 0.1)', text: '#1d4ed8', border: 'rgba(59, 130, 246, 0.3)' },
  shortlisted: { bg: 'rgba(168, 85, 247, 0.1)', text: '#6b21a8', border: 'rgba(168, 85, 247, 0.3)' },
  accepted: { bg: 'rgba(34, 197, 94, 0.1)', text: '#15803d', border: 'rgba(34, 197, 94, 0.3)' },
  rejected: { bg: 'rgba(239, 68, 68, 0.1)', text: '#b91c1c', border: 'rgba(239, 68, 68, 0.3)' },
  withdrawn: { bg: 'rgba(107, 114, 128, 0.1)', text: '#374151', border: 'rgba(107, 114, 128, 0.3)' },
};

export function formatRelativeDate(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  const diffMs = Date.now() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return "à l'instant";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `il y a ${diffMin} min`;
  const diffHrs = Math.floor(diffMin / 60);
  if (diffHrs < 24) return `il y a ${diffHrs} h`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays < 7) return `il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 5) return `il y a ${diffWeeks} sem.`;
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return `il y a ${diffMonths} mois`;
  const diffYears = Math.floor(diffDays / 365);
  return `il y a ${diffYears} an${diffYears > 1 ? 's' : ''}`;
}

export function formatDateFr(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}
