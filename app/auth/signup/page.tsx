'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PublicNavbar from '@/components/PublicNavbar';

export default function SignupChoicePage() {
  const router = useRouter();

  const handleRoleSelection = (role: 'family' | 'educator') => {
    // Redirection directe vers les pages fusionnées
    if (role === 'educator') {
      router.push('/pro');
    } else {
      router.push('/auth/register-family');
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#fdf9f4' }}>
      <PublicNavbar showAuthButtons={true} />

      <div className="flex-1 flex flex-col justify-center pt-20 xl:pt-24 pb-12 px-4 sm:px-6 lg:px-8 relative z-0">
        <div className="sm:mx-auto sm:w-full sm:max-w-4xl">
          {/* En-tête */}
          <div className="text-center mb-10">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
              Créer un compte
            </h1>
            <p className="text-lg text-gray-600">
              Choisissez le type de compte que vous souhaitez créer
            </p>
            <p className="mt-4 text-sm text-gray-600">
              Vous avez déjà un compte ?{' '}
              <Link href="/auth/login" className="font-semibold hover:underline" style={{ color: '#027e7e' }}>
                Connectez-vous
              </Link>
            </p>
          </div>

          {/* Cartes de choix */}
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Carte Aidant */}
            <button
              onClick={() => handleRoleSelection('family')}
              className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-[#027e7e] transform hover:-translate-y-1 text-left"
              aria-label="Créer un compte aidant ou personne avec TND"
            >
              <div className="p-6 sm:p-8">
                {/* En-tête avec icône */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300" style={{ backgroundColor: 'rgba(2, 126, 126, 0.1)' }}>
                    <svg className="w-7 h-7" style={{ color: '#027e7e' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                      Je suis un aidant
                    </h2>
                    <p className="text-gray-500 text-sm">ou une personne avec TND</p>
                  </div>
                </div>

                {/* Liste des avantages */}
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: '#027e7e' }}>
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-gray-700">Rechercher des professionnels qualifiés</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: '#027e7e' }}>
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-gray-700">Contacter et échanger en toute sécurité</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: '#027e7e' }}>
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-gray-700">100% gratuit, sans engagement</span>
                  </li>
                </ul>

                {/* Bouton */}
                <div className="w-full text-center text-white font-semibold py-3.5 rounded-xl transition-all group-hover:opacity-90 group-hover:shadow-lg" style={{ backgroundColor: '#027e7e' }}>
                  <span className="flex items-center justify-center gap-2">
                    Créer mon compte aidant
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </div>
            </button>

            {/* Carte Professionnel */}
            <button
              onClick={() => handleRoleSelection('educator')}
              className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-[#41005c] transform hover:-translate-y-1 text-left"
              aria-label="Créer un compte professionnel"
            >
              <div className="p-6 sm:p-8">
                {/* En-tête avec icône */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300" style={{ backgroundColor: 'rgba(65, 0, 92, 0.1)' }}>
                    <svg className="w-7 h-7" style={{ color: '#41005c' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                      Je suis un professionnel
                    </h2>
                    <p className="text-gray-500 text-sm">Éducateur, psychologue, etc.</p>
                  </div>
                </div>

                {/* Liste des avantages */}
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: '#41005c' }}>
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-gray-700">Valorisez votre expertise et diplômes</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: '#41005c' }}>
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-gray-700">Soyez visible auprès des familles</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: '#41005c' }}>
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-gray-700">Gérez vos revenus facilement</span>
                  </li>
                </ul>

                {/* Bouton */}
                <div className="w-full text-center text-white font-semibold py-3.5 rounded-xl transition-all group-hover:opacity-90 group-hover:shadow-lg" style={{ backgroundColor: '#41005c' }}>
                  <span className="flex items-center justify-center gap-2">
                    Créer mon compte pro
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </div>
            </button>
          </div>

          {/* Message informatif et liens RGPD */}
          <div className="mt-10 text-center">
            <p className="text-sm text-gray-500 max-w-2xl mx-auto mb-6">
              En créant un compte, vous acceptez nos{' '}
              <a href="/cgu" className="font-medium hover:underline" style={{ color: '#027e7e' }}>
                conditions générales d'utilisation
              </a>{' '}
              et notre{' '}
              <a href="/politique-confidentialite" className="font-medium hover:underline" style={{ color: '#027e7e' }}>
                politique de confidentialité
              </a>
              . Tous les diplômes et certifications des professionnels sont vérifiés par notre équipe.
            </p>

            {/* Liens RGPD */}
            <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-400">
              <a href="/politique-confidentialite" className="hover:underline" style={{ color: '#027e7e' }}>
                Politique de confidentialité
              </a>
              <span className="text-gray-300">•</span>
              <a href="/cgu" className="hover:underline" style={{ color: '#027e7e' }}>
                Conditions générales d'utilisation
              </a>
              <span className="text-gray-300">•</span>
              <a href="/mentions-legales" className="hover:underline" style={{ color: '#027e7e' }}>
                Mentions légales
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
