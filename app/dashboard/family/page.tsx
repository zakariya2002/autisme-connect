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
  const [appointments, setAppointments] = useState<any[]>([]);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  useEffect(() => {
    fetchProfile();
    fetchStats();
    fetchAppointments();

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

  const fetchAppointments = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    const { data: familyProfile } = await supabase
      .from('family_profiles')
      .select('id')
      .eq('user_id', session.user.id)
      .single();

    if (familyProfile) {
      const { data } = await supabase
        .from('appointments')
        .select(`
          *,
          educator:educator_profiles(
            first_name,
            last_name,
            profile_image_url,
            avatar_url
          )
        `)
        .eq('family_id', familyProfile.id)
        .order('appointment_date', { ascending: false });

      setAppointments(data || []);
    }
  };

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Message de succès après paiement */}
        {showSuccessMessage && (
          <div className="mb-6 bg-green-50 border-2 border-green-200 rounded-lg p-6 animate-fade-in">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-green-900 mb-2">
                  🎉 Réservation confirmée !
                </h3>
                <p className="text-green-800 mb-3">
                  Votre paiement a été effectué avec succès et votre rendez-vous a été réservé.
                </p>
                <div className="bg-white border border-green-200 rounded-md p-3 text-sm text-gray-700">
                  <p className="mb-2">
                    <strong>Prochaines étapes :</strong>
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>L'éducateur va recevoir votre demande de rendez-vous</li>
                    <li>Vous recevrez une notification par email une fois le rendez-vous accepté</li>
                    <li>Vous pourrez consulter tous vos rendez-vous ci-dessous</li>
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

        <div className="mb-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 shadow-2xl relative overflow-hidden animate-fade-in">
          {/* Animated background circles */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '700ms' }}></div>
          </div>

          <div className="flex items-center gap-6 relative z-10">
            <div className="relative">
              <div className="absolute inset-0 bg-white/30 rounded-full blur-xl animate-pulse"></div>
              <div className="h-24 w-24 rounded-full bg-white flex items-center justify-center border-4 border-white shadow-2xl relative z-10">
                <span className="text-primary-600 font-bold text-3xl">
                  {profile?.first_name?.[0]?.toUpperCase()}{profile?.last_name?.[0]?.toUpperCase()}
                </span>
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white drop-shadow-lg">
                Bienvenue, {profile?.first_name} 👋
              </h1>
              <p className="text-blue-100 mt-2 font-medium text-lg">Tableau de bord famille</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-12">
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl shadow-xl p-8 border-2 border-green-200 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-500 rounded-xl p-4 shadow-lg">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-5">
                <p className="text-sm font-bold text-green-700 uppercase tracking-wide">Rendez-vous</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-4xl font-bold text-green-900">{stats.appointments}</p>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-200 text-green-800">
                    Total
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl shadow-xl p-8 border-2 border-amber-200 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-amber-500 rounded-xl p-4 shadow-lg">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <div className="ml-5">
                <p className="text-sm font-bold text-amber-700 uppercase tracking-wide">Conversations</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-4xl font-bold text-amber-900">{stats.messages}</p>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-200 text-amber-800">
                    Total
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="bg-white rounded-2xl shadow-xl mb-12">
          <div className="px-8 py-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-2xl">
            <h2 className="text-2xl font-bold text-white drop-shadow-lg">Actions rapides</h2>
          </div>
          <div className="p-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Link
              href="/dashboard/family/profile"
              className="block p-8 bg-gradient-to-br from-pink-50 to-pink-100 rounded-2xl hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] border-2 border-pink-200"
            >
              <div className="flex items-center">
                <div className="w-16 h-16 bg-pink-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                  <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <span className="ml-5 text-xl font-bold text-gray-900">Mon profil</span>
              </div>
            </Link>

            <Link
              href="/search"
              className="block p-8 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] border-2 border-blue-200"
            >
              <div className="flex items-center">
                <div className="w-16 h-16 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                  <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <span className="ml-5 text-xl font-bold text-gray-900">Chercher un éducateur</span>
              </div>
            </Link>

            <Link
              href="/bookings"
              className="block p-8 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] border-2 border-green-200"
            >
              <div className="flex items-center">
                <div className="w-16 h-16 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                  <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="ml-5 text-xl font-bold text-gray-900">Mes rendez-vous</span>
              </div>
            </Link>

            <Link
              href="/messages"
              className="block p-8 bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] border-2 border-amber-200"
            >
              <div className="flex items-center">
                <div className="w-16 h-16 bg-amber-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                  <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <span className="ml-5 text-xl font-bold text-gray-900">Messages</span>
              </div>
            </Link>

            <Link
              href="/dashboard/family/receipts"
              className="block p-8 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] border-2 border-purple-200"
            >
              <div className="flex items-center">
                <div className="w-16 h-16 bg-purple-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                  <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <span className="ml-5 text-xl font-bold text-gray-900">Mes reçus</span>
              </div>
            </Link>

            <Link
              href="/familles/aides-financieres"
              className="block p-8 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] border-2 border-indigo-200"
            >
              <div className="flex items-center">
                <div className="w-16 h-16 bg-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                  <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="ml-5 text-xl font-bold text-gray-900">Aides financières</span>
              </div>
            </Link>
          </div>
        </div>

        {/* Liste des rendez-vous */}
        <div className="bg-white rounded-2xl shadow-xl">
          <div className="px-8 py-6 bg-gradient-to-r from-green-500 to-teal-600 rounded-t-2xl">
            <h2 className="text-2xl font-bold text-white drop-shadow-lg">Mes rendez-vous</h2>
          </div>
          <div className="p-8">
            {appointments.length === 0 ? (
              <div className="text-center py-16">
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-gray-100 rounded-full blur-2xl opacity-50"></div>
                  <svg className="mx-auto h-20 w-20 text-gray-400 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-bold text-gray-900">Aucun rendez-vous</h3>
                <p className="mt-2 text-base text-gray-600">Commencez par chercher un éducateur.</p>
                <div className="mt-8">
                  <Link
                    href="/search"
                    className="inline-flex items-center px-6 py-3 border border-transparent shadow-lg text-base font-semibold rounded-xl text-white bg-primary-600 hover:bg-primary-700 transition-all duration-300 hover:scale-105"
                  >
                    Chercher un éducateur
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {appointments.map((appointment) => {
                  const appointmentDate = new Date(appointment.appointment_date);
                  const statusColors: Record<string, string> = {
                    pending: 'bg-yellow-100 text-yellow-800',
                    accepted: 'bg-green-100 text-green-800',
                    rejected: 'bg-red-100 text-red-800',
                    cancelled: 'bg-red-100 text-red-800',
                    completed: 'bg-blue-100 text-blue-800',
                  };
                  const statusLabels: Record<string, string> = {
                    pending: 'En attente',
                    accepted: 'Accepté',
                    rejected: 'Refusé',
                    cancelled: 'Annulé',
                    completed: 'Terminé',
                  };

                  return (
                    <div key={appointment.id} className="border-2 border-gray-200 rounded-2xl p-6 hover:shadow-2xl transition-all duration-300 hover:border-primary-300 bg-gradient-to-br from-white to-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0">
                            {appointment.educator?.avatar_url || appointment.educator?.profile_image_url ? (
                              <img
                                src={appointment.educator.avatar_url || appointment.educator.profile_image_url}
                                alt={`${appointment.educator.first_name} ${appointment.educator.last_name}`}
                                className="h-12 w-12 rounded-full object-cover"
                              />
                            ) : (
                              <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                                <span className="text-lg font-medium text-primary-600">
                                  {appointment.educator?.first_name?.[0]}{appointment.educator?.last_name?.[0]}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-medium text-gray-900">
                              {appointment.educator?.first_name} {appointment.educator?.last_name}
                            </h3>
                            <div className="mt-1 flex items-center text-sm text-gray-500">
                              <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {appointmentDate.toLocaleDateString('fr-FR', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </div>
                            <div className="mt-1 flex items-center text-sm text-gray-500">
                              <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {appointment.start_time} - {appointment.end_time}
                            </div>
                            {appointment.address && (
                              <div className="mt-1 flex items-center text-sm text-gray-500">
                                <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                {appointment.address}
                              </div>
                            )}
                            {appointment.notes && (
                              <div className="mt-2 text-sm text-gray-600">
                                <p className="italic">{appointment.notes}</p>
                              </div>
                            )}
                          </div>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[appointment.status] || 'bg-gray-100 text-gray-800'}`}>
                          {statusLabels[appointment.status] || appointment.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
