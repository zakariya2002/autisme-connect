'use client';

import Link from 'next/link';
import TndNav from '@/components/TndNav';

export default function MessagesTnd() {
  return (
    <div className="min-h-screen bg-white">
      <TndNav />

      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <div className="text-6xl mb-12">💬</div>
          <h1 className="text-5xl font-bold mb-12 text-black" style={{ lineHeight: '1.8' }}>
            MES MESSAGES
          </h1>
          <p className="text-3xl text-black mb-12" style={{ lineHeight: '2' }}>
            La messagerie arrive bientôt en mode simple.
          </p>
        </div>

        <div className="bg-blue-50 p-12 rounded-3xl text-center border-4 border-blue-200 mb-16">
          <div className="text-5xl mb-8">ℹ️</div>
          <p className="text-3xl text-black mb-8" style={{ lineHeight: '2' }}>
            Pour utiliser la messagerie complète, désactivez le mode simple.
          </p>
          <p className="text-2xl text-gray-600" style={{ lineHeight: '2' }}>
            Cliquez sur le bouton en bas à droite.
          </p>
        </div>

        <Link href="/" className="block">
          <div
            className="bg-blue-600 text-white px-16 py-12 rounded-3xl font-bold border-4 border-blue-800 hover:bg-blue-700 transition-colors text-center"
            style={{ fontSize: '2.5rem' }}
          >
            <div className="flex items-center justify-center gap-6">
              <span style={{ fontSize: '3rem' }}>🏠</span>
              <span>RETOUR ACCUEIL</span>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
