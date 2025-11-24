'use client';

import Link from 'next/link';
import TndNav from '@/components/TndNav';

export default function SupportTnd() {
  return (
    <div className="min-h-screen bg-white">
      <TndNav />

      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <div className="text-6xl mb-12">❓</div>
          <h1 className="text-5xl font-bold mb-12 text-black" style={{ lineHeight: '1.8' }}>
            AIDE & SUPPORT
          </h1>
        </div>

        <div className="space-y-10 mb-16">
          <div className="bg-blue-50 p-12 rounded-3xl border-4 border-blue-200">
            <div className="text-5xl mb-6">📧</div>
            <h2 className="text-3xl font-bold text-black mb-6">Email</h2>
            <a href="mailto:contact@autismeconnect.fr" className="text-3xl text-blue-600 font-bold hover:underline">
              contact@autismeconnect.fr
            </a>
          </div>

          <div className="bg-green-50 p-12 rounded-3xl border-4 border-green-200">
            <div className="text-5xl mb-6">📞</div>
            <h2 className="text-3xl font-bold text-black mb-6">Téléphone</h2>
            <a href="tel:+33123456789" className="text-3xl text-green-600 font-bold hover:underline">
              01 23 45 67 89
            </a>
          </div>
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
