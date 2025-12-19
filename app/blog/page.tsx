'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { BlogPost, getCategoryInfo } from '@/types/blog';
import { getPublishedPosts } from '@/lib/blog/actions';

export default function BlogPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userType, setUserType] = useState<'educator' | 'family' | null>(null);
  const [articles, setArticles] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkUser();
    fetchArticles();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        setUser(null);
        setUserType(null);
      } else if (session?.user) {
        setUser(session.user);
        checkUserType(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchArticles = async () => {
    setIsLoading(true);
    const result = await getPublishedPosts({ limit: 20 });
    setArticles(result.posts);
    setIsLoading(false);
  };

  const checkUserType = async (userId: string) => {
    const { data: educator } = await supabase
      .from('educator_profiles')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (educator) {
      setUserType('educator');
    } else {
      setUserType('family');
    }
  };

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUser(session.user);
      checkUserType(session.user.id);
    } else {
      setUser(null);
      setUserType(null);
    }
  };

  const getDashboardLink = () => {
    if (userType === 'educator') return '/dashboard/educator';
    if (userType === 'family') return '/dashboard/family';
    return '/auth/login';
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fdf9f4' }}>
      {/* Header - Same as landing page */}
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
              ) : (
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

      {/* Hero - Plus clair que la navbar */}
      <section className="py-10 sm:py-16 px-4" style={{ backgroundColor: '#0a9a9a' }}>
        <div className="max-w-4xl mx-auto text-center text-white">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
            Blog NeuroCare
          </h1>
          <p className="text-base sm:text-xl text-white/80 px-2">
            Ressources, conseils et actualités pour accompagner les personnes neuro-atypiques
          </p>
          {/* Bouton Mes articles pour les professionnels */}
          {userType === 'educator' && (
            <Link
              href="/dashboard/educator/blog"
              className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-white text-teal-700 font-semibold rounded-xl hover:bg-teal-50 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Mes articles
            </Link>
          )}
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-8 sm:py-16 px-4">
        <div className="max-w-7xl mx-auto">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-xl sm:rounded-2xl shadow-md overflow-hidden animate-pulse">
                  <div className="h-40 sm:h-48 bg-gray-200" />
                  <div className="p-4 sm:p-6">
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-full mb-1" />
                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun article pour le moment</h3>
              <p className="text-gray-600">Les articles seront bientôt disponibles.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {articles.map((article) => {
                const categoryInfo = getCategoryInfo(article.category);
                const formatDate = (dateStr: string) => {
                  return new Date(dateStr).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  });
                };

                return (
                  <Link
                    key={article.id}
                    href={`/blog/${article.slug}`}
                    className="bg-white rounded-xl sm:rounded-2xl shadow-md sm:shadow-lg overflow-hidden hover:shadow-xl transition-shadow group"
                  >
                    {/* Image */}
                    <div className="relative h-40 sm:h-48 bg-gray-200 overflow-hidden">
                      {article.image_url ? (
                        <div
                          className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-300"
                          style={{ backgroundImage: `url('${article.image_url}')` }}
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-teal-100 to-teal-200">
                          <svg className="w-12 h-12 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                          </svg>
                        </div>
                      )}
                      {/* Category badge */}
                      <div className="absolute top-3 left-3">
                        <span
                          className="px-2 py-1 text-xs font-medium rounded-full text-white"
                          style={{ backgroundColor: categoryInfo.color }}
                        >
                          {categoryInfo.label}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 sm:p-6">
                      <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500 mb-2 sm:mb-3">
                        <span>{formatDate(article.published_at || article.created_at)}</span>
                        <span>•</span>
                        <span>{article.read_time_minutes} min</span>
                      </div>
                      <h2 className="text-base sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3 group-hover:text-teal-600 transition-colors line-clamp-2">
                        {article.title}
                      </h2>
                      <p className="text-sm sm:text-base text-gray-600 line-clamp-2 sm:line-clamp-3">
                        {article.excerpt}
                      </p>
                      {/* Author */}
                      {article.author && (
                        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center text-xs font-medium text-teal-700">
                            {article.author.first_name[0]}
                          </div>
                          <span className="text-xs text-gray-500">
                            {article.author.first_name} {article.author.last_name}
                          </span>
                        </div>
                      )}
                      <div className="mt-3 sm:mt-4 flex items-center gap-2 text-sm sm:text-base font-medium" style={{ color: '#027e7e' }}>
                        Lire l'article
                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-10 sm:py-16 px-4 bg-gray-100">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
            Restez informé
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mb-5 sm:mb-6 px-2">
            Recevez nos derniers articles et conseils directement dans votre boîte mail.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto px-2">
            <input
              type="email"
              placeholder="Votre email"
              className="flex-1 px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-base"
            />
            <button
              className="px-6 py-3 text-white font-semibold rounded-xl transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#027e7e' }}
            >
              S'abonner
            </button>
          </div>
        </div>
      </section>

      {/* Footer - Same as landing page */}
      <footer className="text-white py-12 px-6" style={{ backgroundColor: '#027e7e' }} role="contentinfo">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
            {/* Logo et description */}
            <div>
              <Link href="/" className="inline-block mb-4" aria-label="Retour à l'accueil NeuroCare">
                <img
                  src="/images/logo-neurocare.svg"
                  alt="Logo NeuroCare"
                  className="h-20 brightness-0 invert"
                />
              </Link>
              <p className="text-sm leading-relaxed text-teal-100">
                La plateforme qui connecte les familles avec des professionnels du neurodéveloppement vérifiés et qualifiés.
              </p>
            </div>

            {/* Navigation */}
            <nav aria-labelledby="footer-nav-1">
              <h3 id="footer-nav-1" className="font-bold text-white mb-4">Navigation</h3>
              <ul className="space-y-2 text-sm text-teal-100">
                <li><Link href="/search" className="hover:text-white transition-colors">Trouver un professionnel</Link></li>
                <li><Link href="/about" className="hover:text-white transition-colors">À propos</Link></li>
                <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </nav>

            {/* Familles */}
            <nav aria-labelledby="footer-nav-2">
              <h3 id="footer-nav-2" className="font-bold text-white mb-4">Familles</h3>
              <ul className="space-y-2 text-sm text-teal-100">
                <li><Link href="/auth/signup" className="hover:text-white transition-colors">Créer un compte</Link></li>
                <li><Link href="/familles/aides-financieres" className="hover:text-white transition-colors">Aides financières</Link></li>
                <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
              </ul>
            </nav>

            {/* Professionnels */}
            <nav aria-labelledby="footer-nav-3">
              <h3 id="footer-nav-3" className="font-bold text-white mb-4">Professionnels</h3>
              <ul className="space-y-2 text-sm text-teal-100">
                <li><Link href="/pro" className="hover:text-white transition-colors">Espace Pro</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Tarifs</Link></li>
                <li><Link href="/auth/signup" className="hover:text-white transition-colors">Rejoindre neurocare</Link></li>
              </ul>
            </nav>
          </div>

          {/* Séparateur */}
          <div className="border-t border-teal-500 pt-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              {/* Liens légaux */}
              <nav aria-label="Informations légales">
                <div className="flex flex-wrap justify-center gap-4 text-sm text-teal-100">
                  <Link href="/mentions-legales" className="hover:text-white transition-colors" aria-label="Consulter les mentions légales">
                    Mentions légales
                  </Link>
                  <Link href="/politique-confidentialite" className="hover:text-white transition-colors" aria-label="Consulter la politique de confidentialité et RGPD">
                    Politique de confidentialité
                  </Link>
                  <Link href="/cgu" className="hover:text-white transition-colors" aria-label="Consulter les conditions générales d'utilisation">
                    CGU
                  </Link>
                </div>
              </nav>

              {/* Copyright */}
              <p className="text-sm text-teal-200">
                © 2024 neurocare. Tous droits réservés.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
