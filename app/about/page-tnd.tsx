'use client';

import Link from 'next/link';
import TndNav from '@/components/TndNav';

export default function AboutTnd() {
  return (
    <div className="min-h-screen bg-white">
      <TndNav />

      {/* Contenu simplifié */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        {/* Titre principal */}
        <div className="text-center mb-16">
          <div className="text-6xl mb-12" style={{ lineHeight: '1.8' }}>
            📖
          </div>
          <h1 className="text-5xl font-bold mb-12 text-black" style={{ lineHeight: '1.8', letterSpacing: '0.05em' }}>
            QUI SOMMES-NOUS ?
          </h1>
        </div>

        {/* Notre mission */}
        <div className="bg-blue-50 p-12 rounded-3xl text-center border-4 border-blue-200 mb-16">
          <div className="text-5xl mb-8">🎯</div>
          <h2 className="text-4xl font-bold text-black mb-8">Notre Mission</h2>
          <p className="text-3xl text-black mb-6" style={{ lineHeight: '2' }}>
            Nous aidons les familles à trouver des éducateurs spécialisés.
          </p>
          <p className="text-3xl text-black" style={{ lineHeight: '2' }}>
            C'est simple et gratuit pour les familles.
          </p>
        </div>

        {/* Ce que nous faisons */}
        <div className="space-y-10 mb-16">
          <div className="bg-white p-12 rounded-3xl border-4 border-gray-300">
            <div className="text-5xl mb-6">✅</div>
            <h3 className="text-3xl font-bold text-black mb-6">Pour les familles</h3>
            <p className="text-2xl text-black" style={{ lineHeight: '2' }}>
              Trouvez un éducateur qualifié près de chez vous. C'est gratuit.
            </p>
          </div>

          <div className="bg-white p-12 rounded-3xl border-4 border-gray-300">
            <div className="text-5xl mb-6">👨‍🏫</div>
            <h3 className="text-3xl font-bold text-black mb-6">Pour les éducateurs</h3>
            <p className="text-2xl text-black" style={{ lineHeight: '2' }}>
              Développez votre activité. Trouvez des familles qui ont besoin de vous.
            </p>
          </div>
        </div>

        {/* Nos valeurs */}
        <div className="bg-green-50 p-12 rounded-3xl text-center border-4 border-green-200 mb-16">
          <div className="text-5xl mb-8">💚</div>
          <h2 className="text-4xl font-bold text-black mb-8">Nos Valeurs</h2>
          <div className="space-y-6 text-3xl text-black" style={{ lineHeight: '2' }}>
            <p>✅ Transparence totale</p>
            <p>✅ Sécurité maximale</p>
            <p>✅ Accompagnement humain</p>
          </div>
        </div>

        {/* Bouton retour accueil */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-block"
          >
            <div
              className="bg-blue-600 text-white px-16 py-12 rounded-3xl font-bold border-4 border-blue-800 hover:bg-blue-700 transition-colors"
              style={{ fontSize: '2.5rem', lineHeight: '1.4' }}
            >
              <div className="flex items-center justify-center gap-6">
                <span style={{ fontSize: '3rem' }}>🏠</span>
                <span>RETOUR ACCUEIL</span>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
