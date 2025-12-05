'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { signOut } from '@/lib/auth';
import Logo from '@/components/Logo';
import FamilyMobileMenu from '@/components/FamilyMobileMenu';

// Mapping des emojis par profession
const professionEmojis: { [key: string]: string } = {
  educator: '👨‍🏫',
  moniteur_educateur: '👥',
  psychologist: '🧠',
  psychomotricist: '🤸',
  occupational_therapist: '🖐️',
  speech_therapist: '🗣️',
  physiotherapist: '💪',
  apa_teacher: '🏃',
  music_therapist: '🎵',
};

// Labels des professions
const professionLabels: { [key: string]: string } = {
  educator: 'Éducateur spécialisé',
  moniteur_educateur: 'Moniteur éducateur',
  psychologist: 'Psychologue',
  psychomotricist: 'Psychomotricien',
  occupational_therapist: 'Ergothérapeute',
  speech_therapist: 'Orthophoniste',
  physiotherapist: 'Kinésithérapeute',
  apa_teacher: 'Enseignant APA',
  music_therapist: 'Musicothérapeute',
};

// Couleurs des statuts
const statusColors: { [key: string]: { bg: string; text: string; label: string } } = {
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'En attente' },
  accepted: { bg: 'bg-green-100', text: 'text-green-800', label: 'Confirmé' },
  rejected: { bg: 'bg-red-100', text: 'text-red-800', label: 'Refusé' },
  cancelled: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Annulé' },
  completed: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Terminé' },
};

interface CalendarAppointment {
  id: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: string;
  educator: {
    id: string;
    first_name: string;
    last_name: string;
    profession_type: string;
    avatar_url?: string;
  };
}

