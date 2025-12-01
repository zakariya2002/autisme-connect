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
    <div className="fixed bottom-0 left-0 right-0 z-[9999] bg-white border-t-2 border-gray-200 shadow-2xl p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <h3 className="font-semibold text-gray-900">Respect de votre vie privée</h3>
            </div>
            <p className="text-sm text-gray-600">
              Nous utilisons uniquement des <strong>cookies techniques essentiels</strong> pour le fonctionnement du site
              (authentification, session). Aucun cookie publicitaire ou de tracking.{' '}
              <Link href="/politique-confidentialite" className="text-primary-600 hover:underline">
                En savoir plus
              </Link>
            </p>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <button
              onClick={refuseCookies}
              className="flex-1 sm:flex-none px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Refuser
            </button>
            <button
              onClick={acceptCookies}
              className="flex-1 sm:flex-none px-6 py-2.5 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors shadow-md"
            >
              Accepter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
