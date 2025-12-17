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

        {/* Logo centré */}
        <Link href={user ? getDashboardLink() : '/pro'} className="absolute left-1/2 transform -translate-x-1/2" aria-label={user ? "Retour au tableau de bord" : "Retour à l'accueil NeuroCare Pro"}>
          <div className="flex items-center gap-2">
            <img
              src="/images/logo-neurocare.svg"
              alt="NeuroCare Pro"
              className="h-20"
            />
            <span className="px-2 py-0.5 text-xs font-bold rounded-full text-white" style={{ backgroundColor: '#f0879f' }}>
              PRO
            </span>
          </div>
        </Link>

        {/* Espace vide pour équilibrer */}
        <div className="w-8"></div>
      </div>

      {/* Menu mobile déroulant */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-white shadow-lg border-t border-gray-100 z-[100]">
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
            <hr className="my-2" />
            <Link
              href="/"
              className="block py-2 font-medium text-gray-500 text-sm"
              onClick={() => setMobileMenuOpen(false)}
            >
              Vous êtes un aidant ?
            </Link>
            <hr className="my-2" />
            {user ? (
              <Link
                href={getDashboardLink()}
                className="block py-2 font-semibold"
                style={{ color: '#41005c' }}
                onClick={() => setMobileMenuOpen(false)}
              >
                Mon tableau de bord
              </Link>
            ) : (
              <>
                <Link
                  href="/pro/login"
                  className="block py-2 px-4 text-white rounded-lg text-center font-semibold"
                  style={{ backgroundColor: '#f0879f' }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Connexion
                </Link>
                <Link
                  href="/auth/register-educator"
                  className="block py-2 px-4 text-white rounded-lg text-center font-semibold mt-2"
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
