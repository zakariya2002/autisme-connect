'use client';

import Link from 'next/link';
import TndNav from '@/components/TndNav';

export default function ContactTnd() {
  return (
    <div className="min-h-screen bg-white">
      <TndNav />

      {/* Contenu simplifié */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        {/* Titre principal */}
        <div className="text-center mb-16">
          <div className="text-6xl mb-12" style={{ lineHeight: '1.8' }}>
            📧
          </div>
          <h1 className="text-5xl font-bold mb-12 text-black" style={{ lineHeight: '1.8', letterSpacing: '0.05em' }}>
            NOUS CONTACTER
          </h1>
        </div>

        {/* Email */}
        <div className="bg-blue-50 p-12 rounded-3xl text-center border-4 border-blue-200 mb-12">
          <div className="text-5xl mb-8">✉️</div>
          <h2 className="text-3xl font-bold text-black mb-6">Email</h2>
          <a
            href="mailto:admin@autismeconnect.fr"
            className="text-3xl text-blue-600 font-bold hover:underline"
            style={{ lineHeight: '2' }}
          >
            admin@autismeconnect.fr
          </a>
        </div>

        {/* Téléphone */}
        <div className="bg-green-50 p-12 rounded-3xl text-center border-4 border-green-200 mb-12">
          <div className="text-5xl mb-8">📞</div>
          <h2 className="text-3xl font-bold text-black mb-6">Téléphone</h2>
          <a
            href="tel:+33123456789"
            className="text-3xl text-green-600 font-bold hover:underline"
            style={{ lineHeight: '2' }}
          >
            01 23 45 67 89
          </a>
        </div>

        {/* Horaires */}
        <div className="bg-gray-50 p-12 rounded-3xl text-center border-4 border-gray-200 mb-16">
          <div className="text-5xl mb-8">🕐</div>
          <h2 className="text-3xl font-bold text-black mb-8">Nos Horaires</h2>
          <div className="space-y-4 text-2xl text-black" style={{ lineHeight: '2' }}>
            <p>Lundi - Vendredi</p>
            <p className="text-3xl font-bold">9h00 - 18h00</p>
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="space-y-8">
          <Link
            href="/"
            className="block"
          >
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

          <Link
            href="/support"
            className="block"
          >
            <div
              className="bg-white text-black px-16 py-12 rounded-3xl font-bold border-4 border-black hover:bg-gray-50 transition-colors text-center"
              style={{ fontSize: '2rem', lineHeight: '1.4' }}
            >
              <div className="flex items-center justify-center gap-6">
                <span style={{ fontSize: '2.5rem' }}>❓</span>
                <span>AIDE & SUPPORT</span>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
