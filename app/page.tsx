'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Logo from '@/components/Logo';
import MobileMenu from '@/components/MobileMenu';
import TndToggle from '@/components/TndToggle';
import { useTnd } from '@/contexts/TndContext';
import { supabase } from '@/lib/supabase';
import HomeTnd from './page-tnd';

export default function Home() {
  const { tndMode } = useTnd();
  const [user, setUser] = useState<any>(null);
  const [userType, setUserType] = useState<'educator' | 'family' | null>(null);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUser(session.user);

      // Vérifier si c'est un éducateur
      const { data: educator } = await supabase
        .from('educator_profiles')
        .select('id')
        .eq('user_id', session.user.id)
        .single();

      if (educator) {
        setUserType('educator');
      } else {
        // Sinon c'est une famille
        setUserType('family');
      }
    }
  };

  const getDashboardLink = () => {
    if (userType === 'educator') return '/dashboard/educator';
    if (userType === 'family') return '/dashboard/family';
    return '/auth/login';
  };

  // Mode TND temporairement masqué (code conservé pour réactivation future)
  // if (tndMode) {
  //   return (
  //     <>
  //       <HomeTnd />
  //       <TndToggle />
  //     </>
  //   );
  // }

  // Sinon, afficher la version normale
  return (
    <>
    <div className="min-h-screen bg-gradient-to-br from-violet-50/30 via-white to-blue-50/30">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50 backdrop-blur-sm bg-white/95" role="navigation" aria-label="Navigation principale">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 lg:h-20 items-center">
            <Logo />
            <div className="xl:hidden">
              <MobileMenu />
            </div>
            <div className="hidden xl:flex items-center gap-2 2xl:gap-3">
              <Link href="/about" className="text-gray-700 hover:text-primary-600 px-2 xl:px-3 py-2 rounded-md font-medium transition-colors text-sm inline-flex items-center justify-center whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
                À propos
              </Link>
              <Link href="/search" className="text-gray-700 hover:text-primary-600 px-2 xl:px-3 py-2 rounded-md font-medium transition-colors text-sm inline-flex items-center justify-center gap-1 whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Recherche
              </Link>
              <Link href="/pro" className="text-teal-600 bg-teal-50 px-2 xl:px-3 py-2 rounded-md font-medium transition-colors text-sm inline-flex items-center justify-center gap-1 whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 hover:bg-teal-100">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Espace Pro
              </Link>
              <Link href="/familles/aides-financieres" className="text-primary-600 bg-primary-50 px-2 xl:px-3 py-2 rounded-md font-medium transition-colors text-sm inline-flex items-center justify-center gap-1 whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Aides
              </Link>
              <Link href="/contact" className="text-gray-700 hover:text-primary-600 px-2 xl:px-3 py-2 rounded-md font-medium transition-colors text-sm inline-flex items-center justify-center whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
                Contact
              </Link>
              {user ? (
                <Link href={getDashboardLink()} className="ml-2 xl:ml-4 bg-primary-600 text-white px-4 xl:px-5 py-2.5 rounded-md hover:bg-primary-700 font-medium transition-colors shadow-sm text-sm inline-flex items-center gap-2 whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  Tableau de bord
                </Link>
              ) : (
                <>
                  <Link href="/auth/login" className="ml-2 xl:ml-4 text-gray-700 hover:text-primary-600 px-2 xl:px-4 py-2 rounded-md font-medium transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 whitespace-nowrap">
                    Connexion
                  </Link>
                  <Link href="/auth/signup" className="bg-gradient-to-r from-violet-600 to-blue-500 hover:from-violet-700 hover:to-blue-600 text-white px-4 xl:px-5 py-2.5 rounded-md font-medium transition-all shadow-sm text-sm whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
                    Inscription
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Version humaine et chaleureuse */}
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 mb-8 sm:mb-10 leading-tight">
            Vous n'êtes
            <span className="bg-gradient-to-r from-violet-600 to-blue-500 bg-clip-text text-transparent"> plus seul(e)</span>
            <br className="hidden sm:block" />
            <span className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl text-gray-600 font-medium mt-3 block">
              dans votre parcours d'aidant
            </span>
          </h1>

          {/* Bouton principal avec style chaleureux */}
          <div className="flex flex-col items-center gap-4 px-2 sm:px-0">
            <Link
              href="/search"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 sm:px-10 py-4 sm:py-5 bg-gradient-to-r from-violet-600 to-blue-500 hover:from-violet-700 hover:to-blue-600 text-white rounded-2xl font-bold text-lg sm:text-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Trouver un professionnel près de chez moi
            </Link>

            {/* Badge gratuit */}
            <div className="inline-flex items-center gap-2 text-violet-700 font-medium text-sm sm:text-base">
              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Service 100% gratuit pour les aidants
            </div>
          </div>

        </div>
      </div>

      {/* Notre Mission - Version humanisée */}
      <div className="bg-gradient-to-b from-white to-violet-50/30 py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12 lg:mb-16">
            <div className="inline-flex items-center gap-2 bg-violet-100 text-violet-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
              Ensemble, faisons la différence
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
              Une communauté qui vous <span className="text-violet-600">comprend</span>
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed px-4 sm:px-0">
              Parce que derrière chaque recherche, il y a une histoire, des espoirs et le désir profond
              d'offrir le meilleur à son proche.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 items-center max-w-6xl mx-auto">
            {/* Colonne gauche - Texte principal */}
            <div className="space-y-6 sm:space-y-8">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-rose-600" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Nous vous écoutons</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Chaque aidant a son histoire. Nous avons créé cet espace pour que vous puissiez
                      trouver <strong className="text-gray-800">le bon professionnel</strong>, celui qui saura écouter
                      et comprendre vos besoins uniques.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Des professionnels vérifiés</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Chaque professionnel sur notre plateforme est vérifié. Diplômes, expériences, motivations...
                      <strong className="text-gray-800"> Vous pouvez avoir confiance.</strong>
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Toujours là pour vous</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Une question ? Un doute ? Notre équipe est disponible pour vous accompagner
                      à chaque étape de votre recherche.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Colonne droite - Stats/Highlights */}
            <div className="bg-gradient-to-br from-violet-50 to-blue-50 rounded-2xl p-6 sm:p-8 lg:p-10 shadow-sm border border-violet-100">
              <div className="space-y-6">
                <div className="text-center pb-5 border-b border-violet-200">
                  <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
                    <svg className="w-7 h-7 text-violet-600" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                    Nos engagements envers vous
                  </h3>
                </div>

                <div className="space-y-4">
                  <div className="bg-white rounded-xl p-4 flex items-center gap-4 shadow-sm">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">100% gratuit pour les aidants</p>
                      <p className="text-sm text-gray-500">Aucun frais, jamais</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-4 flex items-center gap-4 shadow-sm">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Données sécurisées</p>
                      <p className="text-sm text-gray-500">Conforme RGPD</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-4 flex items-center gap-4 shadow-sm">
                    <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Support humain</p>
                      <p className="text-sm text-gray-500">Une vraie équipe à votre écoute</p>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    href="/search"
                    className="block w-full text-center px-6 py-4 bg-gradient-to-r from-violet-600 to-blue-500 text-white rounded-xl hover:from-violet-700 hover:to-blue-600 font-bold text-lg shadow-md transition-all"
                  >
                    Commencer ma recherche
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section Sécurité et Confiance */}
      <div className="bg-white py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12 lg:mb-16">
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Votre tranquillité d'esprit
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
              Des professionnels de <span className="text-green-600">confiance</span>
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed px-4 sm:px-0">
              Nous savons à quel point il est important pour vous de confier votre proche à quelqu'un de fiable.
              C'est pourquoi chaque professionnel est soigneusement vérifié.
            </p>
          </div>

          {/* Étapes de vérification */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-10 sm:mb-12">
            {/* Étape 1 */}
            <div className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-blue-100 rounded-xl flex items-center justify-center mb-4 sm:mb-6 mx-auto">
                <svg className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="text-center">
                <span className="inline-block bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full mb-3">Étape 1</span>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Vérification des diplômes</h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  Nous vérifions l'authenticité de chaque diplôme (DEES, DEME, etc.) auprès des organismes officiels.
                </p>
              </div>
            </div>

            {/* Étape 2 */}
            <div className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-purple-100 rounded-xl flex items-center justify-center mb-4 sm:mb-6 mx-auto">
                <svg className="w-7 h-7 sm:w-8 sm:h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                </svg>
              </div>
              <div className="text-center">
                <span className="inline-block bg-purple-100 text-purple-700 text-xs font-bold px-3 py-1 rounded-full mb-3">Étape 2</span>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Contrôle d'identité</h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  Vérification de la pièce d'identité et du numéro SIRET pour les auto-entrepreneurs.
                </p>
              </div>
            </div>

            {/* Étape 3 */}
            <div className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-green-100 rounded-xl flex items-center justify-center mb-4 sm:mb-6 mx-auto">
                <svg className="w-7 h-7 sm:w-8 sm:h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="text-center">
                <span className="inline-block bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full mb-3">Étape 3</span>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Entretien vidéo</h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  Un entretien en visio avec notre équipe pour évaluer les compétences et la motivation.
                </p>
              </div>
            </div>

            {/* Étape 4 */}
            <div className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-orange-100 rounded-xl flex items-center justify-center mb-4 sm:mb-6 mx-auto">
                <svg className="w-7 h-7 sm:w-8 sm:h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div className="text-center">
                <span className="inline-block bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1 rounded-full mb-3">Étape 4</span>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Validation finale</h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  Profil activé uniquement après validation complète de tous les documents.
                </p>
              </div>
            </div>
          </div>

          {/* Garanties supplémentaires */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 lg:p-10 shadow-xl max-w-4xl mx-auto">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 text-center">
              Nos garanties pour votre tranquillité
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">100% des diplômes vérifiés</p>
                  <p className="text-sm text-gray-600">Aucun professionnel non qualifié</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Assurance responsabilité civile</p>
                  <p className="text-sm text-gray-600">Exigée pour chaque professionnel</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Messagerie sécurisée</p>
                  <p className="text-sm text-gray-600">Échanges protégés sur la plateforme</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Support réactif</p>
                  <p className="text-sm text-gray-600">Notre équipe vous accompagne</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section Aides Financières */}
      <div className="bg-gradient-to-br from-green-50 to-blue-50 py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-10 lg:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
              Nous vous aidons aussi financièrement
            </h2>
            <p className="text-sm sm:text-base lg:text-xl text-gray-600 max-w-3xl mx-auto px-2 sm:px-0">
              Plusieurs aides existent pour financer l'accompagnement de votre enfant.
              Nous sommes là pour vous guider dans vos démarches.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-10 lg:mb-12">
            {/* CESU */}
            <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 lg:p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-blue-100 rounded-lg sm:rounded-xl flex items-center justify-center mb-4 sm:mb-6 mx-auto">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3 text-center">CESU</h3>
              <p className="text-sm sm:text-base text-gray-600 text-center mb-3 sm:mb-4 leading-relaxed">
                Chèque Emploi Service Universel pour simplifier le paiement et les démarches administratives
              </p>
              <div className="bg-blue-50 rounded-lg p-3 sm:p-4 text-center">
                <p className="text-xs sm:text-sm text-gray-700 font-semibold">Crédit d'impôt</p>
                <p className="text-2xl sm:text-3xl font-bold text-blue-600">50%</p>
                <p className="text-xs text-gray-600 mt-1">sur les dépenses engagées</p>
              </div>
            </div>

            {/* AEEH */}
            <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 lg:p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-green-100 rounded-lg sm:rounded-xl flex items-center justify-center mb-4 sm:mb-6 mx-auto">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3 text-center">AEEH</h3>
              <p className="text-sm sm:text-base text-gray-600 text-center mb-3 sm:mb-4 leading-relaxed">
                Allocation d'Éducation de l'Enfant Handicapé versée par la MDPH
              </p>
              <div className="bg-green-50 rounded-lg p-3 sm:p-4 text-center">
                <p className="text-xs sm:text-sm text-gray-700 font-semibold">Montant de base</p>
                <p className="text-2xl sm:text-3xl font-bold text-green-600">151,80€</p>
                <p className="text-xs text-gray-600 mt-1">+ compléments selon besoins</p>
              </div>
            </div>

            {/* PCH */}
            <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 lg:p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-purple-100 rounded-lg sm:rounded-xl flex items-center justify-center mb-4 sm:mb-6 mx-auto">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3 text-center">PCH</h3>
              <p className="text-sm sm:text-base text-gray-600 text-center mb-3 sm:mb-4 leading-relaxed">
                Prestation de Compensation du Handicap pour financer l'aide humaine
              </p>
              <div className="bg-purple-50 rounded-lg p-3 sm:p-4 text-center">
                <p className="text-xs sm:text-sm text-gray-700 font-semibold">Montant variable</p>
                <p className="text-2xl sm:text-3xl font-bold text-purple-600">Sur mesure</p>
                <p className="text-xs text-gray-600 mt-1">selon évaluation MDPH</p>
              </div>
            </div>
          </div>

          {/* Exemple de calcul */}
          <div className="max-w-4xl mx-auto bg-white rounded-xl sm:rounded-2xl shadow-xl p-5 sm:p-6 lg:p-10">
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 text-center">
              Exemple concret de coût pour vous
            </h3>

            <div className="space-y-3 sm:space-y-4">
              <div className="flex justify-between items-center py-2 sm:py-3 border-b border-gray-200">
                <span className="text-sm sm:text-base text-gray-700 font-medium">Tarif éducateur (1 heure)</span>
                <span className="text-lg sm:text-xl font-bold text-gray-900">40€</span>
              </div>

              <div className="flex justify-between items-center py-2 sm:py-3 border-b border-gray-200">
                <span className="text-sm sm:text-base text-gray-700 font-medium">Crédit d'impôt CESU (50%)</span>
                <span className="text-lg sm:text-xl font-bold text-green-600">-20€</span>
              </div>

              <div className="flex justify-between items-center py-3 sm:py-4 bg-primary-50 rounded-lg px-3 sm:px-4">
                <span className="text-base sm:text-lg font-bold text-gray-900">Votre coût réel</span>
                <span className="text-2xl sm:text-3xl font-bold text-primary-600">20€</span>
              </div>
            </div>

            <div className="mt-5 sm:mt-8 p-4 sm:p-6 bg-blue-50 rounded-lg sm:rounded-xl">
              <p className="text-sm sm:text-base text-gray-700 text-center leading-relaxed">
                <span className="font-semibold">Avec les aides MDPH (AEEH ou PCH)</span>, votre reste à charge peut être encore réduit, voire nul selon votre situation.
              </p>
            </div>

            <div className="mt-5 sm:mt-6 text-center">
              <Link
                href="/search"
                className="inline-block w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-primary-600 text-white rounded-lg sm:rounded-xl hover:bg-primary-700 font-bold text-base sm:text-lg shadow-lg transition-colors"
              >
                Je trouve mon professionnel
              </Link>
            </div>
          </div>

          {/* Note informative */}
          <div className="mt-6 sm:mt-8 text-center px-2">
            <p className="text-xs sm:text-sm text-gray-600 max-w-2xl mx-auto">
              <span className="font-semibold">Bon à savoir :</span> La plupart de nos professionnels acceptent le paiement par CESU.
            </p>
          </div>

          {/* CTA Aides financières */}
          <div className="mt-8 sm:mt-12 text-center px-2">
            <Link
              href="/familles/aides-financieres"
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-5 sm:px-8 py-3 sm:py-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg shadow-lg transition transform hover:scale-105 text-sm sm:text-base"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="hidden sm:inline">Découvrir toutes les aides financières</span>
              <span className="sm:hidden">Voir les aides financières</span>
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* Pour les familles / Pour les éducateurs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
          {/* Pour les familles */}
          <div className="bg-gradient-to-br from-violet-50 to-blue-50 rounded-xl sm:rounded-2xl p-5 sm:p-6 lg:p-10 shadow-lg hover:shadow-xl transition-shadow border border-violet-100">
            <div className="flex items-center mb-4 sm:mb-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-gradient-to-r from-violet-600 to-blue-500 rounded-lg sm:rounded-xl flex items-center justify-center mr-3 sm:mr-4">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Vous êtes aidants ?</h3>
            </div>
            <ul className="space-y-3 sm:space-y-4 mb-5 sm:mb-8">
              <li className="flex items-start">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 mr-2 sm:mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm sm:text-base lg:text-lg text-gray-700">Trouvez des professionnels qualifiés près de chez vous</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 mr-2 sm:mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm sm:text-base lg:text-lg text-gray-700">Consultez leurs profils et spécialités</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 mr-2 sm:mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm sm:text-base lg:text-lg text-gray-700">Échangez en toute confiance</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 mr-2 sm:mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm sm:text-base lg:text-lg text-gray-700">100% gratuit, sans engagement</span>
              </li>
            </ul>
            <Link
              href="/search"
              className="inline-block w-full text-center px-5 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-violet-600 to-blue-500 hover:from-violet-700 hover:to-blue-600 text-white rounded-lg font-semibold transition-all shadow-md text-sm sm:text-base"
            >
              Commencer ma recherche
            </Link>
          </div>

          {/* Pour les éducateurs */}
          <div className="bg-gradient-to-br from-emerald-50 to-cyan-50 rounded-xl sm:rounded-2xl p-5 sm:p-6 lg:p-10 shadow-lg hover:shadow-xl transition-shadow border border-teal-100">
            <div className="flex items-center mb-4 sm:mb-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-lg sm:rounded-xl flex items-center justify-center mr-3 sm:mr-4">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Vous êtes un professionnel ?</h3>
            </div>
            <ul className="space-y-3 sm:space-y-4 mb-5 sm:mb-8">
              <li className="flex items-start">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 mr-2 sm:mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm sm:text-base lg:text-lg text-gray-700">Valorisez votre expertise et vos diplômes</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 mr-2 sm:mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm sm:text-base lg:text-lg text-gray-700">Développez votre activité à votre rythme</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 mr-2 sm:mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm sm:text-base lg:text-lg text-gray-700">Gagnez du temps sur l'administratif</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 mr-2 sm:mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm sm:text-base lg:text-lg text-gray-700">30 jours d'essai gratuit</span>
              </li>
            </ul>
            <Link
              href="/pricing"
              className="inline-block w-full text-center px-5 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 text-white rounded-lg font-semibold transition-all shadow-md text-sm sm:text-base"
            >
              Découvrir les offres
            </Link>
          </div>
        </div>
      </div>

      {/* Call to Action Final - Plus humain */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary-600 via-blue-600 to-purple-600 py-12 sm:py-16 lg:py-20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"></div>
        <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-4 sm:mb-6">
            Prêt à faire partie de l'aventure ?
          </h2>
          <p className="text-sm sm:text-base lg:text-xl text-blue-100 mb-6 sm:mb-8 lg:mb-10 leading-relaxed px-2 sm:px-0">
            Rejoignez une communauté bienveillante qui croit en l'inclusion et en l'accompagnement personnalisé.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-2 sm:px-0">
            <Link
              href="/search"
              className="inline-flex items-center justify-center px-5 sm:px-6 lg:px-8 py-3 sm:py-4 bg-white text-primary-600 rounded-lg sm:rounded-xl hover:bg-gray-50 font-bold text-sm sm:text-base lg:text-lg shadow-xl transition-all transform hover:scale-105"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Trouver un professionnel
            </Link>
            <Link
              href="/auth/signup"
              className="inline-flex items-center justify-center px-5 sm:px-6 lg:px-8 py-3 sm:py-4 bg-transparent text-white border-2 border-white rounded-lg sm:rounded-xl hover:bg-white/10 font-bold text-sm sm:text-base lg:text-lg shadow-xl transition-all"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Créer mon compte
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-white font-semibold text-lg mb-4">neurocare</h3>
              <p className="text-gray-400 leading-relaxed">
                Une plateforme humaine qui connecte les aidants avec des professionnels spécialisés passionnés.
              </p>
            </div>
            <div>
              <h3 className="text-white font-bold text-lg mb-4">Liens rapides</h3>
              <ul className="space-y-2">
                <li><Link href="/search" className="hover:text-white transition-colors">Trouver un professionnel</Link></li>
                <li><Link href="/about" className="hover:text-white transition-colors">Qui sommes-nous ?</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Tarifs</Link></li>
                <li><Link href="/educators/sap-accreditation" className="hover:text-white transition-colors">Agrément SAP</Link></li>
                <li><Link href="/familles/aides-financieres" className="hover:text-white transition-colors">Aides financières</Link></li>
                <li><Link href="/auth/signup" className="hover:text-white transition-colors">Inscription</Link></li>
              </ul>
            </div>            <div>
              <h3 className="text-white font-bold text-lg mb-4">Besoin d'aide ?</h3>
              <p className="text-gray-400 leading-relaxed mb-4">
                Notre équipe est là pour vous accompagner dans votre parcours.
              </p>
              <Link href="/support" className="inline-block px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                Contactez-nous
              </Link>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-4">
              <Link href="/mentions-legales" className="text-gray-400 hover:text-white transition-colors text-sm">
                Mentions légales
              </Link>
              <span className="hidden sm:inline text-gray-600">|</span>
              <Link href="/politique-confidentialite" className="text-gray-400 hover:text-white transition-colors text-sm">
                Politique de confidentialité
              </Link>
              <span className="hidden sm:inline text-gray-600">|</span>
              <Link href="/cgu" className="text-gray-400 hover:text-white transition-colors text-sm">
                CGU
              </Link>
            </div>
            <p className="text-center text-gray-400">© 2024 neurocare. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
    {/* TndToggle masqué temporairement */}
    {/* <TndToggle /> */}
    </>
  );
}
