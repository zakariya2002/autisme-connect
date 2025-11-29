'use client';

import Link from 'next/link';
import TndNav from '@/components/TndNav';

export default function PricingTnd() {
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <TndNav />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-16">
        <div className="text-center mb-8 sm:mb-16">
          <div className="text-4xl sm:text-6xl mb-6 sm:mb-12">💼</div>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-6 sm:mb-12 text-black leading-relaxed">
            OFFRE PROFESSIONNELLE
          </h1>
        </div>

        {/* Offre Gratuite Familles */}
        <div className="bg-green-50 p-6 sm:p-12 rounded-2xl sm:rounded-3xl text-center border-2 sm:border-4 border-green-200 mb-6 sm:mb-12">
          <div className="text-3xl sm:text-5xl mb-4 sm:mb-8">✅</div>
          <h2 className="text-xl sm:text-3xl md:text-4xl font-bold text-black mb-4 sm:mb-8">Pour les Familles</h2>
          <p className="text-2xl sm:text-4xl md:text-5xl font-bold text-green-600 mb-3 sm:mb-6">GRATUIT</p>
          <p className="text-base sm:text-xl md:text-2xl text-black leading-relaxed">
            100% gratuit. Toujours.
          </p>
        </div>

        {/* Offre Découverte Gratuite */}
        <div className="bg-gray-50 p-6 sm:p-12 rounded-2xl sm:rounded-3xl border-2 sm:border-4 border-gray-300 mb-6 sm:mb-12">
          <div className="text-3xl sm:text-5xl mb-4 sm:mb-8">🆓</div>
          <h2 className="text-xl sm:text-3xl md:text-4xl font-bold text-black mb-4 sm:mb-8">OFFRE DÉCOUVERTE</h2>
          <p className="text-2xl sm:text-4xl md:text-5xl font-bold text-gray-700 mb-4 sm:mb-8">GRATUIT</p>

          <div className="space-y-2 sm:space-y-4 text-base sm:text-xl md:text-2xl text-black leading-relaxed">
            <p>✓ Création de profil</p>
            <p>✓ 3 contacts familles/mois</p>
            <p>✓ Messagerie de base</p>
          </div>
        </div>

        {/* Offre Pro */}
        <div className="bg-blue-50 p-6 sm:p-12 rounded-2xl sm:rounded-3xl text-center border-2 sm:border-4 border-blue-200 mb-6 sm:mb-12">
          <div className="text-3xl sm:text-5xl mb-4 sm:mb-8">⭐</div>
          <h2 className="text-xl sm:text-3xl md:text-4xl font-bold text-black mb-4 sm:mb-8">OFFRE PRO</h2>

          <div className="bg-green-100 p-4 sm:p-6 rounded-xl sm:rounded-2xl mb-4 sm:mb-8 border-2 sm:border-4 border-green-300">
            <p className="text-lg sm:text-2xl md:text-3xl font-bold text-green-700 mb-2 sm:mb-4">🎁 OFFRE DE LANCEMENT</p>
            <p className="text-xl sm:text-3xl md:text-4xl font-bold text-green-600 mb-1 sm:mb-2">19€ / mois</p>
            <p className="text-base sm:text-xl md:text-2xl text-black">pendant 3 mois</p>
          </div>

          <p className="text-xl sm:text-3xl md:text-4xl font-bold text-blue-600 mb-2 sm:mb-4">29€ / mois</p>
          <p className="text-lg sm:text-2xl md:text-3xl font-bold text-primary-600 mb-2 sm:mb-4">+ 12% de commission*</p>

          <div className="space-y-2 sm:space-y-4 text-base sm:text-xl md:text-2xl text-black mt-4 sm:mt-8 leading-relaxed">
            <p>✓ Contacts familles illimités</p>
            <p>✓ Badge "Certifié AutismeConnect"</p>
            <p>✓ Notifications instantanées</p>
            <p>✓ Outils de gestion</p>
            <p>✓ Support prioritaire</p>
          </div>
        </div>

        {/* Note Commission */}
        <div className="bg-gray-100 p-4 sm:p-8 rounded-2xl sm:rounded-3xl border-2 sm:border-4 border-gray-300 mb-6 sm:mb-12">
          <p className="text-base sm:text-lg md:text-xl text-black mb-2 sm:mb-4 leading-relaxed">
            <strong>* Commission de succès :</strong>
          </p>
          <p className="text-sm sm:text-lg md:text-xl text-black mb-2 sm:mb-4 leading-relaxed">
            12% (incluant frais bancaires) uniquement sur les prestations trouvées via AutismeConnect.
          </p>
          <p className="text-sm sm:text-lg md:text-xl text-black mb-2 sm:mb-4 leading-relaxed">
            Vos clients existants = 0% de commission.
          </p>
          <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 border-gray-400 mt-4 sm:mt-6">
            <p className="text-base sm:text-xl md:text-2xl font-bold text-black mb-1 sm:mb-2">Exemple :</p>
            <p className="text-sm sm:text-lg md:text-xl text-black leading-relaxed">
              Vous facturez 350€ via notre plateforme<br/>
              → 315€ pour vous, 35€ pour nous
            </p>
          </div>
        </div>

        {/* Encart Agrément SAP */}
        <div className="bg-blue-50 p-6 sm:p-12 rounded-2xl sm:rounded-3xl border-2 sm:border-4 border-blue-200 mb-6 sm:mb-12">
          <div className="text-4xl sm:text-6xl mb-4 sm:mb-8 text-center">🏅</div>
          <h2 className="text-xl sm:text-3xl md:text-4xl font-bold text-black mb-4 sm:mb-8 text-center">AGRÉMENT SAP</h2>
          <p className="text-base sm:text-xl md:text-2xl text-black mb-4 sm:mb-6 text-center leading-relaxed">
            Obtenez l'agrément Services à la Personne<br/>
            pour que vos clients bénéficient du <strong>CESU</strong> et du <strong>crédit d'impôt 50%</strong>
          </p>
          <Link href="/educators/sap-accreditation" className="block">
            <div className="bg-blue-600 text-white px-6 sm:px-12 py-4 sm:py-8 rounded-xl sm:rounded-2xl font-bold border-4 border-blue-800 hover:bg-blue-700 transition-colors text-center text-lg sm:text-2xl">
              <div className="flex items-center justify-center gap-2 sm:gap-4">
                <span className="text-xl sm:text-3xl">ℹ️</span>
                <span>EN SAVOIR PLUS</span>
              </div>
            </div>
          </Link>
          <p className="text-base sm:text-xl text-green-700 font-bold text-center mt-4 sm:mt-6">
            ✅ 100% GRATUIT
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
