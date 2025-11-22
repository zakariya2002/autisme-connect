'use client';

import Link from 'next/link';
import Logo from '@/components/Logo';
import MobileMenu from '@/components/MobileMenu';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-blue-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50 backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="hidden md:block">
              <Logo />
            </div>
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

      {/* Hero Section - Plus humain avec image de fond visible */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-40 mt-8">
        {/* Image de fond de famille souriante se tenant la main - visible mais atténuée */}
        <div className="absolute inset-0 z-0 opacity-40 rounded-3xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/70 via-white/60 to-primary-50/70"></div>
          <img
            src="https://images.unsplash.com/photo-1609220136736-443140cffec6?w=1400&q=80"
            alt="Famille heureuse de face se tenant la main avec le sourire - accompagnement et soutien"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white shadow-lg text-primary-700 px-6 py-3 rounded-full text-sm font-bold mb-6 border-2 border-primary-200">
            <span className="w-2 h-2 bg-primary-600 rounded-full animate-pulse"></span>
            Nous sommes là pour vous accompagner
          </div>
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 sm:p-10 shadow-2xl border-2 border-gray-100 mb-6 sm:mb-10">
            <h1 className="text-3xl sm:text-5xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Trouvez l'éducateur spécialisé
              <span className="text-primary-600 block mt-3">qui comprend vos besoins</span>
            </h1>
            <p className="text-base sm:text-xl lg:text-2xl text-gray-700 leading-relaxed max-w-3xl mx-auto font-medium">
              Nous comprenons vos défis quotidiens. C'est pourquoi nous vous aidons à trouver
              des professionnels passionnés et qualifiés, prêts à accompagner votre famille avec bienveillance.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/search"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 bg-primary-600 text-white rounded-xl hover:bg-primary-700 font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Je cherche un éducateur
            </Link>
            <Link
              href="/auth/signup"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 bg-white text-primary-600 border-2 border-primary-600 rounded-xl hover:bg-primary-50 font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Je suis éducateur
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

      {/* Section "Ils nous font confiance" */}
      <div className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Une communauté qui grandit chaque jour
            </h2>
            <p className="text-gray-600">
              Rejoignez des centaines de familles et d'éducateurs qui font confiance à Autisme Connect
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-bold text-primary-600 mb-2">150+</div>
              <p className="text-gray-600 font-medium">Familles accompagnées</p>
            </div>
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-bold text-blue-600 mb-2">50+</div>
              <p className="text-gray-600 font-medium">Éducateurs partenaires</p>
            </div>
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-bold text-green-600 mb-2">98%</div>
              <p className="text-gray-600 font-medium">Taux de satisfaction</p>
            </div>
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-bold text-purple-600 mb-2">100%</div>
              <p className="text-gray-600 font-medium">Diplômes vérifiés</p>
            </div>
          </div>
        </div>
      </div>

      {/* Section Témoignages */}
      <div className="bg-gradient-to-br from-gray-50 to-blue-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Ils nous racontent leur expérience
            </h2>
            <p className="text-xl text-gray-600">
              Des témoignages authentiques qui illustrent l'impact de notre plateforme
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Témoignage 1 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mr-4">
                  S
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-lg">Sophie M.</h4>
                  <p className="text-gray-600 text-sm">Maman de Lucas, 6 ans</p>
                </div>
              </div>
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 leading-relaxed italic">
                "Grâce à Autisme Connect, nous avons trouvé Marine, une éducatrice formidable qui a vraiment changé notre quotidien.
                Lucas s'épanouit et progresse chaque jour. Un grand merci pour cette plateforme si humaine !"
              </p>
            </div>

            {/* Témoignage 2 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mr-4">
                  M
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-lg">Marine L.</h4>
                  <p className="text-gray-600 text-sm">Éducatrice spécialisée DEES</p>
                </div>
              </div>
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 leading-relaxed italic">
                "En tant qu'éducatrice, cette plateforme m'a permis de développer mon activité libérale tout en restant fidèle à mes valeurs.
                J'accompagne maintenant 8 familles formidables. La gestion administrative est simplifiée, je peux me concentrer sur l'essentiel !"
              </p>
            </div>

            {/* Témoignage 3 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mr-4">
                  T
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-lg">Thomas & Léa R.</h4>
                  <p className="text-gray-600 text-sm">Parents d'Emma, 4 ans</p>
                </div>
              </div>
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 leading-relaxed italic">
                "Nous cherchions depuis des mois un éducateur formé à la méthode ABA. En 2 jours, nous avons trouvé Julien qui habite à 10 minutes de chez nous !
                Emma adore ses séances et nous voyons déjà des progrès incroyables. Merci infiniment !"
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Notre Mission - Version humanisée */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Pourquoi Autisme Connect existe ?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Parce que nous croyons que chaque famille mérite d'avoir accès facilement à un accompagnement de qualité,
              et que chaque enfant a le droit à une prise en charge adaptée à ses besoins uniques.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            {/* Colonne gauche - Texte principal */}
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Pour vous, les familles</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Nous savons à quel point il peut être difficile de trouver le bon professionnel.
                    C'est pourquoi nous avons créé un espace où vous pouvez découvrir des éducateurs passionnés,
                    consulter leurs parcours et échanger avec eux en toute confiance.
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
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Pour vous, les éducateurs</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Votre métier est une vocation. Nous vous donnons les moyens de développer votre activité
                    tout en gardant du temps pour ce qui compte vraiment : accompagner les enfants et leurs familles
                    avec bienveillance et professionnalisme.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Notre engagement</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Transparence totale, sécurité maximale et accompagnement humain.
                    Chaque profil est vérifié, chaque échange est sécurisé, et notre équipe est toujours là pour vous aider.
                  </p>
                </div>
              </div>
            </div>

            {/* Colonne droite - Stats/Highlights */}
            <div className="bg-gradient-to-br from-primary-50 to-blue-50 rounded-2xl p-8 lg:p-10 shadow-lg">
              <div className="space-y-8">
                <div className="text-center pb-6 border-b border-primary-200">
                  <p className="text-primary-600 font-semibold mb-2">Une plateforme pensée pour vous</p>
                  <h3 className="text-3xl font-bold text-gray-900">
                    Simple, humaine et efficace
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-shadow">
                    <div className="text-4xl font-bold text-primary-600 mb-2">100%</div>
                    <p className="text-sm text-gray-600">Gratuit familles</p>
                  </div>
                  <div className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-shadow">
                    <div className="text-4xl font-bold text-green-600 mb-2">30j</div>
                    <p className="text-sm text-gray-600">Essai gratuit</p>
                  </div>
                  <div className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-shadow">
                    <div className="text-4xl font-bold text-blue-600 mb-2">24/7</div>
                    <p className="text-sm text-gray-600">Disponible</p>
                  </div>
                  <div className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-shadow">
                    <div className="text-4xl font-bold text-purple-600 mb-2">0€</div>
                    <p className="text-sm text-gray-600">Frais cachés</p>
                  </div>
                </div>

                <div className="pt-4">
                  <Link
                    href="/auth/signup"
                    className="block w-full text-center px-6 py-4 bg-primary-600 text-white rounded-xl hover:bg-primary-700 font-bold text-lg shadow-md transition-colors"
                  >
                    Rejoignez-nous gratuitement
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
              💰 Nous vous aidons aussi financièrement
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Plusieurs aides existent pour financer l'accompagnement de votre enfant.
              Nous sommes là pour vous guider dans vos démarches.
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
              💡 Exemple concret de coût pour votre famille
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
                <span className="text-lg font-bold text-gray-900">Votre coût réel</span>
                <span className="text-3xl font-bold text-primary-600">20€</span>
              </div>
            </div>

            <div className="mt-8 p-6 bg-blue-50 rounded-xl">
              <p className="text-gray-700 text-center leading-relaxed">
                <span className="font-semibold">💳 Avec les aides MDPH (AEEH ou PCH)</span>, votre reste à charge peut être encore réduit, voire nul selon votre situation. Nous sommes là pour vous accompagner dans vos démarches.
              </p>
            </div>

            <div className="mt-6 text-center">
              <Link
                href="/search"
                className="inline-block px-8 py-4 bg-primary-600 text-white rounded-xl hover:bg-primary-700 font-bold text-lg shadow-lg transition-colors"
              >
                Je trouve mon éducateur
              </Link>
            </div>
          </div>

          {/* Note informative */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600 max-w-2xl mx-auto">
              <span className="font-semibold">ℹ️ Bon à savoir :</span> Tous nos éducateurs acceptent le paiement par CESU.
              N'hésitez pas à les contacter pour échanger sur les modalités adaptées à votre situation.
            </p>
          </div>
        </div>
      </div>

      {/* Pour les familles / Pour les éducateurs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Pour les familles */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 lg:p-10 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-6">
              <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center mr-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-3xl font-bold text-gray-900">Vous êtes parents ?</h3>
            </div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-start">
                <svg className="w-6 h-6 text-green-600 mr-3 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-700 text-lg">Trouvez des éducateurs qualifiés près de chez vous</span>
              </li>
              <li className="flex items-start">
                <svg className="w-6 h-6 text-green-600 mr-3 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-700 text-lg">Consultez leurs profils, parcours et spécialités</span>
              </li>
              <li className="flex items-start">
                <svg className="w-6 h-6 text-green-600 mr-3 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-700 text-lg">Échangez directement avec eux en toute confiance</span>
              </li>
              <li className="flex items-start">
                <svg className="w-6 h-6 text-green-600 mr-3 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-700 text-lg">100% gratuit, sans engagement</span>
              </li>
            </ul>
            <Link
              href="/search"
              className="inline-block w-full text-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors shadow-md"
            >
              Commencer ma recherche
            </Link>
          </div>

          {/* Pour les éducateurs */}
          <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl p-8 lg:p-10 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-6">
              <div className="w-14 h-14 bg-primary-600 rounded-xl flex items-center justify-center mr-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-3xl font-bold text-gray-900">Vous êtes éducateur ?</h3>
            </div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-start">
                <svg className="w-6 h-6 text-green-600 mr-3 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-700 text-lg">Valorisez votre expertise et vos diplômes</span>
              </li>
              <li className="flex items-start">
                <svg className="w-6 h-6 text-green-600 mr-3 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-700 text-lg">Développez votre activité à votre rythme</span>
              </li>
              <li className="flex items-start">
                <svg className="w-6 h-6 text-green-600 mr-3 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-700 text-lg">Gagnez du temps sur l'administratif</span>
              </li>
              <li className="flex items-start">
                <svg className="w-6 h-6 text-green-600 mr-3 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-700 text-lg">30 jours d'essai gratuit</span>
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

      {/* Call to Action Final - Plus humain */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary-600 via-blue-600 to-purple-600 py-20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"></div>
        <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Prêt à faire partie de l'aventure ?
          </h2>
          <p className="text-xl text-blue-100 mb-10 leading-relaxed">
            Rejoignez une communauté bienveillante qui croit en l'inclusion et en l'accompagnement personnalisé.
            Ensemble, faisons la différence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/search"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-primary-600 rounded-xl hover:bg-gray-50 font-bold text-lg shadow-xl transition-all transform hover:scale-105"
            >
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Trouver un éducateur
            </Link>
            <Link
              href="/auth/signup"
              className="inline-flex items-center justify-center px-8 py-4 bg-transparent text-white border-2 border-white rounded-xl hover:bg-white/10 font-bold text-lg shadow-xl transition-all"
            >
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              <h3 className="text-white font-bold text-lg mb-4">Autisme Connect</h3>
              <p className="text-gray-400 leading-relaxed">
                Une plateforme humaine qui connecte les familles avec des éducateurs spécialisés passionnés.
              </p>
            </div>
            <div>
              <h3 className="text-white font-bold text-lg mb-4">Liens rapides</h3>
              <ul className="space-y-2">
                <li><Link href="/search" className="hover:text-white transition-colors">Trouver un éducateur</Link></li>
                <li><Link href="/about" className="hover:text-white transition-colors">Qui sommes-nous ?</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Tarifs</Link></li>
                <li><Link href="/auth/signup" className="hover:text-white transition-colors">Inscription</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-bold text-lg mb-4">Besoin d'aide ?</h3>
              <p className="text-gray-400 leading-relaxed mb-4">
                Notre équipe est là pour vous accompagner dans votre parcours.
              </p>
              <Link href="/support" className="inline-block px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                Contactez-nous
              </Link>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-500">
            <p>© 2024 Autisme Connect. Tous droits réservés. Fait avec ❤️ pour les familles et les éducateurs.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
