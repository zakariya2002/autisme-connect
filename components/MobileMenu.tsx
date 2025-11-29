'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userType, setUserType] = useState<'educator' | 'family' | null>(null);
  const pathname = usePathname();

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

      if (educator) {
        setUserType('educator');
      } else {
        setUserType('family');
      }
    }
  };

  const getDashboardLink = () => {
    if (userType === 'educator') return '/dashboard/educator';
    if (userType === 'family') return '/dashboard/family';
    return '/auth/login';
  };

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      // Bloquer le scroll du body
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Fermer le menu quand on change de page
  useEffect(() => {
    handleClose();
  }, [pathname]);

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
            className={`fixed inset-0 bg-black/60 z-40 backdrop-blur-sm transition-opacity duration-300 ${
              isAnimating ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={handleClose}
          />

          {/* Menu latéral pleine hauteur depuis la droite */}
          <div
            className={`fixed top-0 right-0 h-full w-full z-50 shadow-2xl transform transition-transform duration-300 ease-out overflow-hidden ${
              isAnimating ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            {/* Fond dégradé sur tout le menu */}
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-600 to-blue-600"></div>

            {/* Motif décoratif */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-20 -left-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
              <div className="absolute bottom-40 -right-10 w-60 h-60 bg-blue-300 rounded-full blur-3xl"></div>
            </div>

            {/* Contenu du menu */}
            <div className="relative h-full flex flex-col">
              {/* En-tête du menu avec croix à droite */}
              <div className="px-6 py-5 border-b border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white">Menu</h2>
                    <p className="text-white/70 text-sm">Autisme Connect</p>
                  </div>
                  <button
                    onClick={handleClose}
                    className="p-3 text-white hover:bg-white/20 rounded-full transition-all duration-200"
                    aria-label="Fermer le menu"
                  >
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Navigation */}
              <nav className="flex-1 px-6 py-8 overflow-y-auto">
                <div className="space-y-3 max-w-md mx-auto">
                  {/* Accueil */}
                  <Link
                    href="/"
                    onClick={handleClose}
                    className={`flex items-center gap-4 px-5 py-4 rounded-2xl font-semibold text-lg transition-all duration-200 ${
                      pathname === '/'
                        ? 'bg-white text-violet-600 shadow-lg'
                        : 'text-white hover:bg-white/20'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      pathname === '/' ? 'bg-violet-100' : 'bg-white/20'
                    }`}>
                      <svg className={`w-6 h-6 ${pathname === '/' ? 'text-violet-600' : 'text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                    </div>
                    <span>Accueil</span>
                  </Link>

                  {/* Qui sommes-nous */}
                  <Link
                    href="/about"
                    onClick={handleClose}
                    className={`flex items-center gap-4 px-5 py-4 rounded-2xl font-semibold text-lg transition-all duration-200 ${
                      pathname === '/about'
                        ? 'bg-white text-violet-600 shadow-lg'
                        : 'text-white hover:bg-white/20'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      pathname === '/about' ? 'bg-violet-100' : 'bg-white/20'
                    }`}>
                      <svg className={`w-6 h-6 ${pathname === '/about' ? 'text-violet-600' : 'text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span>Qui sommes-nous ?</span>
                  </Link>

                  {/* Trouver un éducateur */}
                  <Link
                    href="/search"
                    onClick={handleClose}
                    className={`flex items-center gap-4 px-5 py-4 rounded-2xl font-semibold text-lg transition-all duration-200 ${
                      pathname === '/search'
                        ? 'bg-white text-violet-600 shadow-lg'
                        : 'text-white hover:bg-white/20'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      pathname === '/search' ? 'bg-violet-100' : 'bg-white/20'
                    }`}>
                      <svg className={`w-6 h-6 ${pathname === '/search' ? 'text-violet-600' : 'text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <span>Trouver un éducateur</span>
                  </Link>

                  {/* Tarifs */}
                  <Link
                    href="/pricing"
                    onClick={handleClose}
                    className={`flex items-center gap-4 px-5 py-4 rounded-2xl font-semibold text-lg transition-all duration-200 ${
                      pathname === '/pricing'
                        ? 'bg-white text-violet-600 shadow-lg'
                        : 'text-white hover:bg-white/20'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      pathname === '/pricing' ? 'bg-violet-100' : 'bg-white/20'
                    }`}>
                      <svg className={`w-6 h-6 ${pathname === '/pricing' ? 'text-violet-600' : 'text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span>Tarifs</span>
                  </Link>

                  {/* Contact */}
                  <Link
                    href="/contact"
                    onClick={handleClose}
                    className={`flex items-center gap-4 px-5 py-4 rounded-2xl font-semibold text-lg transition-all duration-200 ${
                      pathname === '/contact'
                        ? 'bg-white text-violet-600 shadow-lg'
                        : 'text-white hover:bg-white/20'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      pathname === '/contact' ? 'bg-violet-100' : 'bg-white/20'
                    }`}>
                      <svg className={`w-6 h-6 ${pathname === '/contact' ? 'text-violet-600' : 'text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <span>Contact</span>
                  </Link>
                </div>

                {/* Séparateur */}
                <div className="border-t border-white/20 my-8 max-w-md mx-auto"></div>

                {/* Section compte */}
                <div className="space-y-4 max-w-md mx-auto">
                  {user ? (
                    <Link
                      href={getDashboardLink()}
                      onClick={handleClose}
                      className="flex items-center justify-center gap-3 bg-white text-violet-600 px-6 py-5 rounded-2xl font-bold text-lg hover:bg-white/90 transition-all duration-200 shadow-lg"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                      <span>Tableau de bord</span>
                    </Link>
                  ) : (
                    <>
                      <Link
                        href="/auth/login"
                        onClick={handleClose}
                        className="flex items-center gap-4 px-5 py-4 rounded-2xl font-semibold text-lg text-white hover:bg-white/20 transition-all duration-200"
                      >
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                          </svg>
                        </div>
                        <span>Connexion</span>
                      </Link>

                      <Link
                        href="/auth/signup"
                        onClick={handleClose}
                        className="flex items-center justify-center gap-3 bg-white text-violet-600 px-6 py-5 rounded-2xl font-bold text-lg hover:bg-white/90 transition-all duration-200 shadow-lg"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                        <span>Créer un compte</span>
                      </Link>
                    </>
                  )}
                </div>
              </nav>

              {/* Footer du menu */}
              <div className="px-6 py-4 border-t border-white/20">
                <p className="text-white/50 text-xs text-center">
                  © 2024 Autisme Connect
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
