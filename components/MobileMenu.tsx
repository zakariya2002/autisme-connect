'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Fermer le menu quand on change de page
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Note: Le scroll n'est plus bloqué pour permettre une navigation dynamique

  return (
    <>
      {/* Bouton hamburger avec animation */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden p-2 text-gray-700 hover:text-primary-600 relative z-50 transition-colors"
        aria-label="Menu"
        aria-expanded={isOpen}
      >
        <div className="w-6 h-5 flex flex-col justify-between">
          <span
            className={`block h-0.5 bg-current transition-all duration-300 origin-center ${
              isOpen ? 'rotate-45 translate-y-2' : ''
            }`}
          />
          <span
            className={`block h-0.5 bg-current transition-all duration-300 ${
              isOpen ? 'opacity-0 scale-0' : 'opacity-100 scale-100'
            }`}
          />
          <span
            className={`block h-0.5 bg-current transition-all duration-300 origin-center ${
              isOpen ? '-rotate-45 -translate-y-2' : ''
            }`}
          />
        </div>
      </button>

      {/* Overlay sombre */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Menu slide-in depuis la droite */}
      <div
        className={`fixed top-0 right-0 h-full w-80 max-w-[85vw] z-50 md:hidden transform transition-transform duration-300 ease-out shadow-2xl ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ backgroundColor: '#ffffff' }}
      >
        {/* Header du menu */}
        <div
          className="px-6 py-6 text-white"
          style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
          }}
        >
          <h2 className="text-xl font-bold">Menu</h2>
          <p className="text-blue-100 text-sm">Autisme Connect</p>
        </div>

        {/* Navigation */}
        <nav
          className="flex flex-col py-6 px-4 gap-1 overflow-y-auto max-h-[calc(100vh-140px)]"
          style={{ backgroundColor: '#ffffff' }}
        >
          {/* Section principale */}
          <div className="mb-4">
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium transition-all hover:bg-primary-50 hover:text-primary-700 group ${
                pathname === '/' ? 'bg-primary-50 text-primary-700' : 'text-gray-700'
              }`}
            >
              <svg className="w-5 h-5 text-primary-600 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>Accueil</span>
            </Link>

            <Link
              href="/about"
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium transition-all hover:bg-primary-50 hover:text-primary-700 group ${
                pathname === '/about' ? 'bg-primary-50 text-primary-700' : 'text-gray-700'
              }`}
            >
              <svg className="w-5 h-5 text-primary-600 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Qui sommes-nous ?</span>
            </Link>

            <Link
              href="/search"
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium transition-all hover:bg-primary-50 hover:text-primary-700 group ${
                pathname === '/search' ? 'bg-primary-50 text-primary-700' : 'text-gray-700'
              }`}
            >
              <svg className="w-5 h-5 text-primary-600 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span>Trouver un éducateur</span>
            </Link>

            <Link
              href="/pricing"
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium transition-all hover:bg-primary-50 hover:text-primary-700 group ${
                pathname === '/pricing' ? 'bg-primary-50 text-primary-700' : 'text-gray-700'
              }`}
            >
              <svg className="w-5 h-5 text-primary-600 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Tarifs</span>
            </Link>

            <Link
              href="/contact"
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium transition-all hover:bg-primary-50 hover:text-primary-700 group ${
                pathname === '/contact' ? 'bg-primary-50 text-primary-700' : 'text-gray-700'
              }`}
            >
              <svg className="w-5 h-5 text-primary-600 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>Contact</span>
            </Link>
          </div>

          {/* Séparateur */}
          <div className="border-t border-gray-200 my-2" />

          {/* Section compte */}
          <div className="space-y-1">
            <Link
              href="/auth/login"
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium transition-all hover:bg-gray-50 hover:text-gray-900 group ${
                pathname === '/auth/login' ? 'bg-gray-50 text-gray-900' : 'text-gray-600'
              }`}
            >
              <svg className="w-5 h-5 text-gray-500 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              <span>Connexion</span>
            </Link>

            <Link
              href="/auth/signup"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-3.5 rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] mx-2 mt-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              <span>Créer un compte</span>
            </Link>
          </div>
        </nav>
      </div>
    </>
  );
}
