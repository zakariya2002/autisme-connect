'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Logo from '@/components/Logo';
import MobileMenu from '@/components/MobileMenu';
import TndToggle from '@/components/TndToggle';
import { useTnd } from '@/contexts/TndContext';
import PricingTnd from './page-tnd';

export default function PricingPage() {
  const router = useRouter();
  const { tndMode } = useTnd();
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState<'educator' | 'family' | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setIsLoggedIn(!!session);

    if (session) {
      // Vérifier si c'est un éducateur ou une famille
      const { data: educatorProfile } = await supabase
        .from('educator_profiles')
        .select('id')
        .eq('user_id', session.user.id)
        .single();

      if (educatorProfile) {
        setUserType('educator');
      } else {
        setUserType('family');
      }
    }
  };

  const handleStartTrial = async () => {
    setLoading(true);

    // Vérifier si l'utilisateur est connecté
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      // Pas connecté → rediriger vers inscription ÉDUCATEUR directement
      // Car seuls les éducateurs paient, les familles c'est gratuit
      router.push(`/auth/register-educator?plan=monthly`);
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
      router.push(`/auth/register-educator?plan=monthly`);
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
          planType: 'monthly',
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

  const plans = {
    free: {
      name: 'OFFRE DÉCOUVERTE',
      icon: '🆓',
      price: 0,
      features: [
        'Création de profil',
        '5 contacts familles/mois',
        'Messagerie de base'
      ]
    },
    pro: {
      name: 'OFFRE PRO',
      icon: '⭐',
      price: 29,
      launchPrice: 19,
      launchDuration: '3 premiers mois',
      features: [
        'Accès illimité aux demandes des familles',
        'Mise en avant de votre profil',
        'Outils de gestion et facturation automatique',
        'Badge de confiance sur votre profil',
        'Support prioritaire'
      ],
      commission: '12% sur prestations réservées via la plateforme*'
    }
  };

  if (tndMode) {
    return (
      <>
        <PricingTnd />
        <TndToggle />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-blue-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50 backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <Logo />
            <div className="md:hidden">
              <MobileMenu />
            </div>
            <div className="hidden md:flex items-center gap-2">
              <Link href="/" className="text-gray-700 hover:text-primary-600 px-3 lg:px-4 py-2 rounded-md font-medium transition-colors text-sm lg:text-base">
                Accueil
              </Link>
              <Link href="/about" className="text-gray-700 hover:text-primary-600 px-3 lg:px-4 py-2 rounded-md font-medium transition-colors text-sm lg:text-base">
                Qui sommes-nous ?
              </Link>
              <Link href="/search" className="text-gray-700 hover:text-primary-600 px-3 lg:px-4 py-2 rounded-md font-medium transition-colors text-sm lg:text-base inline-flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Trouver un éducateur
              </Link>
              <Link href="/pricing" className="text-gray-700 hover:text-primary-600 px-2 lg:px-4 py-2 rounded-md font-medium transition-colors text-sm lg:text-base inline-flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Tarifs
              </Link>
              <Link href="/contact" className="text-gray-700 hover:text-primary-600 px-2 lg:px-4 py-2 rounded-md font-medium transition-colors text-sm lg:text-base">
                Contact
              </Link>
              {isLoggedIn ? (
                <Link
                  href={userType === 'educator' ? '/dashboard/educator' : '/dashboard/family'}
                  className={`ml-4 inline-flex items-center gap-2 text-white px-6 py-2.5 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg ${
                    userType === 'educator'
                      ? 'bg-gradient-to-r from-primary-500 to-green-500 hover:from-primary-600 hover:to-green-600'
                      : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Tableau de bord
                </Link>
              ) : (
                <>
                  <Link href="/auth/login" className="ml-4 text-gray-700 hover:text-primary-600 px-2 lg:px-4 py-2 rounded-md font-medium transition-colors text-sm lg:text-base">
                    Connexion
                  </Link>
                  <Link href="/auth/signup" className="bg-primary-600 text-white px-5 py-2.5 rounded-md hover:bg-primary-700 font-medium transition-colors shadow-sm text-sm lg:text-base">
                    Inscription
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12 lg:py-20">
        <div className="text-center mb-8 sm:mb-16">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6">
            Développez votre
            <span className="bg-gradient-to-r from-violet-600 via-purple-500 to-blue-500 bg-clip-text text-transparent"> activité professionnelle</span>
          </h1>
          <p className="text-base sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Rejoignez la plateforme de référence pour les professionnels de l'accompagnement des troubles du neurodéveloppement et connectez-vous avec des familles motivées
          </p>
        </div>

        {/* Title */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">💼 OFFRES</h2>
        </div>

        {/* Pricing Cards Grid */}
        <div className="max-w-6xl mx-auto mb-12 sm:mb-20 grid md:grid-cols-2 gap-6">

          {/* FREE PLAN */}
          <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-2xl shadow-xl border-2 border-indigo-200 p-6 sm:p-8 relative">
            {/* Badge "Parfait pour débuter" */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-2 rounded-full font-bold text-sm shadow-lg">
                ✨ Parfait pour débuter
              </div>
            </div>

            <div className="text-center mb-6 mt-4">
              <div className="inline-block bg-white rounded-full p-4 shadow-md mb-4">
                <div className="text-5xl">{plans.free.icon}</div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">{plans.free.name}</h3>
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                <div className="text-5xl font-bold mb-2">GRATUIT</div>
              </div>
              <p className="text-sm text-indigo-700 font-semibold">Pour toujours • Sans engagement</p>
            </div>

            <ul className="space-y-3 mb-8">
              {plans.free.features.map((feature, index) => (
                <li key={index} className="flex items-start bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-indigo-100">
                  <svg className="w-5 h-5 text-indigo-600 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-900 font-medium">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => router.push('/auth/signup')}
              className="w-full px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 font-bold text-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
            >
              Commencer gratuitement
            </button>
            <p className="text-xs text-indigo-700 text-center mt-3 font-medium">Aucune carte bancaire requise</p>
          </div>

          {/* PRO PLAN */}
          <div className="bg-gradient-to-br from-primary-50 to-blue-50 rounded-2xl shadow-2xl border-2 border-primary-300 p-6 sm:p-8 relative">
            {/* Badge offre de lancement */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2 rounded-full font-bold text-sm shadow-lg">
                🎁 LANCEMENT : 3 premiers mois à 19€
              </div>
            </div>

            <div className="text-center mb-6 mt-4">
              <div className="text-5xl mb-3">{plans.pro.icon}</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">{plans.pro.name}</h3>
              <div className="mb-2">
                <span className="text-5xl font-bold text-primary-600">{plans.pro.price}€</span>
                <span className="text-xl text-gray-600">/mois</span>
              </div>
              <p className="text-sm text-primary-700 font-semibold">+ {plans.pro.commission}</p>
            </div>

            <ul className="space-y-3 mb-8">
              {plans.pro.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <svg className="w-5 h-5 text-primary-600 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700 font-medium">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={handleStartTrial}
              disabled={loading}
              className="w-full px-6 py-4 bg-gradient-to-r from-violet-600 to-blue-500 text-white rounded-xl hover:from-violet-700 hover:to-blue-600 font-bold text-lg shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 disabled:opacity-50"
            >
              {loading ? 'Chargement...' : 'S\'abonner maintenant'}
            </button>

            <p className="text-xs text-gray-600 text-center mt-3">Premier paiement immédiat • Résiliable à tout moment</p>
          </div>
        </div>

        {/* Comment ça marche - Commission transparente */}
        <div className="max-w-4xl mx-auto mb-12 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-primary-200 rounded-2xl p-8">
          <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 text-center">💰 Comment ça marche ?</h3>
          <p className="text-lg text-gray-700 mb-6 text-center font-semibold">
            Nous ne réussissons que si vous réussissez !
          </p>

          <div className="bg-white rounded-xl p-6 mb-6">
            <div className="space-y-4">
              <div className="flex items-start">
                <span className="text-2xl mr-4">→</span>
                <div>
                  <p className="font-semibold text-gray-900">Abonnement : 29€/mois</p>
                  <p className="text-sm text-gray-600">pour l'accès à la plateforme</p>
                </div>
              </div>
              <div className="flex items-start">
                <span className="text-2xl mr-4">→</span>
                <div>
                  <p className="font-semibold text-gray-900">Commission de succès : 12%</p>
                  <p className="text-sm text-gray-600">uniquement sur les nouvelles prestations trouvées via AutismeConnect</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200">
            <h4 className="font-bold text-gray-900 mb-3 text-lg">📊 Exemple concret :</h4>
            <p className="text-gray-700 mb-2">
              Vous trouvez une famille qui vous réserve pour <strong className="text-green-600">400€/mois</strong>
            </p>
            <div className="space-y-1 text-gray-700 ml-4 my-3">
              <p>→ Vous recevez : <strong className="text-green-600">360€</strong></p>
              <p>→ AutismeConnect : <strong>40€</strong></p>
            </div>
            <p className="text-primary-600 font-bold mt-3">
              💡 Sans notre plateforme, cette famille = 0€ pour vous !
            </p>
          </div>

          <p className="text-sm text-gray-600 mt-4 text-center">
            * Vos clients existants = <strong>0% de commission</strong>
          </p>
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
                  <th className="py-3 sm:py-4 px-2 sm:px-6 text-center text-xs sm:text-base">Offre Découverte</th>
                  <th className="py-3 sm:py-4 px-2 sm:px-6 text-center bg-primary-800 text-xs sm:text-base">Offre Pro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {[
                  { feature: 'Profil visible', free: true, premium: true },
                  { feature: 'Contacts familles', free: '5/mois', premium: 'Illimité' },
                  { feature: 'Rendez-vous', free: '3/mois', premium: 'Illimité' },
                  { feature: 'Messagerie', free: 'Basique', premium: 'Complète' },
                  { feature: 'Badge de confiance', free: false, premium: true },
                  { feature: 'Notifications instantanées', free: false, premium: true },
                  { feature: 'Outils de facturation', free: false, premium: true },
                  { feature: 'Support prioritaire', free: false, premium: true },
                  { feature: 'Abonnement mensuel', free: 'Gratuit', premium: '29€' },
                  { feature: 'Commission', free: '12%*', premium: '12%*' },
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
                        <span className="text-gray-700 font-semibold text-xs sm:text-base">{row.free}</span>
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
          <p className="text-sm text-gray-600 text-center mt-4">
            * Commission uniquement sur les prestations trouvées via la plateforme
          </p>
        </div>

        {/* Encart Agrément SAP */}
        <div className="max-w-4xl mx-auto mb-12 sm:mb-20">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6 sm:p-10 shadow-lg">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                  Obtenez l'agrément Services à la Personne (SAP)
                </h3>
                <p className="text-gray-700 text-sm sm:text-base mb-4">
                  Permettez à vos clients de bénéficier du <strong>CESU préfinancé</strong> et du <strong>crédit d'impôt de 50%</strong>.
                  L'agrément est gratuit et vous permet d'attirer plus de familles !
                </p>
                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                  <Link
                    href="/educators/sap-accreditation"
                    className="inline-flex items-center px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition shadow-md text-sm sm:text-base"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    En savoir plus
                  </Link>
                  <span className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-lg font-semibold text-xs sm:text-sm">
                    <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    100% Gratuit
                  </span>
                </div>
              </div>
            </div>
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
                q: "Comment fonctionne l'offre de lancement ?",
                a: "Les 3 premiers mois sont à 19€/mois au lieu de 29€. Vous bénéficiez d'un accès complet à toutes les fonctionnalités dès votre inscription."
              },
              {
                q: "Comment fonctionne la commission de 12% ?",
                a: "La commission de 12% (incluant les frais bancaires) s'applique uniquement sur les prestations réservées via la plateforme AutismeConnect. Vos clients existants ou trouvés en dehors de la plateforme ne sont pas concernés par cette commission."
              },
              {
                q: "Puis-je annuler à tout moment ?",
                a: "Oui, vous pouvez résilier votre abonnement à tout moment depuis votre tableau de bord. Aucun frais de résiliation, aucun engagement."
              },
              {
                q: "Quelle est la différence entre l'offre Découverte et l'offre Pro ?",
                a: "L'offre Découverte est gratuite et permet 3 contacts et 3 rendez-vous par mois avec une messagerie basique. L'offre Pro à 29€/mois offre des contacts illimités, tous les outils de gestion, le badge de confiance et le support prioritaire."
              },
              {
                q: "Quels moyens de paiement acceptez-vous ?",
                a: "Nous acceptons toutes les cartes bancaires (Visa, Mastercard, American Express) via notre système de paiement sécurisé Stripe."
              },
              {
                q: "Comment la commission est-elle prélevée ?",
                a: "Lorsqu'une famille réserve une prestation via la plateforme, 12% du montant de la prestation est automatiquement déduit (incluant les frais bancaires). Vous recevez directement 88% du montant sur votre compte."
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
            {loading ? 'Chargement...' : 'Commencer l\'offre PRO'}
          </button>
          <p className="text-xs sm:text-sm mt-3 sm:mt-4 opacity-75">
            Paiement sécurisé par carte bancaire
          </p>
        </div>
      </div>
      <TndToggle />
    </div>
  );
}
