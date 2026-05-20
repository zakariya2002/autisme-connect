import { z } from 'zod';

// Énumérations alignées sur le schéma SQL (20260520_family_announcements.sql)
// et sur les types TS dans @/types.

export const ACCOMPANIMENT_TYPES = [
  'educatif',
  'scolaire',
  'sport_adapte',
  'guidance_parentale',
  'comportemental',
  'liberal',
] as const;

export const DESIRED_PROFESSIONS = [
  'educateur_specialise',
  'psychomotricien',
  'psychologue',
  'ergotherapeute',
  'orthophoniste',
  'aes_aesh',
  'sportif_adapte',
  'autre',
] as const;

export const TND_CONTEXTS = ['TSA', 'TDAH', 'DYS', 'HPI', 'TDI', 'AUTRE'] as const;

export const PLACE_TYPES = [
  'domicile',
  'cabinet',
  'ecole',
  'institut',
  'club_sport',
  'autre',
] as const;

// Contrainte CHECK en DB : ('immediate', 'flexible', 'fixed')
export const START_FLEXIBILITY = ['immediate', 'flexible', 'fixed'] as const;

// Contrainte CHECK en DB
export const ANNOUNCEMENT_STATUS = [
  'draft',
  'pending',
  'published',
  'rejected',
  'expired',
  'filled',
  'archived',
] as const;

// Contrainte CHECK en DB
export const RESPONSE_STATUS = [
  'pending',
  'read',
  'shortlisted',
  'accepted',
  'declined',
  'withdrawn',
] as const;

// Contrainte CHECK en DB : ('any', 'male', 'female')
export const GENDER_PREFERENCES = ['any', 'male', 'female'] as const;

const accompanimentType = z.enum(ACCOMPANIMENT_TYPES);
const desiredProfession = z.enum(DESIRED_PROFESSIONS);
const tndContext = z.enum(TND_CONTEXTS);
const placeType = z.enum(PLACE_TYPES);
const startFlex = z.enum(START_FLEXIBILITY);
const genderPref = z.enum(GENDER_PREFERENCES);

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format date attendu YYYY-MM-DD');

