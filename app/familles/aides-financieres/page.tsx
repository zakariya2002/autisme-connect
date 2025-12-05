'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { signOut } from '@/lib/auth';
import Logo from '@/components/Logo';
import MobileMenu from '@/components/MobileMenu';

export default function AidesFinancieresPage() {
  const router = useRouter();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<'family' | 'educator' | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      setIsLoggedIn(false);
      return;
    }

    setIsLoggedIn(true);

    // Check if user is family
    const { data: familyProfile } = await supabase
      .from('family_profiles')
      .select('*')
      .eq('user_id', session.user.id)
      .single();

    if (familyProfile) {
      setUserRole('family');
      setProfile(familyProfile);
      return;
    }

    // Check if user is educator
    const { data: educatorProfile } = await supabase
      .from('educator_profiles')
      .select('*')
      .eq('user_id', session.user.id)
      .single();

    if (educatorProfile) {
      setUserRole('educator');
      setProfile(educatorProfile);

      // Check premium status
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('status')
        .eq('educator_id', educatorProfile.id)
        .eq('status', 'active')
        .single();

      setIsPremium(!!subscription);
    }
  };

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const getDashboardLink = () => {
    if (userRole === 'family') return '/dashboard/family';
    if (userRole === 'educator') return '/dashboard/educator';
    return '/';
  };

  const getBackButtonText = () => {
    if (userRole === 'family') return 'Retour au dashboard famille';
    if (userRole === 'educator') return 'Retour au dashboard éducateur';
    return 'Retour à l\'accueil';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-primary-50">
      {/* Navigation - même style que LP */}
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50 backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/">
              <Logo />
            </Link>
            <div className="xl:hidden">
              <MobileMenu />
            </div>
            <div className="hidden xl:flex items-center gap-2 lg:gap-3">
              <Link href="/about" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md font-medium transition-colors text-sm inline-flex items-center justify-center">
                À propos
              </Link>
              <Link href="/search" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md font-medium transition-colors text-sm inline-flex items-center justify-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Recherche
              </Link>
              <Link href="/pricing" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md font-medium transition-colors text-sm inline-flex items-center justify-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Tarifs
              </Link>
              <Link href="/familles/aides-financieres" className="text-primary-600 bg-primary-50 px-3 py-2 rounded-md font-medium transition-colors text-sm inline-flex items-center justify-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Aides
              </Link>
              <Link href="/contact" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md font-medium transition-colors text-sm inline-flex items-center justify-center">
                Contact
              </Link>
              {isLoggedIn ? (
                <Link href={getDashboardLink()} className="ml-4 bg-primary-600 text-white px-5 py-2.5 rounded-md hover:bg-primary-700 font-medium transition-colors shadow-sm text-sm lg:text-base inline-flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  Tableau de bord
                </Link>
              ) : (
                <>
                  <Link href="/auth/login" className="ml-4 text-gray-700 hover:text-primary-600 px-2 lg:px-4 py-2 rounded-md font-medium transition-colors text-sm lg:text-base">
                    Connexion
                  </Link>
                  <Link href="/auth/signup" className="bg-gradient-to-r from-violet-600 to-blue-500 hover:from-violet-700 hover:to-blue-600 text-white px-5 py-2.5 rounded-md font-medium transition-all shadow-sm text-sm lg:text-base">
                    Inscription
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Header rétréci */}
      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-16 -right-16 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-16 -left-16 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-t from-transparent via-white/5 to-transparent"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white text-center drop-shadow-lg">
            Aides Financières TND
          </h1>
          <p className="mt-3 text-base md:text-lg text-white/95 text-center max-w-3xl mx-auto font-medium drop-shadow-md">
            Toutes les aides pour financer l'accompagnement des enfants et adultes avec troubles du neuro-développement
          </p>
          <p className="mt-2 text-sm text-white/80 text-center font-semibold">
            Autisme, TDAH, troubles DYS : jusqu'à 100% de vos dépenses remboursées !
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Simulateur CTA */}
        <Link
          href="/familles/simulateur-aides"
          className="block mb-8 bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 p-6 rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300 relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur">
                <span className="text-3xl">🧮</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white drop-shadow-md">
                  Simulateur d'aides personnalisé
                </h3>
                <p className="text-white/90 text-sm mt-1">
                  Découvrez en 2 minutes les aides auxquelles vous avez droit et estimez les montants
                </p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg backdrop-blur">
              <span className="text-white font-semibold">Lancer le simulateur</span>
              <svg className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </Link>

        {/* Introduction */}
        <div className="bg-gradient-to-r from-blue-500 via-teal-500 to-emerald-500 p-8 mb-8 rounded-2xl shadow-2xl transform hover:scale-[1.02] transition-all duration-300 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-teal-400/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl"></div>

          <div className="flex items-start relative z-10">
            <div className="flex-shrink-0">
              <div className="relative">
                <div className="absolute inset-0 bg-white/30 rounded-full blur-xl animate-pulse"></div>
                <svg className="h-16 w-16 text-white relative z-10 drop-shadow-lg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-6 flex-1">
              <h3 className="text-2xl font-bold text-white drop-shadow-md mb-3">
                Vos reçus neurocare sont compatibles avec toutes ces aides
              </h3>
              <p className="text-xl text-white/95 leading-relaxed drop-shadow">
                Nos attestations de paiement incluent toutes les mentions légales requises pour vos démarches de remboursement.
              </p>
            </div>
          </div>
        </div>

        {/* Tableau récapitulatif par âge */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Quelles aides selon votre situation ?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Enfants */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-purple-900">Enfants (0-20 ans)</h3>
              </div>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-gray-700">
                  <span className="text-green-500 font-bold">✓</span>
                  <span><strong>Forfait Précoce</strong> (0-12 ans) - Psychologue, Ergo, Psychomot</span>
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <span className="text-green-500 font-bold">✓</span>
                  <span><strong>AEEH</strong> - Tous les professionnels</span>
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <span className="text-green-500 font-bold">✓</span>
                  <span><strong>PCH</strong> - Aides humaines et techniques</span>
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <span className="text-green-500 font-bold">✓</span>
                  <span><strong>CESU</strong> - Éducateurs à domicile (50% crédit impôt)</span>
                </li>
              </ul>
            </div>
            {/* Adultes */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-blue-900">Adultes (18+ ans)</h3>
              </div>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-gray-700">
                  <span className="text-green-500 font-bold">✓</span>
                  <span><strong>AAH</strong> - Allocation jusqu'à 1016€/mois</span>
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <span className="text-green-500 font-bold">✓</span>
                  <span><strong>PCH</strong> - Aides humaines et techniques</span>
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <span className="text-green-500 font-bold">✓</span>
                  <span><strong>CESU</strong> - Éducateurs à domicile (50% crédit impôt)</span>
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <span className="text-orange-500 font-bold">⚠</span>
                  <span className="text-gray-600">PCH ne finance pas les libéraux (psy, ergo...)</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Forfait Intervention Précoce - NOUVEAU */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 mb-8 overflow-hidden transform hover:scale-[1.01] transition-all duration-300">
          <button
            onClick={() => toggleSection('forfait')}
            className="w-full px-8 py-6 flex items-center justify-between bg-gradient-to-r from-teal-50 to-cyan-50 hover:from-teal-100 hover:to-cyan-100 transition-all duration-300 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-teal-400/10 to-cyan-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            <div className="flex items-center gap-6 relative z-10">
              <div className="relative">
                <div className="absolute inset-0 bg-teal-400 rounded-xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
                <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg relative z-10 transform group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-9 h-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="text-left flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-2xl font-bold text-gray-900">Forfait Intervention Précoce</h2>
                  <span className="bg-teal-100 text-teal-800 text-xs font-bold px-2 py-1 rounded-full">ENFANTS 0-12 ANS</span>
                </div>
                <p className="text-base text-gray-600 font-medium">Prise en charge Assurance Maladie depuis 2024</p>
              </div>
            </div>
            <svg
              className={`w-7 h-7 text-gray-500 transition-transform duration-300 relative z-10 ${expandedSection === 'forfait' ? 'rotate-180' : ''}`}
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
              <div className="mt-4 space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Qu'est-ce que le Forfait d'Intervention Précoce ?</h3>
                  <p className="text-gray-700">
                    Depuis 2024, l'Assurance Maladie prend en charge directement les bilans et séances de
                    <strong> psychologues, ergothérapeutes et psychomotriciens</strong> pour les enfants de moins de 12 ans
                    présentant des signes de TND (autisme, TDAH, troubles DYS...).
                  </p>
                </div>

                <div className="bg-teal-50 border-l-4 border-teal-500 p-4 rounded-r-lg">
                  <p className="text-teal-800 font-medium">
                    <strong>Important :</strong> Ce forfait concerne les professionnels habituellement NON remboursés par la Sécu.
                    Les orthophonistes et kinés sont déjà remboursés normalement.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Professionnels éligibles</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-teal-50 to-cyan-100 border-2 border-teal-200 rounded-xl p-5 text-center shadow-md hover:shadow-lg transition-shadow">
                      <div className="w-14 h-14 bg-teal-500 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-2xl">🧠</span>
                      </div>
                      <p className="font-bold text-teal-900 text-lg">Psychologue</p>
                      <p className="text-sm text-teal-700 font-medium mt-1">Évaluation : 120-300€</p>
                    </div>
                    <div className="bg-gradient-to-br from-teal-50 to-cyan-100 border-2 border-teal-200 rounded-xl p-5 text-center shadow-md hover:shadow-lg transition-shadow">
                      <div className="w-14 h-14 bg-teal-500 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-2xl">🤸</span>
                      </div>
                      <p className="font-bold text-teal-900 text-lg">Psychomotricien</p>
                      <p className="text-sm text-teal-700 font-medium mt-1">Forfait : 1 500€/an</p>
                    </div>
                    <div className="bg-gradient-to-br from-teal-50 to-cyan-100 border-2 border-teal-200 rounded-xl p-5 text-center shadow-md hover:shadow-lg transition-shadow">
                      <div className="w-14 h-14 bg-teal-500 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-2xl">🎯</span>
                      </div>
                      <p className="font-bold text-teal-900 text-lg">Ergothérapeute</p>
                      <p className="text-sm text-teal-700 font-medium mt-1">Forfait : 1 500€/an</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-teal-500 to-cyan-500 p-6 rounded-2xl shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                      <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <h4 className="text-xl font-bold text-white">Montants pris en charge</h4>
                    </div>
                    <ul className="space-y-2 text-white font-medium">
                      <li><strong className="text-yellow-200">Psychologue :</strong> 120€ (éval. simple) ou 300€ (avec tests neuropsy)</li>
                      <li><strong className="text-yellow-200">Ergo/Psychomot :</strong> 1 500€ pour évaluation + 35 séances minimum</li>
                      <li><strong className="text-yellow-200">Durée :</strong> 12 mois (renouvelable 6 mois)</li>
                    </ul>
                  </div>
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
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                  >
                    <span>Annuaire des PCO-TND</span>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* CESU */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 mb-8 overflow-hidden transform hover:scale-[1.01] transition-all duration-300">
          <button
            onClick={() => toggleSection('cesu')}
            className="w-full px-8 py-6 flex items-center justify-between bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 transition-all duration-300 relative overflow-hidden group"
          >
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-r from-green-400/10 to-emerald-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            <div className="flex items-center gap-6 relative z-10">
              <div className="relative">
                <div className="absolute inset-0 bg-green-400 rounded-xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg relative z-10 transform group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-9 h-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <div className="text-left flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-1">CESU Préfinancé</h2>
                <p className="text-base text-gray-600 font-medium">Chèque Emploi Service Universel</p>
              </div>
            </div>
            <svg
              className={`w-7 h-7 text-gray-500 transition-transform duration-300 relative z-10 ${expandedSection === 'cesu' ? 'rotate-180' : ''}`}
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
              <div className="mt-4 space-y-4">
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

                <div className="bg-gradient-to-br from-green-400 to-emerald-500 p-6 rounded-2xl shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-3">
                      <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <h4 className="text-xl font-bold text-white">Montant de l'aide</h4>
                    </div>
                    <p className="text-lg text-white font-semibold leading-relaxed">
                      Variable selon votre employeur ou organisme. Peut couvrir jusqu'à <span className="text-2xl font-extrabold text-yellow-300">100%</span> du coût des prestations.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Liens utiles</h3>
                  <a
                    href="https://www.cesu.urssaf.fr/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-blue-600 hover:from-primary-600 hover:to-blue-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                  >
                    <span>Site officiel CESU (URSSAF)</span>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* PCH (MDPH) */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 mb-8 overflow-hidden transform hover:scale-[1.01] transition-all duration-300">
          <button
            onClick={() => toggleSection('pch')}
            className="w-full px-8 py-6 flex items-center justify-between bg-gradient-to-r from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 transition-all duration-300 relative overflow-hidden group"
          >
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-cyan-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            <div className="flex items-center gap-6 relative z-10">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-400 rounded-xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg relative z-10 transform group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-9 h-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
              </div>
              <div className="text-left flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-1">PCH - MDPH</h2>
                <p className="text-base text-gray-600 font-medium">Prestation de Compensation du Handicap</p>
              </div>
            </div>
            <svg
              className={`w-7 h-7 text-gray-500 transition-transform duration-300 relative z-10 ${expandedSection === 'pch' ? 'rotate-180' : ''}`}
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
              <div className="mt-4 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded-full">ENFANTS + ADULTES</span>
                  <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded-full">TOUS TND</span>
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
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <h4 className="font-semibold text-green-800 mb-2">✅ Pris en charge</h4>
                      <ul className="text-sm text-green-700 space-y-1">
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

                <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-6 rounded-2xl shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-3">
                      <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <h4 className="text-xl font-bold text-white">Montant de l'aide</h4>
                    </div>
                    <p className="text-lg text-white font-semibold leading-relaxed mb-3">
                      Jusqu'à <span className="text-2xl font-extrabold text-yellow-300">100%</span> du coût dans la limite des heures accordées. Le montant varie selon le niveau d'autonomie.
                    </p>
                    <p className="text-base text-white/90 font-medium">
                      Exemples : 50h/mois pour niveau modéré, 100h+/mois pour niveau sévère
                    </p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-2xl border-l-4 border-amber-400 shadow-md">
                  <h4 className="font-bold text-amber-900 mb-3 text-lg">Documents requis sur vos reçus</h4>
                  <ul className="list-disc list-inside space-y-2 text-amber-800">
                    <li>Nom et SIRET du prestataire (éducateur)</li>
                    <li>Heures précises de début et fin de la prestation</li>
                    <li>Nature du service (accompagnement éducatif)</li>
                    <li>Montant payé</li>
                  </ul>
                  <div className="mt-4 pt-4 border-t border-amber-200">
                    <p className="text-amber-900 font-bold flex items-center gap-2">
                      <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                  >
                    <span>Trouver votre MDPH</span>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* AEEH (CAF) */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 mb-8 overflow-hidden transform hover:scale-[1.01] transition-all duration-300">
          <button
            onClick={() => toggleSection('aeeh')}
            className="w-full px-8 py-6 flex items-center justify-between bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 transition-all duration-300 relative overflow-hidden group"
          >
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 to-pink-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            <div className="flex items-center gap-6 relative z-10">
              <div className="relative">
                <div className="absolute inset-0 bg-purple-400 rounded-xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg relative z-10 transform group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-9 h-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="text-left flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-2xl font-bold text-gray-900">AEEH - CAF</h2>
                  <span className="bg-purple-100 text-purple-800 text-xs font-bold px-2 py-1 rounded-full">ENFANTS 0-20 ANS</span>
                </div>
                <p className="text-base text-gray-600 font-medium">Allocation d'Éducation de l'Enfant Handicapé</p>
              </div>
            </div>
            <svg
              className={`w-7 h-7 text-gray-500 transition-transform duration-300 relative z-10 ${expandedSection === 'aeeh' ? 'rotate-180' : ''}`}
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
              <div className="mt-4 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-purple-100 text-purple-800 text-xs font-bold px-2 py-1 rounded-full">ENFANTS UNIQUEMENT</span>
                  <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded-full">TOUS TND</span>
                </div>

                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
                  <p className="text-green-800 font-medium">
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

                <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-6 rounded-2xl shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                      <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <h4 className="text-xl font-bold text-white">Montant de l'aide (2025)</h4>
                    </div>
                    <ul className="space-y-2 text-white font-medium">
                      <li className="flex items-center gap-2">
                        <span className="text-yellow-300 font-bold">•</span>
                        <span><strong className="text-yellow-200">AEEH de base :</strong> 142,70€/mois</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-yellow-300 font-bold">•</span>
                        <span><strong className="text-yellow-200">Complément 1ère catégorie :</strong> +105,79€/mois</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-yellow-300 font-bold">•</span>
                        <span><strong className="text-yellow-200">Complément 2ème catégorie :</strong> +286,94€/mois</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-yellow-300 font-bold">•</span>
                        <span><strong className="text-yellow-200">Complément 3ème catégorie :</strong> +405,16€/mois</span>
                      </li>
                      <li className="text-base text-white/80">... jusqu'à la 6ème catégorie</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">AEEH vs PCH : Quelle différence ?</h3>
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <p className="text-gray-700 mb-3 flex items-start gap-2">
                      <span className="text-purple-600 font-bold text-xl">→</span>
                      <span><strong className="text-purple-700">AEEH :</strong> Allocation forfaitaire mensuelle pour compenser les frais liés au handicap</span>
                    </p>
                    <p className="text-gray-700 flex items-start gap-2">
                      <span className="text-blue-600 font-bold text-xl">→</span>
                      <span><strong className="text-blue-700">PCH :</strong> Remboursement sur justificatifs des dépenses réelles (dont aide humaine)</span>
                    </p>
                    <div className="mt-4 pt-4 border-t border-gray-300">
                      <p className="text-sm text-gray-700 font-semibold flex items-center gap-2">
                        <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Note : Vous pouvez choisir entre AEEH + complément OU PCH, mais pas les deux simultanément
                      </p>
                    </div>
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
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                  >
                    <span>www.caf.fr</span>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* AAH - NOUVEAU pour adultes */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 mb-8 overflow-hidden transform hover:scale-[1.01] transition-all duration-300">
          <button
            onClick={() => toggleSection('aah')}
            className="w-full px-8 py-6 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-violet-50 hover:from-indigo-100 hover:to-violet-100 transition-all duration-300 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-400/10 to-violet-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            <div className="flex items-center gap-6 relative z-10">
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-400 rounded-xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-xl flex items-center justify-center shadow-lg relative z-10 transform group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-9 h-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
              <div className="text-left flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-2xl font-bold text-gray-900">AAH - MDPH</h2>
                  <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-2 py-1 rounded-full">ADULTES 20+ ANS</span>
                </div>
                <p className="text-base text-gray-600 font-medium">Allocation aux Adultes Handicapés</p>
              </div>
            </div>
            <svg
              className={`w-7 h-7 text-gray-500 transition-transform duration-300 relative z-10 ${expandedSection === 'aah' ? 'rotate-180' : ''}`}
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
              <div className="mt-4 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-2 py-1 rounded-full">ADULTES UNIQUEMENT</span>
                  <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded-full">TOUS TND</span>
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

                <div className="bg-gradient-to-br from-indigo-500 to-violet-500 p-6 rounded-2xl shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                      <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <h4 className="text-xl font-bold text-white">Montant de l'AAH (2025)</h4>
                    </div>
                    <ul className="space-y-2 text-white font-medium">
                      <li><strong className="text-yellow-200">Montant maximum :</strong> 1 016,05€/mois (taux plein)</li>
                      <li><strong className="text-yellow-200">Avec activité partielle :</strong> Cumul possible avec revenus d'activité</li>
                      <li><strong className="text-yellow-200">Durée :</strong> Attribuée pour 1 à 10 ans (renouvelable)</li>
                    </ul>
                  </div>
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

                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                  <h4 className="font-bold text-blue-900 mb-2">Conseil pour les adultes TDAH/TSA</h4>
                  <p className="text-blue-800">
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
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                  >
                    <span>Faire ma demande MDPH en ligne</span>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Crédit d'impôt */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 mb-8 overflow-hidden transform hover:scale-[1.01] transition-all duration-300">
          <button
            onClick={() => toggleSection('credit')}
            className="w-full px-8 py-6 flex items-center justify-between bg-gradient-to-r from-yellow-50 to-orange-50 hover:from-yellow-100 hover:to-orange-100 transition-all duration-300 relative overflow-hidden group"
          >
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 to-orange-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            <div className="flex items-center gap-6 relative z-10">
              <div className="relative">
                <div className="absolute inset-0 bg-yellow-400 rounded-xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg relative z-10 transform group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-9 h-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
              </div>
              <div className="text-left flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-2xl font-bold text-gray-900">Crédit d'Impôt 50%</h2>
                  <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-1 rounded-full">TOUS ÂGES</span>
                </div>
                <p className="text-base text-gray-600 font-medium">Services à la Personne (CESU)</p>
              </div>
            </div>
            <svg
              className={`w-7 h-7 text-gray-500 transition-transform duration-300 relative z-10 ${expandedSection === 'credit' ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {expandedSection === 'credit' && (
            <div className="px-6 pb-6 border-t border-gray-100">
              <div className="mt-4 space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Comment ça marche ?</h3>
                  <p className="text-gray-700">
                    Si votre éducateur dispose d'un agrément Services à la Personne (SAP), vous bénéficiez d'un crédit d'impôt
                    de 50% des sommes versées pour les prestations d'accompagnement éducatif.
                  </p>
                </div>

                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                  <div className="flex items-start">
                    <svg className="h-5 w-5 text-yellow-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p className="ml-3 text-yellow-800">
                      <strong>Important :</strong> L'éducateur doit avoir un numéro d'agrément SAP valide.
                      Vérifiez cette information sur son profil neurocare.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Exemple concret</h3>
                  <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-6 rounded-2xl shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>
                    <div className="relative z-10 space-y-3">
                      <p className="text-white font-medium text-lg">Vous payez 240€/mois pour l'accompagnement éducatif</p>
                      <p className="text-white font-medium text-lg">Soit 2 880€/an</p>
                      <div className="flex items-center gap-3 pt-2">
                        <svg className="w-10 h-10 text-yellow-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        <p className="text-white font-bold text-2xl">→ Crédit d'impôt : 1 440€ (50%)</p>
                      </div>
                      <p className="text-base text-white/90 pt-2 border-t border-white/30">Le crédit d'impôt sera déduit de votre impôt, ou remboursé si vous n'êtes pas imposable</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Plafonds annuels (2025)</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-orange-500 font-bold">•</span>
                      <span>Plafond général : 12 000€ de dépenses (soit 6 000€ de crédit d'impôt)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-500 font-bold">•</span>
                      <span>Majoré à 15 000€ pour le 1er enfant à charge</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-500 font-bold">•</span>
                      <span>+1 500€ par enfant supplémentaire ou membre du foyer de +65 ans</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-500 font-bold">•</span>
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

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border-l-4 border-green-500 shadow-md">
                  <h4 className="font-bold text-green-900 mb-3 text-lg flex items-center gap-2">
                    <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Vos reçus neurocare
                  </h4>
                  <p className="text-green-800 mb-3 font-medium">
                    Si l'éducateur a un numéro SAP, vos reçus incluent automatiquement :
                  </p>
                  <ul className="space-y-2 text-green-800">
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">✓</span>
                      <span>Le numéro d'agrément SAP</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">✓</span>
                      <span>La mention "Éligible au crédit d'impôt 50%"</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">✓</span>
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
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                  >
                    <span>Site officiel Services à la Personne</span>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mutuelles */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 mb-8 overflow-hidden transform hover:scale-[1.01] transition-all duration-300">
          <button
            onClick={() => toggleSection('mutuelle')}
            className="w-full px-8 py-6 flex items-center justify-between bg-gradient-to-r from-pink-50 to-rose-50 hover:from-pink-100 hover:to-rose-100 transition-all duration-300 relative overflow-hidden group"
          >
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-r from-pink-400/10 to-rose-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            <div className="flex items-center gap-6 relative z-10">
              <div className="relative">
                <div className="absolute inset-0 bg-pink-400 rounded-xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
                <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center shadow-lg relative z-10 transform group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-9 h-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
              </div>
              <div className="text-left flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-1">Mutuelles & Complémentaires Santé</h2>
                <p className="text-base text-gray-600 font-medium">Selon votre contrat</p>
              </div>
            </div>
            <svg
              className={`w-7 h-7 text-gray-500 transition-transform duration-300 relative z-10 ${expandedSection === 'mutuelle' ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {expandedSection === 'mutuelle' && (
            <div className="px-6 pb-6 border-t border-gray-100">
              <div className="mt-4 space-y-4">
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
                      <span className="text-primary-600 mr-2">•</span>
                      <span><strong>Harmonie Mutuelle :</strong> Jusqu'à 500€/an pour accompagnement autisme</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary-600 mr-2">•</span>
                      <span><strong>MGEN :</strong> Forfait handicap variable selon formule</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary-600 mr-2">•</span>
                      <span><strong>Malakoff Humanis :</strong> Prise en charge médecines douces et accompagnement</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary-600 mr-2">•</span>
                      <span><strong>AG2R La Mondiale :</strong> Forfait prévention santé</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-gradient-to-br from-pink-500 to-rose-500 p-6 rounded-2xl shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>
                  <div className="relative z-10">
                    <h4 className="font-bold text-white mb-4 text-xl">Comment en bénéficier ?</h4>
                    <ol className="list-decimal list-inside space-y-3 text-white font-medium">
                      <li>Vérifiez votre contrat de mutuelle (garanties handicap/médecines douces)</li>
                      <li>Contactez votre mutuelle pour connaître les conditions</li>
                      <li>Téléchargez vos reçus neurocare</li>
                      <li>Envoyez-les à votre mutuelle avec le formulaire de remboursement</li>
                    </ol>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-2xl border-l-4 border-blue-400 shadow-md">
                  <h4 className="font-bold text-blue-900 mb-3 text-lg">Documents requis</h4>
                  <ul className="space-y-2 text-blue-800">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">•</span>
                      <span>Reçu de paiement (téléchargeable sur votre dashboard)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">•</span>
                      <span>Prescription médicale ou certificat de diagnostic (selon mutuelle)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">•</span>
                      <span>Formulaire de demande de remboursement de votre mutuelle</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-gradient-to-br from-amber-50 to-yellow-50 p-6 rounded-2xl border-l-4 border-amber-400 shadow-md">
                  <div className="flex items-start gap-3">
                    <svg className="w-8 h-8 text-amber-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <div>
                      <h4 className="font-bold text-amber-900 mb-2 text-lg">Conseil</h4>
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
        <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-2xl p-10 text-white mt-16 relative overflow-hidden">
          {/* Animated background circles */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse delay-700"></div>
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <svg className="w-12 h-12 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-3xl font-extrabold">Récapitulatif par situation</h2>
            </div>

            {/* Enfants */}
            <div className="mb-6">
              <h3 className="text-xl font-bold text-yellow-300 mb-3 flex items-center gap-2">
                <span className="bg-purple-500 px-3 py-1 rounded-full text-sm">ENFANTS 0-20 ANS</span>
              </h3>
              <div className="space-y-3">
                <div className="flex items-start bg-white/10 backdrop-blur-sm p-3 rounded-xl">
                  <span className="text-teal-300 mr-3">1.</span>
                  <p className="font-medium"><strong>Enfant &lt; 12 ans :</strong> Demandez le Forfait Intervention Précoce (psychologue, ergo, psychomot gratuits)</p>
                </div>
                <div className="flex items-start bg-white/10 backdrop-blur-sm p-3 rounded-xl">
                  <span className="text-purple-300 mr-3">2.</span>
                  <p className="font-medium"><strong>Tous âges :</strong> Demandez l'AEEH à la MDPH (finance TOUS les professionnels)</p>
                </div>
                <div className="flex items-start bg-white/10 backdrop-blur-sm p-3 rounded-xl">
                  <span className="text-yellow-300 mr-3">3.</span>
                  <p className="font-medium"><strong>Éducateur SAP :</strong> Bénéficiez du crédit d'impôt 50%</p>
                </div>
              </div>
            </div>

            {/* Adultes */}
            <div className="mb-6">
              <h3 className="text-xl font-bold text-yellow-300 mb-3 flex items-center gap-2">
                <span className="bg-indigo-500 px-3 py-1 rounded-full text-sm">ADULTES 20+ ANS</span>
              </h3>
              <div className="space-y-3">
                <div className="flex items-start bg-white/10 backdrop-blur-sm p-3 rounded-xl">
                  <span className="text-indigo-300 mr-3">1.</span>
                  <p className="font-medium"><strong>AAH :</strong> Demandez l'allocation adulte handicapé (jusqu'à 1016€/mois)</p>
                </div>
                <div className="flex items-start bg-white/10 backdrop-blur-sm p-3 rounded-xl">
                  <span className="text-blue-300 mr-3">2.</span>
                  <p className="font-medium"><strong>PCH :</strong> Pour les aides humaines et techniques (⚠️ ne finance pas les libéraux)</p>
                </div>
                <div className="flex items-start bg-white/10 backdrop-blur-sm p-3 rounded-xl">
                  <span className="text-yellow-300 mr-3">3.</span>
                  <p className="font-medium"><strong>CESU/Crédit d'impôt 50% :</strong> Seule aide pour financer les éducateurs à domicile</p>
                </div>
              </div>
            </div>

            {/* Conseils communs */}
            <div className="space-y-3">
              <h3 className="text-xl font-bold text-yellow-300 mb-3">Dans tous les cas :</h3>
              <div className="flex items-start bg-white/10 backdrop-blur-sm p-3 rounded-xl">
                <div className="flex-shrink-0 mr-3">
                  <div className="w-8 h-8 bg-green-400 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <p className="font-medium">Vérifiez les forfaits TND/handicap de votre mutuelle</p>
              </div>
              <div className="flex items-start bg-white/10 backdrop-blur-sm p-3 rounded-xl">
                <div className="flex-shrink-0 mr-3">
                  <div className="w-8 h-8 bg-green-400 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <p className="font-medium">Vérifiez si votre employeur propose des CESU préfinancés</p>
              </div>
              <div className="flex items-start bg-white/10 backdrop-blur-sm p-3 rounded-xl">
                <div className="flex-shrink-0 mr-3">
                  <div className="w-8 h-8 bg-green-400 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <p className="font-medium">Conservez TOUS vos reçus neurocare pour vos démarches</p>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-white/30">
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl">
                <p className="text-base leading-relaxed font-medium">
                  Nos attestations de paiement sont automatiquement conformes aux exigences de tous ces organismes.
                  Vous n'avez qu'à les télécharger depuis votre dashboard et les transmettre.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        {!isLoggedIn && (
          <div className="mt-12 text-center">
            <Link
              href="/auth/register"
              className="inline-flex items-center px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg shadow-lg transition transform hover:scale-105"
            >
              Créer mon compte famille
              <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <p className="mt-4 text-gray-600">
              Déjà inscrit ?{' '}
              <Link href="/auth/login" className="text-primary-600 hover:text-primary-700 font-medium">
                Se connecter
              </Link>
            </p>
          </div>
        )}

        {isLoggedIn && (
          <div className="mt-12 text-center">
            <Link
              href={getDashboardLink()}
              className={`inline-flex items-center px-8 py-4 text-white font-semibold rounded-lg shadow-lg transition-all duration-200 hover:shadow-xl ${
                userRole === 'educator'
                  ? 'bg-gradient-to-r from-primary-500 to-green-500 hover:from-primary-600 hover:to-green-600'
                  : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
              }`}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Tableau de bord
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
