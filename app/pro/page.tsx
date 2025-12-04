'use client';

import Link from 'next/link';
import MobileMenuPro from '@/components/MobileMenuPro';

export default function ProLandingPage() {

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50" role="navigation" aria-label="Navigation principale">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 lg:h-20 items-center">
            <Link href="/pro" className="flex items-center gap-2 flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 rounded-lg" aria-label="Autisme Connect Pro - Accueil">
              <span className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 bg-clip-text text-transparent whitespace-nowrap">
                Autisme Connect
              </span>
              <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white text-xs font-bold px-2 py-0.5 rounded-full" aria-hidden="true">
                PRO
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden xl:flex items-center gap-5" role="menubar">
              <Link href="/pro/pricing" className="text-gray-600 hover:text-teal-600 font-medium text-sm transition-colors whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 rounded px-2 py-1">
                Tarifs
              </Link>
              <Link href="/pro/how-it-works" className="text-gray-600 hover:text-teal-600 font-medium text-sm transition-colors whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 rounded px-2 py-1">
                Comment ça marche
              </Link>
              <Link href="/pro/sap-accreditation" className="text-gray-600 hover:text-teal-600 font-medium text-sm transition-colors whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 rounded px-2 py-1">
                Guide SAP
              </Link>
              <div className="h-5 w-px bg-gray-200" aria-hidden="true"></div>
              <Link href="/" className="text-gray-500 hover:text-gray-700 text-xs transition-colors whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 rounded px-2 py-1">
                Vous êtes un aidant ?
              </Link>
              <Link href="/auth/login" className="text-gray-600 hover:text-teal-600 font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 rounded px-2 py-1">
                Connexion
              </Link>
              <Link
                href="/auth/register-educator"
                className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white px-4 py-2 rounded-xl font-semibold text-sm hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 transition-all shadow-lg hover:shadow-xl whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
              >
                Rejoindre
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="xl:hidden">
              <MobileMenuPro />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main role="main">
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-cyan-50">
        {/* Background decorations */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-emerald-200/30 to-cyan-200/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" aria-hidden="true"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-teal-200/30 to-cyan-200/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" aria-hidden="true"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                Développez votre activité avec{' '}
                <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 bg-clip-text text-transparent">
                  Autisme Connect
                </span>
              </h1>

              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Rejoignez la première plateforme qui met en relation les professionnels de l'accompagnement autisme avec les familles.
                Gagnez en visibilité et simplifiez votre gestion au quotidien.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link
                  href="/auth/register-educator"
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 transition-all shadow-lg hover:shadow-xl group"
                >
                  Créer mon profil gratuitement
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                <Link
                  href="/pro/how-it-works"
                  className="inline-flex items-center justify-center gap-2 bg-white text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg border-2 border-gray-200 hover:border-primary-300 hover:text-teal-600 transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Voir comment ça marche
                </Link>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Inscription gratuite</span>
                </div>
                <div className="flex items-center gap-1">
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Sans engagement</span>
                </div>
                <div className="flex items-center gap-1">
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Profil en 5 minutes</span>
                </div>
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-3xl blur-2xl"></div>
              <div className="relative bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-100 to-cyan-100 flex items-center justify-center">
                    <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Dr. Sophie Martin</h3>
                    <p className="text-sm text-gray-500">Psychologue - Paris</p>
                  </div>
                  <span className="ml-auto inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded-full">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Vérifié
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-gray-900">127</p>
                    <p className="text-xs text-gray-500">Vues ce mois</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-gray-900">23</p>
                    <p className="text-xs text-gray-500">RDV pris</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-primary-600">4.9</p>
                    <p className="text-xs text-gray-500">Note moyenne</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl border border-amber-100">
                  <svg className="w-6 h-6 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-sm font-medium text-amber-800">Compte Premium actif</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Nos Solutions Section */}
      <section className="py-20 bg-gradient-to-br from-emerald-50 via-white to-cyan-50 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-1/2 left-0 w-72 h-72 bg-gradient-to-r from-emerald-200/20 to-teal-200/20 rounded-full blur-3xl -translate-x-1/2"></div>
        <div className="absolute top-1/4 right-0 w-64 h-64 bg-gradient-to-l from-cyan-200/20 to-teal-200/20 rounded-full blur-3xl translate-x-1/2"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Nos Solutions
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Une plateforme{' '}
              <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 bg-clip-text text-transparent">
                tout-en-un
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Découvrez comment Autisme Connect simplifie votre quotidien et améliore l'accompagnement des familles.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Solution 1 - Gestion RDV */}
            <div className="group bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl hover:border-teal-200 transition-all duration-300 hover:-translate-y-1">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Gestion des rendez-vous</h3>
              <p className="text-gray-600 leading-relaxed">
                Planifiez, confirmez et gérez tous vos rendez-vous depuis une interface intuitive. Notifications automatiques pour vous et les familles.
              </p>
            </div>

            {/* Solution 2 - Visibilité */}
            <div className="group bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl hover:border-teal-200 transition-all duration-300 hover:-translate-y-1">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-100 to-blue-100 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Plus de visibilité</h3>
              <p className="text-gray-600 leading-relaxed">
                Soyez visible auprès de centaines de familles dans votre région. Profil vérifié, avis clients et mise en avant dans les recherches.
              </p>
            </div>

            {/* Solution 3 - Pluriprofessionnels */}
            <div className="group bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl hover:border-teal-200 transition-all duration-300 hover:-translate-y-1">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Pluriprofessionnels</h3>
              <p className="text-gray-600 leading-relaxed">
                Les familles trouvent tous les professionnels dont elles ont besoin sur une seule plateforme : psychologues, éducateurs, orthophonistes...
              </p>
            </div>

            {/* Solution 4 - Liens entre professionnels */}
            <div className="group bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl hover:border-teal-200 transition-all duration-300 hover:-translate-y-1">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Liens renforcés</h3>
              <p className="text-gray-600 leading-relaxed">
                Collaborez facilement avec les autres professionnels qui accompagnent le même enfant. Partagez les informations essentielles en toute sécurité.
              </p>
            </div>

            {/* Solution 5 - Meilleur suivi */}
            <div className="group bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl hover:border-teal-200 transition-all duration-300 hover:-translate-y-1">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Meilleur suivi</h3>
              <p className="text-gray-600 leading-relaxed">
                Dossier de la personne accompagnée centralisé. Historique des séances, notes d'évolution et objectifs partagés avec la famille.
              </p>
            </div>

            {/* Solution 6 - Solution financière */}
            <div className="group bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl hover:border-teal-200 transition-all duration-300 hover:-translate-y-1">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Solution financière</h3>
              <p className="text-gray-600 leading-relaxed">
                Facturation simplifiée compatible URSSAF et CESU. Génération automatique des attestations fiscales pour vos clients.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
            Prêt à rejoindre Autisme Connect ?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Créez votre profil gratuitement en quelques minutes et commencez à recevoir des demandes de familles.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/register-educator"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 transition-all shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
            >
              Créer mon profil gratuitement
            </Link>
            <Link
              href="/pro/pricing"
              className="inline-flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-200 transition-all focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
            >
              Voir les tarifs
            </Link>
          </div>
        </div>
      </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12" role="contentinfo">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl font-bold">Autisme Connect</span>
                <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white text-xs font-bold px-2 py-0.5 rounded-full" aria-hidden="true">
                  PRO
                </span>
              </div>
              <p className="text-gray-400 text-sm">
                La plateforme de référence pour les professionnels de l'accompagnement autisme.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Pour les pros</h4>
              <ul className="space-y-2 text-sm text-gray-400" role="list">
                <li><Link href="/pro/pricing" className="hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 rounded">Tarifs</Link></li>
                <li><Link href="/pro/how-it-works" className="hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 rounded">Comment ça marche</Link></li>
                <li><Link href="/pro/sap-accreditation" className="hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 rounded">Guide SAP</Link></li>
                <li><Link href="/auth/register-educator" className="hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 rounded">S'inscrire</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Ressources</h4>
              <ul className="space-y-2 text-sm text-gray-400" role="list">
                <li><Link href="/about" className="hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 rounded">À propos</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 rounded">Contact</Link></li>
                <li><Link href="/faq" className="hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 rounded">FAQ</Link></li>
                <li><Link href="/accessibility" className="hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 rounded">Accessibilité</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Légal</h4>
              <ul className="space-y-2 text-sm text-gray-400" role="list">
                <li><Link href="/terms" className="hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 rounded">Conditions générales</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 rounded">Politique de confidentialité</Link></li>
                <li><Link href="/legal" className="hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 rounded">Mentions légales</Link></li>
                <li><Link href="/cookies" className="hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 rounded">Gestion des cookies</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">© 2025 Autisme Connect. Tous droits réservés.</p>
            <Link href="/" className="text-gray-400 hover:text-white text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 rounded">
              Vous êtes un aidant ? Accéder au site principal →
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
