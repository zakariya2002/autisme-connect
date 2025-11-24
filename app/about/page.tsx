'use client';

import Link from 'next/link';
import Logo from '@/components/Logo';
import MobileMenu from '@/components/MobileMenu';
import TndToggle from '@/components/TndToggle';
import { useTnd } from '@/contexts/TndContext';
import AboutTnd from './page-tnd';

export default function AboutPage() {
  const { tndMode } = useTnd();

  if (tndMode) {
    return (
      <>
        <AboutTnd />
        <TndToggle />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-blue-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50 backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Logo />
            <div className="md:hidden">
              <MobileMenu />
            </div>
            <div className="hidden md:flex items-center gap-2">
              <Link href="/about" className="text-gray-700 hover:text-primary-600 px-3 lg:px-4 py-2 rounded-md font-medium transition-colors text-sm lg:text-base">
                Qui sommes-nous ?
              </Link>
              <Link href="/search" className="text-gray-700 hover:text-primary-600 px-3 lg:px-4 py-2 rounded-md font-medium transition-colors text-sm lg:text-base inline-flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Trouver un éducateur
              </Link>
              <Link href="/pricing" className="text-gray-700 hover:text-primary-600 px-2 lg:px-4 py-2 rounded-md font-medium transition-colors text-sm lg:text-base inline-flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Tarifs
              </Link>
              <Link href="/contact" className="text-gray-700 hover:text-primary-600 px-2 lg:px-4 py-2 rounded-md font-medium transition-colors text-sm lg:text-base">
                Contact
              </Link>
              <Link href="/auth/login" className="text-gray-700 hover:text-primary-600 px-2 lg:px-4 py-2 rounded-md font-medium transition-colors text-sm lg:text-base">
                Connexion
              </Link>
              <Link href="/auth/signup" className="bg-primary-600 text-white px-5 py-2.5 rounded-md hover:bg-primary-700 font-medium transition-colors shadow-sm text-sm lg:text-base">
                Inscription
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600/10 via-blue-500/5 to-purple-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-600 rounded-full mb-8 shadow-lg">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold bg-gradient-to-r from-primary-600 to-blue-600 bg-clip-text text-transparent mb-8 leading-tight">
              Qui sommes-nous ?
            </h1>
            <p className="text-xl sm:text-2xl text-gray-700 leading-relaxed mb-6 font-light">
              Autisme Connect est né d'une vision simple : faciliter la rencontre entre les familles
              concernées par l'autisme et les professionnels qualifiés qui peuvent les accompagner.
            </p>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-xl border border-primary-100">
              <p className="text-xl sm:text-2xl text-gray-800 leading-relaxed font-medium">
                Notre plateforme a été pensée avant tout pour <span className="text-primary-600 font-bold text-2xl sm:text-3xl">aider les institutions et les familles en manque de places</span>,
                sans solutions ou avec des solutions qui ne correspondent pas à leurs besoins spécifiques.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Notre Mission */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="order-2 lg:order-1">
              <div className="inline-block bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
                Notre Mission
              </div>
              <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-8 leading-tight">
                Connecter, accompagner, <span className="text-primary-600">transformer</span>
              </h2>
              <div className="space-y-6 text-lg text-gray-700">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-primary-600 rounded-full mt-1 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p>
                    Notre plateforme a été créée pour répondre à un besoin essentiel :
                    <span className="font-bold text-primary-600"> simplifier l'accès aux éducateurs spécialisés</span> pour
                    les familles touchées par l'autisme.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-primary-600 rounded-full mt-1 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p>
                    Nous croyons fermement que chaque enfant mérite un accompagnement de qualité,
                    et que chaque famille doit pouvoir trouver facilement le professionnel qui lui convient.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-primary-600 rounded-full mt-1 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p>
                    C'est pourquoi nous avons développé une solution <span className="font-bold text-primary-600">100% gratuite</span> pour les familles,
                    tout en offrant aux éducateurs une vitrine professionnelle pour valoriser leur expertise.
                  </p>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-br from-primary-400 to-blue-500 rounded-3xl opacity-20 blur-2xl"></div>
                <div className="relative bg-white rounded-3xl p-8 lg:p-10 shadow-2xl border border-gray-100">
                  <div className="space-y-8">
                    <div className="group hover:scale-105 transition-transform duration-300">
                      <div className="flex items-start gap-5">
                        <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">Diplômes vérifiés</h3>
                          <p className="text-gray-600 leading-relaxed">
                            Tous les éducateurs sont vérifiés par la DREETS pour garantir leur qualification.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="group hover:scale-105 transition-transform duration-300">
                      <div className="flex items-start gap-5">
                        <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">Gain de temps</h3>
                          <p className="text-gray-600 leading-relaxed">
                            Trouvez et contactez des professionnels en quelques clics seulement.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="group hover:scale-105 transition-transform duration-300">
                      <div className="flex items-start gap-5">
                        <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">Gratuit pour les familles</h3>
                          <p className="text-gray-600 leading-relaxed">
                            Recherche, contact et prise de rendez-vous sans aucun frais.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Nos Valeurs */}
      <div className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              Nos Valeurs
            </div>
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4">
              Ce qui guide notre <span className="text-primary-600">action</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Des principes fondamentaux qui inspirent chacune de nos décisions
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-blue-200 hover:-translate-y-2">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">Bienveillance</h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                Nous mettons l'humain au cœur de notre démarche, avec empathie et respect pour chaque famille et chaque professionnel.
              </p>
            </div>
            <div className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-green-200 hover:-translate-y-2">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-green-600 transition-colors">Confiance</h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                La vérification rigoureuse des diplômes et la transparence des profils garantissent une relation de confiance.
              </p>
            </div>
            <div className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-purple-200 hover:-translate-y-2">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-purple-600 transition-colors">Accessibilité</h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                Nous rendons l'accès aux services d'éducation spécialisée simple, rapide et sans barrière financière pour les familles.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* L'équipe derrière Autisme Connect */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              Notre Équipe
            </div>
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4">
              Les visages <span className="text-primary-600">derrière le projet</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Une équipe passionnée et engagée pour faire bouger les choses dans le secteur médico-social
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {/* Fondateur */}
            <div className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:-translate-y-2">
              <div className="relative mb-6">
                <div className="w-32 h-32 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full mx-auto flex items-center justify-center text-white text-4xl font-bold shadow-xl group-hover:scale-110 transition-transform duration-300">
                  ZB
                </div>
                <div className="absolute bottom-0 right-1/2 translate-x-16 translate-y-2 w-10 h-10 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Zakariya B.</h3>
                <p className="text-primary-600 font-semibold mb-4">Fondateur & Développeur</p>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Passionné par l'impact social et la technologie, Zakariya a créé Autisme Connect pour répondre à un besoin réel du secteur médico-social.
                </p>
                <div className="flex justify-center gap-2 flex-wrap">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">Vision</span>
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">Tech</span>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">Innovation</span>
                </div>
              </div>
            </div>

            {/* Partenaire éducateur */}
            <div className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:-translate-y-2">
              <div className="relative mb-6">
                <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full mx-auto flex items-center justify-center text-white text-4xl font-bold shadow-xl group-hover:scale-110 transition-transform duration-300">
                  ML
                </div>
                <div className="absolute bottom-0 right-1/2 translate-x-16 translate-y-2 w-10 h-10 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Marie L.</h3>
                <p className="text-blue-600 font-semibold mb-4">Éducatrice Spécialisée DEES</p>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Avec 8 ans d'expérience, Marie apporte son expertise terrain pour garantir que la plateforme réponde aux besoins réels des professionnels.
                </p>
                <div className="flex justify-center gap-2 flex-wrap">
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">Expertise</span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">DEES</span>
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">ABA</span>
                </div>
              </div>
            </div>

            {/* Représentant familles */}
            <div className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:-translate-y-2">
              <div className="relative mb-6">
                <div className="w-32 h-32 bg-gradient-to-br from-green-400 to-green-600 rounded-full mx-auto flex items-center justify-center text-white text-4xl font-bold shadow-xl group-hover:scale-110 transition-transform duration-300">
                  SP
                </div>
                <div className="absolute bottom-0 right-1/2 translate-x-16 translate-y-2 w-10 h-10 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Sophie P.</h3>
                <p className="text-green-600 font-semibold mb-4">Ambassadrice Familles</p>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Maman d'un enfant avec TSA, Sophie partage l'expérience des familles pour orienter le développement de la plateforme.
                </p>
                <div className="flex justify-center gap-2 flex-wrap">
                  <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm font-medium">Empathie</span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">Écoute</span>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">Conseils</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section "Notre engagement" */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-3xl p-8 lg:p-12 shadow-2xl border border-primary-100">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-4">Notre engagement humain</h3>
              </div>
              <div className="space-y-4 text-lg text-gray-700 leading-relaxed">
                <p className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-primary-600 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>
                    Nous sommes <strong className="text-primary-600">à l'écoute</strong> de chaque retour, chaque suggestion,
                    pour améliorer continuellement notre plateforme.
                  </span>
                </p>
                <p className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-primary-600 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>
                    Notre équipe est <strong className="text-primary-600">disponible</strong> pour vous accompagner à chaque étape,
                    que vous soyez famille ou éducateur.
                  </span>
                </p>
                <p className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-primary-600 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>
                    Nous travaillons chaque jour pour <strong className="text-primary-600">faciliter l'inclusion</strong> et
                    l'accès à des accompagnements de qualité pour tous.
                  </span>
                </p>
              </div>
              <div className="mt-8 text-center">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center px-8 py-4 bg-primary-600 text-white rounded-xl hover:bg-primary-700 font-bold text-lg shadow-lg transition-all transform hover:scale-105"
                >
                  <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Contactez notre équipe
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comment ça marche */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              Le Processus
            </div>
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4">
              Comment <span className="text-primary-600">ça marche ?</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Quatre étapes simples pour trouver l'accompagnement parfait
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="relative text-center group">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 text-3xl font-bold shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  1
                </div>
                <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-primary-300 to-transparent -translate-x-4"></div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Créez votre compte</h3>
              <p className="text-gray-600 leading-relaxed">
                Inscription gratuite en quelques minutes
              </p>
            </div>
            <div className="relative text-center group">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 text-3xl font-bold shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  2
                </div>
                <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-blue-300 to-transparent -translate-x-4"></div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Recherchez</h3>
              <p className="text-gray-600 leading-relaxed">
                Filtrez par localisation, certifications et disponibilités
              </p>
            </div>
            <div className="relative text-center group">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 text-3xl font-bold shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  3
                </div>
                <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-purple-300 to-transparent -translate-x-4"></div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Contactez</h3>
              <p className="text-gray-600 leading-relaxed">
                Échangez directement avec les éducateurs
              </p>
            </div>
            <div className="relative text-center group">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 text-3xl font-bold shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  4
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Réservez</h3>
              <p className="text-gray-600 leading-relaxed">
                Prenez rendez-vous en ligne facilement
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-blue-600 to-purple-600"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-40"></div>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-10 lg:p-16 border border-white/20 shadow-2xl">
            <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6 leading-tight">
              Rejoignez Autisme Connect dès aujourd'hui
            </h2>
            <p className="text-xl lg:text-2xl text-white/90 mb-10 leading-relaxed">
              Que vous soyez une famille ou un éducateur spécialisé, nous sommes là pour vous accompagner.
            </p>
            <div className="flex flex-col sm:flex-row gap-5 justify-center">
              <Link
                href="/search"
                className="group inline-flex items-center justify-center px-10 py-5 bg-white text-primary-700 rounded-2xl hover:bg-gray-50 font-bold text-lg shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105"
              >
                <svg className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Trouver un éducateur
              </Link>
              <Link
                href="/auth/signup"
                className="group inline-flex items-center justify-center px-10 py-5 bg-transparent text-white border-3 border-white rounded-2xl hover:bg-white/10 font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              >
                <svg className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                Créer un compte
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-6">
              <Logo />
            </div>
            <p className="text-gray-400 text-lg mb-8">
              Connecter les familles avec les meilleurs éducateurs spécialisés
            </p>
            <div className="flex justify-center gap-6 mb-8">
              <Link href="/about" className="text-gray-400 hover:text-white transition-colors">
                Qui sommes-nous ?
              </Link>
              <Link href="/search" className="text-gray-400 hover:text-white transition-colors">
                Trouver un éducateur
              </Link>
              <Link href="/pricing" className="text-gray-400 hover:text-white transition-colors">
                Tarifs
              </Link>
            </div>
            <div className="border-t border-gray-800 pt-8">
              <p className="text-gray-500">
                © 2024 Autisme Connect. Tous droits réservés.
              </p>
            </div>
          </div>
        </div>
      </footer>
      <TndToggle />
    </div>
  );
}
