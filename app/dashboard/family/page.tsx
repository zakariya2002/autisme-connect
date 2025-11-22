'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { signOut } from '@/lib/auth';
import Logo from '@/components/Logo';
import FamilyMobileMenu from '@/components/FamilyMobileMenu';

export default function FamilyDashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({
    appointments: 0,
    messages: 0,
  });
  const [appointments, setAppointments] = useState<any[]>([]);

  useEffect(() => {
    fetchProfile();
    fetchStats();
    fetchAppointments();
  }, []);

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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="h-20 w-20 rounded-full bg-primary-100 flex items-center justify-center border-2 border-primary-200">
              <span className="text-primary-600 font-semibold text-2xl">
                {profile?.first_name?.[0]?.toUpperCase()}{profile?.last_name?.[0]?.toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Bienvenue, {profile?.first_name}
              </h1>
              <p className="text-gray-600 mt-1">Tableau de bord famille</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
                <svg className="h-6 w-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Rendez-vous</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.appointments}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
                <svg className="h-6 w-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Conversations</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.messages}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Actions rapides</h2>
          </div>
          <div className="p-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Link
              href="/dashboard/family/profile"
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
              href="/search"
              className="block p-6 bg-primary-50 rounded-lg hover:bg-primary-100 transition"
            >
              <div className="flex items-center">
                <svg className="h-8 w-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="ml-3 text-lg font-medium text-gray-900">Chercher un éducateur</span>
              </div>
            </Link>

            <Link
              href="/bookings"
              className="block p-6 bg-primary-50 rounded-lg hover:bg-primary-100 transition"
            >
              <div className="flex items-center">
                <svg className="h-8 w-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="ml-3 text-lg font-medium text-gray-900">Mes rendez-vous</span>
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
          </div>
        </div>

        {/* Liste des rendez-vous */}
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Mes rendez-vous</h2>
          </div>
          <div className="p-6">
            {appointments.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun rendez-vous</h3>
                <p className="mt-1 text-sm text-gray-500">Commencez par chercher un éducateur.</p>
                <div className="mt-6">
                  <Link
                    href="/search"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                  >
                    Chercher un éducateur
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
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
                    <div key={appointment.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
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