export default function FamilyDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [profile, setProfile] = useState<any>(null);
  const [familyId, setFamilyId] = useState<string | null>(null);
  const [stats, setStats] = useState({
    appointments: 0,
    messages: 0,
  });
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // États pour le calendrier
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarAppointments, setCalendarAppointments] = useState<CalendarAppointment[]>([]);
  const [selectedDayAppointments, setSelectedDayAppointments] = useState<CalendarAppointment[]>([]);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    fetchProfile();
    fetchStats();

    // Vérifier si on vient d'un paiement réussi
    if (searchParams.get('booking') === 'success') {
      setShowSuccessMessage(true);
    }
  }, []);

  // Charger les rendez-vous quand le mois change ou quand familyId est disponible
  useEffect(() => {
    if (familyId) {
      fetchCalendarAppointments(familyId);
    }
  }, [currentMonth, familyId]);

  const handleCloseSuccessMessage = () => {
    setShowSuccessMessage(false);
    // Nettoyer l'URL
    router.replace('/dashboard/family');
  };

  const fetchProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      router.push('/auth/login');
      return;
    }

    const { data } = await supabase
      .from('family_profiles')
      .select('*')
      .eq('user_id', session.user.id)
      .single();

    setProfile(data);
  };

  const fetchStats = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    const { data: familyProfile } = await supabase
      .from('family_profiles')
      .select('id')
      .eq('user_id', session.user.id)
      .single();

    if (familyProfile) {
      setFamilyId(familyProfile.id);

      const { count: appointmentsCount } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('family_id', familyProfile.id);

      const { count: messagesCount } = await supabase
        .from('conversations')
        .select('*', { count: 'exact', head: true })
        .eq('family_id', familyProfile.id);

      setStats({
        appointments: appointmentsCount || 0,
        messages: messagesCount || 0,
      });
    }
  };

  const fetchCalendarAppointments = async (fId: string) => {
    if (!fId) return;

    // Calculer le premier et dernier jour du mois
    const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

    const { data, error } = await supabase
      .from('appointments')
      .select(`
        id,
        appointment_date,
        start_time,
        end_time,
        status,
        educator:educator_profiles!educator_id (
          id,
          first_name,
          last_name,
          profession_type,
          avatar_url
        )
      `)
      .eq('family_id', fId)
      .gte('appointment_date', firstDay.toISOString().split('T')[0])
      .lte('appointment_date', lastDay.toISOString().split('T')[0])
      .in('status', ['pending', 'accepted', 'completed'])
      .order('appointment_date', { ascending: true });

    if (!error && data) {
      setCalendarAppointments(data as unknown as CalendarAppointment[]);
    }
  };

  // Fonctions utilitaires pour le calendrier
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; // Lundi = 0
    return { daysInMonth, startingDay };
  };

  const getAppointmentsForDay = (day: number) => {
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return calendarAppointments.filter(apt => apt.appointment_date === dateStr);
  };

  const handleDayClick = (day: number) => {
    const appointments = getAppointmentsForDay(day);
    if (appointments.length > 0) {
      setSelectedDayAppointments(appointments);
      setSelectedDate(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day));
      setShowPopup(true);
    }
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  };

  const handleLogout = async () => {
    await signOut();
    // Forcer un rechargement complet pour vider le cache
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen min-h-[100dvh] bg-gray-50 flex flex-col">
      <nav className="bg-white shadow-sm flex-shrink-0 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-14 sm:h-16 items-center">
            {/* Logo - visible sur mobile et desktop */}
            <Logo  />
            {/* Menu mobile (hamburger) */}
            <div className="md:hidden">
              <FamilyMobileMenu profile={profile} onLogout={handleLogout} />
            </div>
            {/* Menu desktop - caché sur mobile */}
            <div className="hidden md:flex space-x-4">
              <Link href="/dashboard/family/profile" className="text-gray-700 hover:text-primary-600 px-3 py-2 font-medium transition">
                Mon profil
              </Link>
              <button onClick={handleLogout} className="text-gray-700 hover:text-primary-600 px-3 py-2 font-medium transition">
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex-1 pb-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Message de succès après paiement */}
        {showSuccessMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-green-900 mb-1">
                  Réservation confirmée !
                </h3>
                <p className="text-sm text-green-800 mb-2">
                  Votre paiement a été effectué avec succès et votre rendez-vous a été réservé.
                </p>
                <div className="bg-white border border-green-200 rounded-lg p-3 text-sm text-gray-700">
                  <p className="mb-1 font-medium">Prochaines étapes :</p>
                  <ul className="list-disc list-inside space-y-0.5 ml-1 text-xs">
                    <li>L'éducateur va recevoir votre demande de rendez-vous</li>
                    <li>Vous recevrez une notification par email une fois le rendez-vous accepté</li>
                  </ul>
                </div>
              </div>
              <button
                onClick={handleCloseSuccessMessage}
                className="flex-shrink-0 text-green-600 hover:text-green-800 transition"
                aria-label="Fermer le message"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Bandeau de bienvenue */}
        <div className="mb-4 sm:mb-8 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg relative overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-24 -right-24 w-48 h-48 sm:w-64 sm:h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-24 -left-24 w-48 h-48 sm:w-64 sm:h-64 bg-white/10 rounded-full blur-3xl"></div>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 relative z-10">
            <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-white/20 backdrop-blur flex items-center justify-center border-2 sm:border-4 border-white/30 shadow-lg flex-shrink-0">
              <span className="text-white font-bold text-lg sm:text-xl">
                {profile?.first_name?.[0]?.toUpperCase()}{profile?.last_name?.[0]?.toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-white truncate">
                Bienvenue, {profile?.first_name}
              </h1>
              <p className="text-white/80 text-xs sm:text-sm mt-0.5">Tableau de bord aidant</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-8">
          {/* Rendez-vous */}
          <div className="bg-blue-50 rounded-lg sm:rounded-xl p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] sm:text-xs text-gray-500">Rendez-vous</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.appointments}</p>
            </div>
          </div>

          {/* Conversations */}
          <div className="bg-amber-50 rounded-lg sm:rounded-xl p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] sm:text-xs text-gray-500">Conversations</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.messages}</p>
            </div>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 mb-4 sm:mb-8">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">Actions rapides</h2>
          </div>
          <div className="p-3 sm:p-4 grid grid-cols-2 gap-2 sm:gap-3">
            {/* Mon profil */}
            <Link
              href="/dashboard/family/profile"
              className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-blue-50 rounded-lg sm:rounded-xl hover:bg-blue-100 transition-colors"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="h-4 w-4 sm:h-5 sm:w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <span className="font-medium text-gray-900 text-sm sm:text-base">Mon profil</span>
            </Link>

            {/* Mes accompagnements */}
            <Link
              href="/dashboard/family/children"
              className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-purple-50 rounded-lg sm:rounded-xl hover:bg-purple-100 transition-colors"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="h-4 w-4 sm:h-5 sm:w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <span className="font-medium text-gray-900 text-sm sm:text-base truncate">Accompagnements</span>
            </Link>

            {/* Chercher un éducateur */}
            <Link
              href="/search"
              className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-green-50 rounded-lg sm:rounded-xl hover:bg-green-100 transition-colors"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="h-4 w-4 sm:h-5 sm:w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <span className="font-medium text-gray-900 text-sm sm:text-base truncate">Trouver un pro</span>
            </Link>

            {/* Mes favoris */}
            <Link
              href="/dashboard/family/favorites"
              className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-red-50 rounded-lg sm:rounded-xl hover:bg-red-100 transition-colors"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="h-4 w-4 sm:h-5 sm:w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <span className="font-medium text-gray-900 text-sm sm:text-base truncate">Mes favoris</span>
            </Link>

            {/* Messages */}
            <Link
              href="/messages"
              className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-indigo-50 rounded-lg sm:rounded-xl hover:bg-indigo-100 transition-colors"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="h-4 w-4 sm:h-5 sm:w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <span className="font-medium text-gray-900 text-sm sm:text-base">Messages</span>
            </Link>

            {/* Mes rendez-vous */}
            <Link
              href="/bookings"
              className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-teal-50 rounded-lg sm:rounded-xl hover:bg-teal-100 transition-colors"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-teal-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="h-4 w-4 sm:h-5 sm:w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="font-medium text-gray-900 text-sm sm:text-base">Rendez-vous</span>
            </Link>

            {/* Mes reçus */}
            <Link
              href="/dashboard/family/receipts"
              className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-pink-50 rounded-lg sm:rounded-xl hover:bg-pink-100 transition-colors"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="h-4 w-4 sm:h-5 sm:w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="font-medium text-gray-900 text-sm sm:text-base">Mes reçus</span>
            </Link>

            {/* Aides financières */}
            <Link
              href="/dashboard/family/aides"
              className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-violet-50 rounded-lg sm:rounded-xl hover:bg-violet-100 transition-colors"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-violet-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="h-4 w-4 sm:h-5 sm:w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="font-medium text-gray-900 text-sm sm:text-base truncate">Aides</span>
            </Link>
          </div>
        </div>

        {/* Calendrier prévisionnel */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">Calendrier prévisionnel</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={goToPreviousMonth}
                  className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Mois précédent"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <span className="text-sm sm:text-base font-medium text-gray-700 min-w-[120px] sm:min-w-[150px] text-center capitalize">
                  {formatMonthYear(currentMonth)}
                </span>
                <button
                  onClick={goToNextMonth}
                  className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Mois suivant"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div className="p-3 sm:p-4">
            {/* En-têtes des jours */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
                <div key={day} className="text-center text-[10px] sm:text-xs font-medium text-gray-500 py-1">
                  {day}
                </div>
              ))}
            </div>

            {/* Grille du calendrier */}
            <div className="grid grid-cols-7 gap-1">
              {(() => {
                const { daysInMonth, startingDay } = getDaysInMonth(currentMonth);
                const today = new Date();
                const isCurrentMonth = today.getMonth() === currentMonth.getMonth() && today.getFullYear() === currentMonth.getFullYear();
                const cells = [];

                // Cellules vides pour les jours avant le 1er du mois
                for (let i = 0; i < startingDay; i++) {
                  cells.push(<div key={`empty-${i}`} className="aspect-square"></div>);
                }

                // Jours du mois
                for (let day = 1; day <= daysInMonth; day++) {
                  const dayAppointments = getAppointmentsForDay(day);
                  const hasAppointments = dayAppointments.length > 0;
                  const isToday = isCurrentMonth && today.getDate() === day;

                  cells.push(
                    <button
                      key={day}
                      onClick={() => handleDayClick(day)}
                      disabled={!hasAppointments}
                      className={`
                        aspect-square rounded-lg sm:rounded-xl flex flex-col items-center justify-center relative transition-all
                        ${isToday ? 'ring-2 ring-purple-500 ring-offset-1' : ''}
                        ${hasAppointments ? 'bg-purple-50 hover:bg-purple-100 cursor-pointer' : 'hover:bg-gray-50'}
                      `}
                    >
                      <span className={`text-xs sm:text-sm font-medium ${isToday ? 'text-purple-600' : 'text-gray-700'}`}>
                        {day}
                      </span>
                      {hasAppointments && (
                        <div className="flex items-center justify-center gap-0.5 mt-0.5">
                          {dayAppointments.slice(0, 2).map((apt, idx) => (
                            <span key={idx} className="text-[10px] sm:text-xs">
                              {professionEmojis[apt.educator?.profession_type] || '📅'}
                            </span>
                          ))}
                          {dayAppointments.length > 2 && (
                            <span className="text-[8px] sm:text-[10px] text-gray-500">+{dayAppointments.length - 2}</span>
                          )}
                        </div>
                      )}
                    </button>
                  );
                }

                return cells;
              })()}
            </div>

            {/* Légende des emojis */}
            <div className="mt-4 pt-3 border-t border-gray-100 pb-4">
              <p className="text-[10px] sm:text-xs text-gray-500 mb-2">Légende :</p>
              <div className="flex flex-wrap gap-x-3 gap-y-1.5 sm:gap-3">
                {Object.entries(professionEmojis).map(([key, emoji]) => (
                  <div key={key} className="flex items-center gap-1">
                    <span className="text-xs sm:text-sm">{emoji}</span>
                    <span className="text-[9px] sm:text-[10px] text-gray-600">
                      {key === 'apa_teacher' ? 'Sport adapté' :
                       key === 'music_therapist' ? 'Musico.' :
                       key === 'occupational_therapist' ? 'Ergo.' :
                       key === 'speech_therapist' ? 'Ortho.' :
                       key === 'physiotherapist' ? 'Kiné' :
                       key === 'moniteur_educateur' ? 'Moniteur' :
                       professionLabels[key]?.split(' ')[0]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        {/* Espace supplémentaire pour iOS */}
        <div className="h-16 sm:h-0"></div>
        </div>
      </div>

      {/* Popup des détails du jour */}
      {showPopup && selectedDate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowPopup(false)}>
          <div
            className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-purple-500 to-fuchsia-500">
              <div>
                <h3 className="text-lg font-bold text-white">
                  {selectedDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                </h3>
                <p className="text-white/80 text-sm">
                  {selectedDayAppointments.length} rendez-vous
                </p>
              </div>
              <button
                onClick={() => setShowPopup(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                aria-label="Fermer"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-4 overflow-y-auto max-h-[60vh] space-y-3">
              {selectedDayAppointments.map((apt) => (
                <div key={apt.id} className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl">
                        {professionEmojis[apt.educator?.profession_type] || '📅'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-gray-900 truncate">
                          {apt.educator?.first_name} {apt.educator?.last_name}
                        </p>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${statusColors[apt.status]?.bg} ${statusColors[apt.status]?.text}`}>
                          {statusColors[apt.status]?.label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {professionLabels[apt.educator?.profession_type] || 'Professionnel'}
                      </p>
                      <div className="flex items-center gap-1 mt-2 text-sm text-gray-700">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-medium">
                          {apt.start_time?.slice(0, 5)} - {apt.end_time?.slice(0, 5)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
              <Link
                href="/bookings"
                className="block w-full text-center py-2.5 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors"
                onClick={() => setShowPopup(false)}
              >
                Voir tous mes rendez-vous
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
