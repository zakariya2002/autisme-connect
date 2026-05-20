'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  AnnouncementResponse,
  RESPONSE_STATUS_LABELS,
  RESPONSE_STATUS_COLORS,
  formatDateFr,
  formatRelativeDate,
} from './types';

type Props = {
  response: AnnouncementResponse;
  onWithdrawn: (responseId: string) => void;
};

export default function MyResponseCard({ response, onWithdrawn }: Props) {
  const [withdrawing, setWithdrawing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const status = response.status;
  const colors = RESPONSE_STATUS_COLORS[status];
  const announcement = response.announcement;
  const canWithdraw = status === 'pending' || status === 'read';

  const handleWithdraw = async () => {
    if (!canWithdraw) return;
    if (!window.confirm('Retirer votre candidature pour cette annonce ?')) return;
    setWithdrawing(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/announcements/${response.announcement_id}/responses/${response.id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'withdrawn' }),
        },
      );
      if (!res.ok) {
        let msg = 'Impossible de retirer la candidature.';
        try {
          const data = await res.json();
          if (data?.error) msg = data.error;
        } catch {
          // ignore
        }
        setError(msg);
        setWithdrawing(false);
        return;
      }
      onWithdrawn(response.id);
    } catch {
      setError('Erreur réseau. Réessayez.');
      setWithdrawing(false);
    }
  };

  const excerpt =
    response.message.length > 180 ? `${response.message.slice(0, 180).trim()}…` : response.message;

  return (
    <div className="bg-white rounded-xl md:rounded-2xl shadow-md border border-gray-100 overflow-hidden">
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="min-w-0">
            {announcement ? (
              <Link
                href={`/annonces/${response.announcement_id}`}
                className="text-base sm:text-lg font-bold text-gray-900 hover:text-teal-700 transition-colors line-clamp-2"
                style={{ fontFamily: 'Verdana, sans-serif' }}
              >
                {announcement.title}
              </Link>
            ) : (
              <Link
                href={`/annonces/${response.announcement_id}`}
                className="text-base sm:text-lg font-bold text-gray-900 hover:text-teal-700 transition-colors"
              >
                Annonce
              </Link>
            )}
            <div className="flex items-center flex-wrap gap-x-2 gap-y-1 mt-1 text-xs sm:text-sm text-gray-500">
              {announcement?.city && (
                <span className="inline-flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {announcement.city}
                </span>
              )}
              <span aria-hidden="true">·</span>
              <span title={formatDateFr(response.created_at)}>
                Envoyée {formatRelativeDate(response.created_at)}
              </span>
            </div>
          </div>
          <span
            className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border whitespace-nowrap"
            style={{
              backgroundColor: colors.bg,
              color: colors.text,
              borderColor: colors.border,
            }}
          >
            {RESPONSE_STATUS_LABELS[status]}
          </span>
        </div>

        <p className="text-sm text-gray-700 mb-3 whitespace-pre-line">{excerpt}</p>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-gray-100">
          <div className="text-sm text-gray-600">
            {response.proposed_hourly_rate ? (
              <span className="inline-flex items-center gap-1">
                <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Tarif proposé : <strong>{response.proposed_hourly_rate} €/h</strong>
              </span>
            ) : (
              <span className="text-gray-400">Tarif standard</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/annonces/${response.announcement_id}`}
              className="text-xs sm:text-sm font-semibold text-gray-600 hover:text-teal-700"
            >
              Voir l'annonce →
            </Link>
            {canWithdraw && (
              <button
                type="button"
                onClick={handleWithdraw}
                disabled={withdrawing}
                className="text-xs sm:text-sm font-semibold text-red-600 hover:text-red-700 disabled:opacity-50"
              >
                {withdrawing ? 'Retrait…' : 'Retirer ma candidature'}
              </button>
            )}
          </div>
        </div>

        {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      </div>
    </div>
  );
}
