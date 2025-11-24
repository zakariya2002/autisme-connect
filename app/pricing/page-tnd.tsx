'use client';

import Link from 'next/link';
import TndNav from '@/components/TndNav';

export default function PricingTnd() {
  return (
    <div className="min-h-screen bg-white">
      <TndNav />

      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <div className="text-6xl mb-12">💼</div>
          <h1 className="text-5xl font-bold mb-12 text-black" style={{ lineHeight: '1.8' }}>
            OFFRE PROFESSIONNELLE
          </h1>
        </div>

        {/* Offre Gratuite Familles */}
        <div className="bg-green-50 p-12 rounded-3xl text-center border-4 border-green-200 mb-12">
          <div className="text-5xl mb-8">✅</div>
          <h2 className="text-4xl font-bold text-black mb-8">Pour les Familles</h2>
          <p className="text-5xl font-bold text-green-600 mb-6">GRATUIT</p>
          <p className="text-2xl text-black" style={{ lineHeight: '2' }}>
            100% gratuit. Toujours.
          </p>
        </div>

        {/* Offre Découverte Gratuite */}
        <div className="bg-gray-50 p-12 rounded-3xl border-4 border-gray-300 mb-12">
          <div className="text-5xl mb-8">🆓</div>
          <h2 className="text-4xl font-bold text-black mb-8">OFFRE DÉCOUVERTE</h2>
          <p className="text-5xl font-bold text-gray-700 mb-8">GRATUIT</p>

          <div className="space-y-4 text-2xl text-black" style={{ lineHeight: '2' }}>
            <p>✓ Création de profil</p>
            <p>✓ 3 contacts familles/mois</p>
            <p>✓ Messagerie de base</p>
          </div>
        </div>

        {/* Offre Pro */}
        <div className="bg-blue-50 p-12 rounded-3xl text-center border-4 border-blue-200 mb-12">
          <div className="text-5xl mb-8">⭐</div>
          <h2 className="text-4xl font-bold text-black mb-8">OFFRE PRO</h2>

          <div className="bg-green-100 p-6 rounded-2xl mb-8 border-4 border-green-300">
            <p className="text-3xl font-bold text-green-700 mb-4">🎁 OFFRE DE LANCEMENT</p>
            <p className="text-4xl font-bold text-green-600 mb-2">19€ / mois</p>
            <p className="text-2xl text-black">pendant 3 mois</p>
          </div>

          <p className="text-4xl font-bold text-blue-600 mb-4">29€ / mois</p>
          <p className="text-3xl font-bold text-primary-600 mb-4">+ 10% de commission*</p>

          <div className="space-y-4 text-2xl text-black mt-8" style={{ lineHeight: '2' }}>
            <p>✓ Contacts familles illimités</p>
            <p>✓ Badge "Certifié AutismeConnect"</p>
            <p>✓ Notifications instantanées</p>
            <p>✓ Outils de gestion</p>
            <p>✓ Support prioritaire</p>
          </div>
        </div>

        {/* Note Commission */}
        <div className="bg-gray-100 p-8 rounded-3xl border-4 border-gray-300 mb-12">
          <p className="text-xl text-black mb-4" style={{ lineHeight: '2' }}>
            <strong>* Commission de succès :</strong>
          </p>
          <p className="text-xl text-black mb-4" style={{ lineHeight: '2' }}>
            10% uniquement sur les prestations trouvées via AutismeConnect.
          </p>
          <p className="text-xl text-black mb-4" style={{ lineHeight: '2' }}>
            Vos clients existants = 0% de commission.
          </p>
          <div className="bg-white p-6 rounded-2xl border-2 border-gray-400 mt-6">
            <p className="text-2xl font-bold text-black mb-2">Exemple :</p>
            <p className="text-xl text-black" style={{ lineHeight: '2' }}>
              Vous facturez 350€ via notre plateforme<br/>
              → 315€ pour vous, 35€ pour nous
            </p>
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
