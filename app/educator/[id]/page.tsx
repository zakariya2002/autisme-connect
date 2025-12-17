'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import PublicNavbar from '@/components/PublicNavbar';
import HelpButton from '@/components/HelpButton';
import ContactQuestionnaireModal from '@/components/ContactQuestionnaireModal';
import { canEducatorCreateConversation } from '@/lib/subscription-utils';
import TndToggle from '@/components/TndToggle';

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
  video_presentation_url: string | null;
  video_duration_seconds: number | null;
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
  const [activeTab, setActiveTab] = useState<'about' | 'certifications' | 'availability' | 'cv' | 'video'>('about');
  const [familyProfileId, setFamilyProfileId] = useState<string | null>(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [isBlockedByEducator, setIsBlockedByEducator] = useState(false);

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

              // Vérifier si la famille est bloquée par cet éducateur
              try {
                const response = await fetch(`/api/check-blocked?educatorId=${params.id}&familyId=${familyProfile.id}`);
                if (response.ok) {
                  const data = await response.json();
                  if (data.isBlocked) {
                    setIsBlockedByEducator(true);
                    setError('Ce profil n\'est plus accessible');
                    setLoading(false);
                    return;
                  }
                }
              } catch (e) {
                console.error('Erreur vérification blocage:', e);
              }
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

      // Debug: vérifier si la vidéo est présente
      console.log('📹 Video URL:', profile.video_presentation_url);
      console.log('📹 Video Duration:', profile.video_duration_seconds);

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
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#fdf9f4' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: '#027e7e' }} role="status" aria-label="Chargement en cours"></div>
          <p className="mt-4 text-gray-600" style={{ fontFamily: 'Open Sans, sans-serif' }}>Chargement du profil...</p>
        </div>
      </div>
    );
  }

  if (error || !educator) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#fdf9f4' }}>
        <div className="text-center max-w-md mx-auto px-4">
          <div className="mb-4">
            {isBlockedByEducator ? (
              <svg className="mx-auto h-16 w-16 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            ) : (
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            )}
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Verdana, sans-serif' }}>
            {isBlockedByEducator ? 'Profil non accessible' : 'Profil introuvable'}
          </h1>
          <p className="text-gray-600 mb-6" style={{ fontFamily: 'Open Sans, sans-serif' }}>
            {isBlockedByEducator
              ? 'Ce professionnel a choisi de ne plus être visible pour vous. Vous pouvez rechercher d\'autres professionnels disponibles.'
              : error
            }
          </p>
          <Link
            href="/search"
            className="inline-block px-6 py-3 text-white rounded-md hover:opacity-90 transition-all"
            style={{ backgroundColor: '#027e7e' }}
          >
            {isBlockedByEducator ? 'Rechercher d\'autres professionnels' : 'Retour à la recherche'}
          </Link>
        </div>
      </div>
    );
  }

  const showAvatar = educator.avatar_url && educator.avatar_moderation_status === 'approved';

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ backgroundColor: '#fdf9f4' }}>
      {/* Navigation */}
      <PublicNavbar />

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
                    <div className="w-full h-full rounded-full flex items-center justify-center shadow-inner" style={{ background: 'linear-gradient(135deg, #027e7e 0%, #3a9e9e 100%)' }}>
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
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight" style={{ fontFamily: 'Verdana, sans-serif' }}>
                      {educator.first_name?.trim() && (
                        <span style={{ color: '#027e7e' }}>
                          {capitalizeFirstName(educator.first_name)}{' '}
                        </span>
                      )}
                      <span className="text-gray-900">
                        {formatLastName(educator.last_name)}
                      </span>
                    </h1>
                    {/* Badge Vérifié - affiché si au moins une certification est vérifiée */}
                    {certifications.some(cert => cert.verification_status === 'document_verified' || cert.verification_status === 'officially_confirmed') && (
                      <div className="relative group">
                        <span className="inline-flex items-center gap-1 px-3 py-1 text-white text-sm font-bold rounded-full shadow-md cursor-help" style={{ backgroundColor: '#f0879f' }} aria-label="Profil vérifié avec diplômes certifiés">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Vérifié
                        </span>
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 pointer-events-none">
                          <div className="font-semibold mb-1">Diplômes vérifiés par :</div>
                          {certifications
                            .filter(cert => cert.verification_status === 'document_verified' || cert.verification_status === 'officially_confirmed')
                            .map((cert, i) => (
                              <div key={i} className="text-gray-300">• {cert.issuing_organization}</div>
                            ))
                          }
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                            <div className="border-4 border-transparent border-t-gray-900"></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  {!educator.first_name?.trim() && (
                    <p className="text-sm text-orange-600 italic mt-2">⚠️ Prénom non renseigné</p>
                  )}
                </div>
                <div className="flex flex-wrap gap-4 justify-center sm:justify-start text-sm" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                  <div className="flex items-center bg-gray-50 px-3 py-2 rounded-lg">
                    <svg className="h-5 w-5 mr-2" style={{ color: '#027e7e' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="font-medium text-gray-700">{educator.location}</span>
                  </div>
                  {educator.years_of_experience && (
                    <div className="flex items-center px-3 py-2 rounded-lg" style={{ backgroundColor: 'rgba(58, 158, 158, 0.1)' }}>
                      <svg className="h-5 w-5 mr-2" style={{ color: '#3a9e9e' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-medium text-gray-700">
                        {educator.years_of_experience} {educator.years_of_experience > 1 ? 'ans' : 'an'} d'expérience
                      </span>
                    </div>
                  )}
                  {educator.hourly_rate && (
                    <div className="flex items-center px-3 py-2 rounded-lg border" style={{ backgroundColor: 'rgba(107, 190, 190, 0.1)', borderColor: 'rgba(107, 190, 190, 0.3)' }}>
                      <svg className="h-5 w-5 mr-2" style={{ color: '#6bbebe' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-bold" style={{ color: '#027e7e' }}>{educator.hourly_rate}€/h</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bouton contact */}
              <div className="mt-6 sm:mt-0 sm:ml-6">
                <button
                  onClick={handleContact}
                  className="inline-flex items-center px-8 py-3 text-white rounded-xl hover:opacity-90 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
                  style={{ backgroundColor: '#027e7e' }}
                  aria-label={isAuthenticated ? `Envoyer un message à ${educator.first_name} ${educator.last_name}` : `Contacter ${educator.first_name} ${educator.last_name}`}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
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
              className="flex items-center justify-center w-full px-6 sm:px-8 py-3 sm:py-4 text-white rounded-xl sm:rounded-2xl hover:opacity-90 font-bold text-base sm:text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
              style={{ background: 'linear-gradient(135deg, #027e7e 0%, #3a9e9e 100%)' }}
              aria-label={`Demander un rendez-vous avec ${educator.first_name} ${educator.last_name}`}
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Demander un rendez-vous</span>
            </Link>
          </div>
        )}

        {/* Onglets */}
        <div className="mb-6" role="tablist" aria-label="Sections du profil">
          <div className="bg-white rounded-lg shadow-md p-2 inline-flex gap-2 flex-wrap">
            <button
              onClick={() => setActiveTab('about')}
              role="tab"
              aria-selected={activeTab === 'about'}
              aria-controls="about-panel"
              className={`px-6 py-2.5 rounded-md font-medium transition-all duration-200 ${
                activeTab === 'about'
                  ? 'text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              style={activeTab === 'about' ? { backgroundColor: '#027e7e' } : {}}
            >
              À propos
            </button>
            <button
              onClick={() => setActiveTab('certifications')}
              role="tab"
              aria-selected={activeTab === 'certifications'}
              aria-controls="certifications-panel"
              className={`px-6 py-2.5 rounded-md font-medium transition-all duration-200 ${
                activeTab === 'certifications'
                  ? 'text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              style={activeTab === 'certifications' ? { backgroundColor: '#027e7e' } : {}}
            >
              Certifications
            </button>
            <button
              onClick={() => setActiveTab('cv')}
              role="tab"
              aria-selected={activeTab === 'cv'}
              aria-controls="cv-panel"
              className={`px-6 py-2.5 rounded-md font-medium transition-all duration-200 ${
                activeTab === 'cv'
                  ? 'text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              style={activeTab === 'cv' ? { backgroundColor: '#027e7e' } : {}}
            >
              CV
            </button>
            {educator.video_presentation_url && (
              <button
                onClick={() => setActiveTab('video')}
                role="tab"
                aria-selected={activeTab === 'video'}
                aria-controls="video-panel"
                className={`px-6 py-2.5 rounded-md font-medium transition-all duration-200 flex items-center gap-2 ${
                  activeTab === 'video'
                    ? 'text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                style={activeTab === 'video' ? { backgroundColor: '#f0879f' } : {}}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Vidéo
              </button>
            )}
            <button
              onClick={() => setActiveTab('availability')}
              role="tab"
              aria-selected={activeTab === 'availability'}
              aria-controls="availability-panel"
              className={`px-6 py-2.5 rounded-md font-medium transition-all duration-200 ${
                activeTab === 'availability'
                  ? 'text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              style={activeTab === 'availability' ? { backgroundColor: '#027e7e' } : {}}
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
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center mr-3" style={{ backgroundColor: 'rgba(2, 126, 126, 0.1)' }}>
                    <svg className="w-6 h-6" style={{ color: '#027e7e' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Verdana, sans-serif' }}>À propos</h2>
                </div>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line text-base">{educator.bio}</p>
              </div>
            )}

            {/* CV */}
            {educator.cv_url && (
              <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center mb-5">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
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
                  aria-label={`Voir le CV de ${educator.first_name} ${educator.last_name} en PDF`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
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
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
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
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
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
                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                Vérifié
                              </span>
                            )}
                            {cert.verification_status === 'officially_confirmed' && (
                              <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                Certifié Officiellement
                              </span>
                            )}
                            {cert.verification_status === 'pending' && (
                              <span className="inline-flex items-center px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full">
                                <svg className="w-3 h-3 mr-1 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
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
              <div role="tabpanel" id="cv-panel" aria-labelledby="cv-tab" className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
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
                        className="inline-flex items-center gap-2 px-6 py-3 text-white rounded-lg hover:opacity-90 font-medium transition shadow-md hover:shadow-lg"
                        style={{ backgroundColor: '#027e7e' }}
                        aria-label="Ouvrir le CV en plein écran dans un nouvel onglet"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Ouvrir en plein écran
                      </a>
                      <a
                        href={educator.cv_url}
                        download
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition"
                        aria-label="Télécharger le CV"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Télécharger
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-gray-600 font-medium">Aucun CV disponible</p>
                    <p className="text-sm text-gray-500 mt-2">L'éducateur n'a pas encore téléchargé son CV.</p>
                  </div>
                )}
              </div>
            )}

            {/* Onglet Vidéo de présentation */}
            {activeTab === 'video' && educator.video_presentation_url && (
              <div role="tabpanel" id="video-panel" aria-labelledby="video-tab" className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Vidéo de présentation</h2>
                    {educator.video_duration_seconds && (
                      <p className="text-sm text-gray-500">
                        Durée : {Math.floor(educator.video_duration_seconds / 60)}:{(educator.video_duration_seconds % 60).toString().padStart(2, '0')}
                      </p>
                    )}
                  </div>
                </div>

                <div className="relative rounded-xl overflow-hidden bg-black aspect-video shadow-lg">
                  <video
                    src={educator.video_presentation_url}
                    controls
                    className="w-full h-full object-contain"
                    preload="metadata"
                    poster={educator.avatar_url || undefined}
                  >
                    Votre navigateur ne supporte pas la lecture vidéo.
                  </video>
                </div>

                <div className="mt-6 bg-violet-50 border border-violet-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-violet-900 font-medium">Découvrez {capitalizeFirstName(educator.first_name)} en vidéo</p>
                      <p className="text-violet-700 text-sm mt-1">
                        Cette vidéo vous permet de mieux connaître le professionnel avant de prendre rendez-vous.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Onglet Disponibilités */}
            {activeTab === 'availability' && (
              <>
                {/* Horaires hebdomadaires */}
                <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                  <div className="flex items-center mb-6">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Horaires habituels</h2>
                  </div>

                  {weeklySlots.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                      <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
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
                                <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3" style={{ backgroundColor: 'rgba(2, 126, 126, 0.1)' }}>
                                  <span className="font-bold text-sm" style={{ color: '#027e7e' }}>{day.label.substring(0, 2)}</span>
                                </div>
                                <div>
                                  <p className="font-bold text-gray-900">{day.label}</p>
                                  <div className="flex flex-wrap gap-2 mt-1">
                                    {daySlots.map((slot) => (
                                      <span key={slot.id} className="inline-flex items-center px-3 py-1 bg-white rounded-full text-sm font-medium" style={{ borderWidth: '1px', borderStyle: 'solid', borderColor: 'rgba(2, 126, 126, 0.3)', color: '#027e7e' }}>
                                        <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
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
                        <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
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
            <div className="sticky top-24 rounded-2xl p-8 border-2 shadow-xl" style={{ background: 'linear-gradient(135deg, rgba(2, 126, 126, 0.05) 0%, rgba(2, 126, 126, 0.15) 100%)', borderColor: 'rgba(2, 126, 126, 0.3)' }}>
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg" style={{ backgroundColor: '#027e7e' }}>
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Verdana, sans-serif' }}>Intéressé(e) ?</h3>
                <p className="text-sm text-gray-700 leading-relaxed" style={{ fontFamily: 'Open Sans, sans-serif' }}>
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
                      className="block w-full text-center px-6 py-3.5 text-white rounded-xl hover:opacity-90 font-bold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
                      style={{ backgroundColor: '#027e7e' }}
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
                        className="block w-full text-center px-6 py-3.5 bg-white border-2 rounded-xl hover:bg-teal-50 font-bold shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5"
                        style={{ borderColor: '#027e7e', color: '#027e7e' }}
                      >
                        Mon dashboard
                      </Link>
                    )}
                  </>
                ) : (
                  <>
                    <Link
                      href={`/auth/login?redirect=/messages?educator=${params.id}`}
                      className="block w-full text-center px-6 py-3.5 text-white rounded-xl hover:opacity-90 font-bold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
                      style={{ backgroundColor: '#027e7e' }}
                    >
                      Se connecter
                    </Link>
                    <Link
                      href="/auth/signup"
                      className="block w-full text-center px-6 py-3.5 bg-white border-2 rounded-xl hover:bg-teal-50 font-bold shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5"
                      style={{ borderColor: '#027e7e', color: '#027e7e' }}
                    >
                      Créer un compte
                    </Link>
                  </>
                )}
              </div>
              <div className="mt-6 pt-6" style={{ borderTopWidth: '1px', borderTopStyle: 'solid', borderTopColor: 'rgba(2, 126, 126, 0.3)' }}>
                <div className="flex items-center justify-center text-sm text-gray-600">
                  <svg className="w-5 h-5 mr-2" style={{ color: '#027e7e' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span className="font-medium">100% sécurisé</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-white py-12 mt-16" style={{ backgroundColor: '#027e7e' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-6">
              <Link href="/" className="inline-block">
                <img
                  src="/images/logo-neurocare.svg"
                  alt="neurocare"
                  className="h-20 brightness-0 invert mx-auto"
                />
              </Link>
            </div>
            <p className="text-teal-100 text-lg mb-8" style={{ fontFamily: 'Open Sans, sans-serif' }}>
              Connecter les familles avec les meilleurs éducateurs spécialisés
            </p>
            <div className="flex justify-center gap-6 mb-8 flex-wrap">
              <Link href="/about" className="text-teal-100 hover:text-white transition-colors">
                Qui sommes-nous ?
              </Link>
              <Link href="/search" className="text-teal-100 hover:text-white transition-colors">
                Trouver un professionnel
              </Link>
              <Link href="/contact" className="text-teal-100 hover:text-white transition-colors">
                Contact
              </Link>
            </div>
            <div className="border-t border-teal-600 pt-8">
              <p className="text-teal-200">
                © 2024 neurocare. Tous droits réservés.
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Bouton d'aide flottant */}
      <HelpButton />

      <TndToggle />

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
