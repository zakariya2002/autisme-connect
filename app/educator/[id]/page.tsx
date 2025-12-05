'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import Logo from '@/components/Logo';
import MobileMenu from '@/components/MobileMenu';
import HelpButton from '@/components/HelpButton';
import ContactQuestionnaireModal from '@/components/ContactQuestionnaireModal';
import { canEducatorCreateConversation } from '@/lib/subscription-utils';

interface EducatorProfile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  bio: string;
  phone: string;
  location: string;
  years_of_experience: number;
  hourly_rate: number;
  specializations: string[];
  skills: string | null;
  languages: string[];
  avatar_url: string | null;
  avatar_moderation_status: string;
  cv_url: string | null;
  linkedin_url: string | null;
  created_at: string;
}

interface Certification {
  id: string;
  type: string;
  name: string;
  issuing_organization: string;
  issue_date: string;
  verification_status?: string;
  diploma_number?: string;
}

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

// Fonction pour capitaliser correctement un prénom
const capitalizeFirstName = (name: string): string => {
  if (!name || !name.trim()) return '';
  return name
    .trim()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

// Fonction pour formater un nom de famille
const formatLastName = (name: string): string => {
  if (!name || !name.trim()) return '';
  return name.trim().toUpperCase();
};

// Fonction pour obtenir le nom complet formaté
const getFormattedFullName = (firstName: string, lastName: string): string => {
  const formattedFirstName = capitalizeFirstName(firstName);
  const formattedLastName = formatLastName(lastName);

  if (formattedFirstName && formattedLastName) {
    return `${formattedFirstName} ${formattedLastName}`;
  } else if (formattedLastName) {
    return formattedLastName;
  } else if (formattedFirstName) {
    return formattedFirstName;
  }
  return 'Profil sans nom';
};

const DAYS = [
  { value: 1, label: 'Lundi' },
  { value: 2, label: 'Mardi' },
  { value: 3, label: 'Mercredi' },
  { value: 4, label: 'Jeudi' },
  { value: 5, label: 'Vendredi' },
  { value: 6, label: 'Samedi' },
  { value: 0, label: 'Dimanche' },
];

export default function EducatorPublicProfile({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [educator, setEducator] = useState<EducatorProfile | null>(null);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [weeklySlots, setWeeklySlots] = useState<WeeklySlot[]>([]);
  const [dailyAvailabilities, setDailyAvailabilities] = useState<any[]>([]);
  const [exceptions, setExceptions] = useState<Exception[]>([]);
  const [isPremium, setIsPremium] = useState(false);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<'educator' | 'family' | null>(null);
  const [activeTab, setActiveTab] = useState<'about' | 'certifications' | 'availability' | 'cv'>('about');
  const [familyProfileId, setFamilyProfileId] = useState<string | null>(null);
  const [showContactModal, setShowContactModal] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const initPage = async () => {
      try {
        // Vérifier l'authentification de manière non-intrusive
        const { data: { session } } = await supabase.auth.getSession();
        if (isMounted && session?.user) {
          setIsAuthenticated(true);

          // Déterminer le rôle de l'utilisateur
          const { data: educatorProfile } = await supabase
            .from('educator_profiles')
            .select('id')
            .eq('user_id', session.user.id)
            .single();

          if (educatorProfile) {
            setUserRole('educator');
          } else {
            const { data: familyProfile } = await supabase
              .from('family_profiles')
              .select('id')
              .eq('user_id', session.user.id)
              .single();

            if (familyProfile) {
              setUserRole('family');
              setFamilyProfileId(familyProfile.id);
            }
          }
        }

        // Charger le profil
        await fetchEducatorProfile();
      } catch (error) {
        console.error('Erreur initialisation:', error);
        if (isMounted) {
          setIsAuthenticated(false);
          setUserRole(null);
        }
      }
    };

    initPage();

    // Cleanup pour éviter les mises à jour après unmount
    return () => {
      isMounted = false;
    };
  }, [params.id]);

  const handleContact = () => {
    if (isAuthenticated) {
      // Si c'est une famille, ouvrir le modal questionnaire
      if (userRole === 'family' && familyProfileId) {
        setShowContactModal(true);
      } else {
        // Si c'est un éducateur, rediriger vers la messagerie
        router.push(`/messages?educator=${params.id}`);
      }
    } else {
      // Rediriger vers la connexion avec un redirect vers cette page
      router.push(`/auth/login?redirect=/educator/${params.id}`);
    }
  };

  const handleQuestionnaireSubmit = async (data: any, childId: string | null) => {
    if (!familyProfileId) return;

    try {
      // Vérifier si l'éducateur peut accepter une nouvelle conversation
      const conversationCheck = await canEducatorCreateConversation(params.id);
      if (!conversationCheck.canCreate) {
        alert(`Cet éducateur a atteint sa limite de conversations actives (${conversationCheck.limit}). Il doit passer Premium pour accepter plus de conversations.`);
        return;
      }

      // Vérifier si une conversation existe déjà
      const { data: existingConv } = await supabase
        .from('conversations')
        .select('id')
        .eq('educator_id', params.id)
        .eq('family_id', familyProfileId)
        .single();

      if (existingConv) {
        // Si une conversation existe déjà, mettre à jour avec les nouvelles données
        await supabase
          .from('conversations')
          .update({
            questionnaire_data: data,
            child_id: childId,
            request_message: data.message || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingConv.id);
      } else {
        // Créer une nouvelle conversation avec les données du questionnaire
        const { error: insertError } = await supabase
          .from('conversations')
          .insert({
            educator_id: params.id,
            family_id: familyProfileId,
            status: 'pending',
            questionnaire_data: data,
            child_id: childId,
            request_message: data.message || null,
          });

        if (insertError) {
          console.error('Erreur création conversation:', insertError);
          throw insertError;
        }
      }

      // Fermer le modal et rediriger vers la messagerie
      setShowContactModal(false);
      router.push(`/messages?educator=${params.id}`);
    } catch (error) {
      console.error('Erreur envoi questionnaire:', error);
      alert('Une erreur est survenue lors de l\'envoi de votre demande.');
    }
  };

  const fetchEducatorProfile = async () => {
    setLoading(true);
    setError('');

    try {
      // Récupérer le profil éducateur (requête publique, pas besoin d'être connecté)
      const { data: profile, error: profileError } = await supabase
        .from('educator_profiles')
        .select('*')
        .eq('id', params.id)
        .single();

      if (profileError) {
        console.error('Erreur profil:', profileError);
        setError('Profil éducateur introuvable');
        setLoading(false);
        return;
      }

      if (!profile) {
        setError('Profil éducateur introuvable');
        setLoading(false);
        return;
      }

      setEducator(profile);

      // Vérifier si l'éducateur est Premium
      const { data: subscriptions } = await supabase
        .from('subscriptions')
        .select('status')
        .eq('educator_id', params.id)
        .in('status', ['active', 'trialing']);

      if (subscriptions && subscriptions.length > 0) {
        setIsPremium(true);
      }

      // Tracker la vue du profil (en arrière-plan, ne pas bloquer l'affichage)
      fetch('/api/track-profile-view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ educatorId: params.id }),
      }).catch(error => console.error('Erreur tracking vue:', error));

      // Récupérer les certifications
      const { data: certs, error: certsError } = await supabase
        .from('certifications')
        .select('*')
        .eq('educator_id', params.id);

      if (certsError) {
        console.error('Erreur certifications:', certsError);
      } else if (certs) {
        setCertifications(certs);
      }

      // Récupérer les disponibilités hebdomadaires (ancien système)
      const { data: slots, error: slotsError } = await supabase
        .from('educator_weekly_availability')
        .select('*')
        .eq('educator_id', params.id)
        .eq('is_active', true)
        .order('day_of_week')
        .order('start_time');

      if (!slotsError && slots) {
        setWeeklySlots(slots);
      }

      // Récupérer les disponibilités quotidiennes (nouveau système)
      const today = new Date().toISOString().split('T')[0];
      const { data: dailySlots, error: dailySlotsError } = await supabase
        .from('educator_availability')
        .select('*')
        .eq('educator_id', params.id)
        .eq('is_available', true)
        .gte('availability_date', today)
        .order('availability_date')
        .order('start_time')
        .limit(30);

      if (!dailySlotsError && dailySlots) {
        setDailyAvailabilities(dailySlots);
      }

      // Récupérer les exceptions (uniquement futures)
      const { data: excs, error: excsError } = await supabase
        .from('educator_availability_exceptions')
        .select('*')
        .eq('educator_id', params.id)
        .gte('date', new Date().toISOString().split('T')[0])
        .order('date')
        .limit(10);

      if (!excsError && excs) {
        setExceptions(excs);
      }

      setLoading(false);
    } catch (err: any) {
      console.error('Erreur chargement profil:', err);
      setError('Erreur lors du chargement du profil');
      setLoading(false);
    }
  };

  const getDayLabel = (dayNum: number) => {
    return DAYS.find(d => d.value === dayNum)?.label || '';
  };

  const getExceptionTypeLabel = (type: string) => {
    const labels = {
      blocked: 'Indisponible',
      available: 'Disponible',
      vacation: 'Vacances'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getExceptionTypeColor = (type: string) => {
    const colors = {
      blocked: 'bg-red-100 text-red-700 border-red-200',
      available: 'bg-green-100 text-green-700 border-green-200',
      vacation: 'bg-blue-100 text-blue-700 border-blue-200'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  if (error || !educator) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Profil introuvable</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/search"
            className="inline-block px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            Retour à la recherche
          </Link>
        </div>
      </div>
    );
  }

  const showAvatar = educator.avatar_url && educator.avatar_moderation_status === 'approved';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Logo />

            {/* Menu hamburger */}
            <div className="xl:hidden">
              <MobileMenu />
            </div>

            {/* Navigation desktop */}
            <div className="hidden xl:flex items-center gap-2 lg:gap-3">
              <Link href="/about" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md font-medium transition-colors text-sm">
                À propos
              </Link>
              <Link href="/search" className="text-primary-600 bg-primary-50 px-3 py-2 rounded-md font-medium transition-colors text-sm inline-flex items-center justify-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Recherche
              </Link>
              <Link href="/familles/aides-financieres" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md font-medium transition-colors text-sm inline-flex items-center justify-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Aides
              </Link>
              <Link href="/contact" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md font-medium transition-colors text-sm">
                Contact
              </Link>
              {isAuthenticated && userRole ? (
                <Link
                  href={userRole === 'educator' ? '/dashboard/educator' : '/dashboard/family'}
                  className="ml-4 inline-flex items-center gap-2 text-white px-6 py-2.5 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg bg-gradient-to-r from-primary-500 to-purple-600 hover:from-primary-600 hover:to-purple-700"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Tableau de bord
                </Link>
              ) : (
                <>
                  <Link href="/auth/login" className="ml-4 text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md font-medium transition-colors text-sm">
                    Connexion
                  </Link>
                  <Link href="/auth/signup" className="bg-primary-600 text-white px-5 py-2.5 rounded-md hover:bg-primary-700 font-medium transition-colors shadow-sm text-sm">
                    Inscription
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* En-tête du profil */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8 border border-gray-100">
          <div className="px-6 sm:px-8 py-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="w-36 h-36 rounded-full bg-white p-2 shadow-xl ring-4 ring-gray-100">
                  {showAvatar ? (
                    <img
                      src={educator.avatar_url || undefined}
                      alt={`${educator.first_name} ${educator.last_name}`}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-inner">
                      <span className="text-5xl font-bold text-white">
                        {educator.first_name?.[0]?.toUpperCase()}{educator.last_name?.[0]?.toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Informations principales */}
              <div className="flex-1 text-center sm:text-left pb-2">
                <div className="mb-4">
                  <div className="flex items-center gap-3 flex-wrap justify-center sm:justify-start">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
                      {educator.first_name?.trim() && (
                        <span className="text-primary-600">
                          {capitalizeFirstName(educator.first_name)}{' '}
                        </span>
                      )}
                      <span className="text-gray-900">
                        {formatLastName(educator.last_name)}
                      </span>
                    </h1>
                    {isPremium && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white text-sm font-bold rounded-full shadow-md">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        Premium
                      </span>
                    )}
                  </div>
                  {!educator.first_name?.trim() && (
                    <p className="text-sm text-orange-600 italic mt-2">⚠️ Prénom non renseigné</p>
                  )}
                </div>
                <div className="flex flex-wrap gap-4 justify-center sm:justify-start text-sm">
                  <div className="flex items-center bg-gray-50 px-3 py-2 rounded-lg">
                    <svg className="h-5 w-5 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="font-medium text-gray-700">{educator.location}</span>
                  </div>
                  {educator.years_of_experience && (
                    <div className="flex items-center bg-gray-50 px-3 py-2 rounded-lg">
                      <svg className="h-5 w-5 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-medium text-gray-700">
                        {educator.years_of_experience} {educator.years_of_experience > 1 ? 'ans' : 'an'} d'expérience
                      </span>
                    </div>
                  )}
                  {educator.hourly_rate && (
                    <div className="flex items-center bg-primary-50 px-3 py-2 rounded-lg border border-primary-200">
                      <svg className="h-5 w-5 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-bold text-primary-700">{educator.hourly_rate}€/h</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bouton contact */}
              <div className="mt-6 sm:mt-0 sm:ml-6">
                <button
                  onClick={handleContact}
                  className="inline-flex items-center px-8 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {isAuthenticated ? 'Envoyer un message' : 'Contacter'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bouton Demander un rendez-vous - Mis en avant */}
        {isAuthenticated && userRole === 'family' && (weeklySlots.length > 0 || dailyAvailabilities.length > 0) && (
          <div className="mb-8">
            <Link
              href={`/educator/${params.id}/book-appointment`}
              className="block w-full sm:w-auto sm:inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-2xl hover:from-green-700 hover:to-green-800 font-bold text-lg shadow-2xl hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Demander un rendez-vous
            </Link>
          </div>
        )}

        {/* Onglets */}
        <div className="mb-6">
          <div className="bg-white rounded-lg shadow-md p-2 inline-flex gap-2">
            <button
              onClick={() => setActiveTab('about')}
              className={`px-6 py-2.5 rounded-md font-medium transition-all duration-200 ${
                activeTab === 'about'
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              À propos
            </button>
            <button
              onClick={() => setActiveTab('certifications')}
              className={`px-6 py-2.5 rounded-md font-medium transition-all duration-200 ${
                activeTab === 'certifications'
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Certifications
            </button>
            <button
              onClick={() => setActiveTab('cv')}
              className={`px-6 py-2.5 rounded-md font-medium transition-all duration-200 ${
                activeTab === 'cv'
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              CV
            </button>
            <button
              onClick={() => setActiveTab('availability')}
              className={`px-6 py-2.5 rounded-md font-medium transition-all duration-200 ${
                activeTab === 'availability'
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Disponibilités
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-6">
            {/* Onglet À propos */}
            {activeTab === 'about' && (
              <>
            {/* Bio */}
            {educator.bio && (
              <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center mb-5">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">À propos</h2>
                </div>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line text-base">{educator.bio}</p>
              </div>
            )}

            {/* CV */}
            {educator.cv_url && (
              <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center mb-5">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Curriculum Vitae</h2>
                </div>
                <a
                  href={`/api/educator-cvs/${encodeURIComponent(educator.cv_url)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium shadow-md hover:shadow-lg"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Voir le CV (PDF)
                </a>
              </div>
            )}

            {/* Compétences */}
            {educator.skills && (
              <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Compétences</h2>
                </div>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                    {educator.skills}
                  </p>
                </div>
              </div>
            )}
              </>
            )}

            {/* Onglet Certifications */}
            {activeTab === 'certifications' && (
              <>
            {/* Certifications */}
            {certifications && certifications.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Certifications & Diplômes</h2>
                </div>
                <div className="space-y-3">
                  {certifications
                    .filter(cert => cert.verification_status !== 'rejected')
                    .map((cert, index) => (
                    <div
                      key={index}
                      className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-gray-900">{cert.name}</h3>
                            {cert.verification_status === 'document_verified' && (
                              <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                Vérifié
                              </span>
                            )}
                            {cert.verification_status === 'officially_confirmed' && (
                              <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                Certifié Officiellement
                              </span>
                            )}
                            {cert.verification_status === 'pending' && (
                              <span className="inline-flex items-center px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full">
                                <svg className="w-3 h-3 mr-1 animate-spin" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                En vérification
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{cert.issuing_organization}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Obtenu le {new Date(cert.issue_date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
                          </p>
                        </div>
                        <span className="inline-flex items-center px-3 py-1 bg-white text-gray-700 text-xs font-medium rounded-full border border-gray-300">
                          {cert.type}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
              </>
            )}

            {/* Onglet CV */}
            {activeTab === 'cv' && (
              <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Curriculum Vitae</h2>
                </div>

                {educator.cv_url ? (
                  <div className="space-y-4">
                    <p className="text-gray-600">Consultez le CV de l'éducateur ci-dessous :</p>
                    <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                      <iframe
                        src={educator.cv_url}
                        className="w-full h-[600px]"
                        title="CV de l'éducateur"
                      />
                    </div>
                    <div className="flex gap-3">
                      <a
                        href={educator.cv_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition shadow-md hover:shadow-lg"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Ouvrir en plein écran
                      </a>
                      <a
                        href={educator.cv_url}
                        download
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Télécharger
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-gray-600 font-medium">Aucun CV disponible</p>
                    <p className="text-sm text-gray-500 mt-2">L'éducateur n'a pas encore téléchargé son CV.</p>
                  </div>
                )}
              </div>
            )}

            {/* Onglet Disponibilités */}
            {activeTab === 'availability' && (
              <>
                {/* Horaires hebdomadaires */}
                <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                  <div className="flex items-center mb-6">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Horaires habituels</h2>
                  </div>

                  {weeklySlots.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                      <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-gray-600 font-medium">Aucune disponibilité régulière définie</p>
                      <p className="text-sm text-gray-500 mt-2">L'éducateur n'a pas encore configuré ses horaires.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3">
                      {DAYS.map((day) => {
                        const daySlots = weeklySlots.filter(slot => slot.day_of_week === day.value);
                        if (daySlots.length === 0) return null;

                        return (
                          <div key={day.value} className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                                  <span className="text-primary-600 font-bold text-sm">{day.label.substring(0, 2)}</span>
                                </div>
                                <div>
                                  <p className="font-bold text-gray-900">{day.label}</p>
                                  <div className="flex flex-wrap gap-2 mt-1">
                                    {daySlots.map((slot) => (
                                      <span key={slot.id} className="inline-flex items-center px-3 py-1 bg-white border border-primary-200 text-primary-700 rounded-full text-sm font-medium">
                                        <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        {slot.start_time.substring(0, 5)} - {slot.end_time.substring(0, 5)}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Exceptions et périodes spéciales */}
                {exceptions.length > 0 && (
                  <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                    <div className="flex items-center mb-6">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                        <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900">Périodes spéciales</h2>
                    </div>

                    <div className="space-y-3">
                      {exceptions.map((exc) => (
                        <div
                          key={exc.id}
                          className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <p className="font-bold text-gray-900">
                                  {new Date(exc.date + 'T00:00:00').toLocaleDateString('fr-FR', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })}
                                </p>
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getExceptionTypeColor(exc.exception_type)}`}>
                                  {getExceptionTypeLabel(exc.exception_type)}
                                </span>
                              </div>
                              {exc.start_time && exc.end_time && (
                                <p className="text-sm text-gray-600 ml-7">
                                  {exc.start_time.substring(0, 5)} - {exc.end_time.substring(0, 5)}
                                </p>
                              )}
                              {exc.reason && (
                                <p className="text-sm text-gray-500 italic ml-7 mt-1">{exc.reason}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-start">
                        <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-sm text-blue-700">
                          <strong>Info :</strong> Ces périodes sont des exceptions aux horaires habituels.
                          Contactez l'éducateur pour confirmer les disponibilités.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Message si aucune donnée */}
                {weeklySlots.length === 0 && exceptions.length === 0 && (
                  <div className="bg-white rounded-xl shadow-lg p-12 border border-gray-100 text-center">
                    <svg className="w-20 h-20 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Disponibilités non configurées</h3>
                    <p className="text-gray-600">
                      Cet éducateur n'a pas encore défini ses disponibilités.
                      <br />
                      Contactez-le directement pour connaître ses horaires.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Barre latérale */}
          <div className="space-y-6">
            {/* LinkedIn */}
            {educator.linkedin_url && (
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-2">
                    <svg className="w-5 h-5 text-blue-700" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">LinkedIn</h2>
                </div>
                <a
                  href={educator.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  Voir le profil LinkedIn
                </a>
              </div>
            )}

            {/* Langues */}
            {educator.languages && educator.languages.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-2">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">Langues parlées</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {educator.languages.map((lang, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-2 bg-gradient-to-r from-green-50 to-green-100 text-green-700 rounded-lg text-sm font-semibold border border-green-200 hover:shadow-md transition-all duration-200"
                    >
                      <svg className="w-3 h-3 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Call to Action - Sticky */}
            <div className="sticky top-24 bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl p-8 border-2 border-primary-200 shadow-xl">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Intéressé(e) ?</h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {isAuthenticated
                    ? "Envoyez un message pour discuter avec cet éducateur et réserver une séance."
                    : "Connectez-vous ou créez un compte pour contacter cet éducateur et réserver une séance."
                  }
                </p>
              </div>
              <div className="space-y-3">
                {isAuthenticated ? (
                  <>
                    <button
                      onClick={handleContact}
                      className="block w-full text-center px-6 py-3.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 font-bold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
                    >
                      <span className="inline-flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                        Envoyer un message
                      </span>
                    </button>
                    {userRole && (
                      <Link
                        href={userRole === 'educator' ? '/dashboard/educator' : '/dashboard/family'}
                        className="block w-full text-center px-6 py-3.5 bg-white border-2 border-primary-600 text-primary-600 rounded-xl hover:bg-primary-50 font-bold shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5"
                      >
                        Mon dashboard
                      </Link>
                    )}
                  </>
                ) : (
                  <>
                    <Link
                      href={`/auth/login?redirect=/messages?educator=${params.id}`}
                      className="block w-full text-center px-6 py-3.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 font-bold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
                    >
                      Se connecter
                    </Link>
                    <Link
                      href="/auth/signup"
                      className="block w-full text-center px-6 py-3.5 bg-white border-2 border-primary-600 text-primary-600 rounded-xl hover:bg-primary-50 font-bold shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5"
                    >
                      Créer un compte
                    </Link>
                  </>
                )}
              </div>
              <div className="mt-6 pt-6 border-t border-primary-200">
                <div className="flex items-center justify-center text-sm text-gray-600">
                  <svg className="w-5 h-5 text-primary-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span className="font-medium">100% sécurisé</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bouton d'aide flottant */}
      <HelpButton />

      {/* Modal questionnaire de contact */}
      {educator && familyProfileId && (
        <ContactQuestionnaireModal
          isOpen={showContactModal}
          onClose={() => setShowContactModal(false)}
          educatorId={params.id}
          educatorName={`${capitalizeFirstName(educator.first_name)} ${formatLastName(educator.last_name)}`}
          familyId={familyProfileId}
          onSubmit={handleQuestionnaireSubmit}
        />
      )}
    </div>
  );
}
