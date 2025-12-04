'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function ProHowItWorksPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const steps = [
    {
      number: '01',
      title: 'Créez votre profil',
      description: 'Inscrivez-vous gratuitement et complétez votre profil professionnel en quelques minutes. Ajoutez vos diplômes, certifications, expériences et disponibilités.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      tips: ['Photo professionnelle', 'Biographie complète', 'Diplômes et certifications'],
    },
    {
      number: '02',
      title: 'Vérification du profil',
      description: 'Notre équipe vérifie vos informations et diplômes pour garantir la qualité de la plateforme. Une fois vérifié, vous obtenez le badge "Profil Vérifié".',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      tips: ['Vérification sous 48h', 'Badge de confiance', 'Visibilité accrue'],
    },
    {
      number: '03',
      title: 'Recevez des demandes',
      description: 'Les familles vous trouvent via notre moteur de recherche. Elles peuvent consulter votre profil, vos disponibilités et vous contacter directement.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      tips: ['Notifications instantanées', 'Messagerie sécurisée', 'Demandes de RDV'],
    },
    {
      number: '04',
      title: 'Gérez vos rendez-vous',
      description: 'Acceptez ou refusez les demandes en un clic. Gérez votre calendrier, vos disponibilités et vos interventions depuis votre tableau de bord.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      tips: ['Calendrier intégré', 'Rappels automatiques', 'Gestion simplifiée'],
    },
    {
      number: '05',
      title: 'Développez votre réputation',
      description: 'Après chaque intervention, les familles peuvent laisser un avis. Ces avis renforcent votre crédibilité et attirent de nouvelles familles.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ),
      tips: ['Avis vérifiés', 'Note moyenne visible', 'Confiance des familles'],
    },
  ];

  const benefits = [
    {
      title: 'Aucun frais d\'inscription',
      description: 'Créez votre profil et commencez à recevoir des demandes sans rien payer.',
      icon: '💰',
    },
    {
      title: 'Visibilité locale',
      description: 'Apparaissez dans les recherches des familles de votre région.',
      icon: '📍',
    },
    {
      title: 'Flexibilité totale',
      description: 'Définissez vos disponibilités et tarifs comme vous le souhaitez.',
      icon: '⏰',
    },
    {
      title: 'Support dédié',
      description: 'Notre équipe est là pour vous accompagner dans votre développement.',
      icon: '🤝',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50" role="navigation" aria-label="Navigation principale">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 lg:h-20 items-center">
            <Link href="/pro" className="flex items-center gap-2 flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 rounded-lg" aria-label="Autisme Connect Pro - Accueil">
              <span className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 bg-clip-text text-transparent whitespace-nowrap">
                Autisme Connect
              </span>
              <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white text-xs font-bold px-2 py-0.5 rounded-full" aria-hidden="true">
                PRO
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden xl:flex items-center gap-5" role="menubar">
              <Link href="/pro/pricing" className="text-gray-600 hover:text-teal-600 font-medium text-sm transition-colors whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 rounded px-2 py-1">
                Tarifs
              </Link>
              <Link href="/pro/how-it-works" className="text-teal-600 font-medium text-sm whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 rounded px-2 py-1" aria-current="page">
                Comment ça marche
              </Link>
              <Link href="/pro/sap-accreditation" className="text-gray-600 hover:text-teal-600 font-medium text-sm transition-colors whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 rounded px-2 py-1">
                Guide SAP
              </Link>
              <div className="h-5 w-px bg-gray-200" aria-hidden="true"></div>
              <Link href="/" className="text-gray-500 hover:text-gray-700 text-xs transition-colors whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 rounded px-2 py-1">
                Vous êtes un aidant ?
              </Link>
              <Link href="/auth/login" className="text-gray-600 hover:text-teal-600 font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 rounded px-2 py-1">
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
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu-how"
              aria-label={mobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div id="mobile-menu-how" className="xl:hidden py-4 border-t border-gray-100" role="menu">
              <div className="flex flex-col gap-3">
                <Link href="/pro/pricing" className="text-gray-600 font-medium py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 rounded" role="menuitem">Tarifs</Link>
                <Link href="/pro/how-it-works" className="text-teal-600 font-medium py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 rounded" role="menuitem" aria-current="page">Comment ça marche</Link>
                <Link href="/pro/sap-accreditation" className="text-gray-600 font-medium py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 rounded" role="menuitem">Guide SAP</Link>
                <Link href="/" className="text-gray-500 text-sm py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 rounded" role="menuitem">Vous êtes un aidant ?</Link>
                <div className="flex gap-3 pt-3 border-t border-gray-100">
                  <Link href="/auth/login" className="flex-1 text-center py-2.5 border border-gray-300 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-teal-500" role="menuitem">
                    Connexion
                  </Link>
                  <Link href="/auth/register-educator" className="flex-1 text-center py-2.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white rounded-xl font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500" role="menuitem">
                    S'inscrire
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-emerald-50 via-white to-cyan-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Comment ça{' '}
            <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 bg-clip-text text-transparent">
              marche ?
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Découvrez comment Autisme Connect vous aide à développer votre activité et à accompagner plus de familles.
          </p>
          <Link
            href="/auth/register-educator"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 transition-all shadow-lg hover:shadow-xl"
          >
            Créer mon profil gratuitement
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Steps */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-16">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`flex flex-col lg:flex-row gap-12 items-center ${
                  index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                }`}
              >
                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-6xl font-bold bg-gradient-to-r from-emerald-200 to-cyan-200 bg-clip-text text-transparent">
                      {step.number}
                    </span>
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-100 to-cyan-100 flex items-center justify-center text-primary-600">
                      {step.icon}
                    </div>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">{step.title}</h2>
                  <p className="text-lg text-gray-600 mb-6 leading-relaxed">{step.description}</p>
                  <div className="flex flex-wrap gap-3">
                    {step.tips.map((tip, tipIndex) => (
                      <span
                        key={tipIndex}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-700 rounded-full text-sm font-medium"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        {tip}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Illustration placeholder */}
                <div className="flex-1">
                  <div className="bg-gradient-to-br from-emerald-100 to-cyan-100 rounded-3xl p-12 aspect-square max-w-md mx-auto flex items-center justify-center">
                    <div className="text-primary-600 transform scale-150">
                      {step.icon}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Pourquoi rejoindre Autisme Connect ?
            </h2>
            <p className="text-xl text-gray-600">
              Des avantages concrets pour développer votre activité.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 text-center hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <div className="text-5xl mb-4">{benefit.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 rounded-3xl shadow-2xl p-12 text-center text-white">
            <h2 className="text-4xl font-bold mb-4">
              Prêt à vous lancer ?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Créez votre profil gratuitement et commencez à recevoir des demandes de familles.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/register-educator"
                className="px-8 py-4 bg-white text-primary-600 rounded-xl hover:bg-gray-100 font-bold text-lg shadow-xl transition-all"
              >
                Créer mon profil gratuit
              </Link>
              <Link
                href="/pro/pricing"
                className="px-8 py-4 bg-white/10 text-white border-2 border-white/30 rounded-xl hover:bg-white/20 font-bold text-lg transition-all"
              >
                Voir les tarifs
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="font-bold">Autisme Connect</span>
              <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                PRO
              </span>
            </div>
            <p className="text-gray-400 text-sm">© 2025 Autisme Connect. Tous droits réservés.</p>
            <Link href="/" className="text-gray-400 hover:text-white text-sm transition-colors">
              Accéder au site familles →
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
