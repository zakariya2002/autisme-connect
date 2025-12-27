'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function ProNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userType, setUserType] = useState<'educator' | 'family' | null>(null);
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/pro') return pathname === '/pro';
    return pathname?.startsWith(href);
  };

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
    return '/pro/login';
  };

  return (
    <header className="sticky top-0 z-50" style={{ backgroundColor: '#41005c' }}>
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        {/* Mobile Layout */}
        <div className="flex lg:hidden items-center justify-between h-20">
          {/* Mobile: Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1 text-white"
            aria-label="Ouvrir le menu de navigation"
            aria-expanded={mobileMenuOpen}
          >
            <svg className="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Mobile: Logo centré */}
          <Link href="/pro" className="absolute left-1/2 transform -translate-x-1/2" aria-label="Retour à l'accueil NeuroCare Pro">
            <div className="flex items-center gap-1">
              <img
                src="/images/logo-neurocare.svg"
                alt="NeuroCare Pro"
                className="h-24"
              />
              <span className="px-1.5 py-0.5 text-xs font-bold rounded-full text-white" style={{ backgroundColor: '#f0879f' }}>
                PRO
              </span>
            </div>
          </Link>

          {/* Mobile: Espace vide pour équilibrer */}
          <div className="w-8"></div>
        </div>

        {/* Desktop Layout - Logo centré */}
        <div className="hidden lg:flex items-center h-20 xl:h-24">
          {/* Gauche: Tarifs, Comment ça marche, Guide SAP */}
          <nav className="flex-1 flex items-center justify-end gap-1 xl:gap-2" role="navigation" aria-label="Navigation principale Pro gauche">
            <Link href="/pro/pricing" className={`group flex items-center gap-1.5 xl:gap-2 px-2.5 xl:px-4 py-2 xl:py-2.5 text-sm xl:text-base text-white/90 hover:text-white hover:bg-white/15 rounded-lg font-medium transition-all whitespace-nowrap ${isActive('/pro/pricing') ? 'bg-white/20 text-white' : ''}`}>
              <svg className="w-4 h-4 xl:w-5 xl:h-5 opacity-70 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Tarifs
            </Link>
            <Link href="/pro/how-it-works" className={`group flex items-center gap-1.5 xl:gap-2 px-2.5 xl:px-4 py-2 xl:py-2.5 text-sm xl:text-base text-white/90 hover:text-white hover:bg-white/15 rounded-lg font-medium transition-all whitespace-nowrap ${isActive('/pro/how-it-works') ? 'bg-white/20 text-white' : ''}`}>
              <svg className="w-4 h-4 xl:w-5 xl:h-5 opacity-70 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Comment ça marche
            </Link>
            <Link href="/pro/sap-accreditation" className={`group flex items-center gap-1.5 xl:gap-2 px-2.5 xl:px-4 py-2 xl:py-2.5 text-sm xl:text-base text-white/90 hover:text-white hover:bg-white/15 rounded-lg font-medium transition-all whitespace-nowrap ${isActive('/pro/sap-accreditation') ? 'bg-white/20 text-white' : ''}`}>
              <svg className="w-4 h-4 xl:w-5 xl:h-5 opacity-70 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Guide SAP
            </Link>
          </nav>

          {/* Centre: Logo */}
          <Link href="/pro" className="flex-shrink-0 mx-6 xl:mx-10" aria-label="Retour à l'accueil NeuroCare Pro">
            <div className="flex items-center gap-2">
              <img
                src="/images/logo-neurocare.svg"
                alt="NeuroCare Pro"
                className="h-16 xl:h-24"
              />
              <span className="px-2 py-0.5 text-xs xl:text-sm font-bold rounded-full text-white" style={{ backgroundColor: '#f0879f' }}>
                PRO
              </span>
            </div>
          </Link>

          {/* Droite: Blog, Espace Famille, Connexion/Inscription ou Mon compte */}
          <nav className="flex-1 flex items-center justify-start gap-1 xl:gap-2" role="navigation" aria-label="Navigation principale Pro droite">
            <Link href="/blog" className={`group flex items-center gap-1.5 xl:gap-2 px-2.5 xl:px-4 py-2 xl:py-2.5 text-sm xl:text-base text-white/90 hover:text-white hover:bg-white/15 rounded-lg font-medium transition-all whitespace-nowrap ${isActive('/blog') ? 'bg-white/20 text-white' : ''}`}>
              <svg className="w-4 h-4 xl:w-5 xl:h-5 opacity-70 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
              Blog
            </Link>
            {pathname === '/pro' && (
              <Link
                href="/"
                className="px-3 xl:px-5 py-2 xl:py-2.5 text-sm xl:text-base rounded-lg font-semibold transition-all hover:opacity-90 whitespace-nowrap"
                style={{ backgroundColor: '#e6fffa', color: '#027e7e' }}
              >
                Espace Aidant
              </Link>
            )}
            {user ? (
              <Link
                href={getDashboardLink()}
                className="group ml-2 xl:ml-3 flex items-center gap-1.5 xl:gap-2 px-3 xl:px-5 py-2 xl:py-2.5 text-sm xl:text-base text-white font-semibold rounded-lg transition-all hover:opacity-90 whitespace-nowrap"
                style={{ backgroundColor: '#f0879f' }}
              >
                <svg className="w-4 h-4 xl:w-5 xl:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Mon compte
              </Link>
            ) : (
              <>
                <Link
                  href="/pro/login"
                  className="ml-2 xl:ml-3 px-3 xl:px-4 py-2 xl:py-2.5 text-sm xl:text-base text-white/90 hover:text-white font-medium transition-all whitespace-nowrap"
                >
                  Connexion
                </Link>
                <Link
                  href="/auth/register-educator"
                  className="px-3 xl:px-5 py-2 xl:py-2.5 text-sm xl:text-base text-white font-semibold rounded-lg transition-all hover:opacity-90 whitespace-nowrap"
                  style={{ backgroundColor: '#f0879f' }}
                >
                  S'inscrire
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>

      {/* Menu mobile déroulant */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-white shadow-lg border-t border-gray-100 z-[100]">
          <nav className="px-4 py-4 space-y-3" role="navigation" aria-label="Menu principal Pro">
            <Link
              href="/pro/pricing"
              className="block py-2 font-medium"
              style={{ color: isActive('/pro/pricing') ? '#41005c' : '#374151' }}
              onClick={() => setMobileMenuOpen(false)}
              {...(isActive('/pro/pricing') && { 'aria-current': 'page' })}
            >
              Tarifs
            </Link>
            <Link
              href="/pro/how-it-works"
              className="block py-2 font-medium"
              style={{ color: isActive('/pro/how-it-works') ? '#41005c' : '#374151' }}
              onClick={() => setMobileMenuOpen(false)}
              {...(isActive('/pro/how-it-works') && { 'aria-current': 'page' })}
            >
              Comment ça marche
            </Link>
            <Link
              href="/pro/sap-accreditation"
              className="block py-2 font-medium"
              style={{ color: isActive('/pro/sap-accreditation') ? '#41005c' : '#374151' }}
              onClick={() => setMobileMenuOpen(false)}
              {...(isActive('/pro/sap-accreditation') && { 'aria-current': 'page' })}
            >
              Guide SAP
            </Link>
            {/* Lien vers espace aidant avec style */}
            <Link
              href="/"
              className="block py-3 px-4 rounded-xl text-center font-semibold transition-all hover:opacity-90"
              style={{ backgroundColor: '#e6fffa', color: '#027e7e' }}
              onClick={() => setMobileMenuOpen(false)}
            >
              Vous êtes un aidant ?
            </Link>
            <hr className="my-3" />
            {user ? (
              <Link
                href={getDashboardLink()}
                className="flex items-center justify-center gap-2 py-3 px-4 text-white rounded-xl text-center font-semibold transition-all hover:opacity-90"
                style={{ backgroundColor: '#f0879f' }}
                onClick={() => setMobileMenuOpen(false)}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Mon compte
              </Link>
            ) : (
              <>
                <Link
                  href="/pro/login"
                  className="block py-3 px-4 text-white rounded-xl text-center font-semibold transition-all hover:opacity-90"
                  style={{ backgroundColor: '#f0879f' }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Connexion
                </Link>
                <Link
                  href="/auth/register-educator"
                  className="block py-3 px-4 text-white rounded-xl text-center font-semibold mt-2 transition-all hover:opacity-90"
                  style={{ backgroundColor: '#41005c' }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  S'inscrire
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
