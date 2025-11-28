'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import Logo from '@/components/Logo';
import PublicMobileMenu from '@/components/PublicMobileMenu';
import { canEducatorCreateBooking } from '@/lib/subscription-utils';

interface Educator {
  id: string;
  first_name: string;
  last_name: string;
  hourly_rate: number | null;
}

interface DailyAvailability {
  id: string;
  availability_date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

interface Appointment {
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: string;
}

interface ChildProfile {
  id: string;
  first_name: string;
  age: number | null;
  support_level_needed: string | null;
}

export default function BookAppointmentPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [educator, setEducator] = useState<Educator | null>(null);
  const [familyId, setFamilyId] = useState<string | null>(null);
  const [availabilities, setAvailabilities] = useState<DailyAvailability[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);

  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<{ start: string; end: string } | null>(null);
  const [customStartTime, setCustomStartTime] = useState('');
  const [customEndTime, setCustomEndTime] = useState('');
  const [locationType, setLocationType] = useState<'home' | 'office' | 'online'>('online');
  const [address, setAddress] = useState('');
  const [familyNotes, setFamilyNotes] = useState('');

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

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      router.push(`/auth/login?redirect=/educator/${params.id}/book-appointment`);
      return;
    }

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

    // Récupérer les enfants de la famille
    const { data: childrenData } = await supabase
      .from('child_profiles')
      .select('id, first_name, age, support_level_needed')
      .eq('family_id', familyProfile.id)
      .eq('is_active', true)
      .order('created_at', { ascending: true });

    if (childrenData && childrenData.length > 0) {
      setChildren(childrenData);
      // Présélectionner le premier enfant s'il n'y en a qu'un
      if (childrenData.length === 1) {
        setSelectedChildId(childrenData[0].id);
      }
    }
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

      // Récupérer les disponibilités futures
      const today = new Date().toISOString().split('T')[0];
      const { data: availData } = await supabase
        .from('educator_availability')
        .select('*')
        .eq('educator_id', params.id)
        .eq('is_available', true)
        .gte('availability_date', today)
        .order('availability_date', { ascending: true })
        .order('start_time', { ascending: true });

      if (availData) setAvailabilities(availData);

      // Récupérer les rendez-vous existants
      const { data: appts } = await supabase
        .from('appointments')
        .select('appointment_date, start_time, end_time, status')
        .eq('educator_id', params.id)
        .in('status', ['accepted', 'pending', 'in_progress'])
        .gte('appointment_date', today);

      if (appts) setAppointments(appts);

      setLoading(false);
    } catch (err: any) {
      console.error('Erreur chargement:', err);
      setError('Erreur lors du chargement des données');
      setLoading(false);
    }
  };

  const getAvailableDates = () => {
    // Grouper par date
    const dateMap = new Map<string, DailyAvailability[]>();

    availabilities.forEach(avail => {
      const existing = dateMap.get(avail.availability_date) || [];
      existing.push(avail);
      dateMap.set(avail.availability_date, existing);
    });

    // Filtrer les dates avec au moins un créneau libre
    const freeDates: string[] = [];

    dateMap.forEach((slots, date) => {
      const hasAvailableSlot = slots.some(slot => {
        // Vérifier si ce créneau n'est pas déjà réservé
        return !isSlotBooked(date, slot.start_time, slot.end_time);
      });

      if (hasAvailableSlot) {
        freeDates.push(date);
      }
    });

    return freeDates.sort();
  };

  const getAvailableSlotsForDate = (date: string) => {
    const dayAvail = availabilities.filter(a => a.availability_date === date);

    return dayAvail.filter(slot => {
      return !isSlotBooked(date, slot.start_time, slot.end_time);
    });
  };

  const isSlotBooked = (date: string, startTime: string, endTime: string) => {
    // Vérifier s'il y a un chevauchement avec des rendez-vous existants
    return appointments.some(appt => {
      if (appt.appointment_date !== date) return false;

      // Convertir les heures en minutes pour faciliter la comparaison
      const slotStart = timeToMinutes(startTime);
      const slotEnd = timeToMinutes(endTime);
      const apptStart = timeToMinutes(appt.start_time);
      const apptEnd = timeToMinutes(appt.end_time);

      // Vérifier le chevauchement : un créneau est réservé s'il y a une intersection
      return (slotStart < apptEnd && slotEnd > apptStart);
    });
  };

  // Fonction utilitaire pour convertir HH:MM en minutes
  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Générer des options d'heures pour un créneau (par tranches de 30 minutes)
  const generateTimeOptions = (startTime: string, endTime: string): string[] => {
    const times: string[] = [];
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);

    let currentHour = startHour;
    let currentMin = startMin;

    while (currentHour < endHour || (currentHour === endHour && currentMin < endMin)) {
      times.push(`${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`);

      currentMin += 30;
      if (currentMin >= 60) {
        currentMin = 0;
        currentHour++;
      }
    }

    // Ajouter l'heure de fin
    times.push(endTime);

    return times;
  };

  // Valider que la durée est d'au moins 2 heures
  const validateDuration = (start: string, end: string): boolean => {
    const [startHour, startMin] = start.split(':').map(Number);
    const [endHour, endMin] = end.split(':').map(Number);

    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    const durationMinutes = endMinutes - startMinutes;

    return durationMinutes >= 120; // Au moins 2 heures (120 minutes)
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDate || !selectedSlot) {
      setError('Veuillez sélectionner une date et un créneau');
      return;
    }

    if (!customStartTime || !customEndTime) {
      setError('Veuillez choisir une heure de début et de fin');
      return;
    }

    // Vérifier que la durée est d'au moins 2 heures
    if (!validateDuration(customStartTime, customEndTime)) {
      setError('La durée minimum est de 2 heures');
      return;
    }

    // Vérifier que les heures personnalisées sont dans la plage de disponibilité
    if (customStartTime < selectedSlot.start || customEndTime > selectedSlot.end) {
      setError(`Les heures doivent être entre ${selectedSlot.start} et ${selectedSlot.end}`);
      return;
    }

    if (!familyId) {
      setError('Erreur d\'authentification');
      return;
    }

    // Vérifier qu'un enfant est sélectionné si la famille a des enfants
    if (children.length > 0 && !selectedChildId) {
      setError('Veuillez sélectionner l\'enfant concerné par ce rendez-vous');
      return;
    }

    // Vérifier les limites
    const canBook = await canEducatorCreateBooking(params.id);
    if (!canBook.canCreate) {
      setError(canBook.reason || 'Limite de réservations atteinte');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      // Calculer le prix basé sur la durée et le tarif horaire
      const durationMinutes = calculateDuration(customStartTime, customEndTime);
      const durationHours = durationMinutes / 60;
      const hourlyRate = educator?.hourly_rate || 50; // 50€ par défaut
      const price = durationHours * hourlyRate;

      console.log('💰 Prix calculé:', { durationMinutes, durationHours, hourlyRate, price });

      // Créer une session de paiement Stripe
      const response = await fetch('/api/appointments/create-with-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          educatorId: params.id,
          familyId,
          childId: selectedChildId,
          appointmentDate: selectedDate,
          startTime: customStartTime,
          endTime: customEndTime,
          locationType,
          address: locationType !== 'online' ? address : null,
          familyNotes,
          price
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la création de la session de paiement');
      }

      // Rediriger vers Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('URL de paiement non reçue');
      }
    } catch (err: any) {
      console.error('Erreur:', err);
      setError(err.message || 'Erreur lors de la création du rendez-vous');
      setSubmitting(false);
    }
  };

  const calculateDuration = (start: string, end: string): number => {
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    return (endH * 60 + endM) - (startH * 60 + startM);
  };

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (remainingMinutes === 0) {
      return `${hours}h`;
    }
    return `${hours}h ${remainingMinutes}min`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-primary-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const availableDates = getAvailableDates();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Logo />
            <PublicMobileMenu />
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link
            href={`/educator/${params.id}`}
            className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-2 mb-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour au profil
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            Réserver un rendez-vous
          </h1>
          {educator && (
            <p className="text-gray-600 mt-2">
              Avec {educator.first_name} {educator.last_name}
              {educator.hourly_rate && (
                <span className="ml-2 text-primary-600 font-semibold">
                  {educator.hourly_rate}€/heure
                </span>
              )}
            </p>
          )}
        </div>

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 font-medium">{success}</p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {availableDates.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <svg className="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Aucune disponibilité configurée
            </h3>
            <p className="text-gray-600 mb-6">
              Cet éducateur n&apos;a pas encore défini ses disponibilités.
            </p>
            <Link
              href="/messages"
              className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition font-medium"
            >
              Contactez-le directement par message
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6 space-y-6">
            {/* Sélection de l'enfant (si la famille a des enfants) */}
            {children.length > 0 && (
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  1. Sélectionnez l'enfant concerné
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {children.map((child) => (
                    <button
                      key={child.id}
                      type="button"
                      onClick={() => setSelectedChildId(child.id)}
                      className={`p-4 rounded-lg border-2 transition text-left ${
                        selectedChildId === child.id
                          ? 'border-primary-600 bg-primary-50'
                          : 'border-gray-200 hover:border-primary-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-semibold text-primary-600">
                            {child.first_name[0].toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{child.first_name}</p>
                          <p className="text-sm text-gray-600">
                            {child.age && `${child.age} ans`}
                            {child.age && child.support_level_needed && ' • '}
                            {child.support_level_needed && (
                              child.support_level_needed === 'level_1' ? 'Niveau 1' :
                              child.support_level_needed === 'level_2' ? 'Niveau 2' : 'Niveau 3'
                            )}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Vous pouvez gérer vos enfants dans{' '}
                  <Link href="/dashboard/family/children" className="text-primary-600 hover:underline">
                    votre espace famille
                  </Link>
                </p>
              </div>
            )}

            {/* Sélection de la date */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                {children.length > 0 ? '2. Choisissez une date' : '1. Choisissez une date'}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {availableDates.map(date => (
                  <button
                    key={date}
                    type="button"
                    onClick={() => {
                      setSelectedDate(date);
                      setSelectedSlot(null);
                    }}
                    className={`p-4 rounded-lg border-2 transition text-left ${
                      selectedDate === date
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-200 hover:border-primary-300'
                    }`}
                  >
                    <p className="font-semibold text-gray-900 capitalize">
                      {formatDate(date)}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {getAvailableSlotsForDate(date).length} créneau(x) disponible(s)
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Sélection du créneau */}
            {selectedDate && (
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  {children.length > 0 ? '3. Choisissez un créneau horaire' : '2. Choisissez un créneau horaire'}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {getAvailableSlotsForDate(selectedDate).map((slot) => {
                    const duration = calculateDuration(slot.start_time, slot.end_time);
                    const price = educator?.hourly_rate ? ((educator.hourly_rate / 60) * duration).toFixed(2) : '0';

                    return (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => {
                          setSelectedSlot({ start: slot.start_time, end: slot.end_time });
                          setCustomStartTime(slot.start_time);
                          setCustomEndTime(slot.end_time);
                        }}
                        className={`p-3 rounded-lg border-2 transition ${
                          selectedSlot?.start === slot.start_time
                            ? 'border-primary-600 bg-primary-50'
                            : 'border-gray-200 hover:border-primary-300'
                        }`}
                      >
                        <p className="font-semibold text-gray-900 text-sm">
                          {slot.start_time} - {slot.end_time}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          {formatDuration(duration)} - {price}€
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Choisir les heures personnalisées */}
            {selectedSlot && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Personnalisez votre créneau (minimum 2 heures)
                </label>
                <p className="text-xs text-gray-600 mb-3">
                  Créneau disponible : {selectedSlot.start} - {selectedSlot.end}
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Heure de début
                    </label>
                    <select
                      value={customStartTime}
                      onChange={(e) => setCustomStartTime(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      {generateTimeOptions(selectedSlot.start, selectedSlot.end).slice(0, -1).map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Heure de fin
                    </label>
                    <select
                      value={customEndTime}
                      onChange={(e) => setCustomEndTime(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      {generateTimeOptions(selectedSlot.start, selectedSlot.end).filter(time => time > customStartTime).map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>
                </div>
                {customStartTime && customEndTime && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-gray-900">
                      Durée : {formatDuration(calculateDuration(customStartTime, customEndTime))}
                      {educator?.hourly_rate && ` - ${((educator.hourly_rate / 60) * calculateDuration(customStartTime, customEndTime)).toFixed(2)}€`}
                    </p>
                    {!validateDuration(customStartTime, customEndTime) && (
                      <p className="text-xs text-red-600 mt-1">
                        ⚠️ La durée minimum est de 2 heures
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Type de rendez-vous */}
            {selectedSlot && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    {children.length > 0 ? '4. Type de rendez-vous' : '3. Type de rendez-vous'}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setLocationType('online')}
                      className={`p-4 rounded-lg border-2 transition ${
                        locationType === 'online'
                          ? 'border-primary-600 bg-primary-50'
                          : 'border-gray-200 hover:border-primary-300'
                      }`}
                    >
                      <p className="font-semibold text-gray-900">En ligne</p>
                      <p className="text-xs text-gray-600 mt-1">Visioconférence</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setLocationType('home')}
                      className={`p-4 rounded-lg border-2 transition ${
                        locationType === 'home'
                          ? 'border-primary-600 bg-primary-50'
                          : 'border-gray-200 hover:border-primary-300'
                      }`}
                    >
                      <p className="font-semibold text-gray-900">À domicile</p>
                      <p className="text-xs text-gray-600 mt-1">Chez vous</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setLocationType('office')}
                      className={`p-4 rounded-lg border-2 transition ${
                        locationType === 'office'
                          ? 'border-primary-600 bg-primary-50'
                          : 'border-gray-200 hover:border-primary-300'
                      }`}
                    >
                      <p className="font-semibold text-gray-900">Au cabinet</p>
                      <p className="text-xs text-gray-600 mt-1">Cabinet de l&apos;éducateur</p>
                    </button>
                  </div>
                </div>

                {/* Adresse si nécessaire */}
                {(locationType === 'home' || locationType === 'office') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Adresse
                    </label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Entrez l'adresse complète"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    />
                  </div>
                )}

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message pour l&apos;éducateur (optionnel)
                  </label>
                  <textarea
                    value={familyNotes}
                    onChange={(e) => setFamilyNotes(e.target.value)}
                    rows={4}
                    placeholder="Décrivez brièvement vos besoins, objectifs ou questions..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                {/* Bouton de soumission */}
                <div className="flex gap-4 pt-4">
                  <Link
                    href={`/educator/${params.id}`}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition text-center"
                  >
                    Annuler
                  </Link>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
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
