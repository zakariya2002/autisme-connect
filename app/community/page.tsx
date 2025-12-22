'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import PublicNavbar from '@/components/PublicNavbar';
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
      {/* Navbar */}
      <PublicNavbar />

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
