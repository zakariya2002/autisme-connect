'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { signOut } from '@/lib/auth';
import Logo from '@/components/Logo';
import EducatorMobileMenu from '@/components/EducatorMobileMenu';

interface WeeklySlot {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

interface Exception {
  id: string;
  date: string;
  start_time: string | null;
  end_time: string | null;
  exception_type: 'blocked' | 'available' | 'vacation';
  reason: string | null;
}

const DAYS = [
  { value: 1, label: 'Lundi' },
  { value: 2, label: 'Mardi' },
  { value: 3, label: 'Mercredi' },
  { value: 4, label: 'Jeudi' },
  { value: 5, label: 'Vendredi' },
  { value: 6, label: 'Samedi' },
  { value: 0, label: 'Dimanche' },
];

export default function AvailabilityPage() {
  const router = useRouter();
  const [educatorId, setEducatorId] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [weeklySlots, setWeeklySlots] = useState<WeeklySlot[]>([]);
  const [exceptions, setExceptions] = useState<Exception[]>([]);
  const [loading, setLoading] = useState(true);

  // Formulaire créneaux hebdomadaires
  const [newSlot, setNewSlot] = useState({
    day_of_week: 1,
    start_time: '09:00',
    end_time: '17:00',
  });

  // Formulaire exceptions
  const [newException, setNewException] = useState({
    date: '',
    start_time: '',
    end_time: '',
    exception_type: 'blocked' as 'blocked' | 'available' | 'vacation',
    reason: '',
  });

  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (educatorId) {
      fetchAvailability();
    }
  }, [educatorId]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      router.push('/auth/login');
      return;
    }

    const { data: profile } = await supabase
      .from('educator_profiles')
      .select('*')
      .eq('user_id', session.user.id)
      .single();

    if (profile) {
      setEducatorId(profile.id);
      setProfile(profile);

      // Récupérer l'abonnement
      const { data: subscriptionData } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('educator_id', profile.id)
        .in('status', ['active', 'trialing'])
        .limit(1)
        .maybeSingle();

      setSubscription(subscriptionData);
    }
  };

  const fetchAvailability = async () => {
    setLoading(true);
    try {
      // Récupérer les créneaux hebdomadaires
      const { data: slots } = await supabase
        .from('educator_weekly_availability')
        .select('*')
        .eq('educator_id', educatorId)
        .order('day_of_week')
        .order('start_time');

      if (slots) setWeeklySlots(slots);

      // Récupérer les exceptions
      const { data: excs } = await supabase
        .from('educator_availability_exceptions')
        .select('*')
        .eq('educator_id', educatorId)
        .gte('date', new Date().toISOString().split('T')[0])
        .order('date');

      if (excs) setExceptions(excs);
    } catch (err: any) {
      setError('Erreur lors du chargement des disponibilités');
    } finally {
      setLoading(false);
    }
  };

  const addWeeklySlot = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const { error: insertError } = await supabase
        .from('educator_weekly_availability')
        .insert({
          educator_id: educatorId,
          ...newSlot,
        });

      if (insertError) throw insertError;

      setSuccess('Créneau ajouté avec succès !');
      setNewSlot({ day_of_week: 1, start_time: '09:00', end_time: '17:00' });
      fetchAvailability();

      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const deleteWeeklySlot = async (id: string) => {
    if (!confirm('Voulez-vous vraiment supprimer ce créneau ?')) return;

    try {
      const { error: deleteError } = await supabase
        .from('educator_weekly_availability')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      setSuccess('Créneau supprimé');
      fetchAvailability();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const addException = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const exceptionData: any = {
        educator_id: educatorId,
        date: newException.date,
        exception_type: newException.exception_type,
        reason: newException.reason || null,
      };

      // Si ce n'est pas des vacances complètes, ajouter les heures
      if (newException.exception_type !== 'vacation' && newException.start_time && newException.end_time) {
        exceptionData.start_time = newException.start_time;
        exceptionData.end_time = newException.end_time;
      }

      const { error: insertError } = await supabase
        .from('educator_availability_exceptions')
        .insert(exceptionData);

      if (insertError) throw insertError;

      setSuccess('Exception ajoutée avec succès !');
      setNewException({
        date: '',
        start_time: '',
        end_time: '',
        exception_type: 'blocked',
        reason: '',
      });
      fetchAvailability();

      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const deleteException = async (id: string) => {
    if (!confirm('Voulez-vous vraiment supprimer cette exception ?')) return;

    try {
      const { error: deleteError } = await supabase
        .from('educator_availability_exceptions')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      setSuccess('Exception supprimée');
      fetchAvailability();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const getDayLabel = (dayNum: number) => {
    return DAYS.find(d => d.value === dayNum)?.label || '';
  };

  const getExceptionTypeLabel = (type: string) => {
    const labels = {
      blocked: 'Bloqué',
      available: 'Disponible',
      vacation: 'Vacances'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getExceptionTypeColor = (type: string) => {
    const colors = {
      blocked: 'bg-red-100 text-red-700',
      available: 'bg-green-100 text-green-700',
      vacation: 'bg-blue-100 text-blue-700'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  const isPremium = subscription && ['active', 'trialing'].includes(subscription.status);

  if (loading && !educatorId) {
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
            <div className="flex items-center gap-3">
              {/* Menu mobile (hamburger) */}
              <div className="md:hidden">
                <EducatorMobileMenu profile={profile} isPremium={isPremium} onLogout={handleLogout} />
              </div>
              {/* Logo */}
              <div className="hidden md:block">
                <Logo href="/dashboard/educator" />
              </div>
            </div>
            {/* Menu desktop - caché sur mobile */}
            <div className="hidden md:flex space-x-4">
              <Link href="/dashboard/educator" className="text-gray-700 hover:text-primary-600 px-3 py-2 font-medium transition">
                Tableau de bord
              </Link>
              <Link href="/dashboard/educator/profile" className="text-gray-700 hover:text-primary-600 px-3 py-2 font-medium transition">
                Mon profil
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mes disponibilités</h1>
          <p className="text-gray-600 mt-1">Gérez vos horaires de travail et vos périodes d'indisponibilité</p>
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Section 1 : Horaires hebdomadaires */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Horaires hebdomadaires</h2>
              <p className="text-sm text-gray-600 mt-1">Définissez vos horaires récurrents chaque semaine</p>
            </div>

            {/* Formulaire ajout créneau */}
            <form onSubmit={addWeeklySlot} className="p-6 border-b border-gray-200 bg-gray-50">
              <h3 className="text-sm font-medium text-gray-700 mb-4">Ajouter un créneau</h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Jour
                  </label>
                  <select
                    value={newSlot.day_of_week}
                    onChange={(e) => setNewSlot({ ...newSlot, day_of_week: parseInt(e.target.value) })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    {DAYS.map((day) => (
                      <option key={day.value} value={day.value}>
                        {day.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Heure de début
                    </label>
                    <input
                      type="time"
                      value={newSlot.start_time}
                      onChange={(e) => setNewSlot({ ...newSlot, start_time: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Heure de fin
                    </label>
                    <input
                      type="time"
                      value={newSlot.end_time}
                      onChange={(e) => setNewSlot({ ...newSlot, end_time: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
                >
                  Ajouter le créneau
                </button>
              </div>
            </form>

            {/* Liste des créneaux */}
            <div className="p-6">
              {loading ? (
                <p className="text-gray-500 text-center py-4">Chargement...</p>
              ) : weeklySlots.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Aucun créneau défini</p>
              ) : (
                <div className="space-y-2">
                  {weeklySlots.map((slot) => (
                    <div
                      key={slot.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{getDayLabel(slot.day_of_week)}</p>
                        <p className="text-sm text-gray-600">
                          {slot.start_time} - {slot.end_time}
                        </p>
                      </div>
                      <button
                        onClick={() => deleteWeeklySlot(slot.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Section 2 : Exceptions */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Exceptions et vacances</h2>
              <p className="text-sm text-gray-600 mt-1">Bloquez des dates ou ajoutez des disponibilités exceptionnelles</p>
            </div>

            {/* Formulaire ajout exception */}
            <form onSubmit={addException} className="p-6 border-b border-gray-200 bg-gray-50">
              <h3 className="text-sm font-medium text-gray-700 mb-4">Ajouter une exception</h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={newException.date}
                    onChange={(e) => setNewException({ ...newException, date: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    value={newException.exception_type}
                    onChange={(e) => setNewException({ ...newException, exception_type: e.target.value as any })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="blocked">Jour bloqué</option>
                    <option value="available">Disponible exceptionnellement</option>
                    <option value="vacation">Vacances</option>
                  </select>
                </div>

                {newException.exception_type !== 'vacation' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Heure de début
                      </label>
                      <input
                        type="time"
                        value={newException.start_time}
                        onChange={(e) => setNewException({ ...newException, start_time: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Heure de fin
                      </label>
                      <input
                        type="time"
                        value={newException.end_time}
                        onChange={(e) => setNewException({ ...newException, end_time: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Raison (optionnel)
                  </label>
                  <input
                    type="text"
                    value={newException.reason}
                    onChange={(e) => setNewException({ ...newException, reason: e.target.value })}
                    placeholder="Formation, congé, etc."
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
                >
                  Ajouter l'exception
                </button>
              </div>
            </form>

            {/* Liste des exceptions */}
            <div className="p-6">
              {loading ? (
                <p className="text-gray-500 text-center py-4">Chargement...</p>
              ) : exceptions.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Aucune exception définie</p>
              ) : (
                <div className="space-y-2">
                  {exceptions.map((exc) => (
                    <div
                      key={exc.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-gray-900">
                            {new Date(exc.date + 'T00:00:00').toLocaleDateString('fr-FR', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getExceptionTypeColor(exc.exception_type)}`}>
                            {getExceptionTypeLabel(exc.exception_type)}
                          </span>
                        </div>
                        {exc.start_time && exc.end_time && (
                          <p className="text-sm text-gray-600">
                            {exc.start_time} - {exc.end_time}
                          </p>
                        )}
                        {exc.reason && (
                          <p className="text-sm text-gray-500 italic">{exc.reason}</p>
                        )}
                      </div>
                      <button
                        onClick={() => deleteException(exc.id)}
                        className="text-red-600 hover:text-red-700 ml-4"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
