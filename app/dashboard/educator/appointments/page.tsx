'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import Logo from '@/components/Logo';

interface Appointment {
  id: string;
  family_id: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
  location_type: 'home' | 'office' | 'online';
  address: string | null;
  notes: string | null;
  family_notes: string | null;
  educator_notes: string | null;
  rejection_reason: string | null;
  created_at: string;
  family_first_name: string;
  family_last_name: string;
  family_phone: string;
}

export default function EducatorAppointmentsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [educatorId, setEducatorId] = useState('');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'completed'>('all');

  // Modal states
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [educatorNotes, setEducatorNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchEducatorProfile();
  }, []);

  useEffect(() => {
    if (educatorId) {
      fetchAppointments();
    }
  }, [educatorId, filter]);

  const fetchEducatorProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login');
        return;
      }

      const { data: profile } = await supabase
        .from('educator_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        setEducatorId(profile.id);
      } else {
        router.push('/dashboard/family');
      }
    } catch (error) {
      console.error('Erreur:', error);
      router.push('/auth/login');
    }
  };

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('appointments_with_details')
        .select('*')
        .eq('educator_id', educatorId)
        .order('appointment_date', { ascending: true })
        .order('start_time', { ascending: true });

      // Appliquer le filtre
      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;

      if (error) throw error;

      setAppointments(data || []);
    } catch (error) {
      console.error('Erreur chargement rendez-vous:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (appointmentId: string) => {
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'accepted' })
        .eq('id', appointmentId);

      if (error) throw error;

      alert('Rendez-vous accepté !');
      fetchAppointments();
    } catch (error: any) {
      alert('Erreur: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedAppointment || !rejectionReason.trim()) {
      alert('Veuillez indiquer une raison du refus');
      return;
    }

    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('appointments')
        .update({
          status: 'rejected',
          rejection_reason: rejectionReason.trim()
        })
        .eq('id', selectedAppointment.id);

      if (error) throw error;

      alert('Rendez-vous refusé');
      setShowRejectModal(false);
      setRejectionReason('');
      setSelectedAppointment(null);
      fetchAppointments();
    } catch (error: any) {
      alert('Erreur: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async (appointmentId: string) => {
    if (!confirm('Marquer ce rendez-vous comme terminé ?')) return;

    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'completed' })
        .eq('id', appointmentId);

      if (error) throw error;

      alert('Rendez-vous marqué comme terminé');
      fetchAppointments();
    } catch (error: any) {
      alert('Erreur: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async (appointmentId: string) => {
    if (!confirm('Annuler ce rendez-vous ?')) return;

    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('id', appointmentId);

      if (error) throw error;

      alert('Rendez-vous annulé');
      fetchAppointments();
    } catch (error: any) {
      alert('Erreur: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedAppointment) return;

    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ educator_notes: educatorNotes.trim() || null })
        .eq('id', selectedAppointment.id);

      if (error) throw error;

      alert('Notes enregistrées');
      setShowNotesModal(false);
      setEducatorNotes('');
      setSelectedAppointment(null);
      fetchAppointments();
    } catch (error: any) {
      alert('Erreur: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      pending: 'En attente',
      accepted: 'Accepté',
      rejected: 'Refusé',
      completed: 'Terminé',
      cancelled: 'Annulé'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      accepted: 'bg-green-100 text-green-800 border-green-300',
      rejected: 'bg-red-100 text-red-800 border-red-300',
      completed: 'bg-blue-100 text-blue-800 border-blue-300',
      cancelled: 'bg-gray-100 text-gray-800 border-gray-300'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getLocationTypeLabel = (type: string) => {
    const labels = {
      home: 'À domicile',
      office: 'Au cabinet',
      online: 'En ligne'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getLocationTypeIcon = (type: string) => {
    if (type === 'home') {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      );
    }
    if (type === 'office') {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      );
    }
    return (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    );
  };

  const isPastAppointment = (date: string, time: string) => {
    const appointmentDateTime = new Date(`${date}T${time}`);
    return appointmentDateTime < new Date();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Logo href="/dashboard/educator" />
            </div>
            <div className="flex space-x-4">
              <Link href="/dashboard/educator" className="text-gray-700 hover:text-primary-600 px-3 py-2">
                Tableau de bord
              </Link>
              <Link href="/dashboard/educator/availability" className="text-gray-700 hover:text-primary-600 px-3 py-2">
                Disponibilités
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mes rendez-vous</h1>
          <p className="text-gray-600 mt-2">Gérez vos demandes et rendez-vous avec les familles</p>
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-md font-medium transition ${
                filter === 'all'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Tous
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-md font-medium transition ${
                filter === 'pending'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              En attente
            </button>
            <button
              onClick={() => setFilter('accepted')}
              className={`px-4 py-2 rounded-md font-medium transition ${
                filter === 'accepted'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Acceptés
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 rounded-md font-medium transition ${
                filter === 'completed'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Terminés
            </button>
          </div>
        </div>

        {/* Liste des rendez-vous */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement...</p>
          </div>
        ) : appointments.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <svg className="w-20 h-20 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun rendez-vous</h3>
            <p className="text-gray-600">
              {filter === 'all'
                ? "Vous n'avez aucun rendez-vous pour le moment."
                : `Vous n'avez aucun rendez-vous ${getStatusLabel(filter).toLowerCase()}.`
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((appointment) => {
              const isPast = isPastAppointment(appointment.appointment_date, appointment.end_time);

              return (
                <div key={appointment.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">
                          {appointment.family_first_name} {appointment.family_last_name}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(appointment.status)}`}>
                          {getStatusLabel(appointment.status)}
                        </span>
                      </div>
                      <div className="flex items-center text-gray-600 gap-4 text-sm">
                        <div className="flex items-center">
                          <svg className="w-5 h-5 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="font-medium">
                            {new Date(appointment.appointment_date + 'T00:00:00').toLocaleDateString('fr-FR', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <svg className="w-5 h-5 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="font-medium">
                            {appointment.start_time.substring(0, 5)} - {appointment.end_time.substring(0, 5)}
                          </span>
                        </div>
                      </div>
                    </div>
                    {isPast && appointment.status === 'accepted' && (
                      <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold border border-orange-300">
                        Passé
                      </span>
                    )}
                  </div>

                  {/* Détails */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center text-gray-700">
                      {getLocationTypeIcon(appointment.location_type)}
                      <span className="ml-2 font-medium">{getLocationTypeLabel(appointment.location_type)}</span>
                    </div>

                    {appointment.address && (
                      <div className="flex items-start text-gray-700">
                        <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>{appointment.address}</span>
                      </div>
                    )}

                    {appointment.family_phone && (
                      <div className="flex items-center text-gray-700">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <a href={`tel:${appointment.family_phone}`} className="hover:text-primary-600">
                          {appointment.family_phone}
                        </a>
                      </div>
                    )}

                    {appointment.family_notes && (
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm font-semibold text-blue-900 mb-1">Note de la famille :</p>
                        <p className="text-sm text-blue-800">{appointment.family_notes}</p>
                      </div>
                    )}

                    {appointment.educator_notes && (
                      <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-sm font-semibold text-green-900 mb-1">Mes notes :</p>
                        <p className="text-sm text-green-800">{appointment.educator_notes}</p>
                      </div>
                    )}

                    {appointment.rejection_reason && (
                      <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                        <p className="text-sm font-semibold text-red-900 mb-1">Raison du refus :</p>
                        <p className="text-sm text-red-800">{appointment.rejection_reason}</p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
                    {appointment.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleAccept(appointment.id)}
                          disabled={actionLoading}
                          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 font-medium"
                        >
                          Accepter
                        </button>
                        <button
                          onClick={() => {
                            setSelectedAppointment(appointment);
                            setShowRejectModal(true);
                          }}
                          disabled={actionLoading}
                          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 font-medium"
                        >
                          Refuser
                        </button>
                      </>
                    )}

                    {appointment.status === 'accepted' && !isPast && (
                      <>
                        <button
                          onClick={() => handleComplete(appointment.id)}
                          disabled={actionLoading}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 font-medium"
                        >
                          Marquer comme terminé
                        </button>
                        <button
                          onClick={() => handleCancel(appointment.id)}
                          disabled={actionLoading}
                          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 font-medium"
                        >
                          Annuler
                        </button>
                      </>
                    )}

                    {(appointment.status === 'accepted' || appointment.status === 'completed') && (
                      <button
                        onClick={() => {
                          setSelectedAppointment(appointment);
                          setEducatorNotes(appointment.educator_notes || '');
                          setShowNotesModal(true);
                        }}
                        disabled={actionLoading}
                        className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 font-medium"
                      >
                        {appointment.educator_notes ? 'Modifier mes notes' : 'Ajouter une note'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Refus */}
      {showRejectModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Refuser le rendez-vous</h3>
            <p className="text-gray-600 mb-4">
              Veuillez indiquer la raison du refus. La famille recevra cette information.
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
              placeholder="Raison du refus..."
              className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500 mb-4"
            />
            <div className="flex gap-2">
              <button
                onClick={handleReject}
                disabled={actionLoading || !rejectionReason.trim()}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 font-medium"
              >
                {actionLoading ? 'Envoi...' : 'Confirmer le refus'}
              </button>
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason('');
                  setSelectedAppointment(null);
                }}
                disabled={actionLoading}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 disabled:opacity-50"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Notes */}
      {showNotesModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Notes du rendez-vous</h3>
            <p className="text-gray-600 mb-4">
              Ajoutez des notes personnelles sur ce rendez-vous (visibles uniquement par vous).
            </p>
            <textarea
              value={educatorNotes}
              onChange={(e) => setEducatorNotes(e.target.value)}
              rows={6}
              placeholder="Vos notes..."
              className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500 mb-4"
            />
            <div className="flex gap-2">
              <button
                onClick={handleSaveNotes}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 font-medium"
              >
                {actionLoading ? 'Enregistrement...' : 'Enregistrer'}
              </button>
              <button
                onClick={() => {
                  setShowNotesModal(false);
                  setEducatorNotes('');
                  setSelectedAppointment(null);
                }}
                disabled={actionLoading}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 disabled:opacity-50"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
