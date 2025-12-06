'use client';

import { useState } from 'react';

interface NewsletterFormProps {
  audience?: 'famille' | 'pro' | 'general';
  source?: string;
  variant?: 'footer' | 'inline' | 'popup';
  className?: string;
}

export default function NewsletterForm({
  audience = 'general',
  source = 'website_footer',
  variant = 'footer',
  className = ''
}: NewsletterFormProps) {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          firstName,
          audience,
          source,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'inscription');
      }

      setSuccess(true);
      setEmail('');
      setFirstName('');
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className={`${className}`}>
        <div className="flex items-center gap-2 text-green-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-sm font-medium">Inscription confirmée !</span>
        </div>
        <p className="text-gray-400 text-xs mt-1">
          Vous recevrez bientôt nos conseils et actualités.
        </p>
      </div>
    );
  }

  if (variant === 'footer') {
    return (
      <div className={className}>
        <h3 className="text-white font-bold text-lg mb-3">Newsletter</h3>
        <p className="text-gray-400 text-sm mb-4">
          Recevez nos conseils et actualités chaque mois.
        </p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Votre prénom"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Votre email"
              required
              className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={loading || !email}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              )}
            </button>
          </div>
          {error && (
            <p className="text-red-400 text-xs">{error}</p>
          )}
          <p className="text-gray-500 text-xs">
            En vous inscrivant, vous acceptez de recevoir nos emails. Désabonnement possible à tout moment.
          </p>
        </form>
      </div>
    );
  }

  // Variant inline (pour pages internes)
  return (
    <div className={`bg-gradient-to-r from-primary-50 to-blue-50 rounded-xl p-6 ${className}`}>
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
          <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 mb-1">Restez informé</h3>
          <p className="text-gray-600 text-sm mb-4">
            Conseils pratiques, ressources et actualités sur l'accompagnement des troubles du neurodéveloppement.
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Votre email"
              required
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={loading || !email}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {loading ? 'Inscription...' : 'S\'inscrire'}
            </button>
          </form>
          {error && (
            <p className="text-red-600 text-sm mt-2">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
}
