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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-primary-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <EducatorNavbar profile={profile} subscription={subscription} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Mes disponibilités</h1>
          <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
            Ajoutez vos créneaux disponibles pour que les familles puissent réserver.
          </p>
        </div>

        {/* Messages */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <p className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
              {message.text}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulaire d'ajout */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Ajouter une disponibilité
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Heure de début
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Heure de fin
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <button
                  onClick={handleAddAvailability}
                  disabled={saving}
                  className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {saving ? 'Ajout...' : 'Ajouter'}
                </button>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Astuce</p>
                    <ul className="space-y-1 text-xs">
                      <li>• Ajoutez vos dates disponibles à l&apos;avance</li>
                      <li>• Les familles verront ces horaires</li>
                      <li>• Vous pouvez activer/désactiver un créneau</li>
                      <li>• Les RDV réservés masqueront le créneau</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Liste des disponibilités */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  Vos créneaux à venir ({availabilities.length})
                </h2>
              </div>

              <div className="p-6">
                {availabilities.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune disponibilité</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Commencez par ajouter vos premiers créneaux disponibles.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {Object.keys(groupedAvailabilities).sort().map(date => (
                      <div key={date}>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3 capitalize">
                          {formatDate(date)}
                        </h3>
                        <div className="space-y-2">
                          {groupedAvailabilities[date].map(slot => (
                            <div
                              key={slot.id}
                              className={`p-4 rounded-lg border-2 transition ${
                                slot.is_available
                                  ? 'border-green-200 bg-green-50'
                                  : 'border-gray-200 bg-gray-50'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                                    slot.is_available ? 'bg-green-500' : 'bg-gray-400'
                                  }`}></div>
                                  <div>
                                    <p className="font-medium text-gray-900">
                                      {slot.start_time} - {slot.end_time}
                                    </p>
                                    <p className={`text-xs ${
                                      slot.is_available ? 'text-green-600' : 'text-gray-500'
                                    }`}>
                                      {slot.is_available ? 'Disponible' : 'Désactivé'}
                                    </p>
                                  </div>
                                </div>

                                {/* Actions - visible uniquement sur desktop */}
                                <div className="hidden sm:flex items-center gap-2">
                                  <button
                                    onClick={() => handleToggleAvailability(slot.id, slot.is_available)}
                                    className={`px-3 py-1 rounded text-sm font-medium transition ${
                                      slot.is_available
                                        ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                                    }`}
                                  >
                                    {slot.is_available ? 'Désactiver' : 'Activer'}
                                  </button>
                                  <button
                                    onClick={() => handleDeleteAvailability(slot.id)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                                  >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                </div>
                              </div>

                              {/* Actions mobile - en dessous */}
                              <div className="sm:hidden flex items-center gap-2 mt-3 pt-3 border-t border-gray-200">
                                <button
                                  onClick={() => handleToggleAvailability(slot.id, slot.is_available)}
                                  className={`flex-1 px-3 py-2 rounded text-sm font-medium transition ${
                                    slot.is_available
                                      ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                                  }`}
                                >
                                  {slot.is_available ? 'Désactiver' : 'Activer'}
                                </button>
                                <button
                                  onClick={() => handleDeleteAvailability(slot.id)}
                                  className="px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded transition text-sm font-medium"
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
      </div>
    </div>
  );
}
