'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Vérifier si l'utilisateur a déjà accepté les cookies
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    localStorage.setItem('cookie-consent-date', new Date().toISOString());
    setShowBanner(false);
  };

  const refuseCookies = () => {
    localStorage.setItem('cookie-consent', 'refused');
    localStorage.setItem('cookie-consent-date', new Date().toISOString());
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-6 sm:right-6 z-[9999] animate-slide-up">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-r from-primary-900 via-primary-800 to-indigo-900 rounded-2xl shadow-2xl border border-primary-700/50 p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Icône */}
            <div className="flex-shrink-0 w-12 h-12 bg-white/10 backdrop-blur rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-primary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>

            {/* Contenu */}
            <div className="flex-1">
              <h3 className="font-bold text-white text-lg mb-1">Votre vie privée compte</h3>
              <p className="text-sm text-primary-200/90 leading-relaxed">
                NeuroCare utilise uniquement des <span className="text-white font-medium">cookies essentiels</span> pour
                l'authentification et la session. Aucun tracking publicitaire.{' '}
                <Link href="/politique-confidentialite" className="text-primary-300 hover:text-white underline underline-offset-2 transition-colors">
                  Politique de confidentialité
                </Link>
              </p>
            </div>

            {/* Boutons */}
            <div className="flex gap-3 w-full sm:w-auto">
              <button
                onClick={refuseCookies}
                className="flex-1 sm:flex-none px-5 py-2.5 text-sm font-semibold text-primary-200 bg-white/10 hover:bg-white/20 border border-primary-500/30 rounded-xl transition-all duration-200"
              >
                Refuser
              </button>
              <button
                onClick={acceptCookies}
                className="flex-1 sm:flex-none px-6 py-2.5 text-sm font-semibold text-primary-900 bg-gradient-to-r from-primary-300 to-primary-400 hover:from-primary-200 hover:to-primary-300 rounded-xl transition-all duration-200 shadow-lg shadow-primary-500/25"
              >
                Accepter
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
