'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import Logo from '@/components/Logo';
import PublicMobileMenu from '@/components/PublicMobileMenu';

interface FamilyProfile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  phone: string;
  location: string;
  avatar_url: string | null;
  avatar_moderation_status: string;
  created_at: string;
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

export default function FamilyPublicProfile({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [family, setFamily] = useState<FamilyProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [educatorProfileId, setEducatorProfileId] = useState<string | null>(null);
  const [hasConversation, setHasConversation] = useState(false);

  useEffect(() => {
    fetchFamilyProfile();
    checkAuth();
  }, [params.id]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setIsAuthenticated(!!session);
    setUserRole(session?.user?.user_metadata?.role || null);

    // Si c'est un éducateur, récupérer son profil et vérifier s'il a une conversation
    if (session?.user && session.user.user_metadata?.role === 'educator') {
      const { data: educatorProfile } = await supabase
        .from('educator_profiles')
        .select('id')
        .eq('user_id', session.user.id)
        .single();

      if (educatorProfile) {
        setEducatorProfileId(educatorProfile.id);

        // Vérifier s'il existe déjà une conversation
        const { data: conversation } = await supabase
          .from('conversations')
          .select('id')
          .eq('educator_id', educatorProfile.id)
          .eq('family_id', params.id)
          .single();

        setHasConversation(!!conversation);
      }
    }
  };

  const fetchFamilyProfile = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('family_profiles')
        .select('*')
        .eq('id', params.id)
        .single();

      if (error) {
        console.error('Erreur:', error);
        return;
      }

      setFamily(data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!family) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Profil non trouvé</h1>
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
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo - visible sur desktop */}
            <div className="hidden md:block">
              <Logo />
            </div>

            {/* Menu hamburger - visible uniquement sur mobile */}
            <div className="md:hidden">
              <PublicMobileMenu
                isAuthenticated={isAuthenticated}
                userRole={userRole}
              />
            </div>

            {/* Navigation desktop - cachée sur mobile */}
            <div className="hidden md:flex items-center space-x-4">
              <Link
                href="/search"
                className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Rechercher
              </Link>
              {isAuthenticated ? (
                <Link
                  href={userRole === 'educator' ? '/dashboard/educator' : '/dashboard/family'}
                  className="bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700 transition-colors"
                >
                  Mon tableau de bord
                </Link>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Connexion
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700 transition-colors"
                  >
                    Inscription
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* En-tête du profil */}
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-8">
            <div className="flex items-center gap-6">
              {/* Avatar */}
              <div className="flex-shrink-0">
                {family.avatar_url && family.avatar_moderation_status === 'approved' ? (
                  <img
                    src={family.avatar_url}
                    alt={getFormattedFullName(family.first_name, family.last_name)}
                    className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                ) : (
                  <div className="h-24 w-24 rounded-full bg-white flex items-center justify-center border-4 border-white shadow-lg">
                    <span className="text-3xl font-bold text-primary-600">
                      {family.first_name?.[0]}{family.last_name?.[0]}
                    </span>
                  </div>
                )}
              </div>

              {/* Informations de base */}
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-white mb-2">
                  {getFormattedFullName(family.first_name, family.last_name)}
                </h1>
                <div className="flex items-center text-white/90">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {family.location || 'Localisation non renseignée'}
                </div>
              </div>
            </div>
          </div>

          {/* Corps du profil */}
          <div className="p-6">
            <div className="grid grid-cols-1 gap-6">
              {/* Informations de contact */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <svg className="w-6 h-6 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Profil Famille
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center text-gray-700">
                    <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {family.phone || 'Téléphone non renseigné'}
                  </div>
                  <div className="flex items-center text-gray-700">
                    <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Membre depuis {new Date(family.created_at).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' })}
                  </div>
                </div>
              </div>

              {/* Boutons de contact et rendez-vous */}
              {userRole === 'educator' && hasConversation ? (
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Link
                    href="/messages"
                    className="inline-flex items-center justify-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-semibold transition-colors shadow-md"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Envoyer un message
                  </Link>
                  <Link
                    href={`/family/${params.id}/request-appointment`}
                    className="inline-flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition-colors shadow-md"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Proposer un rendez-vous
                  </Link>
                </div>
              ) : (
                <div className="bg-primary-50 border-l-4 border-primary-500 p-6 rounded-r-lg">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-primary-700">
                        {!isAuthenticated
                          ? "Connectez-vous pour contacter cette famille."
                          : userRole === 'family'
                          ? "Profil d'une famille membre de la plateforme."
                          : "Pour contacter cette famille, démarrez une conversation via votre messagerie."}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
