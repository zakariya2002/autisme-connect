'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { signOut } from '@/lib/auth';
import Logo from '@/components/Logo';
import EducatorMobileMenu from '@/components/EducatorMobileMenu';
import { getEducatorUsageStats, FREE_PLAN_LIMITS } from '@/lib/subscription-utils';

export default function EducatorDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [profile, setProfile] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [stats, setStats] = useState({
    bookings: 0,
    rating: 0,
    reviews: 0,
    profileViews: 0,
  });
  const [usageStats, setUsageStats] = useState<any>(null);
  const [syncingSubscription, setSyncingSubscription] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      router.push('/auth/login');
      return;
    }

    const { data } = await supabase
      .from('educator_profiles')
      .select('*')
      .eq('user_id', session.user.id)
      .single();

    if (data) {
      setProfile(data);
      setStats({
        bookings: 0,
        rating: data.rating || 0,
        reviews: data.total_reviews || 0,
        profileViews: data.total_views || 0, // Ajouter les vues du profil
      });

      const { count } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('educator_id', data.id);

      setStats(prev => ({ ...prev, bookings: count || 0 }));

      // Récupérer l'abonnement
      const { data: subscriptionData } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('educator_id', data.id)
        .in('status', ['active', 'trialing'])
        .limit(1)
        .maybeSingle();

      setSubscription(subscriptionData);

      // Récupérer les statistiques d'usage
      const usage = await getEducatorUsageStats(data.id);
      setUsageStats(usage);

      // Si retour de Stripe avec succès mais pas d'abonnement, synchroniser
      if (searchParams.get('subscription') === 'success' && !subscriptionData && data?.id) {
        syncSubscription(data.id);
      }
    }
  };

  const syncSubscription = async (educatorId: string) => {
    if (syncingSubscription) return;

    setSyncingSubscription(true);
    console.log('🔄 Synchronisation de l\'abonnement...');

    try {
      const response = await fetch('/api/sync-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ educatorId }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log('✅ Abonnement synchronisé, rechargement...');
        // Rafraîchir la page pour afficher le badge
        window.location.href = '/dashboard/educator';
      } else {
        console.error('❌ Erreur de synchronisation:', data.error);
      }
    } catch (error) {
      console.error('❌ Erreur:', error);
    } finally {
      setSyncingSubscription(false);
    }
  };

  const isPremium = subscription && ['active', 'trialing'].includes(subscription.status);

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3">
              {/* Menu mobile (hamburger) */}
              <div className="md:hidden">
                <EducatorMobileMenu profile={profile} isPremium={isPremium} onLogout={handleLogout} />
              </div>
              {/* Logo */}
              <div className="hidden md:block">
                <Logo href="/dashboard/educator" />
              </div>
            </div>
            {/* Menu desktop - caché sur mobile */}
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/dashboard/educator/profile" className="text-gray-700 hover:text-primary-600 px-3 py-2 font-medium transition">
                Mon profil
              </Link>
              {isPremium ? (
                <Link href="/dashboard/educator/subscription" className="text-gray-700 hover:text-primary-600 px-3 py-2 font-medium transition flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  Mon abonnement
                </Link>
              ) : (
                <Link href="/pricing" className="text-gray-700 hover:text-primary-600 px-3 py-2 font-medium transition flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Tarifs
                </Link>
              )}
              <button onClick={handleLogout} className="text-gray-700 hover:text-primary-600 px-3 py-2 font-medium transition">
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Message de synchronisation */}
        {syncingSubscription && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
            <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
            <p className="text-blue-800 font-medium">
              Synchronisation de votre abonnement en cours...
            </p>
          </div>
        )}

        <div className="mb-8 flex items-center gap-4">
          {/* Photo de profil */}
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={`${profile.first_name} ${profile.last_name}`}
              className="h-20 w-20 rounded-full object-cover border-2 border-primary-200"
            />
          ) : (
            <div className="h-20 w-20 rounded-full bg-primary-100 flex items-center justify-center border-2 border-primary-200">
              <span className="text-primary-600 font-semibold text-2xl">
                {profile?.first_name?.[0]}{profile?.last_name?.[0]}
              </span>
            </div>
          )}

          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900">
                Bienvenue, {profile?.first_name}
              </h1>
              {isPremium && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white text-sm font-bold rounded-full shadow-lg">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  Premium
                </span>
              )}
            </div>
            <p className="text-gray-600 mt-1">Tableau de bord éducateur</p>
          </div>
        </div>

        {/* Suivi de la vérification du diplôme */}
        {profile && profile.diploma_verification_status !== 'verified' && (
          <div className="mb-8 bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-300 rounded-lg p-6 shadow-md">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>

              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  ⚠️ Votre profil n'est pas encore visible des familles
                </h3>
                <p className="text-gray-700 mb-4">
                  Pour apparaître dans les résultats de recherche et être contacté par les familles, votre diplôme ME/ES doit être vérifié.
                </p>

                {/* Timeline de progression */}
                <div className="space-y-3">
                  {/* Étape 1: Upload */}
                  <div className="flex items-center gap-3">
                    {profile.diploma_url ? (
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    ) : (
                      <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-xs text-gray-600 font-bold">1</span>
                      </div>
                    )}
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${profile.diploma_url ? 'text-green-700' : 'text-gray-700'}`}>
                        {profile.diploma_url ? '✓ Diplôme uploadé' : 'Uploader votre diplôme'}
                      </p>
                      {!profile.diploma_url && (
                        <p className="text-xs text-gray-600 mt-0.5">
                          Rendez-vous dans la section "Mon diplôme"
                        </p>
                      )}
                    </div>
                    {!profile.diploma_url && (
                      <Link
                        href="/dashboard/educator/diploma"
                        className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 font-medium text-sm transition"
                      >
                        Uploader maintenant
                      </Link>
                    )}
                  </div>

                  {/* Étape 2: Analyse OCR */}
                  <div className="flex items-center gap-3">
                    {profile.diploma_ocr_text ? (
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    ) : (
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${profile.diploma_url ? 'bg-yellow-400 animate-pulse' : 'bg-gray-300'}`}>
                        <span className="text-xs text-white font-bold">2</span>
                      </div>
                    )}
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${profile.diploma_ocr_text ? 'text-green-700' : profile.diploma_url ? 'text-yellow-700' : 'text-gray-500'}`}>
                        {profile.diploma_ocr_text ? '✓ Analyse OCR effectuée' : profile.diploma_url ? 'Analyse OCR en cours...' : 'Analyse OCR automatique'}
                      </p>
                      {profile.diploma_ocr_confidence && (
                        <p className="text-xs text-gray-600 mt-0.5">
                          Confiance: {profile.diploma_ocr_confidence.toFixed(0)}%
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Étape 3: Envoi DREETS */}
                  <div className="flex items-center gap-3">
                    {profile.dreets_verification_sent_at ? (
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    ) : (
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${profile.diploma_ocr_text ? 'bg-yellow-400 animate-pulse' : 'bg-gray-300'}`}>
                        <span className="text-xs text-white font-bold">3</span>
                      </div>
                    )}
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${profile.dreets_verification_sent_at ? 'text-green-700' : profile.diploma_ocr_text ? 'text-yellow-700' : 'text-gray-500'}`}>
                        {profile.dreets_verification_sent_at ? '✓ Email envoyé à la DREETS' : profile.diploma_ocr_text ? 'Envoi à la DREETS en cours...' : 'Vérification DREETS'}
                      </p>
                      {profile.dreets_verification_sent_at && (
                        <p className="text-xs text-gray-600 mt-0.5">
                          Le {new Date(profile.dreets_verification_sent_at).toLocaleDateString('fr-FR')}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Étape 4: Validation admin */}
                  <div className="flex items-center gap-3">
                    {profile.diploma_verification_status === 'verified' ? (
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    ) : profile.diploma_verification_status === 'rejected' ? (
                      <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                    ) : (
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${profile.diploma_verification_status === 'pending' ? 'bg-yellow-400 animate-pulse' : 'bg-gray-300'}`}>
                        <span className="text-xs text-white font-bold">4</span>
                      </div>
                    )}
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${
                        profile.diploma_verification_status === 'verified' ? 'text-green-700' :
                        profile.diploma_verification_status === 'rejected' ? 'text-red-700' :
                        profile.diploma_verification_status === 'pending' ? 'text-yellow-700' :
                        'text-gray-500'
                      }`}>
                        {profile.diploma_verification_status === 'verified' ? '✓ Diplôme vérifié' :
                         profile.diploma_verification_status === 'rejected' ? '✗ Diplôme refusé' :
                         profile.diploma_verification_status === 'pending' ? 'En attente de validation admin (24-48h)' :
                         'Validation par notre équipe'}
                      </p>
                      {profile.diploma_verification_status === 'rejected' && profile.diploma_rejected_reason && (
                        <p className="text-xs text-red-600 mt-0.5">
                          Raison: {profile.diploma_rejected_reason}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Message d'encouragement */}
                {profile.diploma_verification_status === 'pending' && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-sm text-blue-800">
                      <strong>⏳ Patience !</strong> Notre équipe examine votre diplôme. Vous recevrez une notification par email dès validation (généralement sous 24-48h).
                    </p>
                  </div>
                )}

                {profile.diploma_verification_status === 'rejected' && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-800 mb-2">
                      <strong>❌ Diplôme refusé.</strong> Veuillez uploader un nouveau document conforme.
                    </p>
                    <Link
                      href="/dashboard/educator/diploma"
                      className="inline-block px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium text-sm transition"
                    >
                      Uploader un nouveau diplôme
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Message de succès si diplôme vérifié */}
        {profile && profile.diploma_verification_status === 'verified' && (
          <div className="mb-8 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg p-6 shadow-md">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-green-800 mb-1">
                  ✅ Diplôme vérifié ! Vous êtes visible des familles
                </h3>
                <p className="text-green-700 text-sm">
                  Votre profil apparaît maintenant dans les résultats de recherche. Les familles peuvent vous contacter !
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Vues du profil</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.profileViews}</p>
                {!isPremium && stats.profileViews > 0 && (
                  <p className="text-xs text-blue-600 mt-1">
                    {stats.profileViews >= 10 ? '🔥 Profil très consulté !' : '👀 Votre profil attire l\'attention'}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
                <svg className="h-6 w-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Note moyenne</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.rating.toFixed(1)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Avis reçus</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.reviews}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Limites d'usage (pour les comptes gratuits) */}
        {usageStats && !usageStats.isPremium && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  Votre utilisation ce mois-ci
                </h3>
                <p className="text-sm text-gray-600">
                  Passez Premium pour des réservations et conversations illimitées
                </p>
              </div>
              <Link
                href="/pricing"
                className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white text-sm font-bold rounded-lg hover:from-yellow-500 hover:to-yellow-600 shadow-md transition"
              >
                ⭐ Passer Premium
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Compteur réservations */}
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Réservations mensuelles
                  </span>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    usageStats.bookings.current >= usageStats.bookings.limit
                      ? 'bg-red-100 text-red-700'
                      : usageStats.bookings.current >= usageStats.bookings.limit * 0.7
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {usageStats.bookings.current}/{usageStats.bookings.limit}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      usageStats.bookings.current >= usageStats.bookings.limit
                        ? 'bg-red-500'
                        : usageStats.bookings.current >= usageStats.bookings.limit * 0.7
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                    }`}
                    style={{
                      width: `${Math.min((usageStats.bookings.current / usageStats.bookings.limit) * 100, 100)}%`
                    }}
                  ></div>
                </div>
                {usageStats.bookings.current >= usageStats.bookings.limit && (
                  <p className="text-xs text-red-600 mt-2 font-medium">
                    ⚠️ Limite atteinte ! Passez Premium pour continuer
                  </p>
                )}
              </div>

              {/* Compteur conversations */}
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Conversations actives
                  </span>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    usageStats.conversations.current >= usageStats.conversations.limit
                      ? 'bg-red-100 text-red-700'
                      : usageStats.conversations.current >= usageStats.conversations.limit * 0.7
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {usageStats.conversations.current}/{usageStats.conversations.limit}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      usageStats.conversations.current >= usageStats.conversations.limit
                        ? 'bg-red-500'
                        : usageStats.conversations.current >= usageStats.conversations.limit * 0.7
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                    }`}
                    style={{
                      width: `${Math.min((usageStats.conversations.current / usageStats.conversations.limit) * 100, 100)}%`
                    }}
                  ></div>
                </div>
                {usageStats.conversations.current >= usageStats.conversations.limit && (
                  <p className="text-xs text-red-600 mt-2 font-medium">
                    ⚠️ Limite atteinte ! Passez Premium pour continuer
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Actions rapides */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Actions rapides</h2>
          </div>
          <div className="p-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Link
              href="/dashboard/educator/profile"
              className="block p-6 bg-primary-50 rounded-lg hover:bg-primary-100 transition"
            >
              <div className="flex items-center">
                <svg className="h-8 w-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="ml-3 text-lg font-medium text-gray-900">Mon profil</span>
              </div>
            </Link>

            <Link
              href="/messages"
              className="block p-6 bg-primary-50 rounded-lg hover:bg-primary-100 transition"
            >
              <div className="flex items-center">
                <svg className="h-8 w-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <span className="ml-3 text-lg font-medium text-gray-900">Messages</span>
              </div>
            </Link>

            <Link
              href="/dashboard/educator/availability"
              className="block p-6 bg-primary-50 rounded-lg hover:bg-primary-100 transition"
            >
              <div className="flex items-center">
                <svg className="h-8 w-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="ml-3 text-lg font-medium text-gray-900">Mes disponibilités</span>
              </div>
            </Link>

            <Link
              href="/dashboard/educator/appointments"
              className="block p-6 bg-green-50 rounded-lg hover:bg-green-100 transition"
            >
              <div className="flex items-center">
                <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                <span className="ml-3 text-lg font-medium text-gray-900">Mes rendez-vous</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
