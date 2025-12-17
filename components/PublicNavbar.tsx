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
          <nav className="px-4 py-4 space-y-3">
            <Link
              href="/search"
              className="block py-2 font-medium"
              style={{ color: isActive('/search') ? '#027e7e' : '#374151' }}
              onClick={() => setMobileMenuOpen(false)}
              {...(isActive('/search') && { 'aria-current': 'page' })}
            >
              Rechercher un professionnel
            </Link>
            <Link
              href="/about"
              className="block py-2 font-medium"
              style={{ color: isActive('/about') ? '#027e7e' : '#374151' }}
              onClick={() => setMobileMenuOpen(false)}
              {...(isActive('/about') && { 'aria-current': 'page' })}
            >
              À propos
            </Link>
            <Link
              href="/familles/aides-financieres"
              className="block py-2 font-medium"
              style={{ color: isActive('/familles/aides-financieres') ? '#027e7e' : '#374151' }}
              onClick={() => setMobileMenuOpen(false)}
              {...(isActive('/familles/aides-financieres') && { 'aria-current': 'page' })}
            >
              Aides financières
            </Link>
            <Link
              href="/contact"
              className="block py-2 font-medium"
              style={{ color: isActive('/contact') ? '#027e7e' : '#374151' }}
              onClick={() => setMobileMenuOpen(false)}
              {...(isActive('/contact') && { 'aria-current': 'page' })}
            >
              Contact
            </Link>
            <hr className="my-2" />
            {user ? (
              <Link
                href={getDashboardLink()}
                className="block py-2 font-semibold"
                style={{ color: '#027e7e' }}
                onClick={() => setMobileMenuOpen(false)}
                {...(isActive(getDashboardLink()) && { 'aria-current': 'page' })}
              >
                Mon tableau de bord
              </Link>
            ) : showAuthButtons && (
              <>
                <Link
                  href="/auth/login"
                  className="block py-2 px-4 text-white rounded-lg text-center font-semibold"
                  style={{ backgroundColor: '#f0879f' }}
                  onClick={() => setMobileMenuOpen(false)}
                  {...(isActive('/auth/login') && { 'aria-current': 'page' })}
                >
                  Connexion
                </Link>
                <Link
                  href="/auth/signup"
                  className="block py-2 px-4 text-white rounded-lg text-center font-semibold mt-2"
                  style={{ backgroundColor: '#027e7e' }}
                  onClick={() => setMobileMenuOpen(false)}
                  {...(isActive('/auth/signup') && { 'aria-current': 'page' })}
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
