'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

type AppointmentStatus = 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';

export default function AppointmentsPage() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [filter, setFilter] = useState<'all' | AppointmentStatus>('all');

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (userProfile) {
      fetchAppointments();
    }
  }, [userProfile]);

  const fetchCurrentUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        router.push('/auth/login');
        return;
      }

      const role = session.user.user_metadata?.role;
      const table = role === 'educator' ? 'educator_profiles' : 'family_profiles';

      const { data: profile } = await supabase
        .from(table)
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      setUserProfile({ ...profile, role });
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const isEducator = userProfile.role === 'educator';
      const field = isEducator ? 'educator_id' : 'family_id';

      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          educator:educator_profiles(
            id,
            first_name,
            last_name,
            phone,
            profile_image_url,
            avatar_url
          ),
          family:family_profiles(
            id,
            first_name,
            last_name,
            phone
          )
        `)
        .eq(field, userProfile.id)
        .order('appointment_date', { ascending: false });

      if (error) throw error;

      setAppointments(data || []);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateAppointmentStatus = async (appointmentId: string, status: AppointmentStatus) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', appointmentId);

      if (error) throw error;

      alert(`Rendez-vous ${status === 'accepted' ? 'accepté' : status === 'rejected' ? 'refusé' : status === 'cancelled' ? 'annulé' : 'mis à jour'} avec succès!`);
      fetchAppointments();
    } catch (error: any) {
      alert('Erreur: ' + error.message);
    }
  };

  const getStatusBadgeColor = (status: AppointmentStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: AppointmentStatus) => {
    switch (status) {
      case 'pending':
        return 'En attente';
      case 'accepted':
        return 'Accepté';
      case 'rejected':
        return 'Refusé';
      case 'cancelled':
        return 'Annulé';
      case 'completed':
        return 'Terminé';
      default:
        return status;
    }
  };

  const filteredAppointments = filter === 'all'
    ? appointments
    : appointments.filter(apt => apt.status === filter);

  if (loading && !userProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-blue-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-primary-600 flex items-center">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center mr-2">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                Autisme Connect
              </Link>
            </div>
            <div className="flex space-x-4">
              <Link
                href={userProfile?.role === 'educator' ? '/dashboard/educator' : '/dashboard/family'}
                className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md font-medium transition"
              >
                Tableau de bord
              </Link>
              <Link
                href="/search"
                className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md font-medium transition"
              >
                Recherche
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Mes rendez-vous</h1>
          <p className="text-gray-600">Gérez vos rendez-vous et consultez leur statut</p>
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-md font-medium transition ${
                filter === 'all'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Tous ({appointments.length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-md font-medium transition ${
                filter === 'pending'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
              }`}
            >
              En attente ({appointments.filter(a => a.status === 'pending').length})
            </button>
            <button
              onClick={() => setFilter('accepted')}
              className={`px-4 py-2 rounded-md font-medium transition ${
                filter === 'accepted'
                  ? 'bg-green-600 text-white'
                  : 'bg-green-100 text-green-800 hover:bg-green-200'
              }`}
            >
              Acceptés ({appointments.filter(a => a.status === 'accepted').length})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 rounded-md font-medium transition ${
                filter === 'completed'
                  ? 'bg-blue-600 text-white'
                  : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
              }`}
            >
              Terminés ({appointments.filter(a => a.status === 'completed').length})
            </button>
          </div>
        </div>

        {/* Liste des rendez-vous */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="text-gray-500 mt-4">Chargement...</p>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Aucun rendez-vous</h3>
              <p className="text-gray-500 mt-2">
                {filter === 'all'
                  ? 'Vous n\'avez pas encore de rendez-vous.'
                  : `Aucun rendez-vous avec le statut "${getStatusLabel(filter as AppointmentStatus)}".`
                }
              </p>
              {userProfile?.role === 'family' && filter === 'all' && (
                <Link
                  href="/search"
                  className="mt-6 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                >
                  Chercher un éducateur
                </Link>
              )}
            </div>
          ) : (
            filteredAppointments.map((appointment) => {
              const isEducator = userProfile.role === 'educator';
              const otherParty = isEducator ? appointment.family : appointment.educator;
              const appointmentDate = new Date(appointment.appointment_date);

              return (
                <div key={appointment.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start space-x-4 flex-1">
                      {/* Photo */}
                      <div className="flex-shrink-0">
                        {!isEducator && (otherParty?.avatar_url || otherParty?.profile_image_url) ? (
                          <img
                            src={otherParty.avatar_url || otherParty.profile_image_url}
                            alt={`${otherParty.first_name} ${otherParty.last_name}`}
                            className="h-16 w-16 rounded-full object-cover border-2 border-primary-200"
                          />
                        ) : (
                          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center border-2 border-primary-200">
                            <span className="text-xl font-bold text-white">
                              {otherParty?.first_name?.[0]}{otherParty?.last_name?.[0]}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Détails */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold text-gray-900">
                            {isEducator ? 'Famille' : 'Éducateur'}: {otherParty?.first_name} {otherParty?.last_name}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(appointment.status)}`}>
                            {getStatusLabel(appointment.status)}
                          </span>
                        </div>

                        <div className="space-y-2 text-gray-600">
                          <div className="flex items-center">
                            <svg className="h-5 w-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="font-medium">
                              {appointmentDate.toLocaleDateString('fr-FR', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </span>
                          </div>

                          <div className="flex items-center">
                            <svg className="h-5 w-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{appointment.start_time} - {appointment.end_time}</span>
                          </div>

                          {appointment.address && (
                            <div className="flex items-center">
                              <svg className="h-5 w-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <span>{appointment.address}</span>
                            </div>
                          )}

                          {appointment.notes && (
                            <div className="mt-3 p-3 bg-gray-50 rounded-md">
                              <p className="text-sm italic text-gray-700">{appointment.notes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="ml-4 flex flex-col gap-2">
                      {isEducator && appointment.status === 'pending' && (
                        <>
                          <button
                            onClick={() => updateAppointmentStatus(appointment.id, 'accepted')}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm whitespace-nowrap font-medium transition shadow-sm hover:shadow"
                          >
                            ✓ Accepter
                          </button>
                          <button
                            onClick={() => updateAppointmentStatus(appointment.id, 'rejected')}
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm whitespace-nowrap font-medium transition shadow-sm hover:shadow"
                          >
                            ✗ Refuser
                          </button>
                        </>
                      )}

                      {!isEducator && appointment.status === 'pending' && (
                        <button
                          onClick={() => updateAppointmentStatus(appointment.id, 'cancelled')}
                          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm whitespace-nowrap font-medium transition shadow-sm hover:shadow"
                        >
                          Annuler
                        </button>
                      )}

                      {appointment.status === 'accepted' && (
                        <button
                          onClick={() => updateAppointmentStatus(appointment.id, 'completed')}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm whitespace-nowrap font-medium transition shadow-sm hover:shadow"
                        >
                          ✓ Marquer terminé
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
