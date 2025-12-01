'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { signOut } from '@/lib/auth';
import Logo from '@/components/Logo';
import EducatorMobileMenu from '@/components/EducatorMobileMenu';
import { getEducatorUsageStats, FREE_PLAN_LIMITS } from '@/lib/subscription-utils';
import { getProfessionByValue } from '@/lib/professions-config';

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
        profileViews: data.total_views || 0,
      });

      const { count } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('educator_id', data.id);

      setStats(prev => ({ ...prev, bookings: count || 0 }));

      const { data: subscriptionData } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('educator_id', data.id)
        .in('status', ['active', 'trialing'])
        .limit(1)
        .maybeSingle();

      setSubscription(subscriptionData);

      const usage = await getEducatorUsageStats(data.id);
      setUsageStats(usage);

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3">
              <div className="md:hidden">
                <EducatorMobileMenu profile={profile} isPremium={isPremium} onLogout={handleLogout} />
              </div>
              <div className="hidden md:block">
                <Logo />
              </div>
            </div>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Message de synchronisation */}
        {syncingSubscription && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3">
            <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
            <p className="text-blue-800 font-medium">
              Synchronisation de votre abonnement en cours...
            </p>
          </div>
        )}

        {/* Header avec dégradé */}
        <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl sm:rounded-3xl p-6 sm:p-8 mb-6 shadow-xl">
          <div className="flex items-center gap-4">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={`${profile.first_name} ${profile.last_name}`}
                className="h-16 w-16 sm:h-20 sm:w-20 rounded-full object-cover border-4 border-white/30 shadow-lg"
              />
            ) : (
              <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-white/20 backdrop-blur flex items-center justify-center border-4 border-white/30 shadow-lg">
                <span className="text-white font-bold text-xl sm:text-2xl">
                  {profile?.first_name?.[0]}{profile?.last_name?.[0]}
                </span>
              </div>
            )}
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-bold text-white">
                  Bienvenue, {profile?.first_name}
                </h1>
                {isPremium && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-yellow-400 to-amber-500 text-white text-sm font-bold rounded-full shadow-lg">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    Premium
                  </span>
                )}
              </div>
              <p className="text-white/80 mt-1 text-sm sm:text-base">Tableau de bord {getProfessionByValue(profile?.profession_type)?.label?.toLowerCase() || 'professionnel'}</p>
            </div>
          </div>
        </div>

        {/* Stats en cartes */}
        <div className="grid grid-cols-2 gap-4 sm:gap-6 mb-6">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6 flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-500 font-medium">Rendez-vous</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.bookings}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6 flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-500 font-medium">Vues du profil</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.profileViews}</p>
            </div>
          </div>
        </div>

        {/* Alerte si profil non vérifié */}
        {profile && !profile.verification_badge && (
          <div className="mb-6 bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl p-5 sm:p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-amber-400 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Votre profil n'est pas encore visible des familles
                </h3>
                <p className="text-gray-700 text-sm sm:text-base mb-4">
                  Pour garantir la sécurité des enfants, complétez notre processus de vérification en 4 étapes.
                </p>
                <Link
                  href="/dashboard/educator/verification"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-white rounded-xl hover:bg-amber-600 font-semibold text-sm transition shadow-md"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Commencer ma vérification
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Message de succès si profil vérifié */}
        {profile && profile.verification_badge && (
          <div className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-5 sm:p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-green-800 flex items-center gap-2">
                  Profil vérifié !
                  <span className="inline-flex items-center px-2.5 py-0.5 bg-green-600 text-white text-xs font-bold rounded-full">
                    Vérifié
                  </span>
                </h3>
                <p className="text-green-700 text-sm">
                  Votre profil est visible des familles avec le badge de confiance.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Limites d'usage (pour les comptes gratuits) */}
        {usageStats && !usageStats.isPremium && (
          <div className="bg-white rounded-2xl shadow-sm p-5 sm:p-6 mb-6">
            <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Votre utilisation ce mois-ci
                </h3>
                <p className="text-sm text-gray-500">
                  Passez Premium pour des fonctionnalités illimitées
                </p>
              </div>
              <Link
                href="/pricing"
                className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-amber-500 text-white text-sm font-bold rounded-xl hover:from-yellow-500 hover:to-amber-600 shadow-md transition"
              >
                Passer Premium
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Réservations</span>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    usageStats.bookings.current >= usageStats.bookings.limit
                      ? 'bg-red-100 text-red-700'
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {usageStats.bookings.current}/{usageStats.bookings.limit}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      usageStats.bookings.current >= usageStats.bookings.limit ? 'bg-red-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min((usageStats.bookings.current / usageStats.bookings.limit) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Conversations</span>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    usageStats.conversations.current >= usageStats.conversations.limit
                      ? 'bg-red-100 text-red-700'
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {usageStats.conversations.current}/{usageStats.conversations.limit}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      usageStats.conversations.current >= usageStats.conversations.limit ? 'bg-red-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min((usageStats.conversations.current / usageStats.conversations.limit) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Actions rapides */}
        <div className="bg-white rounded-2xl shadow-sm p-5 sm:p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Actions rapides</h2>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {/* Mon profil */}
            <Link
              href="/dashboard/educator/profile"
              className="flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition group"
            >
              <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <span className="font-semibold text-gray-900 text-sm sm:text-base">Mon profil</span>
            </Link>

            {/* Vérification */}
            <Link
              href="/dashboard/educator/verification"
              className={`flex items-center gap-3 p-4 rounded-xl transition group ${
                profile?.verification_badge
                  ? 'bg-green-50 hover:bg-green-100'
                  : 'bg-amber-50 hover:bg-amber-100'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition ${
                profile?.verification_badge ? 'bg-green-500' : 'bg-amber-500'
              }`}>
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <span className="font-semibold text-gray-900 text-sm sm:text-base">
                {profile?.verification_badge ? 'Vérification' : 'Vérification'}
              </span>
            </Link>

            {/* Disponibilités */}
            <Link
              href="/dashboard/educator/availability"
              className="flex items-center gap-3 p-4 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition group"
            >
              <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="font-semibold text-gray-900 text-sm sm:text-base">Disponibilités</span>
            </Link>

            {/* Messages */}
            <Link
              href="/messages"
              className="flex items-center gap-3 p-4 bg-pink-50 hover:bg-pink-100 rounded-xl transition group"
            >
              <div className="w-10 h-10 bg-pink-500 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <span className="font-semibold text-gray-900 text-sm sm:text-base">Messages</span>
            </Link>

            {/* Rendez-vous */}
            <Link
              href="/dashboard/educator/appointments"
              className="flex items-center gap-3 p-4 bg-green-50 hover:bg-green-100 rounded-xl transition group"
            >
              <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <span className="font-semibold text-gray-900 text-sm sm:text-base">Mes rendez-vous</span>
            </Link>

            {/* Factures */}
            <Link
              href="/dashboard/educator/invoices"
              className="flex items-center gap-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-xl transition group"
            >
              <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="font-semibold text-gray-900 text-sm sm:text-base">Mes factures</span>
            </Link>

            {/* Agrément SAP */}
            <Link
              href="/educators/sap-accreditation"
              className="flex items-center gap-3 p-4 bg-cyan-50 hover:bg-cyan-100 rounded-xl transition group col-span-2 sm:col-span-1"
            >
              <div className="w-10 h-10 bg-cyan-500 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900 text-sm sm:text-base">Agrément SAP</span>
                <span className="text-cyan-600 text-xs font-semibold px-2 py-0.5 bg-cyan-100 rounded-full">Info</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
