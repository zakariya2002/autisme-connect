'use client';

import { useState } from 'react';
import Link from 'next/link';
import PublicNavbar from '@/components/PublicNavbar';
import TndToggle from '@/components/TndToggle';

export default function AidesFinancieresPage() {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fdf9f4' }}>
      {/* Navigation */}
      <PublicNavbar />

      {/* Section Titre */}
      <section className="pt-20 xl:pt-24 pb-12 sm:pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Pictogramme */}
          <div className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ backgroundColor: '#027e7e' }}>
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Verdana, sans-serif' }}>
            Aides Financières TND
          </h1>
          {/* Ligne décorative */}
          <div className="w-32 h-[2px] bg-gray-300 mx-auto mb-6"></div>
          <p className="text-lg text-gray-600" style={{ fontFamily: 'Open Sans, sans-serif' }}>
            Toutes les aides pour financer l'accompagnement des enfants et adultes avec troubles du neuro-développement
          </p>
          <p className="mt-3 text-sm font-semibold" style={{ color: '#027e7e' }}>
            Autisme, TDAH, troubles DYS : jusqu'à 100% de vos dépenses remboursées !
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 pb-16">
        {/* Simulateur CTA */}
        <Link
          href="/familles/simulateur-aides"
          className="block mb-8 bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#f0879f' }}>
                <span className="text-2xl">🧮</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Verdana, sans-serif' }}>
                  Simulateur d'aides personnalisé
                </h3>
                <p className="text-gray-600 text-sm mt-1" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                  Découvrez en 2 minutes les aides auxquelles vous avez droit
                </p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg text-white font-semibold" style={{ backgroundColor: '#f0879f' }}>
              <span>Lancer le simulateur</span>
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </Link>

        {/* Introduction */}
        <div className="bg-white rounded-2xl shadow-md p-6 sm:p-8 mb-8 border border-gray-100">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#027e7e' }}>
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Verdana, sans-serif' }}>
                Vos reçus neurocare sont compatibles avec toutes ces aides
              </h3>
              <p className="text-gray-600" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                Nos attestations de paiement incluent toutes les mentions légales requises pour vos démarches de remboursement.
              </p>
            </div>
          </div>
        </div>

        {/* Tableau récapitulatif par âge */}
        <div className="bg-white rounded-2xl shadow-md p-6 sm:p-8 mb-10 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center" style={{ fontFamily: 'Verdana, sans-serif' }}>
            Quelles aides selon votre situation ?
          </h2>
          <div className="w-24 h-[2px] bg-gray-300 mx-auto mb-6"></div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Enfants */}
            <div className="rounded-xl p-6 border-2" style={{ borderColor: '#027e7e', backgroundColor: 'rgba(2, 126, 126, 0.05)' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#027e7e' }}>
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold" style={{ color: '#027e7e', fontFamily: 'Verdana, sans-serif' }}>Enfants (0-20 ans)</h3>
              </div>
              <ul className="space-y-2" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                <li className="flex items-center gap-2 text-gray-700">
                  <span className="font-bold" style={{ color: '#027e7e' }}>✓</span>
                  <span><strong>Forfait Précoce</strong> (0-12 ans) - Psychologue, Ergo, Psychomot</span>
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <span className="font-bold" style={{ color: '#027e7e' }}>✓</span>
                  <span><strong>AEEH</strong> - Tous les professionnels</span>
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <span className="font-bold" style={{ color: '#027e7e' }}>✓</span>
                  <span><strong>PCH</strong> - Aides humaines et techniques</span>
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <span className="font-bold" style={{ color: '#027e7e' }}>✓</span>
                  <span><strong>CESU</strong> - Éducateurs à domicile (50% crédit impôt)</span>
                </li>
              </ul>
            </div>

            {/* Adultes */}
            <div className="rounded-xl p-6 border-2" style={{ borderColor: '#f0879f', backgroundColor: 'rgba(240, 135, 159, 0.05)' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#f0879f' }}>
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold" style={{ color: '#f0879f', fontFamily: 'Verdana, sans-serif' }}>Adultes (18+ ans)</h3>
              </div>
              <ul className="space-y-2" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                <li className="flex items-center gap-2 text-gray-700">
                  <span className="font-bold" style={{ color: '#f0879f' }}>✓</span>
                  <span><strong>AAH</strong> - Allocation jusqu'à 1016€/mois</span>
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <span className="font-bold" style={{ color: '#f0879f' }}>✓</span>
                  <span><strong>PCH</strong> - Aides humaines et techniques</span>
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <span className="font-bold" style={{ color: '#f0879f' }}>✓</span>
                  <span><strong>CESU</strong> - Éducateurs à domicile (50% crédit impôt)</span>
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <span className="text-amber-500 font-bold">⚠</span>
                  <span className="text-gray-600">PCH ne finance pas les libéraux (psy, ergo...)</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Forfait Intervention Précoce */}
        <div className="bg-white rounded-2xl shadow-md mb-6 overflow-hidden border border-gray-100">
          <button
            onClick={() => toggleSection('forfait')}
            className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-all duration-300"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#027e7e' }}>
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900" style={{ fontFamily: 'Verdana, sans-serif' }}>Forfait Intervention Précoce</h2>
                  <span className="text-xs font-bold px-2 py-1 rounded-full text-white" style={{ backgroundColor: '#027e7e' }}>0-12 ANS</span>
                </div>
                <p className="text-sm text-gray-600" style={{ fontFamily: 'Open Sans, sans-serif' }}>Prise en charge Assurance Maladie depuis 2024</p>
              </div>
            </div>
            <svg
              className={`w-6 h-6 text-gray-500 transition-transform duration-300 flex-shrink-0 ${expandedSection === 'forfait' ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {expandedSection === 'forfait' && (
            <div className="px-6 pb-6 border-t border-gray-100">
              <div className="mt-4 space-y-4" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Qu'est-ce que le Forfait d'Intervention Précoce ?</h3>
                  <p className="text-gray-700">
                    Depuis 2024, l'Assurance Maladie prend en charge directement les bilans et séances de
                    <strong> psychologues, ergothérapeutes et psychomotriciens</strong> pour les enfants de moins de 12 ans
                    présentant des signes de TND (autisme, TDAH, troubles DYS...).
                  </p>
                </div>

                <div className="border-l-4 p-4 rounded-r-lg" style={{ borderColor: '#027e7e', backgroundColor: 'rgba(2, 126, 126, 0.05)' }}>
                  <p style={{ color: '#027e7e' }} className="font-medium">
                    <strong>Important :</strong> Ce forfait concerne les professionnels habituellement NON remboursés par la Sécu.
                    Les orthophonistes et kinés sont déjà remboursés normalement.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Professionnels éligibles</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white border-2 rounded-xl p-5 text-center shadow-sm" style={{ borderColor: '#027e7e' }}>
                      <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: '#027e7e' }}>
                        <span className="text-2xl">🧠</span>
                      </div>
                      <p className="font-bold text-lg" style={{ color: '#027e7e' }}>Psychologue</p>
                      <p className="text-sm text-gray-600 mt-1">Évaluation : 120-300€</p>
                    </div>
                    <div className="bg-white border-2 rounded-xl p-5 text-center shadow-sm" style={{ borderColor: '#3a9e9e' }}>
                      <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: '#3a9e9e' }}>
                        <span className="text-2xl">🤸</span>
                      </div>
                      <p className="font-bold text-lg" style={{ color: '#3a9e9e' }}>Psychomotricien</p>
                      <p className="text-sm text-gray-600 mt-1">Forfait : 1 500€/an</p>
                    </div>
                    <div className="bg-white border-2 rounded-xl p-5 text-center shadow-sm" style={{ borderColor: '#6bbebe' }}>
                      <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: '#6bbebe' }}>
                        <span className="text-2xl">🎯</span>
                      </div>
                      <p className="font-bold text-lg" style={{ color: '#6bbebe' }}>Ergothérapeute</p>
                      <p className="text-sm text-gray-600 mt-1">Forfait : 1 500€/an</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl p-6 text-white" style={{ backgroundColor: '#027e7e' }}>
                  <div className="flex items-center gap-3 mb-4">
                    <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h4 className="text-lg font-bold">Montants pris en charge</h4>
                  </div>
                  <ul className="space-y-2 font-medium">
                    <li><strong className="text-teal-200">Psychologue :</strong> 120€ (éval. simple) ou 300€ (avec tests neuropsy)</li>
                    <li><strong className="text-teal-200">Ergo/Psychomot :</strong> 1 500€ pour évaluation + 35 séances minimum</li>
                    <li><strong className="text-teal-200">Durée :</strong> 12 mois (renouvelable 6 mois)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Comment en bénéficier ?</h3>
                  <ol className="list-decimal list-inside space-y-2 text-gray-700">
                    <li>Consultez votre médecin traitant ou pédiatre qui repère les signes de TND</li>
                    <li>Il vous oriente vers une Plateforme de Coordination et d'Orientation (PCO-TND)</li>
                    <li>La PCO prescrit les bilans et séances nécessaires</li>
                    <li>Le professionnel doit être conventionné avec la PCO</li>
                  </ol>
                </div>

                <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg">
                  <p className="text-amber-800">
                    <strong>⚠️ Non cumulable avec l'AEEH :</strong> Dès que vous percevez l'AEEH, le forfait s'arrête.
                    C'est souvent plus avantageux de passer à l'AEEH pour les accompagnements long terme.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Trouver une PCO près de chez vous</h3>
                  <a
                    href="https://handicap.gouv.fr/les-plateformes-de-coordination-et-dorientation"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 text-white font-semibold rounded-lg shadow-md hover:opacity-90 transition-all"
                    style={{ backgroundColor: '#027e7e' }}
                    aria-label="Annuaire des PCO-TND (s'ouvre dans un nouvel onglet)"
                  >
                    <span>Annuaire des PCO-TND</span>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* CESU */}
        <div className="bg-white rounded-2xl shadow-md mb-6 overflow-hidden border border-gray-100">
          <button
            onClick={() => toggleSection('cesu')}
            className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-all duration-300"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#3a9e9e' }}>
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="text-left">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900" style={{ fontFamily: 'Verdana, sans-serif' }}>CESU Préfinancé</h2>
                <p className="text-sm text-gray-600" style={{ fontFamily: 'Open Sans, sans-serif' }}>Chèque Emploi Service Universel</p>
              </div>
            </div>
            <svg
              className={`w-6 h-6 text-gray-500 transition-transform duration-300 flex-shrink-0 ${expandedSection === 'cesu' ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {expandedSection === 'cesu' && (
            <div className="px-6 pb-6 border-t border-gray-100">
              <div className="mt-4 space-y-4" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Qu'est-ce que le CESU ?</h3>
                  <p className="text-gray-700">
                    Le CESU préfinancé est un titre de paiement fourni par votre employeur, votre comité d'entreprise,
                    ou certains organismes publics pour financer des services à la personne, dont l'accompagnement éducatif.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Qui peut en bénéficier ?</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    <li>Salariés dont l'employeur propose le CESU</li>
                    <li>Agents de la fonction publique</li>
                    <li>Bénéficiaires de l'aide sociale (selon départements)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Comment l'utiliser avec neurocare ?</h3>
                  <ol className="list-decimal list-inside space-y-2 text-gray-700">
                    <li>Payez votre séance par carte bancaire sur la plateforme</li>
                    <li>Téléchargez votre reçu depuis votre dashboard</li>
                    <li>Envoyez le reçu + vos CESU à l'organisme émetteur pour remboursement</li>
                  </ol>
                </div>

                <div className="rounded-2xl p-6 text-white" style={{ backgroundColor: '#3a9e9e' }}>
                  <div className="flex items-center gap-3 mb-3">
                    <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h4 className="text-lg font-bold">Montant de l'aide</h4>
                  </div>
                  <p className="text-lg font-semibold leading-relaxed">
                    Variable selon votre employeur ou organisme. Peut couvrir jusqu'à <span className="text-2xl font-extrabold text-teal-100">100%</span> du coût des prestations.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Liens utiles</h3>
                  <a
                    href="https://www.cesu.urssaf.fr/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 text-white font-semibold rounded-lg shadow-md hover:opacity-90 transition-all"
                    style={{ backgroundColor: '#3a9e9e' }}
                    aria-label="Site officiel CESU URSSAF (s'ouvre dans un nouvel onglet)"
                  >
                    <span>Site officiel CESU (URSSAF)</span>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* PCH (MDPH) */}
        <div className="bg-white rounded-2xl shadow-md mb-6 overflow-hidden border border-gray-100">
          <button
            onClick={() => toggleSection('pch')}
            className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-all duration-300"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#6bbebe' }}>
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div className="text-left">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900" style={{ fontFamily: 'Verdana, sans-serif' }}>PCH - MDPH</h2>
                <p className="text-sm text-gray-600" style={{ fontFamily: 'Open Sans, sans-serif' }}>Prestation de Compensation du Handicap</p>
              </div>
            </div>
            <svg
              className={`w-6 h-6 text-gray-500 transition-transform duration-300 flex-shrink-0 ${expandedSection === 'pch' ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {expandedSection === 'pch' && (
            <div className="px-6 pb-6 border-t border-gray-100">
              <div className="mt-4 space-y-4" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="text-xs font-bold px-2 py-1 rounded-full text-white" style={{ backgroundColor: '#6bbebe' }}>ENFANTS + ADULTES</span>
                  <span className="text-xs font-bold px-2 py-1 rounded-full text-white" style={{ backgroundColor: '#027e7e' }}>TOUS TND</span>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Qu'est-ce que la PCH ?</h3>
                  <p className="text-gray-700">
                    La PCH est une aide financière versée par le département pour compenser les besoins liés au handicap.
                    <strong> Depuis janvier 2023</strong>, les personnes avec TND (autisme, TDAH, troubles DYS...) peuvent plus facilement y accéder.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Conditions d'éligibilité</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    <li>Reconnaissance du handicap par la MDPH (enfant ou adulte)</li>
                    <li>Difficultés dans au moins 1 activité essentielle ou 2 activités instrumentales</li>
                    <li>Résidence en France</li>
                    <li>Âge : pas de limite (enfants et adultes)</li>
                  </ul>
                </div>

                <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
                  <h4 className="font-bold text-red-900 mb-2">⚠️ Limitation importante pour les ADULTES</h4>
                  <p className="text-red-800">
                    Contrairement au complément AEEH pour les enfants, <strong>la PCH ne permet PAS de rémunérer les professionnels libéraux</strong>
                    (psychologue, ergothérapeute, psychomotricien...). Elle finance principalement les aides humaines pour la vie quotidienne
                    et les aides techniques.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Ce que finance la PCH</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg border-2" style={{ borderColor: '#027e7e', backgroundColor: 'rgba(2, 126, 126, 0.05)' }}>
                      <h4 className="font-semibold mb-2" style={{ color: '#027e7e' }}>✅ Pris en charge</h4>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• Aide humaine (aidant familial ou professionnel)</li>
                        <li>• Aides techniques (logiciels, équipements...)</li>
                        <li>• Aménagement du logement</li>
                        <li>• Aménagement du véhicule</li>
                        <li>• Surcoûts de transport</li>
                      </ul>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                      <h4 className="font-semibold text-red-800 mb-2">❌ Non pris en charge (adultes)</h4>
                      <ul className="text-sm text-red-700 space-y-1">
                        <li>• Séances de psychologue</li>
                        <li>• Séances d'ergothérapeute</li>
                        <li>• Séances de psychomotricien</li>
                        <li>• Coaching TND</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Démarches</h3>
                  <ol className="list-decimal list-inside space-y-2 text-gray-700">
                    <li>Constituez un dossier MDPH avec certificat médical</li>
                    <li>Demandez la PCH volet "aide humaine"</li>
                    <li>Après accord, utilisez neurocare pour vos séances</li>
                    <li>Envoyez mensuellement vos reçus à la MDPH pour remboursement</li>
                  </ol>
                </div>

                <div className="rounded-2xl p-6 text-white" style={{ backgroundColor: '#6bbebe' }}>
                  <div className="flex items-center gap-3 mb-3">
                    <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h4 className="text-lg font-bold">Montant de l'aide</h4>
                  </div>
                  <p className="text-lg font-semibold leading-relaxed mb-3">
                    Jusqu'à <span className="text-2xl font-extrabold text-teal-100">100%</span> du coût dans la limite des heures accordées. Le montant varie selon le niveau d'autonomie.
                  </p>
                  <p className="text-base font-medium opacity-90">
                    Exemples : 50h/mois pour niveau modéré, 100h+/mois pour niveau sévère
                  </p>
                </div>

                <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg">
                  <h4 className="font-bold text-amber-900 mb-3">Documents requis sur vos reçus</h4>
                  <ul className="list-disc list-inside space-y-2 text-amber-800">
                    <li>Nom et SIRET du prestataire (éducateur)</li>
                    <li>Heures précises de début et fin de la prestation</li>
                    <li>Nature du service (accompagnement éducatif)</li>
                    <li>Montant payé</li>
                  </ul>
                  <div className="mt-4 pt-4 border-t border-amber-200">
                    <p className="text-amber-900 font-bold flex items-center gap-2">
                      <svg className="w-6 h-6" style={{ color: '#027e7e' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Tous ces éléments sont inclus dans vos reçus neurocare
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Contact</h3>
                  <p className="text-gray-700 mb-3">
                    Contactez la MDPH de votre département :
                  </p>
                  <a
                    href="https://www.mdphenligne.cnsa.fr/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 text-white font-semibold rounded-lg shadow-md hover:opacity-90 transition-all"
                    style={{ backgroundColor: '#6bbebe' }}
                    aria-label="Trouver votre MDPH (s'ouvre dans un nouvel onglet)"
                  >
                    <span>Trouver votre MDPH</span>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* AEEH (CAF) */}
        <div className="bg-white rounded-2xl shadow-md mb-6 overflow-hidden border border-gray-100">
          <button
            onClick={() => toggleSection('aeeh')}
            className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-all duration-300"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#f0879f' }}>
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900" style={{ fontFamily: 'Verdana, sans-serif' }}>AEEH - CAF</h2>
                  <span className="text-xs font-bold px-2 py-1 rounded-full text-white" style={{ backgroundColor: '#f0879f' }}>0-20 ANS</span>
                </div>
                <p className="text-sm text-gray-600" style={{ fontFamily: 'Open Sans, sans-serif' }}>Allocation d'Éducation de l'Enfant Handicapé</p>
              </div>
            </div>
            <svg
              className={`w-6 h-6 text-gray-500 transition-transform duration-300 flex-shrink-0 ${expandedSection === 'aeeh' ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {expandedSection === 'aeeh' && (
            <div className="px-6 pb-6 border-t border-gray-100">
              <div className="mt-4 space-y-4" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="text-xs font-bold px-2 py-1 rounded-full text-white" style={{ backgroundColor: '#f0879f' }}>ENFANTS UNIQUEMENT</span>
                  <span className="text-xs font-bold px-2 py-1 rounded-full text-white" style={{ backgroundColor: '#027e7e' }}>TOUS TND</span>
                </div>

                <div className="border-l-4 p-4 rounded-r-lg" style={{ borderColor: '#027e7e', backgroundColor: 'rgba(2, 126, 126, 0.05)' }}>
                  <p style={{ color: '#027e7e' }} className="font-medium">
                    <strong>L'AEEH est l'aide la plus complète pour les enfants TND !</strong> Elle permet de financer TOUS les professionnels
                    (psychologue, ergothérapeute, psychomotricien, éducateur...) contrairement à la PCH adulte.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Qu'est-ce que l'AEEH ?</h3>
                  <p className="text-gray-700">
                    L'AEEH est une allocation mensuelle versée par la CAF pour compenser les frais d'éducation et de soins
                    d'un enfant en situation de handicap (autisme, TDAH, troubles DYS...). Elle peut être complétée par un complément selon le niveau de handicap.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Conditions d'éligibilité</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    <li>Enfant de moins de 20 ans</li>
                    <li>Taux d'incapacité d'au moins 80% (ou 50-79% si fréquente un établissement spécialisé)</li>
                    <li>Résidence en France</li>
                    <li>Pas de condition de ressources pour l'AEEH de base</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Démarches</h3>
                  <ol className="list-decimal list-inside space-y-2 text-gray-700">
                    <li>Demandez l'AEEH via le dossier MDPH</li>
                    <li>La CDAPH (Commission des Droits et de l'Autonomie) évalue le dossier</li>
                    <li>En cas d'accord, la CAF verse l'allocation mensuellement</li>
                    <li>Utilisez cette aide pour financer les séances sur neurocare</li>
                  </ol>
                </div>

                <div className="rounded-2xl p-6 text-white" style={{ backgroundColor: '#f0879f' }}>
                  <div className="flex items-center gap-3 mb-4">
                    <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h4 className="text-lg font-bold">Montant de l'aide (2025)</h4>
                  </div>
                  <ul className="space-y-2 font-medium">
                    <li className="flex items-center gap-2">
                      <span className="text-pink-200 font-bold">•</span>
                      <span><strong className="text-pink-100">AEEH de base :</strong> 142,70€/mois</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-pink-200 font-bold">•</span>
                      <span><strong className="text-pink-100">Complément 1ère catégorie :</strong> +105,79€/mois</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-pink-200 font-bold">•</span>
                      <span><strong className="text-pink-100">Complément 2ème catégorie :</strong> +286,94€/mois</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-pink-200 font-bold">•</span>
                      <span><strong className="text-pink-100">Complément 3ème catégorie :</strong> +405,16€/mois</span>
                    </li>
                    <li className="text-base opacity-80">... jusqu'à la 6ème catégorie</li>
                  </ul>
                </div>

                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-3">AEEH vs PCH : Quelle différence ?</h3>
                  <p className="text-gray-700 mb-3 flex items-start gap-2">
                    <span style={{ color: '#f0879f' }} className="font-bold text-xl">→</span>
                    <span><strong style={{ color: '#f0879f' }}>AEEH :</strong> Allocation forfaitaire mensuelle pour compenser les frais liés au handicap</span>
                  </p>
                  <p className="text-gray-700 flex items-start gap-2">
                    <span style={{ color: '#027e7e' }} className="font-bold text-xl">→</span>
                    <span><strong style={{ color: '#027e7e' }}>PCH :</strong> Remboursement sur justificatifs des dépenses réelles (dont aide humaine)</span>
                  </p>
                  <div className="mt-4 pt-4 border-t border-gray-300">
                    <p className="text-sm text-gray-700 font-semibold flex items-center gap-2">
                      <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Note : Vous pouvez choisir entre AEEH + complément OU PCH, mais pas les deux simultanément
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Contact</h3>
                  <p className="text-gray-700 mb-3">
                    Votre CAF :
                  </p>
                  <a
                    href="https://www.caf.fr/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 text-white font-semibold rounded-lg shadow-md hover:opacity-90 transition-all"
                    style={{ backgroundColor: '#f0879f' }}
                    aria-label="Site CAF (s'ouvre dans un nouvel onglet)"
                  >
                    <span>www.caf.fr</span>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* AAH */}
        <div className="bg-white rounded-2xl shadow-md mb-6 overflow-hidden border border-gray-100">
          <button
            onClick={() => toggleSection('aah')}
            className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-all duration-300"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#f4a3b3' }}>
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900" style={{ fontFamily: 'Verdana, sans-serif' }}>AAH - MDPH</h2>
                  <span className="text-xs font-bold px-2 py-1 rounded-full text-white" style={{ backgroundColor: '#f4a3b3' }}>ADULTES 20+</span>
                </div>
                <p className="text-sm text-gray-600" style={{ fontFamily: 'Open Sans, sans-serif' }}>Allocation aux Adultes Handicapés</p>
              </div>
            </div>
            <svg
              className={`w-6 h-6 text-gray-500 transition-transform duration-300 flex-shrink-0 ${expandedSection === 'aah' ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {expandedSection === 'aah' && (
            <div className="px-6 pb-6 border-t border-gray-100">
              <div className="mt-4 space-y-4" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="text-xs font-bold px-2 py-1 rounded-full text-white" style={{ backgroundColor: '#f4a3b3' }}>ADULTES UNIQUEMENT</span>
                  <span className="text-xs font-bold px-2 py-1 rounded-full text-white" style={{ backgroundColor: '#027e7e' }}>TOUS TND</span>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Qu'est-ce que l'AAH ?</h3>
                  <p className="text-gray-700">
                    L'AAH est un revenu minimum garanti pour les adultes en situation de handicap (autisme, TDAH, troubles DYS sévères...).
                    Elle assure un minimum de ressources aux personnes qui ne peuvent pas travailler ou dont les revenus sont limités.
                  </p>
                </div>

                <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg">
                  <p className="text-amber-800">
                    <strong>⚠️ Important :</strong> L'AAH est un <strong>revenu de remplacement</strong>, pas une aide pour financer des séances.
                    Elle vous permet de vivre dignement et d'utiliser ce revenu comme vous le souhaitez, y compris pour des accompagnements TND.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Conditions d'éligibilité</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    <li>Avoir 20 ans ou plus (ou 16 ans si vous n'êtes plus à charge)</li>
                    <li>Taux d'incapacité d'au moins 80% <strong>OU</strong></li>
                    <li>Taux entre 50% et 79% avec restriction substantielle d'accès à l'emploi</li>
                    <li>Résider en France de façon permanente</li>
                    <li>Ne pas dépasser un plafond de ressources</li>
                  </ul>
                </div>

                <div className="rounded-2xl p-6 text-white" style={{ backgroundColor: '#f4a3b3' }}>
                  <div className="flex items-center gap-3 mb-4">
                    <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h4 className="text-lg font-bold">Montant de l'AAH (2025)</h4>
                  </div>
                  <ul className="space-y-2 font-medium">
                    <li><strong className="text-pink-100">Montant maximum :</strong> 1 016,05€/mois (taux plein)</li>
                    <li><strong className="text-pink-100">Avec activité partielle :</strong> Cumul possible avec revenus d'activité</li>
                    <li><strong className="text-pink-100">Durée :</strong> Attribuée pour 1 à 10 ans (renouvelable)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Démarches</h3>
                  <ol className="list-decimal list-inside space-y-2 text-gray-700">
                    <li>Constituez un dossier MDPH avec certificat médical détaillant l'impact du TND</li>
                    <li>La qualité de l'argumentation est clé : détaillez les difficultés au quotidien</li>
                    <li>La CDAPH évalue le taux d'incapacité et la restriction d'accès à l'emploi</li>
                    <li>Si accord, la CAF verse l'AAH mensuellement</li>
                  </ol>
                </div>

                <div className="border-l-4 p-4 rounded-r-lg" style={{ borderColor: '#027e7e', backgroundColor: 'rgba(2, 126, 126, 0.05)' }}>
                  <h4 className="font-bold mb-2" style={{ color: '#027e7e' }}>Conseil pour les adultes TDAH/TSA</h4>
                  <p style={{ color: '#027e7e' }}>
                    Le diagnostic seul ne suffit pas. Faites rédiger des attestations par vos professionnels de santé
                    décrivant <strong>l'impact fonctionnel concret</strong> de votre TND sur votre vie quotidienne et professionnelle.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Contact</h3>
                  <a
                    href="https://www.mdphenligne.cnsa.fr/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 text-white font-semibold rounded-lg shadow-md hover:opacity-90 transition-all"
                    style={{ backgroundColor: '#f4a3b3' }}
                    aria-label="Faire ma demande MDPH en ligne (s'ouvre dans un nouvel onglet)"
                  >
                    <span>Faire ma demande MDPH en ligne</span>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Crédit d'impôt */}
        <div className="bg-white rounded-2xl shadow-md mb-6 overflow-hidden border border-gray-100">
          <button
            onClick={() => toggleSection('credit')}
            className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-all duration-300"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#f8bfc7' }}>
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900" style={{ fontFamily: 'Verdana, sans-serif' }}>Crédit d'Impôt 50%</h2>
                  <span className="text-xs font-bold px-2 py-1 rounded-full text-white" style={{ backgroundColor: '#f8bfc7' }}>TOUS ÂGES</span>
                </div>
                <p className="text-sm text-gray-600" style={{ fontFamily: 'Open Sans, sans-serif' }}>Services à la Personne (CESU)</p>
              </div>
            </div>
            <svg
              className={`w-6 h-6 text-gray-500 transition-transform duration-300 flex-shrink-0 ${expandedSection === 'credit' ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {expandedSection === 'credit' && (
            <div className="px-6 pb-6 border-t border-gray-100">
              <div className="mt-4 space-y-4" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Comment ça marche ?</h3>
                  <p className="text-gray-700">
                    Si votre éducateur dispose d'un agrément Services à la Personne (SAP), vous bénéficiez d'un crédit d'impôt
                    de 50% des sommes versées pour les prestations d'accompagnement éducatif.
                  </p>
                </div>

                <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg">
                  <div className="flex items-start">
                    <svg className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p className="ml-3 text-amber-800">
                      <strong>Important :</strong> L'éducateur doit avoir un numéro d'agrément SAP valide.
                      Vérifiez cette information sur son profil neurocare.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Exemple concret</h3>
                  <div className="rounded-2xl p-6 text-white" style={{ backgroundColor: '#f8bfc7' }}>
                    <div className="space-y-3">
                      <p className="font-medium text-lg">Vous payez 240€/mois pour l'accompagnement éducatif</p>
                      <p className="font-medium text-lg">Soit 2 880€/an</p>
                      <div className="flex items-center gap-3 pt-2">
                        <svg className="w-10 h-10 text-pink-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        <p className="font-bold text-2xl">→ Crédit d'impôt : 1 440€ (50%)</p>
                      </div>
                      <p className="text-base opacity-90 pt-2 border-t border-white/30">Le crédit d'impôt sera déduit de votre impôt, ou remboursé si vous n'êtes pas imposable</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Plafonds annuels (2025)</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start gap-2">
                      <span style={{ color: '#f0879f' }} className="font-bold">•</span>
                      <span>Plafond général : 12 000€ de dépenses (soit 6 000€ de crédit d'impôt)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span style={{ color: '#f0879f' }} className="font-bold">•</span>
                      <span>Majoré à 15 000€ pour le 1er enfant à charge</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span style={{ color: '#f0879f' }} className="font-bold">•</span>
                      <span>+1 500€ par enfant supplémentaire ou membre du foyer de +65 ans</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span style={{ color: '#f0879f' }} className="font-bold">•</span>
                      <span>Plafond maximal : 20 000€</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Démarches</h3>
                  <ol className="list-decimal list-inside space-y-2 text-gray-700">
                    <li>Choisissez un éducateur avec agrément SAP sur neurocare</li>
                    <li>Conservez tous vos reçus de paiement</li>
                    <li>Lors de votre déclaration d'impôts, déclarez les sommes versées</li>
                    <li>Le crédit d'impôt sera calculé automatiquement</li>
                  </ol>
                </div>

                <div className="border-l-4 p-4 rounded-r-lg" style={{ borderColor: '#027e7e', backgroundColor: 'rgba(2, 126, 126, 0.05)' }}>
                  <h4 className="font-bold mb-3 flex items-center gap-2" style={{ color: '#027e7e' }}>
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Vos reçus neurocare
                  </h4>
                  <p className="mb-3 font-medium" style={{ color: '#027e7e' }}>
                    Si l'éducateur a un numéro SAP, vos reçus incluent automatiquement :
                  </p>
                  <ul className="space-y-2" style={{ color: '#027e7e' }}>
                    <li className="flex items-start gap-2">
                      <span className="font-bold">✓</span>
                      <span>Le numéro d'agrément SAP</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold">✓</span>
                      <span>La mention "Éligible au crédit d'impôt 50%"</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold">✓</span>
                      <span>La référence à l'Article 199 sexdecies du CGI</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Plus d'informations</h3>
                  <a
                    href="https://www.servicesalapersonne.gouv.fr/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 text-white font-semibold rounded-lg shadow-md hover:opacity-90 transition-all"
                    style={{ backgroundColor: '#f8bfc7' }}
                    aria-label="Site officiel Services à la Personne (s'ouvre dans un nouvel onglet)"
                  >
                    <span>Site officiel Services à la Personne</span>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mutuelles */}
        <div className="bg-white rounded-2xl shadow-md mb-6 overflow-hidden border border-gray-100">
          <button
            onClick={() => toggleSection('mutuelle')}
            className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-all duration-300"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#9bd4d4' }}>
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <div className="text-left">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900" style={{ fontFamily: 'Verdana, sans-serif' }}>Mutuelles & Complémentaires Santé</h2>
                <p className="text-sm text-gray-600" style={{ fontFamily: 'Open Sans, sans-serif' }}>Selon votre contrat</p>
              </div>
            </div>
            <svg
              className={`w-6 h-6 text-gray-500 transition-transform duration-300 flex-shrink-0 ${expandedSection === 'mutuelle' ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {expandedSection === 'mutuelle' && (
            <div className="px-6 pb-6 border-t border-gray-100">
              <div className="mt-4 space-y-4" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Prises en charge possibles</h3>
                  <p className="text-gray-700">
                    Certaines mutuelles proposent des forfaits spécifiques pour l'accompagnement des personnes avec TND
                    (autisme, TDAH, troubles DYS...). Les prises en charge varient selon votre contrat.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Exemples de mutuelles avec forfaits TND/handicap</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <span style={{ color: '#027e7e' }} className="mr-2">•</span>
                      <span><strong>Harmonie Mutuelle :</strong> Jusqu'à 500€/an pour accompagnement autisme</span>
                    </li>
                    <li className="flex items-start">
                      <span style={{ color: '#027e7e' }} className="mr-2">•</span>
                      <span><strong>MGEN :</strong> Forfait handicap variable selon formule</span>
                    </li>
                    <li className="flex items-start">
                      <span style={{ color: '#027e7e' }} className="mr-2">•</span>
                      <span><strong>Malakoff Humanis :</strong> Prise en charge médecines douces et accompagnement</span>
                    </li>
                    <li className="flex items-start">
                      <span style={{ color: '#027e7e' }} className="mr-2">•</span>
                      <span><strong>AG2R La Mondiale :</strong> Forfait prévention santé</span>
                    </li>
                  </ul>
                </div>

                <div className="rounded-2xl p-6 text-white" style={{ backgroundColor: '#9bd4d4' }}>
                  <h4 className="font-bold mb-4 text-lg">Comment en bénéficier ?</h4>
                  <ol className="list-decimal list-inside space-y-3 font-medium">
                    <li>Vérifiez votre contrat de mutuelle (garanties handicap/médecines douces)</li>
                    <li>Contactez votre mutuelle pour connaître les conditions</li>
                    <li>Téléchargez vos reçus neurocare</li>
                    <li>Envoyez-les à votre mutuelle avec le formulaire de remboursement</li>
                  </ol>
                </div>

                <div className="border-l-4 p-4 rounded-r-lg" style={{ borderColor: '#027e7e', backgroundColor: 'rgba(2, 126, 126, 0.05)' }}>
                  <h4 className="font-bold mb-3" style={{ color: '#027e7e' }}>Documents requis</h4>
                  <ul className="space-y-2" style={{ color: '#027e7e' }}>
                    <li className="flex items-start gap-2">
                      <span className="font-bold">•</span>
                      <span>Reçu de paiement (téléchargeable sur votre dashboard)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold">•</span>
                      <span>Prescription médicale ou certificat de diagnostic (selon mutuelle)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold">•</span>
                      <span>Formulaire de demande de remboursement de votre mutuelle</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg">
                  <div className="flex items-start gap-3">
                    <svg className="w-8 h-8 text-amber-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <div>
                      <h4 className="font-bold text-amber-900 mb-2">Conseil</h4>
                      <p className="text-amber-800 font-medium">
                        Certaines mutuelles proposent des formules renforcées incluant des forfaits handicap plus généreux.
                        N'hésitez pas à comparer les offres lors du renouvellement de votre contrat.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Récapitulatif */}
        <div className="rounded-2xl shadow-md p-8 sm:p-10 text-white mt-12" style={{ backgroundColor: '#027e7e' }}>
          <div className="flex items-center gap-4 mb-6">
            <svg className="w-10 h-10 text-teal-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-2xl sm:text-3xl font-bold" style={{ fontFamily: 'Verdana, sans-serif' }}>Récapitulatif par situation</h2>
          </div>

          {/* Enfants */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-teal-200 mb-3 flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-sm text-white" style={{ backgroundColor: '#3a9e9e' }}>ENFANTS 0-20 ANS</span>
            </h3>
            <div className="space-y-3">
              <div className="flex items-start bg-white/10 p-3 rounded-xl">
                <span className="text-teal-200 mr-3 font-bold">1.</span>
                <p className="font-medium"><strong>Enfant &lt; 12 ans :</strong> Demandez le Forfait Intervention Précoce (psychologue, ergo, psychomot gratuits)</p>
              </div>
              <div className="flex items-start bg-white/10 p-3 rounded-xl">
                <span className="text-teal-200 mr-3 font-bold">2.</span>
                <p className="font-medium"><strong>Tous âges :</strong> Demandez l'AEEH à la MDPH (finance TOUS les professionnels)</p>
              </div>
              <div className="flex items-start bg-white/10 p-3 rounded-xl">
                <span className="text-teal-200 mr-3 font-bold">3.</span>
                <p className="font-medium"><strong>Éducateur SAP :</strong> Bénéficiez du crédit d'impôt 50%</p>
              </div>
            </div>
          </div>

          {/* Adultes */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-pink-200 mb-3 flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-sm text-white" style={{ backgroundColor: '#f0879f' }}>ADULTES 20+ ANS</span>
            </h3>
            <div className="space-y-3">
              <div className="flex items-start bg-white/10 p-3 rounded-xl">
                <span className="text-pink-200 mr-3 font-bold">1.</span>
                <p className="font-medium"><strong>AAH :</strong> Demandez l'allocation adulte handicapé (jusqu'à 1016€/mois)</p>
              </div>
              <div className="flex items-start bg-white/10 p-3 rounded-xl">
                <span className="text-pink-200 mr-3 font-bold">2.</span>
                <p className="font-medium"><strong>PCH :</strong> Pour les aides humaines et techniques (⚠️ ne finance pas les libéraux)</p>
              </div>
              <div className="flex items-start bg-white/10 p-3 rounded-xl">
                <span className="text-pink-200 mr-3 font-bold">3.</span>
                <p className="font-medium"><strong>CESU/Crédit d'impôt 50% :</strong> Seule aide pour financer les éducateurs à domicile</p>
              </div>
            </div>
          </div>

          {/* Conseils communs */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-teal-200 mb-3">Dans tous les cas :</h3>
            <div className="flex items-start bg-white/10 p-3 rounded-xl">
              <div className="flex-shrink-0 mr-3">
                <div className="w-7 h-7 bg-teal-300 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-teal-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <p className="font-medium">Vérifiez les forfaits TND/handicap de votre mutuelle</p>
            </div>
            <div className="flex items-start bg-white/10 p-3 rounded-xl">
              <div className="flex-shrink-0 mr-3">
                <div className="w-7 h-7 bg-teal-300 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-teal-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <p className="font-medium">Vérifiez si votre employeur propose des CESU préfinancés</p>
            </div>
            <div className="flex items-start bg-white/10 p-3 rounded-xl">
              <div className="flex-shrink-0 mr-3">
                <div className="w-7 h-7 bg-teal-300 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-teal-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <p className="font-medium">Conservez TOUS vos reçus neurocare pour vos démarches</p>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-white/30">
            <div className="bg-white/10 p-6 rounded-xl">
              <p className="text-base leading-relaxed font-medium" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                Nos attestations de paiement sont automatiquement conformes aux exigences de tous ces organismes.
                Vous n'avez qu'à les télécharger depuis votre dashboard et les transmettre.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <Link
            href="/auth/signup"
            className="inline-flex items-center px-8 py-4 text-white font-semibold rounded-lg shadow-md transition hover:opacity-90"
            style={{ backgroundColor: '#f0879f' }}
          >
            Créer mon compte
            <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          <p className="mt-4 text-gray-600" style={{ fontFamily: 'Open Sans, sans-serif' }}>
            Déjà inscrit ?{' '}
            <Link href="/auth/login" className="font-medium hover:underline" style={{ color: '#027e7e' }}>
              Se connecter
            </Link>
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-white py-12" style={{ backgroundColor: '#027e7e' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-6">
              <Link href="/" className="inline-block">
                <img
                  src="/images/logo-neurocare.svg"
                  alt="neurocare"
                  className="h-20 brightness-0 invert mx-auto"
                />
              </Link>
            </div>
            <p className="text-teal-100 text-lg mb-8">
              Connecter les familles avec les meilleurs éducateurs spécialisés
            </p>
            <div className="flex justify-center gap-6 mb-8 flex-wrap">
              <Link href="/about" className="text-teal-100 hover:text-white transition-colors">
                Qui sommes-nous ?
              </Link>
              <Link href="/search" className="text-teal-100 hover:text-white transition-colors">
                Trouver un professionnel
              </Link>
              <Link href="/contact" className="text-teal-100 hover:text-white transition-colors">
                Contact
              </Link>
            </div>
            <div className="border-t border-teal-600 pt-8">
              <p className="text-teal-200">
                © 2024 neurocare. Tous droits réservés.
              </p>
            </div>
          </div>
        </div>
      </footer>
      <TndToggle />
    </div>
  );
}
