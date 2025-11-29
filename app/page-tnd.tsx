'use client';

import Link from 'next/link';
import TndNav from '@/components/TndNav';

// Version TND simplifiée de la page d'accueil
export default function HomeTnd() {
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <TndNav />

      {/* Hero Section TND - Ultra simplifié */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-16">

        {/* Titre principal */}
        <div className="text-center mb-8 sm:mb-16">
          <div className="text-4xl sm:text-6xl mb-6 sm:mb-12">
            🏠
          </div>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-6 sm:mb-12 text-black leading-relaxed">
            AUTISME CONNECT
          </h1>

          <div className="space-y-4 sm:space-y-8 text-lg sm:text-2xl md:text-3xl text-black mb-8 sm:mb-16 leading-relaxed">
            <p>Nous aidons votre famille.</p>
            <p>Nous trouvons un éducateur pour vous.</p>
          </div>
        </div>

        {/* Action principale - Bouton */}
        <div className="text-center mb-10 sm:mb-20">
          <Link
            href="/search"
            className="inline-block w-full sm:w-auto"
          >
            <div className="bg-blue-600 text-white px-6 sm:px-16 py-6 sm:py-12 rounded-2xl sm:rounded-3xl font-bold border-4 border-blue-800 hover:bg-blue-700 transition-colors text-xl sm:text-3xl md:text-4xl">
              <div className="flex items-center justify-center gap-3 sm:gap-6">
                <span className="text-2xl sm:text-4xl">🔍</span>
                <span>CHERCHER UN ÉDUCATEUR</span>
              </div>
            </div>
          </Link>

          <div className="mt-6 sm:mt-10 text-xl sm:text-3xl text-black">
            <span className="inline-flex items-center gap-2 sm:gap-3">
              <span className="text-xl sm:text-3xl">✅</span>
              <span>C'est gratuit</span>
            </span>
          </div>
        </div>

        {/* Stats simplifiées avec pictogrammes */}
        <div className="grid grid-cols-2 gap-4 sm:gap-10 mb-10 sm:mb-20 max-w-4xl mx-auto">
          <div className="bg-gray-50 p-6 sm:p-12 rounded-2xl sm:rounded-3xl text-center border-2 sm:border-4 border-gray-200">
            <div className="text-3xl sm:text-6xl mb-3 sm:mb-6">👨‍👩‍👧</div>
            <div className="text-2xl sm:text-5xl font-bold text-black mb-2 sm:mb-4">150</div>
            <div className="text-sm sm:text-2xl text-black">Familles aidées</div>
          </div>

          <div className="bg-gray-50 p-6 sm:p-12 rounded-2xl sm:rounded-3xl text-center border-2 sm:border-4 border-gray-200">
            <div className="text-3xl sm:text-6xl mb-3 sm:mb-6">👨‍🏫</div>
            <div className="text-2xl sm:text-5xl font-bold text-black mb-2 sm:mb-4">50</div>
            <div className="text-sm sm:text-2xl text-black">Éducateurs</div>
          </div>
        </div>

        {/* Action secondaire - Aide */}
        <div className="text-center mb-10 sm:mb-16">
          <Link
            href="/contact"
            className="inline-block w-full sm:w-auto"
          >
            <div className="bg-white text-black px-6 sm:px-12 py-5 sm:py-10 rounded-2xl sm:rounded-3xl font-bold border-2 sm:border-4 border-black hover:bg-gray-50 transition-colors text-lg sm:text-2xl">
              <div className="flex items-center justify-center gap-3 sm:gap-6">
                <span className="text-xl sm:text-3xl">❓</span>
                <span>BESOIN D'AIDE ?</span>
              </div>
            </div>
          </Link>
        </div>

        {/* Information simple */}
        <div className="bg-blue-50 p-6 sm:p-12 rounded-2xl sm:rounded-3xl text-center border-2 sm:border-4 border-blue-200 mb-10 sm:mb-16">
          <div className="text-lg sm:text-2xl md:text-3xl text-black space-y-3 sm:space-y-6 leading-relaxed">
            <p>✅ Tous les éducateurs sont vérifiés</p>
            <p>✅ Vous choisissez votre éducateur</p>
            <p>✅ C'est simple et rapide</p>
          </div>
        </div>

        {/* CTA Inscription éducateur */}
        <div className="text-center mb-10 sm:mb-16">
          <div className="text-lg sm:text-2xl text-black mb-4 sm:mb-8">
            Vous êtes éducateur ?
          </div>
          <Link
            href="/auth/signup"
            className="inline-block w-full sm:w-auto"
          >
            <div className="bg-green-600 text-white px-6 sm:px-12 py-5 sm:py-10 rounded-2xl sm:rounded-3xl font-bold border-2 sm:border-4 border-green-800 hover:bg-green-700 transition-colors text-lg sm:text-2xl">
              <div className="flex items-center justify-center gap-3 sm:gap-6">
                <span className="text-xl sm:text-3xl">📝</span>
                <span>S'INSCRIRE</span>
              </div>
            </div>
          </Link>
        </div>

      </div>
    </div>
  );
}
