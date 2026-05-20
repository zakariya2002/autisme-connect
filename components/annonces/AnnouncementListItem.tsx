'use client';

import Link from 'next/link';
import {
  FamilyAnnouncement,
  ACCOMPANIMENT_TYPE_LABELS,
  TND_CONTEXT_LABELS,
  formatRelativeDate,
  AccompanimentType,
  TndContext,
} from './types';

type Props = {
  announcement: FamilyAnnouncement & { distance?: number };
};

const MAX_TAGS = 4;

export default function AnnouncementListItem({ announcement }: Props) {
  const a = announcement;
  const tags: { label: string; kind: 'accompaniment' | 'tnd' }[] = [
    ...(a.accompaniment_types || []).map((t) => ({
      label: ACCOMPANIMENT_TYPE_LABELS[t as AccompanimentType] || t,
      kind: 'accompaniment' as const,
    })),
    ...(a.tnd_context || []).map((t) => ({
      label: TND_CONTEXT_LABELS[t as TndContext] || t,
      kind: 'tnd' as const,
    })),
  ];
  const visibleTags = tags.slice(0, MAX_TAGS);
  const extraCount = tags.length - visibleTags.length;

  const personLabel = a.person_is_adult
    ? a.person_age
      ? `Adulte de ${a.person_age} ans`
      : 'Adulte'
    : a.person_age
    ? `Enfant de ${a.person_age} ans`
    : 'Enfant';

  const hoursLabel =
    a.hours_per_week_min && a.hours_per_week_max
      ? a.hours_per_week_min === a.hours_per_week_max
        ? `${a.hours_per_week_min} h/sem`
        : `${a.hours_per_week_min}–${a.hours_per_week_max} h/sem`
      : a.hours_per_week_max
      ? `~${a.hours_per_week_max} h/sem`
      : a.hours_per_week_min
      ? `dès ${a.hours_per_week_min} h/sem`
      : null;

  const startLabel = a.start_date
    ? `Début : ${new Date(a.start_date).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })}`
    : null;

  return (
    <div className="bg-white rounded-xl md:rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden group hover:-translate-y-1">
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="min-w-0">
            <h3
              className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-teal-700 transition-colors line-clamp-2"
              style={{ fontFamily: 'Verdana, sans-serif' }}
            >
              {a.title}
            </h3>
            <div className="flex items-center flex-wrap gap-x-2 gap-y-1 mt-1 text-xs sm:text-sm text-gray-500">
              {a.city && (
                <span className="inline-flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {a.city}
                  {typeof a.distance === 'number' && (
                    <span className="ml-1 text-gray-400">· {a.distance} km</span>
                  )}
                </span>
              )}
              <span aria-hidden="true">·</span>
              <span>{formatRelativeDate(a.published_at || a.created_at)}</span>
            </div>
          </div>
        </div>

        {visibleTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {visibleTags.map((tag, i) => (
              <span
                key={`${tag.kind}-${i}`}
                className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border"
                style={
                  tag.kind === 'accompaniment'
                    ? {
                        backgroundColor: 'rgba(2, 126, 126, 0.08)',
                        color: '#027e7e',
                        borderColor: 'rgba(2, 126, 126, 0.2)',
                      }
                    : {
                        backgroundColor: 'rgba(240, 135, 159, 0.1)',
                        color: '#b9456d',
                        borderColor: 'rgba(240, 135, 159, 0.25)',
                      }
                }
              >
                {tag.label}
              </span>
            ))}
            {extraCount > 0 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                + {extraCount}
              </span>
            )}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-gray-600 mb-4">
          <span className="inline-flex items-center gap-1">
            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            {personLabel}
          </span>
          {hoursLabel && (
            <span className="inline-flex items-center gap-1">
              <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {hoursLabel}
            </span>
          )}
          {startLabel && (
            <span className="inline-flex items-center gap-1">
              <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {startLabel}
            </span>
          )}
        </div>

        <div className="flex items-center justify-end">
          <Link
            href={`/annonces/${a.id}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white rounded-xl hover:opacity-90 transition-all shadow-md hover:shadow-lg"
            style={{ backgroundColor: '#027e7e' }}
            aria-label={`Voir l'annonce ${a.title}`}
          >
            Voir l'annonce
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
