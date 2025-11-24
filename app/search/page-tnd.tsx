'use client';

import Link from 'next/link';
import TndNav from '@/components/TndNav';

export default function SearchTnd() {
  return (
    <div className="min-h-screen bg-white">
      <TndNav />

      {/* Contenu simplifié */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        {/* Titre principal */}
        <div className="text-center mb-16">
          <div className="text-6xl mb-12" style={{ lineHeight: '1.8' }}>
            🔍
          </div>
          <h1 className="text-5xl font-bold mb-12 text-black" style={{ lineHeight: '1.8', letterSpacing: '0.05em' }}>
            TROUVER UN ÉDUCATEUR
          </h1>
          <p className="text-3xl text-black mb-12" style={{ lineHeight: '2' }}>
            La recherche complète arrive bientôt en mode simple.
          </p>
        </div>

        {/* Message info */}
        <div className="bg-blue-50 p-12 rounded-3xl text-center border-4 border-blue-200 mb-16">
          <div className="text-5xl mb-8">ℹ️</div>
          <p className="text-3xl text-black mb-8" style={{ lineHeight: '2' }}>
            Pour utiliser la recherche complète, désactivez le mode simple.
          </p>
          <p className="text-2xl text-gray-600" style={{ lineHeight: '2' }}>
            Cliquez sur le bouton en bas à droite.
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-8">
          <Link href="/" className="block">
            <div
              className="bg-blue-600 text-white px-16 py-12 rounded-3xl font-bold border-4 border-blue-800 hover:bg-blue-700 transition-colors text-center"
              style={{ fontSize: '2.5rem', lineHeight: '1.4' }}
            >
              <div className="flex items-center justify-center gap-6">
                <span style={{ fontSize: '3rem' }}>🏠</span>
                <span>RETOUR ACCUEIL</span>
              </div>
            </div>
          </Link>

          <Link href="/contact" className="block">
            <div
              className="bg-white text-black px-16 py-12 rounded-3xl font-bold border-4 border-black hover:bg-gray-50 transition-colors text-center"
              style={{ fontSize: '2rem', lineHeight: '1.4' }}
            >
              <div className="flex items-center justify-center gap-6">
                <span style={{ fontSize: '2.5rem' }}>📧</span>
                <span>NOUS CONTACTER</span>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
