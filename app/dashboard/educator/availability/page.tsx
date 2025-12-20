'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { signOut } from '@/lib/auth';
import EducatorNavbar from '@/components/EducatorNavbar';

interface TimeSlot {
  id: string;
  availability_date: string; // Format: "2025-11-25"
  start_time: string; // Format: "09:00"
  end_time: string; // Format: "17:00"
  is_available: boolean;
}

export default function EducatorAvailability() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [availabilities, setAvailabilities] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form state
  const [selectedDate, setSelectedDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');

  useEffect(() => {
    fetchData();
    // Initialiser la date au lendemain
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setSelectedDate(tomorrow.toISOString().split('T')[0]);
  }, []);

  const fetchData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      router.push('/auth/login');
      return;
    }

    // Récupérer le profil éducateur
    const { data: profileData } = await supabase
      .from('educator_profiles')
      .select('*')
      .eq('user_id', session.user.id)
      .single();

    if (profileData) {
      setProfile(profileData);

      // Récupérer l'abonnement
      const { data: subscriptionData } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('educator_id', profileData.id)
        .in('status', ['active', 'trialing'])
        .limit(1)
        .maybeSingle();

      setSubscription(subscriptionData);

      // Récupérer les disponibilités (seulement futures)
      const { data: availData } = await supabase
        .from('educator_availability')
        .select('*')
        .eq('educator_id', profileData.id)
        .gte('availability_date', new Date().toISOString().split('T')[0])
        .order('availability_date', { ascending: true })
        .order('start_time', { ascending: true });

      if (availData) {
        setAvailabilities(availData);
      }
    }

    setLoading(false);
  };

  const handleAddAvailability = async () => {
    if (!profile) return;

    // Validation
    if (!selectedDate) {
      setMessage({ type: 'error', text: 'Veuillez sélectionner une date' });
      return;
    }

    if (startTime >= endTime) {
      setMessage({ type: 'error', text: 'L\'heure de fin doit être après l\'heure de début' });
      return;
    }

    // Vérifier que la date est dans le futur
    const today = new Date().toISOString().split('T')[0];
    if (selectedDate < today) {
      setMessage({ type: 'error', text: 'Vous ne pouvez pas ajouter une disponibilité dans le passé' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const { data, error } = await supabase
        .from('educator_availability')
        .insert({
          educator_id: profile.id,
          availability_date: selectedDate,
          start_time: startTime,
          end_time: endTime,
          is_available: true,
        })
        .select()
        .single();

      if (error) throw error;

      setAvailabilities([...availabilities, data].sort((a, b) => {
        if (a.availability_date !== b.availability_date) {
          return a.availability_date.localeCompare(b.availability_date);
        }
        return a.start_time.localeCompare(b.start_time);
      }));

      setMessage({ type: 'success', text: 'Disponibilité ajoutée avec succès' });

      // Incrémenter la date d'un jour pour faciliter l'ajout de plusieurs jours
      const nextDate = new Date(selectedDate);
      nextDate.setDate(nextDate.getDate() + 1);
      setSelectedDate(nextDate.toISOString().split('T')[0]);
    } catch (error: any) {
      console.error('Erreur ajout disponibilité:', error);
      setMessage({ type: 'error', text: 'Erreur lors de l\'ajout de la disponibilité' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAvailability = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette disponibilité ?')) return;

    try {
      const { error } = await supabase
        .from('educator_availability')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setAvailabilities(availabilities.filter(a => a.id !== id));
      setMessage({ type: 'success', text: 'Disponibilité supprimée' });
    } catch (error: any) {
      console.error('Erreur suppression:', error);
      setMessage({ type: 'error', text: 'Erreur lors de la suppression' });
    }
  };

  const handleToggleAvailability = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('educator_availability')
        .update({ is_available: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      setAvailabilities(availabilities.map(a =>
        a.id === id ? { ...a, is_available: !currentStatus } : a
      ));
      setMessage({ type: 'success', text: 'Statut modifié' });
    } catch (error: any) {
      console.error('Erreur toggle:', error);
      setMessage({ type: 'error', text: 'Erreur lors de la modification' });
    }
  };

  const isPremium = subscription && ['active', 'trialing'].includes(subscription.status);

  const handleLogout = async () => {
    await signOut();
    window.location.href = '/';
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

  // Grouper par date
  const groupedAvailabilities = availabilities.reduce((acc, slot) => {
    if (!acc[slot.availability_date]) {
      acc[slot.availability_date] = [];
    }
    acc[slot.availability_date].push(slot);
    return acc;
  }, {} as Record<string, TimeSlot[]>);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#fdf9f4' }}>
        <div
          className="animate-spin h-12 w-12 border-4 border-t-transparent rounded-full"
          style={{ borderColor: '#41005c', borderTopColor: 'transparent' }}
          role="status"
          aria-label="Chargement en cours"
        >
          <span className="sr-only">Chargement...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col" style={{ backgroundColor: '#fdf9f4' }}>
      {/* Navigation */}
      <div className="sticky top-0 z-40">
        <EducatorNavbar profile={profile} subscription={subscription} />
      </div>

      <div className="flex-1 max-w-3xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 w-full">
        {/* En-tête centré avec icône */}
        <div className="mb-5 sm:mb-8 text-center">
          <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-full flex items-center justify-center p-1" style={{ backgroundColor: '#41005c' }}>
            <img src="/images/icons/clock.svg" alt="" className="w-full h-full" />
          </div>
          <h1 className="text-lg sm:text-2xl font-bold text-gray-900">Mes disponibilités</h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-1 px-2">Ajoutez vos créneaux pour que les familles puissent réserver</p>
        </div>

        {/* Messages */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}
            role="alert"
            aria-live="polite"
          >
            <p className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
              {message.text}
            </p>
          </div>
        )}

        {/* Formulaire d'ajout */}
        <div className="bg-white rounded-2xl shadow-sm p-3 sm:p-5 mb-4 sm:mb-6 border border-gray-100">
          <h2 className="text-sm sm:text-lg font-semibold mb-3 sm:mb-4" style={{ color: '#41005c' }}>
            Ajouter une disponibilité
          </h2>

          <div className="space-y-3 mb-3 sm:mb-4">
            {/* Date - pleine largeur sur mobile */}
            <div>
              <label htmlFor="availability-date" className="block text-xs font-medium text-gray-600 mb-1">
                Date
              </label>
              <input
                id="availability-date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-3 sm:py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 text-base"
                style={{ '--tw-ring-color': '#41005c', fontSize: '16px' } as React.CSSProperties}
                aria-required="true"
                aria-describedby="date-description"
              />
              <span id="date-description" className="sr-only">
                Sélectionnez une date pour votre disponibilité. Seules les dates futures sont autorisées.
              </span>
            </div>

            {/* Heures côte à côte */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <div>
                <label htmlFor="availability-start-time" className="block text-xs font-medium text-gray-600 mb-1">
                  Début
                </label>
                <input
                  id="availability-start-time"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-2 sm:px-3 py-3 sm:py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 text-base text-center"
                  style={{ '--tw-ring-color': '#41005c', fontSize: '16px' } as React.CSSProperties}
                  aria-required="true"
                />
              </div>

              <div>
                <label htmlFor="availability-end-time" className="block text-xs font-medium text-gray-600 mb-1">
                  Fin
                </label>
                <input
                  id="availability-end-time"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-2 sm:px-3 py-3 sm:py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 text-base text-center"
                  style={{ '--tw-ring-color': '#41005c', fontSize: '16px' } as React.CSSProperties}
                  aria-required="true"
                  aria-describedby="time-description"
                />
                <span id="time-description" className="sr-only">
                  L'heure de fin doit être postérieure à l'heure de début.
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={handleAddAvailability}
            disabled={saving}
            className="w-full text-white py-3 px-4 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed font-medium hover:opacity-90 text-sm"
            style={{ backgroundColor: '#41005c' }}
            aria-label="Ajouter une nouvelle disponibilité"
            aria-busy={saving}
          >
            {saving ? 'Ajout en cours...' : '+ Ajouter ce créneau'}
          </button>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-6">
          <div className="bg-white rounded-xl p-3 sm:p-4 text-center border border-gray-100 shadow-sm">
            <p className="text-xl sm:text-2xl font-bold" style={{ color: '#41005c' }}>{availabilities.length}</p>
            <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1">Créneaux à venir</p>
          </div>
          <div className="bg-white rounded-xl p-3 sm:p-4 text-center border border-gray-100 shadow-sm">
            <p className="text-xl sm:text-2xl font-bold" style={{ color: '#41005c' }}>{availabilities.filter(a => a.is_available).length}</p>
            <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1">Disponibles</p>
          </div>
        </div>

        {/* Liste des disponibilités */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* En-tête de section */}
          <div className="px-3 sm:px-5 py-3 sm:py-4 border-b border-gray-100" style={{ backgroundColor: '#faf5ff' }}>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#41005c' }}>
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-semibold text-gray-900">Vos créneaux à venir</h2>
                <p className="text-[10px] sm:text-xs text-gray-500">{availabilities.length} créneau{availabilities.length > 1 ? 'x' : ''} programmé{availabilities.length > 1 ? 's' : ''}</p>
              </div>
            </div>
          </div>

          <div className="p-3 sm:p-5">
            {availabilities.length === 0 ? (
              <div className="text-center py-6 sm:py-8">
                <div className="mx-auto w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center mb-3" style={{ backgroundColor: '#f3e8ff' }}>
                  <svg
                    className="h-6 w-6 sm:h-7 sm:w-7"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    style={{ color: '#41005c' }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xs sm:text-sm font-medium text-gray-900">Aucune disponibilité</h3>
                <p className="mt-1 text-[10px] sm:text-xs text-gray-500">
                  Ajoutez vos premiers créneaux ci-dessus
                </p>
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-5" role="list" aria-label="Liste des créneaux de disponibilité">
                {Object.keys(groupedAvailabilities).sort().map(date => (
                  <div key={date}>
                    <h3 className="text-xs sm:text-sm font-semibold mb-2 capitalize" style={{ color: '#41005c' }}>
                      {formatDate(date)}
                    </h3>
                    <div className="space-y-2" role="list">
                      {groupedAvailabilities[date].map(slot => (
                        <div
                          key={slot.id}
                          className="p-2.5 sm:p-3 rounded-xl border transition"
                          style={{
                            borderColor: slot.is_available ? '#d8b4fe' : '#e5e7eb',
                            backgroundColor: slot.is_available ? '#faf5ff' : '#f9fafb'
                          }}
                          role="listitem"
                          aria-label={`Créneau de ${slot.start_time} à ${slot.end_time}, ${slot.is_available ? 'disponible' : 'désactivé'}`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 sm:gap-3">
                              <div
                                className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full flex-shrink-0"
                                style={{ backgroundColor: slot.is_available ? '#41005c' : '#9ca3af' }}
                                role="status"
                                aria-label={slot.is_available ? 'Statut: Disponible' : 'Statut: Désactivé'}
                              ></div>
                              <div>
                                <p className="font-medium text-gray-900 text-xs sm:text-sm">
                                  {slot.start_time} - {slot.end_time}
                                </p>
                                <p className="text-[10px] sm:text-xs" style={{ color: slot.is_available ? '#7c3aed' : '#6b7280' }}>
                                  {slot.is_available ? 'Disponible' : 'Désactivé'}
                                </p>
                              </div>
                            </div>

                            {/* Actions - visible uniquement sur desktop */}
                            <div className="hidden sm:flex items-center gap-2">
                              <button
                                onClick={() => handleToggleAvailability(slot.id, slot.is_available)}
                                className="px-3 py-1.5 rounded-lg text-xs font-medium transition hover:opacity-90"
                                style={{
                                  backgroundColor: slot.is_available ? '#fef3c7' : '#f3e8ff',
                                  color: slot.is_available ? '#92400e' : '#41005c'
                                }}
                                aria-label={slot.is_available ? `Désactiver le créneau de ${slot.start_time} à ${slot.end_time}` : `Activer le créneau de ${slot.start_time} à ${slot.end_time}`}
                                aria-pressed={slot.is_available}
                              >
                                {slot.is_available ? 'Désactiver' : 'Activer'}
                              </button>
                              <button
                                onClick={() => handleDeleteAvailability(slot.id)}
                                className="p-1.5 rounded-lg transition"
                                style={{ color: '#f0879f', backgroundColor: '#fdf2f4' }}
                                aria-label={`Supprimer le créneau de ${slot.start_time} à ${slot.end_time}`}
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>

                          {/* Actions mobile - en dessous */}
                          <div className="sm:hidden flex items-center gap-2 mt-2 pt-2 border-t border-gray-100">
                            <button
                              onClick={() => handleToggleAvailability(slot.id, slot.is_available)}
                              className="flex-1 px-2 py-1.5 rounded-lg text-[10px] font-medium transition hover:opacity-90"
                              style={{
                                backgroundColor: slot.is_available ? '#fef3c7' : '#f3e8ff',
                                color: slot.is_available ? '#92400e' : '#41005c'
                              }}
                              aria-label={slot.is_available ? `Désactiver le créneau de ${slot.start_time} à ${slot.end_time}` : `Activer le créneau de ${slot.start_time} à ${slot.end_time}`}
                              aria-pressed={slot.is_available}
                            >
                              {slot.is_available ? 'Désactiver' : 'Activer'}
                            </button>
                            <button
                              onClick={() => handleDeleteAvailability(slot.id)}
                              className="px-2 py-1.5 rounded-lg transition text-[10px] font-medium"
                              style={{ color: '#f0879f', backgroundColor: '#fdf2f4' }}
                              aria-label={`Supprimer le créneau de ${slot.start_time} à ${slot.end_time}`}
                            >
                              Supprimer
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
