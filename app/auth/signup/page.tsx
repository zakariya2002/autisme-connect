'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignupChoicePage() {
  const router = useRouter();

  const handleRoleSelection = (role: 'family' | 'educator') => {
    // Redirection directe vers les pages fusionnées
    if (role === 'educator') {
      router.push('/auth/register-educator');
    } else {
      router.push('/auth/register-family');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-blue-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-4xl">
        {/* En-tête */}
        <div className="text-center mb-12">
          <Link href="/" className="inline-block">
            <h1 className="text-4xl font-bold text-primary-600 mb-2">
              Autisme Connect
            </h1>
          </Link>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
            Créer un compte
          </h2>
          <p className="text-lg text-gray-600">
            Choisissez le type de compte que vous souhaitez créer
          </p>
          <p className="mt-4 text-sm text-gray-600">
            Vous avez déjà un compte ?{' '}
            <Link href="/auth/login" className="font-medium text-primary-600 hover:text-primary-500">
              Connectez-vous
            </Link>
          </p>
        </div>

        {/* Cartes de choix */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto px-4">
          {/* Carte Famille */}
          <button
            onClick={() => handleRoleSelection('family')}
            className="group relative bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-primary-500 transform hover:-translate-y-1"
          >
            <div className="p-8 text-center">
              {/* Icône */}
              <div className="mb-6 flex justify-center">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-primary-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-12 h-12 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>

              {/* Titre */}
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Je suis une famille
              </h3>
              <p className="text-gray-600 mb-6">
                ou une personne avec TSA
              </p>

              {/* Description */}
              <div className="text-left space-y-3 mb-6">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-gray-600">Rechercher des éducateurs qualifiés</span>
                </div>
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-gray-600">Contacter et échanger en toute sécurité</span>
                </div>
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-gray-600">Accéder à des professionnels certifiés</span>
                </div>
              </div>

              {/* Bouton */}
              <div className="flex items-center justify-center text-primary-600 font-semibold group-hover:text-primary-700">
                <span>Continuer</span>
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>

            {/* Effet de brillance au survol */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-10 transform -skew-x-12 group-hover:translate-x-full transition-all duration-1000"></div>
          </button>

          {/* Carte Éducateur */}
          <button
            onClick={() => handleRoleSelection('educator')}
            className="group relative bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-primary-500 transform hover:-translate-y-1"
          >
            <div className="p-8 text-center">
              {/* Icône */}
              <div className="mb-6 flex justify-center">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-primary-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-12 h-12 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>

              {/* Titre */}
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Je suis un éducateur
              </h3>
              <p className="text-gray-600 mb-6">
                spécialisé en autisme
              </p>

              {/* Description */}
              <div className="text-left space-y-3 mb-6">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-gray-600">Créer votre profil professionnel</span>
                </div>
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-gray-600">Faire vérifier vos certifications</span>
                </div>
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-gray-600">Être visible auprès des familles</span>
                </div>
              </div>

              {/* Bouton */}
              <div className="flex items-center justify-center text-primary-600 font-semibold group-hover:text-primary-700">
                <span>Continuer</span>
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>

            {/* Effet de brillance au survol */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-10 transform -skew-x-12 group-hover:translate-x-full transition-all duration-1000"></div>
          </button>
        </div>

        {/* Message informatif */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500 max-w-2xl mx-auto">
            En créant un compte, vous acceptez nos conditions d'utilisation et notre politique de confidentialité.
            Toutes les certifications des éducateurs sont vérifiées par notre équipe.
          </p>
        </div>
      </div>
    </div>
  );
}
