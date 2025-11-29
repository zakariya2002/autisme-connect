'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userType, setUserType] = useState<'educator' | 'family' | null>(null);
  const pathname = usePathname();

  // Pour le portal - s'assurer qu'on est côté client
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUser(session.user);
      const { data: educator } = await supabase
        .from('educator_profiles')
        .select('id')
        .eq('user_id', session.user.id)
        .single();

      setUserType(educator ? 'educator' : 'family');
    }
  };

  const getDashboardLink = () => {
    if (userType === 'educator') return '/dashboard/educator';
    if (userType === 'family') return '/dashboard/family';
    return '/auth/login';
  };

  const openMenu = () => {
    setIsOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeMenu = () => {
    setIsOpen(false);
    document.body.style.overflow = '';
  };

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

  // Le contenu du menu qui sera rendu via portal
  const menuContent = (
    <div
      className="fixed inset-0 overflow-hidden"
      style={{ zIndex: 99999, touchAction: 'none' }}
    >
      {/* Overlay sombre pour le fond */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={closeMenu}
        onTouchMove={(e) => e.preventDefault()}
      />

      {/* Menu panel - 3/4 de la largeur, à droite */}
      <div
        className="absolute top-0 right-0 h-full w-3/4 max-w-sm"
        style={{
          background: 'linear-gradient(135deg, #7c3aed 0%, #9333ea 50%, #3b82f6 100%)'
        }}
      >

      {/* Contenu du menu */}
      <div className="relative h-full flex flex-col">
        {/* Header avec croix de fermeture */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/20">
          <div>
            <h2 className="text-2xl font-bold text-white">Menu</h2>
            <p className="text-white/70 text-sm">Autisme Connect</p>
          </div>
          <button
            onClick={closeMenu}
            className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
            aria-label="Fermer le menu"
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto">
          <div className="space-y-2">
            <Link
              href="/"
              onClick={closeMenu}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                pathname === '/' ? 'bg-white text-violet-600' : 'text-white hover:bg-white/20'
              }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                pathname === '/' ? 'bg-violet-100' : 'bg-white/20'
              }`}>
                <svg className={`w-5 h-5 ${pathname === '/' ? 'text-violet-600' : 'text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <span>Accueil</span>
            </Link>

            <Link
              href="/about"
              onClick={closeMenu}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                pathname === '/about' ? 'bg-white text-violet-600' : 'text-white hover:bg-white/20'
              }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                pathname === '/about' ? 'bg-violet-100' : 'bg-white/20'
              }`}>
                <svg className={`w-5 h-5 ${pathname === '/about' ? 'text-violet-600' : 'text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span>Qui sommes-nous ?</span>
            </Link>

            <Link
              href="/search"
              onClick={closeMenu}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                pathname === '/search' ? 'bg-white text-violet-600' : 'text-white hover:bg-white/20'
              }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                pathname === '/search' ? 'bg-violet-100' : 'bg-white/20'
              }`}>
                <svg className={`w-5 h-5 ${pathname === '/search' ? 'text-violet-600' : 'text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <span>Trouver un éducateur</span>
            </Link>

            <Link
              href="/pricing"
              onClick={closeMenu}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                pathname === '/pricing' ? 'bg-white text-violet-600' : 'text-white hover:bg-white/20'
              }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                pathname === '/pricing' ? 'bg-violet-100' : 'bg-white/20'
              }`}>
                <svg className={`w-5 h-5 ${pathname === '/pricing' ? 'text-violet-600' : 'text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span>Tarifs</span>
            </Link>

            <Link
              href="/contact"
              onClick={closeMenu}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                pathname === '/contact' ? 'bg-white text-violet-600' : 'text-white hover:bg-white/20'
              }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                pathname === '/contact' ? 'bg-violet-100' : 'bg-white/20'
              }`}>
                <svg className={`w-5 h-5 ${pathname === '/contact' ? 'text-violet-600' : 'text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <span>Contact</span>
            </Link>
          </div>

          {/* Séparateur */}
          <div className="border-t border-white/20 my-6"></div>

          {/* Section compte */}
          <div className="space-y-2">
            {user ? (
              <Link
                href={getDashboardLink()}
                onClick={closeMenu}
                className="flex items-center justify-center gap-2 bg-white text-violet-600 px-4 py-3 rounded-xl font-bold hover:bg-white/90 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                <span>Tableau de bord</span>
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  onClick={closeMenu}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-white hover:bg-white/20 transition-colors"
                >
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                  </div>
                  <span>Connexion</span>
                </Link>

                <Link
                  href="/auth/signup"
                  onClick={closeMenu}
                  className="flex items-center justify-center gap-2 bg-white text-violet-600 px-4 py-3 rounded-xl font-bold hover:bg-white/90 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  <span>Créer un compte</span>
                </Link>
              </>
            )}
          </div>
        </nav>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/20">
          <p className="text-white/50 text-xs text-center">
            © 2024 Autisme Connect
          </p>
        </div>
      </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Bouton hamburger */}
      <button
        onClick={openMenu}
        className="md:hidden p-2 text-gray-700 hover:text-primary-600 transition-colors"
        aria-label="Ouvrir le menu"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Menu rendu via Portal pour sortir du contexte de stacking de la navbar */}
      {mounted && isOpen && createPortal(menuContent, document.body)}
    </>
  );
}
