'use client';

import Link from 'next/link';
import TndNav from '@/components/TndNav';

export default function AboutTnd() {
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <TndNav />

      {/* Contenu simplifié */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-16">
        {/* Titre principal */}
        <div className="text-center mb-8 sm:mb-16">
          <div className="text-4xl sm:text-6xl mb-6 sm:mb-12">
            📖
          </div>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-6 sm:mb-12 text-black leading-relaxed">
            QUI SOMMES-NOUS ?
          </h1>
        </div>

        {/* Notre mission */}
        <div className="bg-blue-50 p-6 sm:p-12 rounded-2xl sm:rounded-3xl text-center border-2 sm:border-4 border-blue-200 mb-8 sm:mb-16">
          <div className="text-3xl sm:text-5xl mb-4 sm:mb-8">🎯</div>
          <h2 className="text-xl sm:text-3xl md:text-4xl font-bold text-black mb-4 sm:mb-8">Notre Mission</h2>
          <p className="text-lg sm:text-2xl md:text-3xl text-black mb-3 sm:mb-6 leading-relaxed">
            Nous aidons les familles à trouver des éducateurs spécialisés.
          </p>
          <p className="text-lg sm:text-2xl md:text-3xl text-black leading-relaxed">
            C'est simple et gratuit pour les familles.
          </p>
        </div>

        {/* Ce que nous faisons */}
        <div className="space-y-4 sm:space-y-10 mb-8 sm:mb-16">
          <div className="bg-white p-6 sm:p-12 rounded-2xl sm:rounded-3xl border-2 sm:border-4 border-gray-300">
            <div className="text-3xl sm:text-5xl mb-3 sm:mb-6">✅</div>
            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-black mb-3 sm:mb-6">Pour les familles</h3>
            <p className="text-base sm:text-xl md:text-2xl text-black leading-relaxed">
              Trouvez un éducateur qualifié près de chez vous. C'est gratuit.
            </p>
          </div>

          <div className="bg-white p-6 sm:p-12 rounded-2xl sm:rounded-3xl border-2 sm:border-4 border-gray-300">
            <div className="text-3xl sm:text-5xl mb-3 sm:mb-6">👨‍🏫</div>
            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-black mb-3 sm:mb-6">Pour les éducateurs</h3>
            <p className="text-base sm:text-xl md:text-2xl text-black leading-relaxed">
              Développez votre activité. Trouvez des familles qui ont besoin de vous.
            </p>
          </div>
        </div>

        {/* Nos valeurs */}
        <div className="bg-green-50 p-6 sm:p-12 rounded-2xl sm:rounded-3xl text-center border-2 sm:border-4 border-green-200 mb-8 sm:mb-16">
          <div className="text-3xl sm:text-5xl mb-4 sm:mb-8">💚</div>
          <h2 className="text-xl sm:text-3xl md:text-4xl font-bold text-black mb-4 sm:mb-8">Nos Valeurs</h2>
          <div className="space-y-3 sm:space-y-6 text-lg sm:text-2xl md:text-3xl text-black leading-relaxed">
            <p>✅ Transparence totale</p>
            <p>✅ Sécurité maximale</p>
            <p>✅ Accompagnement humain</p>
          </div>
        </div>

        {/* Bouton retour accueil */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-block w-full sm:w-auto"
          >
            <div className="bg-blue-600 text-white px-6 sm:px-16 py-6 sm:py-12 rounded-2xl sm:rounded-3xl font-bold border-4 border-blue-800 hover:bg-blue-700 transition-colors text-xl sm:text-3xl md:text-4xl">
              <div className="flex items-center justify-center gap-3 sm:gap-6">
                <span className="text-2xl sm:text-4xl">🏠</span>
                <span>RETOUR ACCUEIL</span>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
