'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Bouton hamburger */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden p-2 text-gray-700 hover:text-primary-600"
        aria-label="Menu"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Menu en plein écran */}
      {isOpen && (
        <div className="fixed inset-0 z-[9999] md:hidden">
          {/* Fond avec overlay */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Panneau du menu */}
          <div className="fixed top-0 left-0 bottom-0 w-full max-w-sm bg-white shadow-2xl flex flex-col">
            {/* En-tête avec gradient - Fixe */}
            <div className="flex-shrink-0 bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">Autisme Connect</h2>
                  <p className="text-sm text-primary-100 mt-1">Menu de navigation</p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-white hover:bg-white/20 rounded-lg flex-shrink-0"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Navigation - Scrollable */}
            <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
              <div className="mb-6">
                <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Navigation
                </p>

                <Link
                  href="/"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-lg font-medium"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Accueil
                </Link>

                <Link
                  href="/about"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-lg font-medium"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Qui sommes-nous ?
                </Link>

                <Link
                  href="/search"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-lg font-medium"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Trouver un éducateur
                </Link>

                <Link
                  href="/pricing"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-lg font-medium"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Tarifs
                </Link>

                <Link
                  href="/contact"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-lg font-medium"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Contact
                </Link>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Compte
                </p>

                <Link
                  href="/auth/login"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-lg font-medium"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Connexion
                </Link>

                <Link
                  href="/auth/signup"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-3 mt-3 mx-4 px-4 py-3.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg font-semibold shadow-lg hover:from-primary-700 hover:to-primary-800"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  Inscription
                </Link>
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
