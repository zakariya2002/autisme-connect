'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import MobileMenuPro from '@/components/MobileMenuPro';
import LogoPro from '@/components/LogoPro';

export default function ProPricingPage() {
  const router = useRouter();
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

    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      router.push(`/auth/register-educator?plan=monthly`);
      return;
    }

    const { data: educatorProfile } = await supabase
      .from('educator_profiles')
      .select('id')
      .eq('user_id', session.user.id)
      .single();

    if (!educatorProfile) {
      router.push(`/auth/register-educator?plan=monthly`);
      return;
    }

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

  const plans = {
    free: {
      name: 'OFFRE DÉCOUVERTE',
      icon: '🆓',
      price: 0,
      features: [
        'Création de profil vérifié',
        '3 rendez-vous acceptés/mois',
        '5 conversations actives',
        'Messagerie de base'
      ]
    },
    pro: {
      name: 'OFFRE PREMIUM',
      icon: '⭐',
      price: 29,
      launchPrice: 19,
      features: [
        'Rendez-vous illimités',
        'Conversations illimitées',
        'Mise en avant dans les recherches',
        'Badge Premium sur le profil',
        'Outils de gestion avancés',
        'Support prioritaire'
      ],
      commission: '12% sur prestations réservées via la plateforme*'
    }
  };

  const features = [
    { icon: '🎯', title: 'Visibilité Maximum', description: 'Profil visible par toutes les familles de votre région' },
    { icon: '📅', title: 'Gestion des RDV', description: 'Système automatisé de demandes et acceptation en 1 clic' },
    { icon: '💬', title: 'Messagerie Privée', description: 'Communication directe et sécurisée avec les familles' },
    { icon: '💳', title: 'Gestion Financière', description: 'Définissez votre tarif et suivez vos interventions' },
    { icon: '⭐', title: 'Avis & Réputation', description: 'Système de notation pour renforcer votre crédibilité' },
    { icon: '🔒', title: 'Sécurité & RGPD', description: 'Données cryptées et conformité RGPD' },
    { icon: '📊', title: 'Dashboard Pro', description: 'Statistiques complètes et calendrier intégré' },
    { icon: '🤝', title: 'Support Prioritaire', description: 'Assistance technique réactive' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-cyan-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50" role="navigation" aria-label="Navigation principale">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 lg:h-20 items-center">
            <LogoPro iconSize="md" />

            {/* Desktop Navigation */}
            <div className="hidden xl:flex items-center gap-5" role="menubar">
              <Link href="/pro/pricing" className="text-teal-600 font-medium text-sm whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 rounded px-2 py-1" aria-current="page">
                Tarifs
              </Link>
              <Link href="/pro/how-it-works" className="text-gray-600 hover:text-teal-600 font-medium text-sm transition-colors whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 rounded px-2 py-1">
                Comment ça marche
              </Link>
              <Link href="/pro/sap-accreditation" className="text-gray-600 hover:text-teal-600 font-medium text-sm transition-colors whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 rounded px-2 py-1">
                Guide SAP
              </Link>
              <div className="h-5 w-px bg-gray-200" aria-hidden="true"></div>
              <Link href="/" className="text-gray-500 hover:text-gray-700 text-xs transition-colors whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 rounded px-2 py-1">
                Vous êtes un aidant ?
              </Link>
              <Link href="/pro/login" className="text-gray-600 hover:text-teal-600 font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 rounded px-2 py-1">
                Connexion
              </Link>
              <Link
                href="/auth/register-educator"
                className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white px-4 py-2 rounded-xl font-semibold text-sm hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 transition-all shadow-lg hover:shadow-xl whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
              >
                Rejoindre
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="xl:hidden">
              <MobileMenuPro />
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Des tarifs{' '}
            <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 bg-clip-text text-transparent">
              transparents
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Commencez gratuitement et passez Premium quand vous êtes prêt à développer votre activité.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="max-w-5xl mx-auto mb-20 grid md:grid-cols-2 gap-8">
          {/* FREE PLAN */}
          <div className="bg-white rounded-3xl shadow-xl border-2 border-gray-200 p-8 relative hover:shadow-2xl transition-all">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <div className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-2 rounded-full font-bold text-sm shadow-lg">
                Parfait pour débuter
              </div>
            </div>

            <div className="text-center mb-8 mt-4">
              <div className="text-5xl mb-4">{plans.free.icon}</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">{plans.free.name}</h3>
              <div className="text-5xl font-bold text-gray-900 mb-2">0€</div>
              <p className="text-gray-500 font-medium">Pour toujours</p>
            </div>

            <ul className="space-y-4 mb-8">
              {plans.free.features.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/auth/register-educator"
              className="block w-full text-center px-6 py-4 bg-gray-100 text-gray-800 rounded-xl hover:bg-gray-200 font-bold text-lg transition-all"
            >
              Commencer gratuitement
            </Link>
          </div>

          {/* PRO PLAN */}
          <div className="bg-gradient-to-br from-emerald-50 to-cyan-50 rounded-3xl shadow-2xl border-2 border-teal-300 p-8 relative hover:shadow-3xl transition-all transform hover:-translate-y-1">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-2 rounded-full font-bold text-sm shadow-lg animate-pulse">
                🎁 3 premiers mois à 19€
              </div>
            </div>

            <div className="text-center mb-8 mt-4">
              <div className="text-5xl mb-4">{plans.pro.icon}</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">{plans.pro.name}</h3>
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-3xl text-gray-400 line-through">29€</span>
                <span className="text-5xl font-bold bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 bg-clip-text text-transparent">19€</span>
                <span className="text-xl text-gray-600">/mois</span>
              </div>
              <p className="text-teal-600 font-medium text-sm">+ {plans.pro.commission}</p>
            </div>

            <ul className="space-y-4 mb-8">
              {plans.pro.features.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <svg className="w-5 h-5 text-primary-600 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700 font-medium">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={handleStartTrial}
              disabled={loading}
              className="w-full px-6 py-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white rounded-xl hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 font-bold text-lg shadow-xl hover:shadow-2xl transition-all disabled:opacity-50"
            >
              {loading ? 'Chargement...' : 'Passer Premium'}
            </button>
            <p className="text-xs text-gray-500 text-center mt-3">Résiliable à tout moment</p>
          </div>
        </div>

        {/* Comment ça marche */}
        <div className="max-w-4xl mx-auto mb-20 bg-white rounded-3xl shadow-xl p-8 lg:p-12 border border-gray-100">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            💰 Comment fonctionne la commission ?
          </h2>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="bg-gray-50 rounded-2xl p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold">1</span>
                Abonnement mensuel
              </h3>
              <p className="text-gray-600">
                <span className="text-3xl font-bold text-gray-900">29€</span>/mois pour l'accès à la plateforme
                <br />
                <span className="text-sm text-green-600 font-medium">(19€ les 3 premiers mois)</span>
              </p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold">2</span>
                Commission de succès
              </h3>
              <p className="text-gray-600">
                <span className="text-3xl font-bold text-gray-900">12%</span> uniquement sur les prestations
                <br />
                <span className="text-sm">trouvées via neurocare</span>
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
            <h4 className="font-bold text-gray-900 mb-4 text-lg">📊 Exemple concret :</h4>
            <p className="text-gray-700 mb-3">
              Une famille vous réserve pour <strong className="text-green-600">400€/mois</strong> via la plateforme
            </p>
            <div className="flex flex-wrap gap-6 text-gray-700">
              <div>
                <span className="text-sm text-gray-500">Vous recevez</span>
                <p className="text-2xl font-bold text-green-600">352€</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Commission</span>
                <p className="text-2xl font-bold text-gray-600">48€</p>
              </div>
            </div>
            <p className="text-primary-600 font-semibold mt-4">
              💡 Sans notre plateforme, cette famille = 0€ pour vous !
            </p>
          </div>

          <p className="text-sm text-gray-500 text-center mt-6">
            * Vos clients existants = <strong>0% de commission</strong>
          </p>
        </div>

        {/* Features Grid */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Tout ce dont vous avez besoin
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Comparison Table */}
        <div className="max-w-4xl mx-auto mb-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Comparaison des offres
          </h2>
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white">
                <tr>
                  <th className="py-4 px-6 text-left">Fonctionnalité</th>
                  <th className="py-4 px-6 text-center">Découverte</th>
                  <th className="py-4 px-6 text-center bg-white/10">Premium</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {[
                  { feature: 'Profil vérifié', free: true, premium: true },
                  { feature: 'Rendez-vous', free: '3/mois', premium: 'Illimité' },
                  { feature: 'Conversations', free: '5 actives', premium: 'Illimité' },
                  { feature: 'Mise en avant', free: false, premium: true },
                  { feature: 'Badge Premium', free: false, premium: true },
                  { feature: 'Support prioritaire', free: false, premium: true },
                  { feature: 'Abonnement', free: 'Gratuit', premium: '29€/mois' },
                  { feature: 'Commission', free: '12%*', premium: '12%*' },
                ].map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="py-4 px-6 font-medium text-gray-900">{row.feature}</td>
                    <td className="py-4 px-6 text-center">
                      {typeof row.free === 'boolean' ? (
                        row.free ? (
                          <span className="text-green-600 text-2xl">✓</span>
                        ) : (
                          <span className="text-gray-300 text-2xl">✗</span>
                        )
                      ) : (
                        <span className="text-gray-700">{row.free}</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-center bg-primary-50">
                      {typeof row.premium === 'boolean' ? (
                        row.premium ? (
                          <span className="text-primary-600 text-2xl font-bold">✓</span>
                        ) : (
                          <span className="text-gray-300 text-2xl">✗</span>
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
          <p className="text-sm text-gray-500 text-center mt-4">
            * Commission uniquement sur les prestations trouvées via la plateforme
          </p>
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto mb-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Questions fréquentes
          </h2>
          <div className="space-y-4">
            {[
              {
                q: "Comment fonctionne l'offre de lancement ?",
                a: "Les 3 premiers mois sont à 19€/mois au lieu de 29€. Vous bénéficiez d'un accès complet à toutes les fonctionnalités Premium dès votre inscription."
              },
              {
                q: "Comment fonctionne la commission de 12% ?",
                a: "La commission s'applique uniquement sur les prestations réservées via neurocare. Vos clients existants ou trouvés en dehors de la plateforme ne sont pas concernés."
              },
              {
                q: "Puis-je annuler à tout moment ?",
                a: "Oui, vous pouvez résilier votre abonnement Premium à tout moment depuis votre tableau de bord. Aucun frais de résiliation."
              },
              {
                q: "Quels moyens de paiement acceptez-vous ?",
                a: "Nous acceptons toutes les cartes bancaires (Visa, Mastercard, American Express) via Stripe, notre partenaire de paiement sécurisé."
              },
            ].map((faq, index) => (
              <details key={index} className="bg-white rounded-xl shadow-md overflow-hidden group">
                <summary className="px-6 py-4 cursor-pointer font-semibold text-gray-900 hover:bg-gray-50 transition flex items-center justify-between">
                  {faq.q}
                  <svg className="w-5 h-5 text-primary-600 group-open:rotate-180 transition-transform flex-shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-6 py-4 bg-gray-50 text-gray-700 border-t border-gray-200">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 rounded-3xl shadow-2xl p-12 text-center text-white">
          <h2 className="text-4xl font-bold mb-4">
            Prêt à développer votre activité ?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Rejoignez les professionnels qui font confiance à neurocare
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/register-educator"
              className="px-8 py-4 bg-white text-primary-600 rounded-xl hover:bg-gray-100 font-bold text-lg shadow-xl transition-all"
            >
              Commencer gratuitement
            </Link>
            <button
              onClick={handleStartTrial}
              disabled={loading}
              className="px-8 py-4 bg-primary-800/50 text-white border-2 border-white/30 rounded-xl hover:bg-primary-800/70 font-bold text-lg transition-all disabled:opacity-50"
            >
              {loading ? 'Chargement...' : 'Passer Premium'}
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="font-bold">neurocare</span>
              <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                PRO
              </span>
            </div>
            <p className="text-gray-400 text-sm">© 2025 neurocare. Tous droits réservés.</p>
            <Link href="/" className="text-gray-400 hover:text-white text-sm transition-colors">
              Accéder au site familles →
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
