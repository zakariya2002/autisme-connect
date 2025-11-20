'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface Educator {
  id: string;
  first_name: string;
  last_name: string;
  hourly_rate: number | null;
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

export default function BookAppointmentPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [educator, setEducator] = useState<Educator | null>(null);
  const [familyId, setFamilyId] = useState<string | null>(null);
  const [weeklySlots, setWeeklySlots] = useState<WeeklySlot[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]); // Liste des heures de début sélectionnées
  const [locationType, setLocationType] = useState<'home' | 'office' | 'online'>('online');
  const [address, setAddress] = useState('');
  const [familyNotes, setFamilyNotes] = useState('');

  const [availableSlots, setAvailableSlots] = useState<{ start: string; end: string }[]>([]);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (familyId) {
      fetchEducatorData();
    }
  }, [familyId]);

  useEffect(() => {
    if (selectedDate && weeklySlots.length > 0) {
      calculateAvailableSlots();
    }
  }, [selectedDate, weeklySlots, appointments]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      router.push(`/auth/login?redirect=/educator/${params.id}/book-appointment`);
      return;
    }

    // Vérifier que c'est bien une famille
    const { data: familyProfile } = await supabase
      .from('family_profiles')
      .select('id')
      .eq('user_id', session.user.id)
      .single();

    if (!familyProfile) {
      setError('Seules les familles peuvent demander des rendez-vous');
      setLoading(false);
      return;
    }

    setFamilyId(familyProfile.id);
  };

  const fetchEducatorData = async () => {
    try {
      // Récupérer les infos éducateur
      const { data: educatorData, error: educatorError } = await supabase
        .from('educator_profiles')
        .select('id, first_name, last_name, hourly_rate')
        .eq('id', params.id)
        .single();

      if (educatorError) throw educatorError;
      setEducator(educatorData);

      // Récupérer les disponibilités hebdomadaires
      const { data: slots } = await supabase
        .from('educator_weekly_availability')
        .select('*')
        .eq('educator_id', params.id)
        .eq('is_active', true);

      if (slots) setWeeklySlots(slots);

      // Récupérer les rendez-vous existants (acceptés ou en attente)
      const { data: appts } = await supabase
        .from('appointments')
        .select('appointment_date, start_time, end_time, status')
        .eq('educator_id', params.id)
        .in('status', ['accepted', 'pending'])
        .gte('appointment_date', new Date().toISOString().split('T')[0]);

      if (appts) setAppointments(appts);

      setLoading(false);
    } catch (err: any) {
      setError('Erreur lors du chargement des données');
      setLoading(false);
    }
  };

  const calculateAvailableSlots = () => {
    const date = new Date(selectedDate + 'T00:00:00');
    const dayOfWeek = date.getDay();

    // Trouver les créneaux pour ce jour
    const daySlotsTemplate = weeklySlots.filter(slot => slot.day_of_week === dayOfWeek);

    if (daySlotsTemplate.length === 0) {
      setAvailableSlots([]);
      return;
    }

    // Filtrer les créneaux déjà pris
    const dayAppointments = appointments.filter(
      appt => appt.appointment_date === selectedDate
    );

    const available: { start: string; end: string }[] = [];

    daySlotsTemplate.forEach(slot => {
      // Générer des créneaux de 1 heure
      const startHour = parseInt(slot.start_time.split(':')[0]);
      const endHour = parseInt(slot.end_time.split(':')[0]);

      for (let hour = startHour; hour < endHour; hour++) {
        const slotStart = `${hour.toString().padStart(2, '0')}:00`;
        const slotEnd = `${(hour + 1).toString().padStart(2, '0')}:00`;

        // Vérifier si ce créneau n'est pas déjà pris
        const isConflict = dayAppointments.some(appt => {
          return (
            (slotStart >= appt.start_time && slotStart < appt.end_time) ||
            (slotEnd > appt.start_time && slotEnd <= appt.end_time) ||
            (slotStart <= appt.start_time && slotEnd >= appt.end_time)
          );
        });

        if (!isConflict) {
          available.push({ start: slotStart, end: slotEnd });
        }
      }
    });

    setAvailableSlots(available);
  };

  // Gérer la sélection/désélection des créneaux avec remplissage automatique
  const toggleSlotSelection = (slotStart: string) => {
    setSelectedSlots(prev => {
      if (prev.includes(slotStart)) {
        // Désélectionner ce créneau uniquement
        return prev.filter(s => s !== slotStart);
      } else {
        // Ajouter le nouveau créneau
        const newSelection = [...prev, slotStart].sort();

        // Si on a plusieurs créneaux sélectionnés, remplir automatiquement les créneaux entre le premier et le dernier
        if (newSelection.length >= 2) {
          const firstSlot = newSelection[0];
          const lastSlot = newSelection[newSelection.length - 1];

          // Trouver tous les créneaux disponibles entre le premier et le dernier
          const allSlotsBetween: string[] = [];
          availableSlots.forEach(slot => {
            if (slot.start >= firstSlot && slot.start <= lastSlot) {
              allSlotsBetween.push(slot.start);
            }
          });

          return allSlotsBetween.sort();
        }

        return newSelection;
      }
    });
  };

  // Calculer la durée totale et le coût
  const getAppointmentDetails = () => {
    if (selectedSlots.length === 0) return null;

    // Trouver le premier et le dernier créneau
    const sortedSlots = [...selectedSlots].sort();
    const startTime = sortedSlots[0];

    // Trouver l'heure de fin du dernier créneau
    const lastSlot = availableSlots.find(slot => slot.start === sortedSlots[sortedSlots.length - 1]);
    const endTime = lastSlot?.end || startTime;

    const durationHours = selectedSlots.length;
    const totalCost = educator?.hourly_rate ? durationHours * educator.hourly_rate : null;

    return {
      startTime,
      endTime,
      durationHours,
      totalCost
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedDate || selectedSlots.length === 0) {
      setError('Veuillez sélectionner une date et au moins un créneau');
      return;
    }

    if (locationType === 'home' && !address.trim()) {
      setError('Veuillez indiquer l\'adresse pour un rendez-vous à domicile');
      return;
    }

    const details = getAppointmentDetails();
    if (!details) {
      setError('Erreur dans la sélection des créneaux');
      return;
    }

    setSubmitting(true);

    try {
      const { error: insertError } = await supabase
        .from('appointments')
        .insert({
          educator_id: params.id,
          family_id: familyId,
          appointment_date: selectedDate,
          start_time: details.startTime,
          end_time: details.endTime,
          location_type: locationType,
          address: locationType === 'home' ? address : null,
          family_notes: familyNotes.trim() || null,
        });

      if (insertError) throw insertError;

      setSuccess('✅ Votre demande de rendez-vous a été envoyée !');

      // Réinitialiser le formulaire
      setTimeout(() => {
        router.push(`/educator/${params.id}`);
      }, 2000);
    } catch (err: any) {
      setError('Erreur lors de l\'envoi de la demande : ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Générer les 30 prochains jours
  const getNextDays = (count: number) => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < count; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      days.push(date.toISOString().split('T')[0]);
    }
    return days;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Chargement...</p>
      </div>
    );
  }

  if (!educator) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Éducateur introuvable</p>
          <Link href="/" className="text-primary-600 hover:underline">
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/dashboard/family" className="text-2xl font-bold text-primary-600">
              Autisme Connect
            </Link>
            <Link
              href={`/educator/${params.id}`}
              className="text-gray-700 hover:text-primary-600"
            >
              ← Retour au profil
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Demander un rendez-vous
          </h1>
          <p className="text-gray-600 mt-2">
            avec {educator.first_name} {educator.last_name}
          </p>
          {educator.hourly_rate && (
            <p className="text-sm text-gray-500 mt-1">
              Tarif : {educator.hourly_rate}€/heure
            </p>
          )}
        </div>

        {/* Messages */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {weeklySlots.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Aucune disponibilité configurée
            </h3>
            <p className="text-gray-600 mb-6">
              Cet éducateur n&apos;a pas encore défini ses disponibilités.
              <br />
              Contactez-le directement par message.
            </p>
            <Link
              href={`/messages?educator=${params.id}`}
              className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Envoyer un message
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-8">
            {/* Sélection de la date */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                1. Sélectionnez une date
              </label>
              <select
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setSelectedSlots([]);
                }}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                required
              >
                <option value="">-- Choisir une date --</option>
                {getNextDays(30).map((date) => {
                  const d = new Date(date + 'T00:00:00');
                  const dayOfWeek = d.getDay();
                  const hasSlots = weeklySlots.some(slot => slot.day_of_week === dayOfWeek);

                  if (!hasSlots) return null;

                  return (
                    <option key={date} value={date}>
                      {d.toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Sélection du créneau */}
            {selectedDate && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  2. Choisissez un ou plusieurs créneaux horaires
                </label>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                  <p className="text-sm text-blue-800">
                    💡 <strong>Astuce :</strong> Cliquez sur une heure de début et une heure de fin, tous les créneaux entre ces deux heures seront automatiquement sélectionnés.
                  </p>
                </div>
                {availableSlots.length === 0 ? (
                  <p className="text-gray-500 text-sm bg-gray-50 p-4 rounded-lg">
                    Aucun créneau disponible pour cette date. Essayez une autre date.
                  </p>
                ) : (
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {availableSlots.map((slot, index) => {
                        const isSelected = selectedSlots.includes(slot.start);
                        return (
                          <button
                            key={index}
                            type="button"
                            onClick={() => toggleSlotSelection(slot.start)}
                            className={`p-3 rounded-lg border-2 transition-all ${
                              isSelected
                                ? 'border-green-600 bg-green-50 text-green-700'
                                : 'border-gray-200 hover:border-primary-300'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="font-medium">
                                {slot.start} - {slot.end}
                              </div>
                              {isSelected && (
                                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Récapitulatif */}
                    {selectedSlots.length > 0 && (
                      <div className="mt-4 p-4 bg-primary-50 border border-primary-200 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-primary-900">📋 Récapitulatif</h4>
                          <button
                            type="button"
                            onClick={() => setSelectedSlots([])}
                            className="text-xs text-red-600 hover:text-red-700 font-medium underline"
                          >
                            Tout désélectionner
                          </button>
                        </div>
                        <div className="space-y-1 text-sm">
                          <p>
                            <span className="text-gray-700">Horaire :</span>{' '}
                            <span className="font-medium text-gray-900">
                              {getAppointmentDetails()?.startTime} - {getAppointmentDetails()?.endTime}
                            </span>
                          </p>
                          <p>
                            <span className="text-gray-700">Durée :</span>{' '}
                            <span className="font-medium text-gray-900">
                              {getAppointmentDetails()?.durationHours} heure{getAppointmentDetails()?.durationHours! > 1 ? 's' : ''}
                            </span>
                          </p>
                          {getAppointmentDetails()?.totalCost && (
                            <p>
                              <span className="text-gray-700">Coût estimé :</span>{' '}
                              <span className="font-bold text-primary-700 text-lg">
                                {getAppointmentDetails()?.totalCost}€
                              </span>
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Type de rendez-vous */}
            {selectedSlots.length > 0 && (
              <>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    3. Type de rendez-vous
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-primary-300">
                      <input
                        type="radio"
                        name="location_type"
                        value="online"
                        checked={locationType === 'online'}
                        onChange={(e) => setLocationType(e.target.value as any)}
                        className="mr-3"
                      />
                      <div>
                        <div className="font-medium">En ligne</div>
                        <div className="text-sm text-gray-500">Visioconférence</div>
                      </div>
                    </label>
                    <label className="flex items-center p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-primary-300">
                      <input
                        type="radio"
                        name="location_type"
                        value="home"
                        checked={locationType === 'home'}
                        onChange={(e) => setLocationType(e.target.value as any)}
                        className="mr-3"
                      />
                      <div>
                        <div className="font-medium">À domicile</div>
                        <div className="text-sm text-gray-500">L&apos;éducateur se déplace</div>
                      </div>
                    </label>
                    <label className="flex items-center p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-primary-300">
                      <input
                        type="radio"
                        name="location_type"
                        value="office"
                        checked={locationType === 'office'}
                        onChange={(e) => setLocationType(e.target.value as any)}
                        className="mr-3"
                      />
                      <div>
                        <div className="font-medium">Au cabinet</div>
                        <div className="text-sm text-gray-500">Vous vous déplacez</div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Adresse si à domicile */}
                {locationType === 'home' && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Adresse du rendez-vous *
                    </label>
                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      rows={3}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="Adresse complète..."
                      required
                    />
                  </div>
                )}

                {/* Notes */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes ou demandes particulières (optionnel)
                  </label>
                  <textarea
                    value={familyNotes}
                    onChange={(e) => setFamilyNotes(e.target.value)}
                    rows={4}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Précisez vos besoins, objectifs, ou toute information utile pour l'éducateur..."
                  />
                </div>

                {/* Boutons */}
                <div className="flex gap-4">
                  <Link
                    href={`/educator/${params.id}`}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-center"
                  >
                    Annuler
                  </Link>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 font-medium"
                  >
                    {submitting ? 'Envoi...' : 'Envoyer la demande'}
                  </button>
                </div>
              </>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
