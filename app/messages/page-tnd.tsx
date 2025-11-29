'use client';

import Link from 'next/link';
import TndNav from '@/components/TndNav';

export default function MessagesTnd() {
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <TndNav />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-16">
        <div className="text-center mb-8 sm:mb-16">
          <div className="text-4xl sm:text-6xl mb-6 sm:mb-12">💬</div>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-6 sm:mb-12 text-black leading-relaxed">
            MES MESSAGES
          </h1>
          <p className="text-lg sm:text-2xl md:text-3xl text-black mb-6 sm:mb-12 leading-relaxed">
            La messagerie arrive bientôt en mode simple.
          </p>
        </div>

        <div className="bg-blue-50 p-6 sm:p-12 rounded-2xl sm:rounded-3xl text-center border-2 sm:border-4 border-blue-200 mb-8 sm:mb-16">
          <div className="text-3xl sm:text-5xl mb-4 sm:mb-8">ℹ️</div>
          <p className="text-lg sm:text-2xl md:text-3xl text-black mb-4 sm:mb-8 leading-relaxed">
            Pour utiliser la messagerie complète, désactivez le mode simple.
          </p>
          <p className="text-base sm:text-xl md:text-2xl text-gray-600 leading-relaxed">
            Cliquez sur le bouton en bas à droite.
          </p>
        </div>

        <Link href="/" className="block">
          <div className="bg-blue-600 text-white px-6 sm:px-16 py-6 sm:py-12 rounded-2xl sm:rounded-3xl font-bold border-4 border-blue-800 hover:bg-blue-700 transition-colors text-center text-xl sm:text-3xl md:text-4xl">
            <div className="flex items-center justify-center gap-3 sm:gap-6">
              <span className="text-2xl sm:text-4xl">🏠</span>
              <span>RETOUR ACCUEIL</span>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
