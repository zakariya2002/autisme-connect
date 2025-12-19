'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface PublicNavbarProps {
  showAuthButtons?: boolean;
}

export default function PublicNavbar({ showAuthButtons = true }: PublicNavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userType, setUserType] = useState<'educator' | 'family' | null>(null);
  const pathname = usePathname();

  // Helper function to check if link is active
  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
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
    return '/dashboard/family';
  };

  return (
    <header className="sticky top-0 z-50" style={{ backgroundColor: '#027e7e' }}>
      <div className="flex items-center justify-between px-4 py-4">
        {/* Menu Hamburger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1 text-white"
          aria-label="Ouvrir le menu de navigation"
          aria-expanded={mobileMenuOpen}
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Logo centré - redirige vers le dashboard si connecté */}
        <Link href={user ? getDashboardLink() : "/"} className="absolute left-1/2 transform -translate-x-1/2">
          <img
            src="/images/logo-neurocare.svg"
            alt="neurocare"
            className="h-20"
          />
        </Link>

        {/* Espace vide pour équilibrer */}
        <div className="w-8"></div>
      </div>

      {/* Menu mobile déroulant */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-white shadow-lg border-t border-gray-100 z-[100]">
          <nav className="px-4 py-4 space-y-1" role="navigation" aria-label="Menu principal">
            <Link
              href="/search"
              className="block py-3 font-medium text-gray-800"
              onClick={() => setMobileMenuOpen(false)}
            >
              Rechercher un professionnel
            </Link>
            <Link
              href="/about"
              className="block py-3 font-medium text-gray-800"
              onClick={() => setMobileMenuOpen(false)}
            >
              À propos
            </Link>
            <Link
              href="/familles/aides-financieres"
              className="block py-3 font-medium text-gray-800"
              onClick={() => setMobileMenuOpen(false)}
            >
              Aides financières
            </Link>
            <Link
              href="/contact"
              className="block py-3 font-medium text-gray-800"
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact
            </Link>
            <Link
              href="/pro"
              className="block py-3 px-4 rounded-xl font-semibold text-center my-3"
              style={{ backgroundColor: '#f3e8ff', color: '#41005c' }}
              onClick={() => setMobileMenuOpen(false)}
            >
              Vous êtes professionnel ?
            </Link>
            <Link
              href="/blog"
              className="flex items-center gap-3 py-3 font-medium text-gray-800"
              onClick={() => setMobileMenuOpen(false)}
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
              Blog
            </Link>
            <Link
              href="/community"
              className="flex items-center gap-3 py-3 font-medium text-gray-800"
              onClick={() => setMobileMenuOpen(false)}
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Communauté
            </Link>
            {user ? (
              <Link
                href={getDashboardLink()}
                className="flex items-center gap-3 py-3 px-4 rounded-xl font-semibold text-white mt-3"
                style={{ backgroundColor: '#027e7e' }}
                onClick={() => setMobileMenuOpen(false)}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Mon tableau de bord
              </Link>
            ) : showAuthButtons && (
              <>
                <Link
                  href="/auth/login"
                  className="block py-3 px-4 text-white rounded-xl text-center font-semibold mt-3"
                  style={{ backgroundColor: '#f0879f' }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Connexion
                </Link>
                <Link
                  href="/auth/signup"
                  className="block py-3 px-4 text-white rounded-xl text-center font-semibold mt-2"
                  style={{ backgroundColor: '#027e7e' }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Inscription
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
