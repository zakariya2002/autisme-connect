'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

const articles = [
  {
    id: 1,
    slug: 'harcelement-scolaire',
    title: "Harcèlement scolaire et TSA : Comment protéger son enfant ?",
    excerpt: "Les enfants avec un trouble du spectre de l'autisme sont malheureusement plus exposés au harcèlement scolaire. Découvrez les signes à surveiller et les stratégies pour protéger votre enfant.",
    image: "/images/articles/harcelement.png",
    category: "Éducation",
    date: "15 décembre 2024",
    readTime: "8 min"
  },
  {
    id: 2,
    slug: 'nutrition',
    title: "Nutrition et autisme : Les bases d'une alimentation adaptée",
    excerpt: "L'alimentation peut jouer un rôle important dans le bien-être des personnes autistes. Découvrez les principes d'une nutrition adaptée et les aliments à privilégier.",
    image: "/images/articles/nutrition.png",
    category: "Santé",
    date: "10 décembre 2024",
    readTime: "6 min"
  },
  {
    id: 3,
    slug: 'activite-physique',
    title: "Sport et autisme : Les bienfaits de l'activité physique adaptée",
    excerpt: "L'activité physique offre de nombreux bénéfices pour les personnes avec TSA. Découvrez quels sports privilégier et comment adapter la pratique.",
    image: "/images/articles/sport.png",
    category: "Bien-être",
    date: "5 décembre 2024",
    readTime: "7 min"
  }
];

export default function BlogPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userType, setUserType] = useState<'educator' | 'family' | null>(null);

  useEffect(() => {
    checkUser();

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
            <nav className="px-4 py-4 space-y-3" role="navigation" aria-label="Menu principal">
              <Link
                href="/search"
                className="block py-2 font-medium"
                style={{ color: '#374151' }}
              >
                Rechercher un professionnel
              </Link>
              <Link
                href="/about"
                className="block py-2 font-medium"
                style={{ color: '#374151' }}
              >
                À propos
              </Link>
              <Link
                href="/blog"
                className="block py-2 font-medium"
                style={{ color: '#027e7e' }}
              >
                Blog
              </Link>
              <Link
                href="/familles/aides-financieres"
                className="block py-2 font-medium"
                style={{ color: '#374151' }}
              >
                Aides financières
              </Link>
              <Link
                href="/contact"
                className="block py-2 font-medium"
                style={{ color: '#374151' }}
              >
                Contact
              </Link>
              <Link
                href="/pro"
                className="block py-2 px-4 rounded-lg font-semibold text-center mt-2"
                style={{
                  backgroundColor: '#f3e8ff',
                  color: '#41005c'
                }}
              >
                Vous êtes professionnel ?
              </Link>
              <hr className="my-2" />
              {user ? (
                <Link
                  href={getDashboardLink()}
                  className="block py-2 font-semibold"
                  style={{ color: '#027e7e' }}
                >
                  Mon tableau de bord
                </Link>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="block py-2 px-4 text-white rounded-lg text-center font-semibold"
                    style={{ backgroundColor: '#f0879f' }}
                  >
                    Connexion
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="block py-2 px-4 text-white rounded-lg text-center font-semibold mt-2"
                    style={{ backgroundColor: '#027e7e' }}
                  >
                    Inscription
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="py-10 sm:py-16 px-4" style={{ backgroundColor: '#027e7e' }}>
        <div className="max-w-4xl mx-auto text-center text-white">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
            Blog NeuroCare
          </h1>
          <p className="text-base sm:text-xl text-teal-100 px-2">
            Ressources, conseils et actualités pour accompagner les personnes neuro-atypiques
          </p>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-8 sm:py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {articles.map((article) => (
              <Link
                key={article.id}
                href={`/blog/${article.slug}`}
                className="bg-white rounded-xl sm:rounded-2xl shadow-md sm:shadow-lg overflow-hidden hover:shadow-xl transition-shadow group"
              >
                {/* Image - Sans texte */}
                <div className="relative h-40 sm:h-48 bg-gray-200 overflow-hidden">
                  <div
                    className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-300"
                    style={{ backgroundImage: `url('${article.image}')` }}
                  />
                </div>

                {/* Content */}
                <div className="p-4 sm:p-6">
                  <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500 mb-2 sm:mb-3">
                    <span>{article.date}</span>
                    <span>•</span>
                    <span>{article.readTime}</span>
                  </div>
                  <h2 className="text-base sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3 group-hover:text-teal-600 transition-colors line-clamp-2">
                    {article.title}
                  </h2>
                  <p className="text-sm sm:text-base text-gray-600 line-clamp-2 sm:line-clamp-3">
                    {article.excerpt}
                  </p>
                  <div className="mt-3 sm:mt-4 flex items-center gap-2 text-sm sm:text-base font-medium" style={{ color: '#027e7e' }}>
                    Lire l'article
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
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
