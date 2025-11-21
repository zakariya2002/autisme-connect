'use client';

import Link from 'next/link';
import Logo from '@/components/Logo';
import MobileMenu from '@/components/MobileMenu';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-blue-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="hidden md:block">
              <Logo />
            </div>
            <div className="md:hidden">
              <MobileMenu />
            </div>
            <div className="hidden md:flex items-center gap-2">
              <Link href="/search" className="text-gray-700 hover:text-primary-600 px-3 lg:px-4 py-2 rounded-md font-medium transition-colors text-sm lg:text-base">
                Trouver un éducateur
              </Link>
              <Link href="/pricing" className="text-gray-700 hover:text-primary-600 px-2 lg:px-4 py-2 rounded-md font-medium transition-colors text-sm lg:text-base">
                Tarifs
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 lg:py-32">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-5xl lg:text-7xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
            Connectez-vous avec les meilleurs
            <span className="text-primary-600 block mt-2">éducateurs spécialisés</span>
          </h1>
          <p className="text-base sm:text-xl lg:text-2xl text-gray-600 mb-6 sm:mb-10 leading-relaxed max-w-3xl mx-auto">
            Autisme Connect est la plateforme qui simplifie la recherche et la mise en relation
            entre les familles et les éducateurs spécialisés qualifiés.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/search"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 bg-primary-600 text-white rounded-xl hover:bg-primary-700 font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Trouver un éducateur
            </Link>
            <Link
              href="/auth/signup"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 bg-white text-primary-600 border-2 border-primary-600 rounded-xl hover:bg-primary-50 font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Créer un compte
            </Link>
          </div>

          {/* Badge "Gratuit pour les familles" */}
          <div className="mt-8 inline-flex items-center px-6 py-3 bg-green-100 text-green-800 rounded-full font-semibold text-base">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            100% gratuit pour les familles
          </div>
        </div>
      </div>

      {/* À propos du projet */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Notre Mission
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Faciliter l'accès à l'accompagnement
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            {/* Colonne gauche - Texte principal */}
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Pour les familles</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Trouvez rapidement des éducateurs spécialisés qualifiés près de chez vous.
                    Consultez leurs profils, diplômes et disponibilités en toute transparence.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Pour les éducateurs</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Développez votre activité professionnelle en rejoignant notre réseau.
                    Que vous soyez diplômé DEES, DEME ou formé aux méthodes ABA, TEACCH, PECS.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Simple et sécurisé</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Messagerie intégrée, gestion des rendez-vous, paiements sécurisés.
                    Tout est pensé pour faciliter votre quotidien.
                  </p>
                </div>
              </div>
            </div>

            {/* Colonne droite - Stats/Highlights */}
            <div className="bg-gradient-to-br from-primary-50 to-blue-50 rounded-2xl p-8 lg:p-10 shadow-lg">
              <div className="space-y-8">
                <div className="text-center pb-6 border-b border-primary-200">
                  <p className="text-primary-600 font-semibold mb-2">Une plateforme qui grandit</p>
                  <h3 className="text-3xl font-bold text-gray-900">
                    Rejoignez notre communauté
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl p-6 text-center shadow-sm">
                    <div className="text-4xl font-bold text-primary-600 mb-2">100%</div>
                    <p className="text-sm text-gray-600">Gratuit pour les familles</p>
                  </div>
                  <div className="bg-white rounded-xl p-6 text-center shadow-sm">
                    <div className="text-4xl font-bold text-green-600 mb-2">30j</div>
                    <p className="text-sm text-gray-600">Essai gratuit éducateurs</p>
                  </div>
                  <div className="bg-white rounded-xl p-6 text-center shadow-sm">
                    <div className="text-4xl font-bold text-blue-600 mb-2">24/7</div>
                    <p className="text-sm text-gray-600">Accès à la plateforme</p>
                  </div>
                  <div className="bg-white rounded-xl p-6 text-center shadow-sm">
                    <div className="text-4xl font-bold text-purple-600 mb-2">0€</div>
                    <p className="text-sm text-gray-600">Frais de commission</p>
                  </div>
                </div>

                <div className="pt-4">
                  <Link
                    href="/auth/signup"
                    className="block w-full text-center px-6 py-4 bg-primary-600 text-white rounded-xl hover:bg-primary-700 font-bold text-lg shadow-md transition-colors"
                  >
                    Commencer gratuitement
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section Aides Financières */}
      <div className="bg-gradient-to-br from-green-50 to-blue-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              💰 Aides financières disponibles
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Plusieurs dispositifs existent pour vous aider à financer l'accompagnement de votre enfant
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {/* CESU */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mb-6 mx-auto">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3 text-center">CESU</h3>
              <p className="text-gray-600 text-center mb-4 leading-relaxed">
                Chèque Emploi Service Universel pour simplifier le paiement et les démarches administratives
              </p>
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-700 font-semibold">Crédit d'impôt</p>
                <p className="text-3xl font-bold text-blue-600">50%</p>
                <p className="text-xs text-gray-600 mt-1">sur les dépenses engagées</p>
              </div>
            </div>

            {/* AEEH */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mb-6 mx-auto">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3 text-center">AEEH</h3>
              <p className="text-gray-600 text-center mb-4 leading-relaxed">
                Allocation d'Éducation de l'Enfant Handicapé versée par la MDPH
              </p>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-700 font-semibold">Montant de base</p>
                <p className="text-3xl font-bold text-green-600">151,80€</p>
                <p className="text-xs text-gray-600 mt-1">+ compléments selon besoins</p>
              </div>
            </div>

            {/* PCH */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mb-6 mx-auto">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3 text-center">PCH</h3>
              <p className="text-gray-600 text-center mb-4 leading-relaxed">
                Prestation de Compensation du Handicap pour financer l'aide humaine
              </p>
              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-700 font-semibold">Montant variable</p>
                <p className="text-3xl font-bold text-purple-600">Sur mesure</p>
                <p className="text-xs text-gray-600 mt-1">selon évaluation MDPH</p>
              </div>
            </div>
          </div>

          {/* Exemple de calcul */}
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8 lg:p-10">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              💡 Exemple de coût réel pour les familles
            </h3>

            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-gray-200">
                <span className="text-gray-700 font-medium">Tarif éducateur (1 heure)</span>
                <span className="text-xl font-bold text-gray-900">40€</span>
              </div>

              <div className="flex justify-between items-center py-3 border-b border-gray-200">
                <span className="text-gray-700 font-medium">Crédit d'impôt CESU (50%)</span>
                <span className="text-xl font-bold text-green-600">-20€</span>
              </div>

              <div className="flex justify-between items-center py-4 bg-primary-50 rounded-lg px-4">
                <span className="text-lg font-bold text-gray-900">Coût réel pour vous</span>
                <span className="text-3xl font-bold text-primary-600">20€</span>
              </div>
            </div>

            <div className="mt-8 p-6 bg-blue-50 rounded-xl">
              <p className="text-gray-700 text-center leading-relaxed">
                <span className="font-semibold">💳 Avec les aides MDPH (AEEH ou PCH)</span>, le reste à charge peut être encore réduit, voire nul selon votre situation.
              </p>
            </div>

            <div className="mt-6 text-center">
              <Link
                href="/search"
                className="inline-block px-8 py-4 bg-primary-600 text-white rounded-xl hover:bg-primary-700 font-bold text-lg shadow-lg transition-colors"
              >
                Trouver un éducateur maintenant
              </Link>
            </div>
          </div>

          {/* Note informative */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600 max-w-2xl mx-auto">
              <span className="font-semibold">ℹ️ Bon à savoir :</span> Les éducateurs peuvent accepter le paiement par CESU.
              N'hésitez pas à les contacter pour discuter des modalités de financement adaptées à votre situation.
            </p>
          </div>
        </div>
      </div>

      {/* Pour les familles / Pour les éducateurs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Pour les familles */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 lg:p-10 shadow-lg">
            <div className="flex items-center mb-6">
              <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center mr-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-3xl font-bold text-gray-900">Pour les familles</h3>
            </div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-start">
                <svg className="w-6 h-6 text-green-600 mr-3 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-700 text-lg">Recherchez des éducateurs qualifiés près de chez vous</span>
              </li>
              <li className="flex items-start">
                <svg className="w-6 h-6 text-green-600 mr-3 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-700 text-lg">Consultez les profils, certifications et avis</span>
              </li>
              <li className="flex items-start">
                <svg className="w-6 h-6 text-green-600 mr-3 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-700 text-lg">Réservez des rendez-vous en quelques clics</span>
              </li>
              <li className="flex items-start">
                <svg className="w-6 h-6 text-green-600 mr-3 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-700 text-lg">Communiquez via messagerie sécurisée</span>
              </li>
            </ul>
            <Link
              href="/search"
              className="inline-block w-full text-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors shadow-md"
            >
              Trouver un éducateur
            </Link>
          </div>

          {/* Pour les éducateurs */}
          <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl p-8 lg:p-10 shadow-lg">
            <div className="flex items-center mb-6">
              <div className="w-14 h-14 bg-primary-600 rounded-xl flex items-center justify-center mr-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-3xl font-bold text-gray-900">Pour les éducateurs</h3>
            </div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-start">
                <svg className="w-6 h-6 text-green-600 mr-3 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-700 text-lg">Créez votre profil professionnel en quelques minutes</span>
              </li>
              <li className="flex items-start">
                <svg className="w-6 h-6 text-green-600 mr-3 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-700 text-lg">Augmentez votre visibilité auprès des familles</span>
              </li>
              <li className="flex items-start">
                <svg className="w-6 h-6 text-green-600 mr-3 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-700 text-lg">Gérez vos disponibilités et rendez-vous facilement</span>
              </li>
              <li className="flex items-start">
                <svg className="w-6 h-6 text-green-600 mr-3 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-700 text-lg">Développez votre activité professionnelle</span>
              </li>
            </ul>
            <Link
              href="/pricing"
              className="inline-block w-full text-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-semibold transition-colors shadow-md"
            >
              Découvrir les offres
            </Link>
          </div>
        </div>
      </div>

      {/* Call to Action Final */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Prêt à commencer ?
          </h2>
          <p className="text-xl text-blue-100 mb-10">
            Rejoignez Autisme Connect et facilitez la mise en relation avec des professionnels qualifiés.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/search"
              className="inline-block px-8 py-4 bg-white text-primary-600 rounded-xl hover:bg-gray-50 font-bold text-lg shadow-xl transition-colors"
            >
              Trouver un éducateur
            </Link>
            <Link
              href="/auth/signup"
              className="inline-block px-8 py-4 bg-blue-500 text-white rounded-xl hover:bg-blue-600 font-bold text-lg shadow-xl transition-colors"
            >
              Créer un compte
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-white font-bold text-lg mb-4">Autisme Connect</h3>
              <p className="text-gray-400">
                La plateforme qui connecte les familles avec les meilleurs éducateurs spécialisés.
              </p>
            </div>
            <div>
              <h3 className="text-white font-bold text-lg mb-4">Liens rapides</h3>
              <ul className="space-y-2">
                <li><Link href="/search" className="hover:text-white transition-colors">Trouver un éducateur</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Tarifs</Link></li>
                <li><Link href="/auth/signup" className="hover:text-white transition-colors">Inscription</Link></li>
                <li><Link href="/auth/login" className="hover:text-white transition-colors">Connexion</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-bold text-lg mb-4">Contact</h3>
              <p className="text-gray-400">
                Pour toute question, n'hésitez pas à nous contacter via votre compte ou par email.
              </p>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-500">
            <p>© 2024 Autisme Connect. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
