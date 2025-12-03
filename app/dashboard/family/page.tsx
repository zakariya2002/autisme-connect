'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { signOut } from '@/lib/auth';
import Logo from '@/components/Logo';
import FamilyMobileMenu from '@/components/FamilyMobileMenu';

export default function FamilyDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({
    appointments: 0,
    messages: 0,
  });
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  useEffect(() => {
    fetchProfile();
    fetchStats();

    // Vérifier si on vient d'un paiement réussi
    if (searchParams.get('booking') === 'success') {
      setShowSuccessMessage(true);
    }
  }, []);

  const handleCloseSuccessMessage = () => {
    setShowSuccessMessage(false);
    // Nettoyer l'URL
    router.replace('/dashboard/family');
  };

  const fetchProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      router.push('/auth/login');
      return;
    }

    const { data } = await supabase
      .from('family_profiles')
      .select('*')
      .eq('user_id', session.user.id)
      .single();

    setProfile(data);
  };

  const fetchStats = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    const { data: familyProfile } = await supabase
      .from('family_profiles')
      .select('id')
      .eq('user_id', session.user.id)
      .single();

    if (familyProfile) {
      const { count: appointmentsCount } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('family_id', familyProfile.id);

      const { count: messagesCount } = await supabase
        .from('conversations')
        .select('*', { count: 'exact', head: true })
        .eq('family_id', familyProfile.id);

      setStats({
        appointments: appointmentsCount || 0,
        messages: messagesCount || 0,
      });
    }
  };

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
                <FamilyMobileMenu profile={profile} onLogout={handleLogout} />
              </div>
              {/* Logo */}
              <div className="hidden md:block">
                <Logo />
              </div>
            </div>
            {/* Menu desktop - caché sur mobile */}
            <div className="hidden md:flex space-x-4">
              <Link href="/dashboard/family/profile" className="text-gray-700 hover:text-primary-600 px-3 py-2 font-medium transition">
                Mon profil
              </Link>
              <button onClick={handleLogout} className="text-gray-700 hover:text-primary-600 px-3 py-2 font-medium transition">
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Message de succès après paiement */}
        {showSuccessMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-green-900 mb-1">
                  Réservation confirmée !
                </h3>
                <p className="text-sm text-green-800 mb-2">
                  Votre paiement a été effectué avec succès et votre rendez-vous a été réservé.
                </p>
                <div className="bg-white border border-green-200 rounded-lg p-3 text-sm text-gray-700">
                  <p className="mb-1 font-medium">Prochaines étapes :</p>
                  <ul className="list-disc list-inside space-y-0.5 ml-1 text-xs">
                    <li>L'éducateur va recevoir votre demande de rendez-vous</li>
                    <li>Vous recevrez une notification par email une fois le rendez-vous accepté</li>
                  </ul>
                </div>
              </div>
              <button
                onClick={handleCloseSuccessMessage}
                className="flex-shrink-0 text-green-600 hover:text-green-800 transition"
                aria-label="Fermer le message"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Bandeau de bienvenue */}
        <div className="mb-8 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          </div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-white/20 backdrop-blur flex items-center justify-center border-4 border-white/30 shadow-lg">
              <span className="text-white font-bold text-xl sm:text-2xl">
                {profile?.first_name?.[0]?.toUpperCase()}{profile?.last_name?.[0]?.toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                Bienvenue, {profile?.first_name}
              </h1>
              <p className="text-white/80 text-sm sm:text-base mt-1">Tableau de bord aidant</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {/* Rendez-vous */}
          <div className="bg-blue-50 rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-500">Rendez-vous</p>
              <p className="text-2xl font-bold text-gray-900">{stats.appointments}</p>
            </div>
          </div>

          {/* Conversations */}
          <div className="bg-amber-50 rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <svg className="h-5 w-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-500">Conversations</p>
              <p className="text-2xl font-bold text-gray-900">{stats.messages}</p>
            </div>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Actions rapides</h2>
          </div>
          <div className="p-4 grid grid-cols-2 gap-3">
            {/* Mon profil */}
            <Link
              href="/dashboard/family/profile"
              className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
            >
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <span className="font-medium text-gray-900">Mon profil</span>
            </Link>

            {/* Mes enfants */}
            <Link
              href="/dashboard/family/children"
              className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors"
            >
              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <span className="font-medium text-gray-900">Mes enfants</span>
            </Link>

            {/* Chercher un éducateur */}
            <Link
              href="/search"
              className="flex items-center gap-3 p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors"
            >
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <span className="font-medium text-gray-900">Trouver un professionnel</span>
            </Link>

            {/* Mes favoris */}
            <Link
              href="/dashboard/family/favorites"
              className="flex items-center gap-3 p-4 bg-yellow-50 rounded-xl hover:bg-yellow-100 transition-colors"
            >
              <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <span className="font-medium text-gray-900">Mes favoris</span>
            </Link>

            {/* Messages */}
            <Link
              href="/messages"
              className="flex items-center gap-3 p-4 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors"
            >
              <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <span className="font-medium text-gray-900">Messages</span>
            </Link>

            {/* Mes rendez-vous */}
            <Link
              href="/bookings"
              className="flex items-center gap-3 p-4 bg-teal-50 rounded-xl hover:bg-teal-100 transition-colors"
            >
              <div className="w-10 h-10 bg-teal-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="font-medium text-gray-900">Mes rendez-vous</span>
            </Link>

            {/* Mes reçus */}
            <Link
              href="/dashboard/family/receipts"
              className="flex items-center gap-3 p-4 bg-pink-50 rounded-xl hover:bg-pink-100 transition-colors"
            >
              <div className="w-10 h-10 bg-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="font-medium text-gray-900">Mes reçus</span>
            </Link>

            {/* Aides financières */}
            <Link
              href="/familles/aides-financieres"
              className="flex items-center gap-3 p-4 bg-violet-50 rounded-xl hover:bg-violet-100 transition-colors"
            >
              <div className="w-10 h-10 bg-violet-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900">Aides financières</span>
                <span className="text-xs bg-violet-200 text-violet-700 px-2 py-0.5 rounded-full font-medium">Info</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
