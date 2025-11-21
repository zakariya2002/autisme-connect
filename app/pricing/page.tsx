'use client';

import Link from 'next/link';
import { useState } from 'react';
import Logo from '@/components/Logo';

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  const features = [
    {
      icon: '🎯',
      title: 'Visibilité Maximum',
      description: 'Profil professionnel visible par toutes les familles recherchant un éducateur spécialisé'
    },
    {
      icon: '📅',
      title: 'Gestion des Rendez-vous',
      description: 'Système automatisé de demandes, acceptation/refus en 1 clic, détection des conflits'
    },
    {
      icon: '💬',
      title: 'Messagerie Privée',
      description: 'Communication directe et sécurisée avec les familles, historique complet'
    },
    {
      icon: '💳',
      title: 'Gestion Financière',
      description: 'Définissez votre tarif, calcul automatique, suivi de vos interventions'
    },
    {
      icon: '⭐',
      title: 'Avis & Réputation',
      description: 'Système de notation et avis clients pour renforcer votre crédibilité'
    },
    {
      icon: '🔒',
      title: 'Sécurité & RGPD',
      description: 'Données cryptées, conformité RGPD, sauvegarde automatique'
    },
    {
      icon: '📊',
      title: 'Dashboard Professionnel',
      description: 'Statistiques complètes, calendrier intégré, interface intuitive'
    },
    {
      icon: '🤝',
      title: 'Support Prioritaire',
      description: 'Assistance technique réactive pour vous accompagner au quotidien'
    },
  ];

  const pricing = {
    monthly: {
      price: 90,
      period: '/mois',
      total: '90€',
      savings: null
    },
    annual: {
      price: 80,
      period: '/mois',
      total: '960€',
      savings: 'Économisez 120€ par an'
    }
  };

  const currentPrice = pricing[billingCycle];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-blue-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Logo />
            <div className="flex gap-2">
              <Link
                href="/auth/login"
                className="text-gray-700 hover:text-primary-600 px-4 py-2 rounded-md font-medium transition"
              >
                Se connecter
              </Link>
              <Link
                href="/auth/signup"
                className="bg-primary-600 text-white hover:bg-primary-700 px-4 py-2 rounded-md font-medium transition"
              >
                Créer un compte
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Développez votre activité d'
            <span className="text-primary-600">éducateur spécialisé</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Rejoignez la plateforme de référence pour les professionnels de l'accompagnement TSA
            et connectez-vous avec des familles motivées
          </p>
        </div>

        {/* Pricing Card */}
        <div className="max-w-4xl mx-auto mb-20">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-primary-200">
            {/* Badge "Offre de lancement" */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white text-center py-3 font-bold">
              🎁 OFFRE DE BIENVENUE : 1er MOIS GRATUIT
            </div>

            <div className="p-8 lg:p-12">
              {/* Toggle Monthly/Annual */}
              <div className="flex justify-center mb-8">
                <div className="bg-gray-100 p-1 rounded-xl inline-flex">
                  <button
                    onClick={() => setBillingCycle('monthly')}
                    className={`px-6 py-3 rounded-lg font-semibold transition ${
                      billingCycle === 'monthly'
                        ? 'bg-white text-primary-600 shadow-md'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Mensuel
                  </button>
                  <button
                    onClick={() => setBillingCycle('annual')}
                    className={`px-6 py-3 rounded-lg font-semibold transition relative ${
                      billingCycle === 'annual'
                        ? 'bg-white text-primary-600 shadow-md'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Annuel
                    <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                      -11%
                    </span>
                  </button>
                </div>
              </div>

              {/* Price */}
              <div className="text-center mb-8">
                <div className="mb-2">
                  <span className="text-6xl font-bold text-gray-900">{currentPrice.price}€</span>
                  <span className="text-2xl text-gray-600">{currentPrice.period}</span>
                </div>
                {currentPrice.savings && (
                  <p className="text-green-600 font-semibold">{currentPrice.savings}</p>
                )}
                {billingCycle === 'annual' && (
                  <p className="text-gray-500 mt-2">Soit {currentPrice.total} facturés annuellement</p>
                )}
                <div className="mt-4 inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Sans engagement • Résiliable à tout moment
                </div>
              </div>

              {/* ROI Calculation */}
              <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-2xl p-6 mb-8">
                <h3 className="text-lg font-bold text-gray-900 mb-3 text-center">💰 Rentabilité immédiate</h3>
                <p className="text-gray-700 text-center mb-4">
                  Il vous suffit de <strong className="text-primary-600">3-4 interventions par mois</strong> via la plateforme
                  pour rentabiliser votre abonnement
                </p>
                <div className="bg-white rounded-lg p-4 text-sm">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">2 interventions × 2h × 30€/h</span>
                    <span className="font-bold text-green-600">+120€</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Abonnement mensuel</span>
                    <span className="font-bold text-gray-900">-90€</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <div className="flex justify-between">
                      <span className="font-bold text-gray-900">Bénéfice net</span>
                      <span className="font-bold text-primary-600 text-lg">+30€</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <div className="text-center">
                <Link
                  href="/auth/signup"
                  className="inline-block w-full sm:w-auto px-12 py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  Commencer gratuitement
                </Link>
                <p className="text-sm text-gray-500 mt-4">
                  Carte bancaire requise • Aucun prélèvement pendant le mois d'essai
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Tout ce dont vous avez besoin pour réussir
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Comparison Table */}
        <div className="max-w-4xl mx-auto mb-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Pourquoi choisir Autisme Connect ?
          </h2>
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-primary-600 to-primary-700 text-white">
                <tr>
                  <th className="py-4 px-6 text-left">Fonctionnalité</th>
                  <th className="py-4 px-6 text-center">Sans abonnement</th>
                  <th className="py-4 px-6 text-center bg-primary-800">Avec abonnement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {[
                  { feature: 'Profil visible', free: false, premium: true },
                  { feature: 'Réception de demandes', free: false, premium: 'Illimité' },
                  { feature: 'Messagerie', free: false, premium: true },
                  { feature: 'Gestion rendez-vous', free: false, premium: true },
                  { feature: 'Avis et notations', free: false, premium: true },
                  { feature: 'Statistiques détaillées', free: false, premium: true },
                  { feature: 'Support prioritaire', free: false, premium: true },
                  { feature: 'Commission sur réservations', free: '25%', premium: '0%' },
                ].map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="py-4 px-6 font-medium text-gray-900">{row.feature}</td>
                    <td className="py-4 px-6 text-center">
                      {typeof row.free === 'boolean' ? (
                        row.free ? (
                          <span className="text-green-600 text-2xl">✓</span>
                        ) : (
                          <span className="text-red-600 text-2xl">✗</span>
                        )
                      ) : (
                        <span className="text-gray-600">{row.free}</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-center bg-primary-50">
                      {typeof row.premium === 'boolean' ? (
                        row.premium ? (
                          <span className="text-green-600 text-2xl font-bold">✓</span>
                        ) : (
                          <span className="text-red-600 text-2xl">✗</span>
                        )
                      ) : (
                        <span className="text-primary-600 font-bold">{row.premium}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto mb-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Questions fréquentes
          </h2>
          <div className="space-y-4">
            {[
              {
                q: "Comment fonctionne le mois gratuit ?",
                a: "Vous bénéficiez d'un accès complet à toutes les fonctionnalités pendant 30 jours sans aucun frais. Vous ne serez prélevé qu'à partir du 31ème jour si vous souhaitez continuer."
              },
              {
                q: "Puis-je annuler à tout moment ?",
                a: "Oui, vous pouvez résilier votre abonnement à tout moment depuis votre tableau de bord. Aucun frais de résiliation, aucun engagement."
              },
              {
                q: "Quels moyens de paiement acceptez-vous ?",
                a: "Nous acceptons toutes les cartes bancaires (Visa, Mastercard, American Express) via notre système de paiement sécurisé Stripe."
              },
              {
                q: "Que se passe-t-il si je résilie ?",
                a: "Votre profil reste actif jusqu'à la fin de votre période payée, puis il sera désactivé. Vous pouvez le réactiver à tout moment."
              },
              {
                q: "Y a-t-il des frais cachés ?",
                a: "Absolument aucun. Le prix affiché est le prix final. Contrairement à d'autres plateformes, nous ne prenons AUCUNE commission sur vos interventions."
              },
            ].map((faq, index) => (
              <details key={index} className="bg-white rounded-lg shadow-md overflow-hidden group">
                <summary className="px-6 py-4 cursor-pointer font-semibold text-gray-900 hover:bg-gray-50 transition flex items-center justify-between">
                  {faq.q}
                  <svg className="w-5 h-5 text-primary-600 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-6 py-4 bg-gray-50 text-gray-700 leading-relaxed border-t border-gray-200">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-3xl shadow-2xl p-12 text-center text-white">
          <h2 className="text-4xl font-bold mb-4">
            Prêt à développer votre activité ?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Rejoignez les éducateurs qui font confiance à Autisme Connect
          </p>
          <Link
            href="/auth/signup"
            className="inline-block px-12 py-4 bg-white text-primary-600 rounded-xl hover:bg-gray-100 font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
          >
            Essayer gratuitement pendant 30 jours
          </Link>
          <p className="text-sm mt-4 opacity-75">
            Aucune carte bancaire requise pour l'essai
          </p>
        </div>
      </div>
    </div>
  );
}
