'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface FamilyMobileMenuProps {
  profile: any;
  onLogout: () => void;
}

export default function FamilyMobileMenu({ profile, onLogout }: FamilyMobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => setIsOpen(false), 300);
  };

  const handleLogoutClick = () => {
    handleClose();
    onLogout();
  };

  return (
    <>
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

            {/* Profil utilisateur */}
            <div className="mb-6 p-4 bg-gradient-to-br from-blue-50 to-green-50 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={`${profile.first_name} ${profile.last_name}`}
                    className="h-12 w-12 rounded-full object-cover border-2 border-blue-200"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center border-2 border-blue-200">
                    <span className="text-blue-600 font-semibold text-lg">
                      {profile?.first_name?.[0]}{profile?.last_name?.[0]}
                    </span>
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{profile?.first_name} {profile?.last_name}</p>
                  <p className="text-xs text-gray-500">Compte famille</p>
                </div>
              </div>
              <div className="mt-2 px-3 py-1.5 bg-green-100 rounded-lg text-center">
                <p className="text-xs font-semibold text-green-700">✓ 100% Gratuit</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex flex-col gap-2">
              <Link
                href="/dashboard/family"
                onClick={handleClose}
                className="text-gray-700 hover:text-primary-600 hover:bg-primary-50 py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center gap-3"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Tableau de bord
              </Link>

              <Link
                href="/dashboard/family/profile"
                onClick={handleClose}
                className="text-gray-700 hover:text-primary-600 hover:bg-primary-50 py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center gap-3"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Mon profil
              </Link>

              <Link
                href="/search"
                onClick={handleClose}
                className="text-gray-700 hover:text-primary-600 hover:bg-primary-50 py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center gap-3"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Chercher un éducateur
              </Link>

              <Link
                href="/bookings"
                onClick={handleClose}
                className="text-gray-700 hover:text-primary-600 hover:bg-primary-50 py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center gap-3"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Mes rendez-vous
              </Link>

              <Link
                href="/messages"
                onClick={handleClose}
                className="text-gray-700 hover:text-primary-600 hover:bg-primary-50 py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center gap-3"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                Messages
              </Link>

              <div className="border-t border-gray-200 my-4"></div>

              <button
                onClick={handleLogoutClick}
                className="text-gray-700 hover:text-red-600 hover:bg-red-50 py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center gap-3 w-full text-left"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Déconnexion
              </button>
            </nav>
          </div>
        </>
      )}
    </>
  );
}
