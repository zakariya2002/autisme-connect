'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface FamilyMobileMenuProps {
  profile: any;
  onLogout: () => void;
}

export default function FamilyMobileMenu({ profile, onLogout }: FamilyMobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  // Pour le portal - s'assurer qu'on est côté client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fermer le menu quand on change de page
  useEffect(() => {
    closeMenu();
  }, [pathname]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // Fermer avec la touche Échap (RGAA)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeMenu();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const openMenu = () => {
    setIsOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeMenu = () => {
    setIsOpen(false);
    document.body.style.overflow = '';
  };

  const handleLogoutClick = () => {
    closeMenu();
    onLogout();
  };

  // Le contenu du menu qui sera rendu via portal
  const menuContent = (
    <div
      className="fixed inset-0 overflow-hidden"
      style={{ zIndex: 99999, touchAction: 'none' }}
    >
      {/* Overlay sombre pour le fond */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={closeMenu}
        onTouchMove={(e) => e.preventDefault()}
      />

      {/* Menu panel - à droite */}
      <div
        className="absolute top-0 right-0 h-full w-[320px] max-w-[90vw] bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="family-mobile-menu-title"
      >
        {/* Contenu du menu */}
        <div className="relative h-full flex flex-col">
          {/* Header avec titre et croix */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 id="family-mobile-menu-title" className="text-xl font-bold text-primary-600">Menu</h2>
            <button
              onClick={closeMenu}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              aria-label="Fermer le menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Profil utilisateur */}
          <div className="px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-blue-50 to-green-50 rounded-lg">
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
              <p className="text-xs font-semibold text-green-700">100% Gratuit</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-4 py-4">
            <div className="flex flex-col gap-2">
              <Link
                href="/dashboard/family"
                onClick={closeMenu}
                className="bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 text-white hover:from-violet-600 hover:via-purple-600 hover:to-fuchsia-600 py-3 px-4 rounded-xl font-bold transition-all duration-200 flex items-center gap-3 shadow-lg"
              >
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <span>Tableau de bord</span>
              </Link>

              <Link
                href="/dashboard/family/profile"
                onClick={closeMenu}
                className="text-gray-700 hover:text-primary-600 hover:bg-primary-50 py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center gap-3"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Mon profil
              </Link>

              <Link
                href="/dashboard/family/search"
                onClick={closeMenu}
                className="text-gray-700 hover:text-primary-600 hover:bg-primary-50 py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center gap-3"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Chercher un professionnel
              </Link>

              <Link
                href="/dashboard/family/bookings"
                onClick={closeMenu}
                className="text-gray-700 hover:text-primary-600 hover:bg-primary-50 py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center gap-3"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Mes rendez-vous
              </Link>

              <Link
                href="/dashboard/family/messages"
                onClick={closeMenu}
                className="text-gray-700 hover:text-primary-600 hover:bg-primary-50 py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center gap-3"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                Messages
              </Link>

              <Link
                href="/dashboard/family/favorites"
                onClick={closeMenu}
                className="text-gray-700 hover:text-primary-600 hover:bg-primary-50 py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center gap-3"
              >
                <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                Mes favoris
              </Link>

              <Link
                href="/dashboard/family/receipts"
                onClick={closeMenu}
                className="text-gray-700 hover:text-primary-600 hover:bg-primary-50 py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center gap-3"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Mes reçus
              </Link>

              <Link
                href="/dashboard/family/children"
                onClick={closeMenu}
                className="text-gray-700 hover:text-primary-600 hover:bg-primary-50 py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center gap-3"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                Accompagnements
              </Link>

              <Link
                href="/dashboard/family/aides"
                onClick={closeMenu}
                className="text-gray-700 hover:text-primary-600 hover:bg-primary-50 py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center gap-3"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Aides financières
              </Link>

              <div className="border-t border-gray-200 my-4"></div>

              <button
                onClick={handleLogoutClick}
                className="text-purple-600 bg-purple-50 hover:bg-purple-100 py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center gap-3 w-full text-left"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Déconnexion
              </button>
            </div>
          </nav>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={openMenu}
        className="p-2 text-gray-700 hover:text-primary-600 transition-colors duration-200"
        aria-label="Ouvrir le menu"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Rendu via portal pour être au-dessus de tout */}
      {mounted && isOpen && createPortal(menuContent, document.body)}
    </>
  );
}
