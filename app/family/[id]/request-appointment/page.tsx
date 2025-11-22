'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import Calendar from '@/components/Calendar';
import Logo from '@/components/Logo';
import PublicMobileMenu from '@/components/PublicMobileMenu';

interface Family {
  id: string;
  first_name: string;
  last_name: string;
}

interface WeeklySlot {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
}

interface Appointment {
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: string;
}

const DAYS = [
  { value: 0, label: 'Dimanche' },
  { value: 1, label: 'Lundi' },
  { value: 2, label: 'Mardi' },
  { value: 3, label: 'Mercredi' },
  { value: 4, label: 'Jeudi' },
  { value: 5, label: 'Vendredi' },
  { value: 6, label: 'Samedi' },
];

export default function RequestAppointmentPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [family, setFamily] = useState<Family | null>(null);
  const [educatorId, setEducatorId] = useState<string | null>(null);
  const [weeklySlots, setWeeklySlots] = useState<WeeklySlot[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [locationType, setLocationType] = useState<'home' | 'office' | 'online'>('online');
  const [address, setAddress] = useState('');
  const [educatorNotes, setEducatorNotes] = useState('');

  const [availableSlots, setAvailableSlots] = useState<{ start: string; end: string }[]>([]);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (educatorId) {
      fetchFamilyData();
      fetchEducatorAvailability();
    }
  }, [educatorId]);

  useEffect(() => {
    if (selectedDate && weeklySlots.length > 0) {
      calculateAvailableSlots();
    }
  }, [selectedDate, weeklySlots, appointments]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      router.push(`/auth/login?redirect=/family/${params.id}/request-appointment`);
      return;
    }

    // Vérifier que c'est bien un éducateur
    const { data: educatorProfile } = await supabase
      .from('educator_profiles')
      .select('id')
      .eq('user_id', session.user.id)
      .single();

    if (!educatorProfile) {
      setError('Seuls les éducateurs peuvent proposer des rendez-vous');
      setLoading(false);
      return;
    }

    setEducatorId(educatorProfile.id);
  };

  const fetchFamilyData = async () => {
    try {
      const { data, error } = await supabase
        .from('family_profiles')
        .select('id, first_name, last_name')
        .eq('id', params.id)
        .single();

      if (error) throw error;
      setFamily(data);
    } catch (err) {
      console.error('Erreur:', err);
      setError('Impossible de charger les informations de la famille');
    } finally {
      setLoading(false);
    }
  };

  const fetchEducatorAvailability = async () => {
    if (!educatorId) return;

    try {
      // Récupérer les créneaux hebdomadaires de l'éducateur
      const { data: slots } = await supabase
        .from('weekly_availability')
        .select('*')
        .eq('educator_id', educatorId)
        .eq('is_active', true);

      setWeeklySlots(slots || []);

      // Récupérer les rendez-vous existants
      const { data: existingAppointments } = await supabase
        .from('appointments')
        .select('appointment_date, start_time, end_time, status')
        .eq('educator_id', educatorId)
        .in('status', ['pending', 'confirmed']);

      setAppointments(existingAppointments || []);
    } catch (err) {
      console.error('Erreur:', err);
    }
  };

  const calculateAvailableSlots = () => {
    if (!selectedDate) return;

    const date = new Date(selectedDate);
    const dayOfWeek = date.getDay();

    // Trouver les créneaux pour ce jour
    const daySlots = weeklySlots.filter(slot => slot.day_of_week === dayOfWeek);

    if (daySlots.length === 0) {
      setAvailableSlots([]);
      return;
    }

    // Générer tous les créneaux de 30 minutes
    const slots: { start: string; end: string }[] = [];
    daySlots.forEach(slot => {
      const [startHour, startMinute] = slot.start_time.split(':').map(Number);
      const [endHour, endMinute] = slot.end_time.split(':').map(Number);

      let currentHour = startHour;
      let currentMinute = startMinute;

      while (currentHour < endHour || (currentHour === endHour && currentMinute < endMinute)) {
        const startTime = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;

        // Calculer l'heure de fin (+30 min)
        let nextMinute = currentMinute + 30;
        let nextHour = currentHour;
        if (nextMinute >= 60) {
          nextMinute -= 60;
          nextHour += 1;
        }
        const endTime = `${String(nextHour).padStart(2, '0')}:${String(nextMinute).padStart(2, '0')}`;

        // Vérifier si ce créneau n'est pas déjà pris
        const isBooked = appointments.some(apt => {
          return apt.appointment_date === selectedDate &&
                 apt.start_time === startTime;
        });

        if (!isBooked) {
          slots.push({ start: startTime, end: endTime });
        }

        currentMinute = nextMinute;
        currentHour = nextHour;
      }
    });

    setAvailableSlots(slots);
  };

  const handleSlotToggle = (startTime: string) => {
    setSelectedSlots(prev => {
      if (prev.includes(startTime)) {
        return prev.filter(t => t !== startTime);
      } else {
        return [...prev, startTime];
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedSlots.length === 0) {
      setError('Veuillez sélectionner au moins un créneau horaire');
      return;
    }

    if (locationType === 'home' && !address.trim()) {
      setError('Veuillez indiquer une adresse');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      // Créer un rendez-vous pour chaque créneau sélectionné
      const appointmentsToCreate = selectedSlots.map(startTime => {
        const slot = availableSlots.find(s => s.start === startTime);
        return {
          educator_id: educatorId,
          family_id: params.id,
          appointment_date: selectedDate,
          start_time: startTime,
          end_time: slot?.end || '',
          location_type: locationType,
          location_address: locationType === 'home' ? address : null,
          educator_notes: educatorNotes || null,
          status: 'pending',
        };
      });

      const { error: insertError } = await supabase
        .from('appointments')
        .insert(appointmentsToCreate);

      if (insertError) throw insertError;

      setSuccess(`Rendez-vous proposé${selectedSlots.length > 1 ? 's' : ''} avec succès ! La famille recevra une notification.`);

      // Réinitialiser le formulaire
      setSelectedSlots([]);
      setEducatorNotes('');
      setAddress('');

      // Recharger les rendez-vous
      fetchEducatorAvailability();

      // Rediriger après 2 secondes
      setTimeout(() => {
        router.push('/messages');
      }, 2000);
    } catch (err: any) {
      console.error('Erreur:', err);
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error && !educatorId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">{error}</h1>
          <Link href="/" className="text-primary-600 hover:text-primary-700">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="hidden md:block">
              <Logo />
            </div>
            <div className="md:hidden">
              <PublicMobileMenu isAuthenticated={true} userRole="educator" />
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <Link
                href="/dashboard/educator"
                className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Tableau de bord
              </Link>
              <Link
                href="/messages"
                className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Messages
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Contenu principal */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="mb-6">
            <Link
              href={`/family/${params.id}`}
              className="text-primary-600 hover:text-primary-700 inline-flex items-center mb-4"
            >
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Retour au profil
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">
              Proposer un rendez-vous à {family?.first_name} {family?.last_name}
            </h1>
            <p className="text-gray-600 mt-2">
              Sélectionnez une ou plusieurs dates et créneaux horaires à proposer à la famille.
            </p>
          </div>

          {success && (
            <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-r">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-green-700 font-medium">{success}</span>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-red-700 font-medium">{error}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Calendrier */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Sélectionner une date
              </label>
              <Calendar
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                minDate={new Date().toISOString().split('T')[0]}
              />
            </div>

            {/* Créneaux disponibles */}
            {selectedDate && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Créneaux disponibles pour le {new Date(selectedDate + 'T00:00:00').toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </label>
                {availableSlots.length === 0 ? (
                  <p className="text-gray-500 text-sm">Aucun créneau disponible pour cette date.</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot.start}
                        type="button"
                        onClick={() => handleSlotToggle(slot.start)}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                          selectedSlots.includes(slot.start)
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {slot.start} - {slot.end}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Type de rendez-vous */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Type de rendez-vous
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setLocationType('online')}
                  className={`px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                    locationType === 'online'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  En ligne
                </button>
                <button
                  type="button"
                  onClick={() => setLocationType('home')}
                  className={`px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                    locationType === 'home'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  À domicile
                </button>
                <button
                  type="button"
                  onClick={() => setLocationType('office')}
                  className={`px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                    locationType === 'office'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Au cabinet
                </button>
              </div>
            </div>

            {/* Adresse */}
            {locationType === 'home' && (
              <div>
                <label htmlFor="address" className="block text-sm font-semibold text-gray-700 mb-2">
                  Adresse du rendez-vous
                </label>
                <input
                  id="address"
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="123 Rue Example, 75001 Paris"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            )}

            {/* Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-semibold text-gray-700 mb-2">
                Notes ou informations complémentaires (optionnel)
              </label>
              <textarea
                id="notes"
                value={educatorNotes}
                onChange={(e) => setEducatorNotes(e.target.value)}
                rows={4}
                placeholder="Ajoutez des informations supplémentaires pour la famille..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Bouton de soumission */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting || selectedSlots.length === 0}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Envoi en cours...' : `Proposer ${selectedSlots.length > 0 ? `(${selectedSlots.length})` : ''}`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
