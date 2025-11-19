'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Booking, BookingStatus } from '@/types';

export default function BookingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const educatorId = searchParams.get('educator');

  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [showNewBookingForm, setShowNewBookingForm] = useState(false);

  const [newBooking, setNewBooking] = useState({
    start_time: '',
    end_time: '',
    notes: '',
    location: '',
  });

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (userProfile) {
      fetchBookings();
      if (educatorId) {
        setShowNewBookingForm(true);
      }
    }
  }, [userProfile, educatorId]);

  const fetchCurrentUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        router.push('/auth/login');
        return;
      }
      setCurrentUser(session.user);

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

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const isEducator = userProfile.role === 'educator';
      const field = isEducator ? 'educator_id' : 'family_id';

      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          educator_profiles(*),
          family_profiles(*)
        `)
        .eq(field, userProfile.id)
        .order('start_time', { ascending: true });

      if (error) throw error;

      setBookings(data || []);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const createBooking = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!educatorId || userProfile.role !== 'family') {
      alert('Erreur: impossible de créer la réservation');
      return;
    }

    try {
      const { error } = await supabase
        .from('bookings')
        .insert({
          educator_id: educatorId,
          family_id: userProfile.id,
          start_time: newBooking.start_time,
          end_time: newBooking.end_time,
          notes: newBooking.notes,
          location: newBooking.location,
          status: 'pending',
        });

      if (error) throw error;

      alert('Réservation créée avec succès!');
      setShowNewBookingForm(false);
      setNewBooking({
        start_time: '',
        end_time: '',
        notes: '',
        location: '',
      });
      fetchBookings();
    } catch (error: any) {
      alert('Erreur: ' + error.message);
    }
  };

  const updateBookingStatus = async (bookingId: string, status: BookingStatus) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', bookingId);

      if (error) throw error;

      fetchBookings();
    } catch (error: any) {
      alert('Erreur: ' + error.message);
    }
  };

  const getStatusBadgeColor = (status: BookingStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: BookingStatus) => {
    switch (status) {
      case 'pending':
        return 'En attente';
      case 'confirmed':
        return 'Confirmée';
      case 'cancelled':
        return 'Annulée';
      case 'completed':
        return 'Terminée';
      default:
        return status;
    }
  };

  if (loading && !userProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Link href="/search" className="text-2xl font-bold text-primary-600">
                Autisme Connect
              </Link>
            </div>
            <div className="flex space-x-4">
              <Link
                href={userProfile?.role === 'educator' ? '/dashboard/educator' : '/dashboard/family'}
                className="text-gray-700 hover:text-primary-600 px-3 py-2"
              >
                Mon tableau de bord
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mes réservations</h1>
          {userProfile?.role === 'family' && (
            <button
              onClick={() => setShowNewBookingForm(!showNewBookingForm)}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              Nouvelle réservation
            </button>
          )}
        </div>

        {/* Formulaire de nouvelle réservation */}
        {showNewBookingForm && userProfile?.role === 'family' && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Nouvelle réservation</h2>
            <form onSubmit={createBooking} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Début *</label>
                  <input
                    type="datetime-local"
                    required
                    value={newBooking.start_time}
                    onChange={(e) => setNewBooking({ ...newBooking, start_time: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Fin *</label>
                  <input
                    type="datetime-local"
                    required
                    value={newBooking.end_time}
                    onChange={(e) => setNewBooking({ ...newBooking, end_time: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Lieu</label>
                <input
                  type="text"
                  value={newBooking.location}
                  onChange={(e) => setNewBooking({ ...newBooking, location: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Notes</label>
                <textarea
                  rows={3}
                  value={newBooking.notes}
                  onChange={(e) => setNewBooking({ ...newBooking, notes: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                >
                  Créer la réservation
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewBookingForm(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Liste des réservations */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Chargement...</p>
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="text-gray-500">Aucune réservation</p>
            </div>
          ) : (
            bookings.map((booking) => {
              const isEducator = userProfile.role === 'educator';
              const otherParty = isEducator ? booking.family_profiles : booking.educator_profiles;

              return (
                <div key={booking.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {isEducator ? 'Famille' : 'Éducateur'}: {otherParty.first_name} {otherParty.last_name}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(booking.status)}`}>
                          {getStatusLabel(booking.status)}
                        </span>
                      </div>

                      <p className="text-gray-600">
                        📅 {new Date(booking.start_time).toLocaleString('fr-FR')}
                      </p>
                      <p className="text-gray-600">
                        ⏰ Fin: {new Date(booking.end_time).toLocaleString('fr-FR')}
                      </p>

                      {booking.location && (
                        <p className="text-gray-600 mt-1">📍 {booking.location}</p>
                      )}

                      {booking.notes && (
                        <p className="text-gray-700 mt-3 bg-gray-50 p-3 rounded">
                          {booking.notes}
                        </p>
                      )}
                    </div>

                    <div className="ml-4 flex flex-col gap-2">
                      {isEducator && booking.status === 'pending' && (
                        <>
                          <button
                            onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm whitespace-nowrap"
                          >
                            Confirmer
                          </button>
                          <button
                            onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm whitespace-nowrap"
                          >
                            Refuser
                          </button>
                        </>
                      )}

                      {booking.status === 'confirmed' && (
                        <button
                          onClick={() => updateBookingStatus(booking.id, 'completed')}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm whitespace-nowrap"
                        >
                          Marquer terminée
                        </button>
                      )}

                      {booking.status === 'completed' && !isEducator && (
                        <Link
                          href={`/reviews/create?booking=${booking.id}&educator=${booking.educator_id}`}
                          className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 text-sm whitespace-nowrap text-center"
                        >
                          Laisser un avis
                        </Link>
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
