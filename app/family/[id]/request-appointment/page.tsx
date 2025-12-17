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

interface Appointment {
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: string;
}

export default function RequestAppointmentPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [family, setFamily] = useState<Family | null>(null);
  const [educatorId, setEducatorId] = useState<string | null>(null);
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
      fetchExistingAppointments();
    }
  }, [educatorId]);

  useEffect(() => {
    if (selectedDate) {
      calculateAvailableSlots();
    }
  }, [selectedDate, appointments]);

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

  const fetchExistingAppointments = async () => {
    if (!educatorId) return;

    try {
      // Récupérer les rendez-vous existants de l'éducateur
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

  // Générer des créneaux standards de 8h à 20h (créneaux de 1h)
  const calculateAvailableSlotsForDate = (dateStr: string) => {
    const slots: { start: string; end: string }[] = [];

    // Créneaux de 8h00 à 20h00 par tranches de 1 heure
    for (let hour = 8; hour < 20; hour++) {
      const startTime = `${String(hour).padStart(2, '0')}:00`;
      const endTime = `${String(hour + 1).padStart(2, '0')}:00`;

      // Vérifier si ce créneau n'est pas déjà pris
      const isBooked = appointments.some(apt => {
        return apt.appointment_date === dateStr && apt.start_time === startTime;
      });

      if (!isBooked) {
        slots.push({ start: startTime, end: endTime });
      }
    }

    return slots;
  };

  const calculateAvailableSlots = () => {
    if (!selectedDate) return;
    const slots = calculateAvailableSlotsForDate(selectedDate);
    setAvailableSlots(slots);
  };

  const handleSlotToggle = (startTime: string) => {
    setSelectedSlots(prev => {
      // Si on clique sur un créneau déjà sélectionné, on désélectionne tout
      if (prev.includes(startTime)) {
        return [];
      }

      // Si aucun créneau n'est sélectionné, on sélectionne juste celui-ci
      if (prev.length === 0) {
        return [startTime];
      }

      // Sinon, on sélectionne tous les créneaux entre le premier sélectionné et celui-ci
      const allSlotTimes = availableSlots.map(s => s.start);
      const clickedIndex = allSlotTimes.indexOf(startTime);
      const firstSelectedIndex = allSlotTimes.indexOf(prev[0]);

      if (clickedIndex === -1 || firstSelectedIndex === -1) {
        return [startTime];
      }

      const startIdx = Math.min(clickedIndex, firstSelectedIndex);
      const endIdx = Math.max(clickedIndex, firstSelectedIndex);

      // Sélectionner tous les créneaux entre startIdx et endIdx
      return allSlotTimes.slice(startIdx, endIdx + 1);
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
      // Préparer les créneaux pour l'API
      const slots = selectedSlots.map(startTime => {
        const slot = availableSlots.find(s => s.start === startTime);
        return {
          start_time: startTime,
          end_time: slot?.end || '',
        };
      });

      // Appeler l'API pour créer les rendez-vous
      const response = await fetch('/api/appointments/propose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          educatorId,
          familyId: params.id,
          appointmentDate: selectedDate,
          slots,
          locationType,
          address: locationType === 'home' ? address : null,
          educatorNotes: educatorNotes || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la création des rendez-vous');
      }

      setSuccess(`Rendez-vous proposé${selectedSlots.length > 1 ? 's' : ''} avec succès ! La famille recevra une notification.`);

      // Réinitialiser le formulaire
      setSelectedSlots([]);
      setEducatorNotes('');
      setAddress('');

      // Recharger les rendez-vous
      fetchExistingAppointments();

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
            <Logo iconSize="sm" />
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
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
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
            <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-r" role="alert">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-green-700 font-medium">{success}</span>
              </div>
            </div>
          )}


          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Calendrier - tous les jours sont disponibles */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Sélectionner une date
              </label>
              <Calendar
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
                minDate={new Date()}
              />
            </div>

            {/* Créneaux disponibles */}
            {selectedDate && (
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Créneaux disponibles pour le {new Date(selectedDate + 'T00:00:00').toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long'
                  })}
                </label>
                {availableSlots.length === 0 ? (
                  <p className="text-gray-500 text-sm">Tous les créneaux sont déjà réservés pour cette date.</p>
                ) : (
                  <>
                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                      {availableSlots.map((slot) => (
                        <button
                          key={slot.start}
                          type="button"
                          onClick={() => handleSlotToggle(slot.start)}
                          className={`py-2 px-2 rounded-lg text-sm font-medium transition-all ${
                            selectedSlots.includes(slot.start)
                              ? 'bg-green-600 text-white shadow-md'
                              : 'bg-white text-gray-700 border border-gray-300 hover:border-green-400 hover:bg-green-50'
                          }`}
                          aria-label={`Créneau de ${slot.start} à ${slot.end}`}
                          aria-pressed={selectedSlots.includes(slot.start)}
                        >
                          {slot.start}
                        </button>
                      ))}
                    </div>

                    {/* Résumé dynamique */}
                    {selectedSlots.length > 0 && (
                      <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div>
                            <p className="text-lg font-bold text-green-900">
                              {selectedSlots.length}h
                            </p>
                            <p className="text-sm text-green-700">
                              De {[...selectedSlots].sort()[0]} à {(() => {
                                const sorted = [...selectedSlots].sort();
                                const last = sorted[sorted.length - 1];
                                const h = parseInt(last.split(':')[0], 10);
                                return `${String(h + 1).padStart(2, '0')}:00`;
                              })()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-green-600">
                              Cliquez sur un créneau sélectionné pour annuler
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
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
                  aria-pressed={locationType === 'online'}
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
                  aria-pressed={locationType === 'home'}
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
                  aria-pressed={locationType === 'office'}
                >
                  Au cabinet
                </button>
              </div>
            </div>

            {/* Adresse */}
            {locationType === 'home' && (
              <div>
                <label htmlFor="address" className="block text-sm font-semibold text-gray-700 mb-2">
                  Adresse du rendez-vous <span className="text-red-500">*</span>
                </label>
                <input
                  id="address"
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="123 Rue Example, 75001 Paris"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  aria-required="true"
                  required
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
                {submitting ? 'Envoi en cours...' : 'Proposer'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Toast d'erreur en bas à droite */}
      {error && (
        <div className="fixed bottom-4 right-4 left-4 md:left-auto md:w-96 z-50 animate-slide-up">
          <div className="bg-red-600 text-white px-6 py-4 rounded-lg shadow-2xl border-2 border-red-700" role="alert">
            <div className="flex items-start gap-3">
              <svg className="h-6 w-6 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <p className="font-semibold text-sm">{error}</p>
              </div>
              <button
                onClick={() => setError('')}
                className="flex-shrink-0 text-white/80 hover:text-white transition"
                aria-label="Fermer le message d'erreur"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