const schedulePreferencesSchema = z
  .object({
    days: z
      .array(z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']))
      .optional(),
    time_ranges: z
      .array(z.object({ start: z.string(), end: z.string() }))
      .optional(),
    tags: z.array(z.string()).optional(),
  })
  .nullable()
  .optional();

// CREATE : payload accepté par POST /api/family/announcements
// Les contraintes en DB : title len >= 8, description len >= 30.
export const createAnnouncementSchema = z.object({
  child_id: z.string().uuid().nullable().optional(),

  title: z.string().trim().min(8).max(120),
  description: z.string().trim().min(30).max(5000),

  accompaniment_types: z.array(accompanimentType).min(1),
  desired_professions: z.array(desiredProfession).min(1),
  tnd_context: z.array(tndContext).min(1),
  place_types: z.array(placeType).min(1),

  person_age: z.number().int().min(0).max(120).nullable().optional(),
  gender_preference: genderPref.optional().default('any'),

  location_label: z.string().min(2).max(200),
  city: z.string().min(1).max(100),
  postal_code: z.string().regex(/^\d{4,5}$/).nullable().optional(),
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
  radius_km: z.number().int().min(1).max(100).optional().default(10),

  hours_per_week: z.number().positive().max(168).nullable().optional(),
  schedule_preferences: schedulePreferencesSchema,

  start_date: isoDate.nullable().optional(),
  start_date_flexibility: startFlex.optional().default('flexible'),

  // Le client peut indiquer 'draft' pour sauvegarder un brouillon ; sinon le
  // serveur force 'pending' (pré-modération).
  status: z.enum(['draft', 'pending']).optional(),
});

export type CreateAnnouncementInput = z.infer<typeof createAnnouncementSchema>;

// UPDATE famille : tous les champs de contenu, plus archivage et brouillon
export const updateAnnouncementSchema = z.object({
  child_id: z.string().uuid().nullable().optional(),

  title: z.string().trim().min(8).max(120).optional(),
  description: z.string().trim().min(30).max(5000).optional(),

  accompaniment_types: z.array(accompanimentType).min(1).optional(),
  desired_professions: z.array(desiredProfession).min(1).optional(),
  tnd_context: z.array(tndContext).min(1).optional(),
  place_types: z.array(placeType).min(1).optional(),

  person_age: z.number().int().min(0).max(120).nullable().optional(),
  gender_preference: genderPref.optional(),

  location_label: z.string().min(2).max(200).optional(),
  city: z.string().min(1).max(100).optional(),
  postal_code: z.string().regex(/^\d{4,5}$/).nullable().optional(),
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
  radius_km: z.number().int().min(1).max(100).optional(),

  hours_per_week: z.number().positive().max(168).nullable().optional(),
  schedule_preferences: schedulePreferencesSchema,

  start_date: isoDate.nullable().optional(),
  start_date_flexibility: startFlex.optional(),

  // Transitions admises côté famille : draft (sauvegarde), archived (désactivation),
  // filled (marquer pourvue), pending (soumettre une annonce en brouillon).
  // Le serveur enforce le reset à 'pending' si du contenu change ailleurs.
  status: z.enum(['draft', 'pending', 'archived', 'filled']).optional(),
});

export type UpdateAnnouncementInput = z.infer<typeof updateAnnouncementSchema>;

// Filtres pour GET /api/announcements (listing public)
const csvArray = <T extends z.ZodTypeAny>(item: T) =>
  z.preprocess((v) => {
    if (v == null || v === '') return undefined;
    if (Array.isArray(v)) return v;
    if (typeof v === 'string') return v.split(',').map((s) => s.trim()).filter(Boolean);
    return v;
  }, z.array(item).optional());

const numFromQuery = z.preprocess((v) => {
  if (v == null || v === '') return undefined;
  if (typeof v === 'number') return v;
  if (typeof v === 'string') {
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  }
  return undefined;
}, z.number().optional());

export const announcementFiltersSchema = z.object({
  city: z.string().min(1).optional(),
  lat: numFromQuery,
  lng: numFromQuery,
  radius_km: numFromQuery,

  accompaniment_types: csvArray(accompanimentType),
  desired_professions: csvArray(desiredProfession),
  tnd_context: csvArray(tndContext),
  place_types: csvArray(placeType),

  min_hours_per_week: numFromQuery,
  max_hours_per_week: numFromQuery,
  gender_preference: genderPref.optional(),
  start_date_from: isoDate.optional(),

  limit: z.preprocess((v) => {
    if (v == null || v === '') return undefined;
    const n = Number(v);
    return Number.isFinite(n) ? Math.min(Math.max(n, 1), 50) : undefined;
  }, z.number().int().min(1).max(50).default(20)),

  offset: z.preprocess((v) => {
    if (v == null || v === '') return undefined;
    const n = Number(v);
    return Number.isFinite(n) ? Math.max(n, 0) : undefined;
  }, z.number().int().min(0).default(0)),
});

export type AnnouncementFiltersInput = z.infer<typeof announcementFiltersSchema>;

// Candidature pro : POST /api/announcements/[id]/respond
export const respondAnnouncementSchema = z.object({
  message: z.string().trim().min(20).max(3000),
  proposed_hourly_rate: z.number().positive().max(500).nullable().optional(),
});

export type RespondAnnouncementInput = z.infer<typeof respondAnnouncementSchema>;

// PATCH /api/announcements/[id]/responses/[responseId] : transition de statut
// Le serveur valide la transition selon le rôle (famille vs pro).
export const updateResponseSchema = z.object({
  status: z.enum(['read', 'shortlisted', 'accepted', 'declined', 'withdrawn']),
});

export type UpdateResponseInput = z.infer<typeof updateResponseSchema>;

// Champs de contenu — toute modification force la re-modération (status -> 'pending')
export const CONTENT_FIELDS = [
  'title',
  'description',
  'accompaniment_types',
  'desired_professions',
  'tnd_context',
  'place_types',
  'person_age',
  'gender_preference',
  'location_label',
  'city',
  'postal_code',
  'latitude',
  'longitude',
  'radius_km',
  'hours_per_week',
  'schedule_preferences',
  'start_date',
  'start_date_flexibility',
  'child_id',
] as const;
