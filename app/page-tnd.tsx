'use client';

import Link from 'next/link';
import TndNav from '@/components/TndNav';

// Version TND simplifiée de la page d'accueil
export default function HomeTnd() {
  return (
    <div className="min-h-screen bg-white">
      <TndNav />

      {/* Hero Section TND - Ultra simplifié */}
      <div className="max-w-5xl mx-auto px-6 py-16">

        {/* Titre principal */}
        <div className="text-center mb-16">
          <div className="text-6xl mb-12" style={{ lineHeight: '1.8' }}>
            🏠
          </div>
          <h1 className="text-5xl font-bold mb-12 text-black" style={{ lineHeight: '1.8', letterSpacing: '0.05em' }}>
            AUTISME CONNECT
          </h1>

          <div className="space-y-8 text-3xl text-black mb-16" style={{ lineHeight: '2' }}>
            <p>Nous aidons votre famille.</p>
            <p>Nous trouvons un éducateur pour vous.</p>
          </div>
        </div>

        {/* Action principale - Bouton énorme */}
        <div className="text-center mb-20">
          <Link
            href="/search"
            className="inline-block"
          >
            <div
              className="bg-blue-600 text-white px-16 py-12 rounded-3xl font-bold border-4 border-blue-800 hover:bg-blue-700 transition-colors"
              style={{ fontSize: '2.5rem', lineHeight: '1.4' }}
            >
              <div className="flex items-center justify-center gap-6">
                <span style={{ fontSize: '3rem' }}>🔍</span>
                <span>CHERCHER UN ÉDUCATEUR</span>
              </div>
            </div>
          </Link>

          <div className="mt-10 text-3xl text-black">
            <span className="inline-flex items-center gap-3">
              <span style={{ fontSize: '2.5rem' }}>✅</span>
              <span>C'est gratuit</span>
            </span>
          </div>
        </div>

        {/* Stats simplifiées avec pictogrammes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-20 max-w-4xl mx-auto">
          <div className="bg-gray-50 p-12 rounded-3xl text-center border-4 border-gray-200">
            <div style={{ fontSize: '5rem' }} className="mb-6">👨‍👩‍👧</div>
            <div className="text-5xl font-bold text-black mb-4">150</div>
            <div className="text-2xl text-black">Familles aidées</div>
          </div>

          <div className="bg-gray-50 p-12 rounded-3xl text-center border-4 border-gray-200">
            <div style={{ fontSize: '5rem' }} className="mb-6">👨‍🏫</div>
            <div className="text-5xl font-bold text-black mb-4">50</div>
            <div className="text-2xl text-black">Éducateurs</div>
          </div>
        </div>

        {/* Action secondaire - Aide */}
        <div className="text-center mb-16">
          <Link
            href="/contact"
            className="inline-block"
          >
            <div
              className="bg-white text-black px-12 py-10 rounded-3xl font-bold border-4 border-black hover:bg-gray-50 transition-colors"
              style={{ fontSize: '2rem', lineHeight: '1.4' }}
            >
              <div className="flex items-center justify-center gap-6">
                <span style={{ fontSize: '2.5rem' }}>❓</span>
                <span>BESOIN D'AIDE ?</span>
              </div>
            </div>
          </Link>
        </div>

        {/* Information simple */}
        <div className="bg-blue-50 p-12 rounded-3xl text-center border-4 border-blue-200 mb-16">
          <div className="text-3xl text-black mb-8" style={{ lineHeight: '2' }}>
            <p className="mb-6">✅ Tous les éducateurs sont vérifiés</p>
            <p className="mb-6">✅ Vous choisissez votre éducateur</p>
            <p>✅ C'est simple et rapide</p>
          </div>
        </div>

        {/* CTA Inscription éducateur */}
        <div className="text-center mb-16">
          <div className="text-2xl text-black mb-8">
            Vous êtes éducateur ?
          </div>
          <Link
            href="/auth/signup"
            className="inline-block"
          >
            <div
              className="bg-green-600 text-white px-12 py-10 rounded-3xl font-bold border-4 border-green-800 hover:bg-green-700 transition-colors"
              style={{ fontSize: '2rem', lineHeight: '1.4' }}
            >
              <div className="flex items-center justify-center gap-6">
                <span style={{ fontSize: '2.5rem' }}>📝</span>
                <span>S'INSCRIRE</span>
              </div>
            </div>
          </Link>
        </div>

      </div>
    </div>
  );
}
