'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import FamilyNavbar from '@/components/FamilyNavbar';
import EducatorNavbar from '@/components/EducatorNavbar';
import CommunityFeed from '@/components/community/CommunityFeed';
import { CommunityPost } from '@/types/community';
import { getPosts } from '@/lib/community/actions';
import Link from 'next/link';

export default function CommunityPage() {
  const router = useRouter();
  const [userRole, setUserRole] = useState<'family' | 'educator' | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [familyId, setFamilyId] = useState<string | null>(null);
  const [educatorId, setEducatorId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [totalPosts, setTotalPosts] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchUserAndPosts = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.user) {
          // User not logged in - show public view
          setLoading(false);
          // Fetch posts without user-specific data
          const result = await getPosts({ limit: 10 });
          setPosts(result.posts);
          setTotalPosts(result.total);
          return;
        }

        setUserId(session.user.id);

        // Check if educator
        const { data: educator } = await supabase
          .from('educator_profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .single();

        if (educator) {
          setUserRole('educator');
          setProfile(educator);
          setEducatorId(educator.id);
        } else {
          // Check if family
          const { data: family } = await supabase
            .from('family_profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .single();

          if (family) {
            setUserRole('family');
            setProfile(family);
            setFamilyId(family.id);
          }
        }

        // Fetch posts
        const result = await getPosts({ limit: 10 });
        setPosts(result.posts);
        setTotalPosts(result.total);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndPosts();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fdf9f4] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdf9f4]">
      {/* Navbar based on role */}
      {userRole === 'educator' ? (
        <EducatorNavbar profile={profile} />
      ) : userRole === 'family' ? (
        <FamilyNavbar profile={profile} familyId={familyId} userId={userId} />
      ) : (
        // Public navbar (LP style)
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

            {/* Logo centré */}
            <Link href="/" className="absolute left-1/2 transform -translate-x-1/2" aria-label="Retour à l'accueil NeuroCare">
              <img
                src="/images/logo-neurocare.svg"
                alt="NeuroCare"
                className="h-20"
              />
            </Link>

            {/* Espace vide pour équilibrer */}
            <div className="w-8"></div>
          </div>

          {/* Menu mobile déroulant */}
          {mobileMenuOpen && (
            <div className="absolute top-full left-0 right-0 bg-white shadow-lg border-t border-gray-100 z-50">
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
              </nav>
            </div>
          )}
        </header>
      )}

      {/* Main content */}
      <main className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Page header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
            Communauté NeuroCare
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Un espace d'échange et de soutien pour les familles et professionnels
          </p>
        </div>

        {/* Login prompt for non-authenticated users */}
        {!userRole && (
          <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 text-white">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
              <div className="text-center sm:text-left">
                <h3 className="text-base sm:text-lg font-semibold mb-1">Rejoignez la conversation</h3>
                <p className="text-teal-100 text-xs sm:text-sm">
                  Connectez-vous pour participer, réagir et partager avec la communauté
                </p>
              </div>
              <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
                <Link
                  href="/auth/login"
                  className="flex-1 sm:flex-none text-center px-4 sm:px-5 py-2 sm:py-2.5 bg-white text-teal-700 font-semibold rounded-lg hover:bg-teal-50 transition text-sm sm:text-base"
                >
                  Connexion
                </Link>
                <Link
                  href="/auth/register"
                  className="flex-1 sm:flex-none text-center px-4 sm:px-5 py-2 sm:py-2.5 bg-teal-700 text-white font-semibold rounded-lg hover:bg-teal-800 transition text-sm sm:text-base"
                >
                  S'inscrire
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Community feed */}
        <CommunityFeed
          initialPosts={posts}
          initialTotal={totalPosts}
          showCreateButton={!!userRole}
        />
      </main>

      {/* Footer complet */}
      <footer className="text-white py-8 sm:py-12 px-4 sm:px-6 mt-8 sm:mt-12" style={{ backgroundColor: '#027e7e' }} role="contentinfo">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-8 sm:mb-10">
            {/* Logo et description */}
            <div className="col-span-2 sm:col-span-1">
              <Link href="/" className="inline-block mb-3 sm:mb-4">
                <img
                  src="/images/logo-neurocare.svg"
                  alt="Logo NeuroCare"
                  className="h-16 sm:h-20 brightness-0 invert"
                />
              </Link>
              <p className="text-xs sm:text-sm leading-relaxed text-teal-100">
                La plateforme qui connecte les familles avec des professionnels du neurodéveloppement.
              </p>
            </div>

            {/* Navigation */}
            <nav>
              <h3 className="font-bold text-white mb-3 sm:mb-4 text-sm sm:text-base">Navigation</h3>
              <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-teal-100">
                <li><Link href="/search" className="hover:text-white transition-colors">Trouver un professionnel</Link></li>
                <li><Link href="/community" className="hover:text-white transition-colors">Communauté</Link></li>
                <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
              </ul>
            </nav>

            {/* Familles */}
            <nav>
              <h3 className="font-bold text-white mb-3 sm:mb-4 text-sm sm:text-base">Familles</h3>
              <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-teal-100">
                <li><Link href="/auth/register" className="hover:text-white transition-colors">Créer un compte</Link></li>
                <li><Link href="/familles/aides-financieres" className="hover:text-white transition-colors">Aides financières</Link></li>
              </ul>
            </nav>

            {/* Professionnels */}
            <nav className="hidden sm:block">
              <h3 className="font-bold text-white mb-3 sm:mb-4 text-sm sm:text-base">Professionnels</h3>
              <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-teal-100">
                <li><Link href="/pro" className="hover:text-white transition-colors">Espace Pro</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Tarifs</Link></li>
              </ul>
            </nav>
          </div>

          {/* Séparateur */}
          <div className="border-t border-teal-500 pt-6 sm:pt-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
              {/* Liens légaux */}
              <nav>
                <div className="flex flex-wrap justify-center gap-3 sm:gap-4 text-xs sm:text-sm text-teal-100">
                  <Link href="/mentions-legales" className="hover:text-white transition-colors">
                    Mentions légales
                  </Link>
                  <Link href="/politique-confidentialite" className="hover:text-white transition-colors">
                    Confidentialité
                  </Link>
                  <Link href="/cgu" className="hover:text-white transition-colors">
                    CGU
                  </Link>
                </div>
              </nav>

              {/* Copyright */}
              <p className="text-xs sm:text-sm text-teal-200">
                © 2024 NeuroCare. Tous droits réservés.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
