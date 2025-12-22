'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import ProNavbar from '@/components/ProNavbar';

export default function ProPricingPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setIsLoggedIn(!!session);
  };

  const features = [
    { icon: '🎯', title: 'Visibilité Maximum', description: 'Profil visible par toutes les familles de votre région' },
    { icon: '📅', title: 'Rendez-vous Illimités', description: 'Acceptez autant de rendez-vous que vous le souhaitez' },
    { icon: '💬', title: 'Messagerie Illimitée', description: 'Communication directe et sécurisée avec toutes les familles' },
    { icon: '💳', title: 'Gestion Financière', description: 'Définissez votre tarif et suivez vos interventions' },
    { icon: '⭐', title: 'Badge Vérifié', description: 'Inspirez confiance avec un profil vérifié' },
    { icon: '🔒', title: 'Sécurité & RGPD', description: 'Données cryptées et conformité RGPD' },
    { icon: '📊', title: 'Dashboard Pro', description: 'Statistiques complètes et calendrier intégré' },
    { icon: '🤝', title: 'Support Dédié', description: 'Assistance technique réactive' },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fdf9f4' }}>
      {/* Navigation */}
      <ProNavbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        {/* Hero */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-white font-bold" style={{ backgroundColor: '#f0879f' }}>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            100% Gratuit
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Un modèle{' '}
            <span style={{ color: '#41005c' }}>
              transparent
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Inscription et utilisation gratuites. Vous ne payez que lorsque vous gagnez de l'argent.
          </p>
        </div>

        {/* Main Card */}
        <div className="max-w-3xl mx-auto mb-20">
          <div className="rounded-3xl shadow-2xl border-2 overflow-hidden" style={{ borderColor: '#41005c' }}>
            {/* Header */}
            <div className="p-8 text-white text-center" style={{ background: 'linear-gradient(135deg, #41005c 0%, #5a1a75 100%)' }}>
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold mb-2">Accès Premium Gratuit</h2>
              <p className="text-white/80">Toutes les fonctionnalités, sans abonnement</p>
            </div>

            {/* Content */}
            <div className="p-8 bg-white">
              {/* Price */}
              <div className="text-center mb-8 pb-8 border-b border-gray-200">
                <div className="flex items-center justify-center gap-4">
                  <div>
                    <div className="text-6xl font-bold" style={{ color: '#41005c' }}>0€</div>
                    <p className="text-gray-500 font-medium">Inscription gratuite</p>
                  </div>
                  <div className="text-3xl text-gray-300">+</div>
                  <div>
                    <div className="text-6xl font-bold" style={{ color: '#41005c' }}>12%</div>
                    <p className="text-gray-500 font-medium">Commission sur RDV*</p>
                  </div>
                </div>
              </div>

              {/* Features list */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {[
                  'Rendez-vous illimités',
                  'Conversations illimitées',
                  'Profil mis en avant',
                  'Badge vérifié',
                  'Dashboard complet',
                  'Support dédié',
                  'Outils de gestion',
                  'Statistiques avancées',
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#f0879f' }}>
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-gray-700 font-medium">{feature}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <Link
                href={isLoggedIn ? "/dashboard/educator" : "/auth/register-educator"}
                className="block w-full text-center px-8 py-4 text-white rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all hover:opacity-90"
                style={{ backgroundColor: '#41005c' }}
              >
                {isLoggedIn ? 'Accéder à mon compte' : 'Créer mon profil gratuitement'}
              </Link>

              <p className="text-sm text-gray-500 text-center mt-4">
                * Commission uniquement sur les prestations réservées via NeuroCare
              </p>
            </div>
          </div>
        </div>

        {/* Comment ça marche */}
        <div className="max-w-4xl mx-auto mb-20 bg-white rounded-3xl shadow-xl p-8 lg:p-12 border border-gray-100">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Comment fonctionne la commission ?
          </h2>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'rgba(65, 0, 92, 0.1)' }}>
                <span className="text-2xl font-bold" style={{ color: '#41005c' }}>1</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Créez votre profil</h3>
              <p className="text-gray-600 text-sm">Inscription 100% gratuite, aucun frais caché</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'rgba(65, 0, 92, 0.1)' }}>
                <span className="text-2xl font-bold" style={{ color: '#41005c' }}>2</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Recevez des demandes</h3>
              <p className="text-gray-600 text-sm">Les familles vous contactent via la plateforme</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'rgba(65, 0, 92, 0.1)' }}>
                <span className="text-2xl font-bold" style={{ color: '#41005c' }}>3</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Soyez rémunéré</h3>
              <p className="text-gray-600 text-sm">12% de commission sur les RDV conclus</p>
            </div>
          </div>

          <div className="rounded-2xl p-6 border" style={{ backgroundColor: 'rgba(65, 0, 92, 0.05)', borderColor: 'rgba(65, 0, 92, 0.2)' }}>
            <h4 className="font-bold text-gray-900 mb-4 text-lg">Exemple concret :</h4>
            <p className="text-gray-700 mb-3">
              Une famille vous réserve pour <strong style={{ color: '#41005c' }}>400€/mois</strong> via la plateforme
            </p>
            <div className="flex flex-wrap gap-6 text-gray-700">
              <div>
                <span className="text-sm text-gray-500">Vous recevez</span>
                <p className="text-2xl font-bold" style={{ color: '#41005c' }}>352€</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Commission NeuroCare</span>
                <p className="text-2xl font-bold text-gray-600">48€</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t" style={{ borderColor: 'rgba(65, 0, 92, 0.2)' }}>
              <p className="font-semibold" style={{ color: '#f0879f' }}>
                Vos clients existants ou trouvés en dehors de la plateforme = 0% de commission !
              </p>
            </div>
          </div>
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

        {/* Pourquoi ce modèle */}
        <div className="max-w-4xl mx-auto mb-20 bg-gradient-to-br from-white to-purple-50 rounded-3xl shadow-xl p-8 lg:p-12 border border-purple-100">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Pourquoi ce modèle ?
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#f0879f' }}>
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Pas de frais fixes</h3>
                <p className="text-gray-600 text-sm">Vous ne payez rien pour vous inscrire et utiliser la plateforme. Zéro risque financier.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#f0879f' }}>
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Alignement des intérêts</h3>
                <p className="text-gray-600 text-sm">Nous gagnons uniquement quand vous gagnez. Notre succès dépend du vôtre.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#f0879f' }}>
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Transparence totale</h3>
                <p className="text-gray-600 text-sm">Un seul tarif simple : 12%. Pas de frais cachés, pas de surprises.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#f0879f' }}>
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Focus sur la qualité</h3>
                <p className="text-gray-600 text-sm">Nous investissons dans la plateforme pour vous apporter toujours plus de familles.</p>
              </div>
            </div>
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
                q: "L'inscription est-elle vraiment gratuite ?",
                a: "Oui, 100% gratuite. Vous créez votre profil, accédez à toutes les fonctionnalités et commencez à recevoir des demandes sans rien payer."
              },
              {
                q: "Comment fonctionne la commission de 12% ?",
                a: "La commission s'applique uniquement sur les prestations réservées et payées via NeuroCare. Vos clients existants ou trouvés en dehors de la plateforme ne sont pas concernés : 0% de commission."
              },
              {
                q: "Y a-t-il des limites sur le nombre de rendez-vous ?",
                a: "Non, aucune limite ! Vous pouvez accepter autant de rendez-vous et de conversations que vous le souhaitez."
              },
              {
                q: "Quand suis-je payé ?",
                a: "Après chaque prestation réalisée, le paiement vous est transféré directement sur votre compte bancaire, moins la commission de 12%."
              },
              {
                q: "Puis-je quitter la plateforme à tout moment ?",
                a: "Absolument. Pas d'engagement, pas de frais de résiliation. Vous êtes libre de partir quand vous le souhaitez."
              },
            ].map((faq, index) => (
              <details key={index} className="bg-white rounded-xl shadow-md overflow-hidden group">
                <summary className="px-6 py-4 cursor-pointer font-semibold text-gray-900 hover:bg-gray-50 transition flex items-center justify-between">
                  {faq.q}
                  <svg className="w-5 h-5 group-open:rotate-180 transition-transform flex-shrink-0 ml-2" style={{ color: '#41005c' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
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
        <div className="rounded-3xl shadow-2xl p-12 text-center text-white" style={{ backgroundColor: '#41005c' }}>
          <h2 className="text-4xl font-bold mb-4">
            Prêt à développer votre activité ?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Rejoignez les professionnels qui font confiance à NeuroCare
          </p>
          <Link
            href={isLoggedIn ? "/dashboard/educator" : "/auth/register-educator"}
            className="inline-block px-8 py-4 bg-white rounded-xl hover:bg-gray-100 font-bold text-lg shadow-xl transition-all"
            style={{ color: '#41005c' }}
          >
            {isLoggedIn ? 'Accéder à mon compte' : 'Créer mon profil gratuitement'}
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-white py-12 px-6 mt-20" style={{ backgroundColor: '#41005c' }} role="contentinfo">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
            {/* Logo et description */}
            <div>
              <Link href="/pro" className="inline-block mb-4">
                <div className="flex items-center gap-2">
                  <img
                    src="/images/logo-neurocare.svg"
                    alt="Logo NeuroCare Pro"
                    className="h-16 brightness-0 invert"
                  />
                  <span className="px-2 py-0.5 text-xs font-bold rounded-full" style={{ backgroundColor: '#f0879f' }}>
                    PRO
                  </span>
                </div>
              </Link>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                La plateforme de référence pour les professionnels de l'accompagnement des troubles neurodéveloppementaux.
              </p>
            </div>

            {/* Pour les pros */}
            <nav aria-labelledby="footer-nav-pros">
              <h3 id="footer-nav-pros" className="font-bold text-white mb-4">Pour les pros</h3>
              <ul className="space-y-2 text-sm" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                <li><Link href="/pro/pricing" className="hover:text-white transition-colors">Notre modèle</Link></li>
                <li><Link href="/pro/how-it-works" className="hover:text-white transition-colors">Comment ça marche</Link></li>
                <li><Link href="/pro/sap-accreditation" className="hover:text-white transition-colors">Guide SAP</Link></li>
                <li><Link href="/auth/register-educator" className="hover:text-white transition-colors">S'inscrire</Link></li>
              </ul>
            </nav>

            {/* Ressources */}
            <nav aria-labelledby="footer-nav-ressources">
              <h3 id="footer-nav-ressources" className="font-bold text-white mb-4">Ressources</h3>
              <ul className="space-y-2 text-sm" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                <li><Link href="/about" className="hover:text-white transition-colors">À propos</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
              </ul>
            </nav>

            {/* Familles */}
            <nav aria-labelledby="footer-nav-familles">
              <h3 id="footer-nav-familles" className="font-bold text-white mb-4">Familles</h3>
              <ul className="space-y-2 text-sm" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                <li><Link href="/" className="hover:text-white transition-colors">Accueil familles</Link></li>
                <li><Link href="/search" className="hover:text-white transition-colors">Trouver un professionnel</Link></li>
                <li><Link href="/familles/aides-financieres" className="hover:text-white transition-colors">Aides financières</Link></li>
              </ul>
            </nav>
          </div>

          {/* Séparateur */}
          <div className="border-t pt-8" style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}>
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              {/* Liens légaux */}
              <nav aria-label="Informations légales">
                <div className="flex flex-wrap justify-center gap-4 text-sm" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  <Link href="/mentions-legales" className="hover:text-white transition-colors">Mentions légales</Link>
                  <Link href="/politique-confidentialite" className="hover:text-white transition-colors">Confidentialité</Link>
                  <Link href="/cgu" className="hover:text-white transition-colors">CGU</Link>
                </div>
              </nav>

              {/* Copyright */}
              <p className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                © 2025 NeuroCare. Tous droits réservés.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
