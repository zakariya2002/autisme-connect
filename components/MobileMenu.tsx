'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const pathname = usePathname();

  // Fermer le menu quand on change de page
  useEffect(() => {
    handleClose();
  }, [pathname]);

  // Gérer les animations d'ouverture
  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => setIsOpen(false), 300);
  };

  return (
    <>
      {/* Bouton hamburger */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden p-2 text-gray-700 hover:text-primary-600 transition-colors duration-200"
        aria-label="Ouvrir le menu"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Overlay avec animation de fade */}
          <div
            className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
              isAnimating ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={handleClose}
          />

          {/* Menu latéral avec animation de slide depuis la gauche */}
          <div
            className={`fixed top-0 left-0 h-full w-72 bg-white shadow-2xl z-50 p-6 transform transition-transform duration-300 ease-out overflow-y-auto ${
              isAnimating ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            {/* En-tête du menu */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-primary-600">Menu</h2>
              <button
                onClick={handleClose}
                className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200"
                aria-label="Fermer le menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Logo section */}
            <div className="mb-6 p-4 bg-gradient-to-br from-primary-50 to-blue-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center border-2 border-primary-200">
                  <svg className="w-7 h-7 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-lg">Autisme Connect</p>
                  <p className="text-sm text-gray-600">Plateforme d'accompagnement</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex flex-col gap-2">
              <Link
                href="/"
                onClick={handleClose}
                className="bg-gradient-to-r from-primary-500 to-green-500 text-white hover:from-primary-600 hover:to-green-600 py-3 px-4 rounded-xl font-bold transition-all duration-200 flex items-center gap-3 shadow-lg"
              >
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <span>Accueil</span>
                <span className="ml-auto text-xs bg-white/20 px-2 py-1 rounded-full">🏠</span>
              </Link>

              <Link
                href="/about"
                onClick={handleClose}
                className="text-gray-700 hover:text-primary-600 hover:bg-primary-50 py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center gap-3"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Qui sommes-nous ?
              </Link>

              <Link
                href="/search"
                onClick={handleClose}
                className="text-gray-700 hover:text-primary-600 hover:bg-primary-50 py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center gap-3"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Trouver un éducateur
              </Link>

              <Link
                href="/pricing"
                onClick={handleClose}
                className="text-gray-700 hover:text-primary-600 hover:bg-primary-50 py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center gap-3"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Tarifs
              </Link>

              <Link
                href="/contact"
                onClick={handleClose}
                className="text-gray-700 hover:text-primary-600 hover:bg-primary-50 py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center gap-3"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Contact
              </Link>

              <div className="border-t border-gray-200 my-4"></div>

              <Link
                href="/auth/login"
                onClick={handleClose}
                className="text-gray-700 hover:text-primary-600 hover:bg-primary-50 py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center gap-3"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Connexion
              </Link>

              <Link
                href="/auth/signup"
                onClick={handleClose}
                className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-4 py-3 rounded-lg hover:from-primary-700 hover:to-primary-800 font-medium text-center transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 flex items-center justify-center gap-3"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                Créer un compte
              </Link>
            </nav>
          </div>
        </>
      )}
    </>
  );
}
