'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Logo from '@/components/Logo';
import MobileMenu from '@/components/MobileMenu';

export default function PricingPage() {
  const router = useRouter();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setIsLoggedIn(!!session);
  };

  const handleStartTrial = async () => {
    setLoading(true);

    // Vérifier si l'utilisateur est connecté
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      // Pas connecté → rediriger vers inscription ÉDUCATEUR directement
      // Car seuls les éducateurs paient, les familles c'est gratuit
      router.push(`/signup?role=educator&plan=${billingCycle}`);
      return;
    }

    // Connecté → récupérer le profil éducateur
    const { data: educatorProfile } = await supabase
      .from('educator_profiles')
      .select('id')
      .eq('user_id', session.user.id)
      .single();

    if (!educatorProfile) {
      // Pas de profil éducateur → créer d'abord le profil
      router.push(`/signup?role=educator&plan=${billingCycle}`);
      return;
    }

    // Créer la session Stripe Checkout
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          educatorId: educatorProfile.id,
          planType: billingCycle,
        }),
      });

      const data = await response.json();

      if (data.url) {
        // Rediriger vers Stripe Checkout
        window.location.href = data.url;
      } else {
        alert('Erreur lors de la création de la session de paiement');
        setLoading(false);
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Une erreur est survenue');
      setLoading(false);
    }
  };

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
            <div className="hidden md:block">
              <Logo />
            </div>
            <div className="md:hidden">
              <MobileMenu />
            </div>
            <div className="hidden md:flex gap-2">
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12 lg:py-20">
        <div className="text-center mb-8 sm:mb-16">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6">
            Développez votre activité d'
            <span className="text-primary-600">éducateur spécialisé</span>
          </h1>
          <p className="text-base sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Rejoignez la plateforme de référence pour les professionnels de l'accompagnement TSA
            et connectez-vous avec des familles motivées
          </p>
        </div>

        {/* Pricing Card */}
        <div className="max-w-4xl mx-auto mb-12 sm:mb-20">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border-2 border-primary-200">
            {/* Badge "Offre de lancement" */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white text-center py-2 sm:py-3 font-bold text-sm sm:text-base">
              🎁 OFFRE DE BIENVENUE : 1er MOIS GRATUIT
            </div>

            <div className="p-4 sm:p-8 lg:p-12">
              {/* Toggle Monthly/Annual */}
              <div className="flex justify-center mb-6 sm:mb-8">
                <div className="bg-gray-100 p-1 rounded-xl inline-flex">
                  <button
                    onClick={() => setBillingCycle('monthly')}
                    className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition text-sm sm:text-base ${
                      billingCycle === 'monthly'
                        ? 'bg-white text-primary-600 shadow-md'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Mensuel
                  </button>
                  <button
                    onClick={() => setBillingCycle('annual')}
                    className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition relative text-sm sm:text-base ${
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
              <div className="text-center mb-6 sm:mb-8">
                <div className="mb-2">
                  <span className="text-4xl sm:text-6xl font-bold text-gray-900">{currentPrice.price}€</span>
                  <span className="text-lg sm:text-2xl text-gray-600">{currentPrice.period}</span>
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
              <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 sm:mb-3 text-center">💰 Rentabilité immédiate</h3>
                <p className="text-sm sm:text-base text-gray-700 text-center mb-3 sm:mb-4">
                  Il vous suffit de <strong className="text-primary-600">3-4 interventions par mois</strong> via la plateforme
                  pour rentabiliser votre abonnement
                </p>
                <div className="bg-white rounded-lg p-3 sm:p-4 text-xs sm:text-sm">
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
                      <span className="font-bold text-primary-600 text-base sm:text-lg">+30€</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <div className="text-center">
                <button
                  onClick={handleStartTrial}
                  disabled={loading}
                  className="inline-block w-full sm:w-auto px-8 sm:px-12 py-3 sm:py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 font-bold text-base sm:text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Chargement...
                    </span>
                  ) : (
                    'Commencer gratuitement'
                  )}
                </button>
                <p className="text-xs sm:text-sm text-gray-500 mt-3 sm:mt-4">
                  Carte bancaire requise • Aucun prélèvement pendant 30 jours
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mb-12 sm:mb-20">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-8 sm:mb-12">
            Tout ce dont vous avez besoin pour réussir
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">{feature.icon}</div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Comparison Table */}
        <div className="max-w-4xl mx-auto mb-12 sm:mb-20">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-8 sm:mb-12">
            Pourquoi choisir Autisme Connect ?
          </h2>
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-primary-600 to-primary-700 text-white">
                <tr>
                  <th className="py-3 sm:py-4 px-3 sm:px-6 text-left text-xs sm:text-base">Fonctionnalité</th>
                  <th className="py-3 sm:py-4 px-2 sm:px-6 text-center text-xs sm:text-base">Sans abonnement</th>
                  <th className="py-3 sm:py-4 px-2 sm:px-6 text-center bg-primary-800 text-xs sm:text-base">Avec abonnement</th>
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
                    <td className="py-3 sm:py-4 px-3 sm:px-6 font-medium text-gray-900 text-xs sm:text-base">{row.feature}</td>
                    <td className="py-3 sm:py-4 px-2 sm:px-6 text-center">
                      {typeof row.free === 'boolean' ? (
                        row.free ? (
                          <span className="text-green-600 text-xl sm:text-2xl">✓</span>
                        ) : (
                          <span className="text-red-600 text-xl sm:text-2xl">✗</span>
                        )
                      ) : (
                        <span className="text-gray-600 text-xs sm:text-base">{row.free}</span>
                      )}
                    </td>
                    <td className="py-3 sm:py-4 px-2 sm:px-6 text-center bg-primary-50">
                      {typeof row.premium === 'boolean' ? (
                        row.premium ? (
                          <span className="text-green-600 text-xl sm:text-2xl font-bold">✓</span>
                        ) : (
                          <span className="text-red-600 text-xl sm:text-2xl">✗</span>
                        )
                      ) : (
                        <span className="text-primary-600 font-bold text-xs sm:text-base">{row.premium}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto mb-12 sm:mb-20">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-8 sm:mb-12">
            Questions fréquentes
          </h2>
          <div className="space-y-3 sm:space-y-4">
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
                <summary className="px-4 sm:px-6 py-3 sm:py-4 cursor-pointer font-semibold text-gray-900 hover:bg-gray-50 transition flex items-center justify-between text-sm sm:text-base">
                  {faq.q}
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600 group-open:rotate-180 transition-transform flex-shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 text-gray-700 leading-relaxed border-t border-gray-200 text-sm sm:text-base">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-12 text-center text-white">
          <h2 className="text-2xl sm:text-4xl font-bold mb-3 sm:mb-4">
            Prêt à développer votre activité ?
          </h2>
          <p className="text-base sm:text-xl mb-6 sm:mb-8 opacity-90">
            Rejoignez les éducateurs qui font confiance à Autisme Connect
          </p>
          <button
            onClick={handleStartTrial}
            disabled={loading}
            className="inline-block w-full sm:w-auto px-8 sm:px-12 py-3 sm:py-4 bg-white text-primary-600 rounded-xl hover:bg-gray-100 font-bold text-base sm:text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Chargement...' : 'Essayer gratuitement pendant 30 jours'}
          </button>
          <p className="text-xs sm:text-sm mt-3 sm:mt-4 opacity-75">
            Carte bancaire requise • Prélèvement après 30 jours d'essai
          </p>
        </div>
      </div>
    </div>
  );
}
