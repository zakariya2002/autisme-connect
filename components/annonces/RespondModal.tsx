'use client';

import { useEffect, useState } from 'react';
import { useToast } from '@/components/Toast';

type Props = {
  announcementId: string;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

const MIN_MESSAGE_LENGTH = 20;

export default function RespondModal({ announcementId, open, onClose, onSuccess }: Props) {
  const { showToast } = useToast();
  const [message, setMessage] = useState('');
  const [rate, setRate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setMessage('');
      setRate('');
      setError(null);
      setSubmitting(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !submitting) onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, submitting, onClose]);

  if (!open) return null;

  const canSubmit = message.trim().length >= MIN_MESSAGE_LENGTH && !submitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      const body: { message: string; proposed_hourly_rate?: number } = {
        message: message.trim(),
      };
      if (rate.trim()) {
        const parsed = parseFloat(rate.replace(',', '.'));
        if (!isNaN(parsed) && parsed > 0) body.proposed_hourly_rate = parsed;
      }
      const res = await fetch(`/api/announcements/${announcementId}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        let msg = 'Une erreur est survenue. Réessayez plus tard.';
        try {
          const data = await res.json();
          if (res.status === 409) {
            msg = "Vous avez déjà répondu à cette annonce.";
          } else if (data?.error) {
            msg = data.error;
          }
        } catch {
          // ignore
        }
        setError(msg);
        setSubmitting(false);
        return;
      }
      showToast('Votre réponse a été envoyée', 'success');
      onSuccess();
    } catch (err: any) {
      setError(err?.message || "Impossible d'envoyer la réponse.");
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className="fixed inset-0 bg-black/50"
        onClick={() => !submitting && onClose()}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="respond-modal-title"
        className="relative bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 id="respond-modal-title" className="text-lg font-bold text-gray-900" style={{ fontFamily: 'Verdana, sans-serif' }}>
            Répondre à l'annonce
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
            aria-label="Fermer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          <div>
            <label htmlFor="respond-message" className="block text-sm font-semibold text-gray-700 mb-1">
              Votre message
            </label>
            <textarea
              id="respond-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              placeholder="Présentez-vous, votre expérience, ce que vous proposez à la famille…"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:border-transparent transition-all"
              disabled={submitting}
              required
              minLength={MIN_MESSAGE_LENGTH}
            />
            <div className="flex items-center justify-between mt-1 text-xs">
              <span className={message.trim().length < MIN_MESSAGE_LENGTH ? 'text-red-500' : 'text-gray-500'}>
                {message.trim().length < MIN_MESSAGE_LENGTH
                  ? `Encore ${MIN_MESSAGE_LENGTH - message.trim().length} caractères minimum`
                  : 'Longueur OK'}
              </span>
              <span className="text-gray-400">{message.length} caractère(s)</span>
            </div>
          </div>

          <div>
            <label htmlFor="respond-rate" className="block text-sm font-semibold text-gray-700 mb-1">
              Tarif horaire proposé <span className="font-normal text-gray-400">(optionnel)</span>
            </label>
            <div className="relative">
              <input
                id="respond-rate"
                type="number"
                step="0.5"
                min="0"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                placeholder="Ex: 35"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 text-sm focus:ring-2 focus:border-transparent transition-all"
                disabled={submitting}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">€/h</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Laissez vide pour utiliser votre tarif standard.</p>
          </div>

          {error && (
            <div
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
              role="alert"
            >
              {error}
            </div>
          )}
        </form>

        <div className="px-5 py-4 border-t border-gray-100 flex flex-col sm:flex-row gap-2 sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-all disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="px-4 py-2.5 rounded-xl text-white font-semibold shadow-md hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
            style={{ backgroundColor: '#027e7e' }}
          >
            {submitting ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" aria-hidden="true"></div>
                <span>Envoi en cours…</span>
              </>
            ) : (
              <>
                Envoyer ma réponse
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
