'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { signOut } from '@/lib/auth';
import Logo from '@/components/Logo';
import FamilyMobileMenu from '@/components/FamilyMobileMenu';
import { getProfessionByValue } from '@/lib/professions-config';

interface FavoriteEducator {
  id: string;
  educator_id: string;
  created_at: string;
  educator: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url: string | null;
    profession_type: string | null;
    location: string | null;
    hourly_rate: number | null;
    rating: number;
    total_reviews: number;
    years_of_experience: number;
    bio: string | null;
    verification_badge: boolean;
  };
}

export default function FavoritesPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [favorites, setFavorites] = useState<FavoriteEducator[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        router.push('/auth/login');
        return;
      }

      // Récupérer le profil famille
      const { data: familyProfile } = await supabase
        .from('family_profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (!familyProfile) {
        router.push('/auth/login');
        return;
      }

      setProfile(familyProfile);

      // Récupérer les favoris avec les infos des éducateurs
      const { data: favoritesData, error } = await supabase
        .from('favorite_educators')
        .select(`
          id,
          educator_id,
          created_at,
          educator:educator_profiles(
            id,
            first_name,
            last_name,
            avatar_url,
            profession_type,
            location,
            hourly_rate,
            rating,
            total_reviews,
            years_of_experience,
            bio,
            verification_badge
          )
        `)
        .eq('family_id', familyProfile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transformer et filtrer les favoris où l'éducateur existe encore
      const validFavorites = (favoritesData || [])
        .map((f: any) => ({
          ...f,
          educator: Array.isArray(f.educator) ? f.educator[0] : f.educator
        }))
        .filter((f: any) => f.educator !== null && f.educator !== undefined) as FavoriteEducator[];

      setFavorites(validFavorites);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (favoriteId: string, educatorId: string) => {
    setRemoving(educatorId);
    try {
      const { error } = await supabase
        .from('favorite_educators')
        .delete()
        .eq('id', favoriteId);

      if (error) throw error;

      setFavorites(prev => prev.filter(f => f.id !== favoriteId));
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    } finally {
      setRemoving(null);
    }
  };

  const handleLogout = async () => {
    await signOut();
    window.location.href = '/';
  };

  const getProfessionLabel = (professionType: string | null) => {
    if (!professionType) return 'Professionnel';
    const profession = getProfessionByValue(professionType);
    return profession?.label || 'Professionnel';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Logo  />
            <div className="md:hidden">
              <FamilyMobileMenu profile={profile} onLogout={handleLogout} />
            </div>
            <div className="hidden md:flex space-x-4">
              <Link href="/dashboard/family" className="text-gray-700 hover:text-primary-600 px-3 py-2 font-medium transition">
                Tableau de bord
              </Link>
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard/family"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-primary-600 mb-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Retour au tableau de bord
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Mes favoris</h1>
              <p className="text-gray-600">Professionnels que vous avez enregistrés</p>
            </div>
          </div>
        </div>

        {/* Liste des favoris */}
        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement...</p>
          </div>
        ) : favorites.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun favori</h3>
            <p className="text-gray-500 mb-4">
              Vous n'avez pas encore ajouté de professionnels à vos favoris.
            </p>
            <Link
              href="/search"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Rechercher des professionnels
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-500 mb-4">
              {favorites.length} professionnel(s) dans vos favoris
            </p>

            {favorites.map((favorite) => (
              <div
                key={favorite.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-5 hover:shadow-md transition-all relative cursor-pointer sm:cursor-default"
                onClick={(e) => {
                  // Navigation mobile uniquement (< 640px)
                  if (window.innerWidth < 640) {
                    router.push(`/educator/${favorite.educator.id}`);
                  }
                }}
              >
                {/* Bouton retirer - position absolue en haut à droite */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveFavorite(favorite.id, favorite.educator.id);
                  }}
                  disabled={removing === favorite.educator.id}
                  className="absolute top-3 right-3 p-2 rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition disabled:opacity-50 z-10"
                  aria-label="Retirer des favoris"
                >
                  {removing === favorite.educator.id ? (
                    <span className="animate-spin h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full block"></span>
                  ) : (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>

                <div className="flex items-start gap-3 sm:gap-4 pr-10">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {favorite.educator.avatar_url ? (
                      <img
                        src={favorite.educator.avatar_url}
                        alt={`${favorite.educator.first_name} ${favorite.educator.last_name}`}
                        className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover border-2 border-gray-100"
                      />
                    ) : (
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center border-2 border-gray-100">
                        <span className="text-primary-600 font-bold text-base sm:text-lg">
                          {favorite.educator.first_name[0]}{favorite.educator.last_name[0]}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Infos */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                        {favorite.educator.first_name} {favorite.educator.last_name}
                      </h3>
                      {favorite.educator.verification_badge && (
                        <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 bg-green-100 text-green-700 text-[10px] sm:text-xs font-medium rounded-full">
                          <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Vérifié
                        </span>
                      )}
                    </div>

                    <p className="text-xs sm:text-sm text-primary-600 font-medium mt-0.5">
                      {getProfessionLabel(favorite.educator.profession_type)}
                    </p>

                    {favorite.educator.location && (
                      <p className="text-xs sm:text-sm text-gray-500 flex items-center gap-1 mt-1">
                        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="truncate">{favorite.educator.location}</span>
                      </p>
                    )}

                    <div className="flex items-center gap-2 sm:gap-3 mt-2 text-xs sm:text-sm flex-wrap">
                      {favorite.educator.rating > 0 && (
                        <span className="flex items-center gap-1 text-yellow-600">
                          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          {favorite.educator.rating.toFixed(1)} ({favorite.educator.total_reviews})
                        </span>
                      )}
                      <span className="text-gray-500">
                        {favorite.educator.years_of_experience} ans d'exp.
                      </span>
                      {favorite.educator.hourly_rate && (
                        <span className="text-gray-500">
                          {favorite.educator.hourly_rate}€/h
                        </span>
                      )}
                    </div>

                    {/* Bouton voir profil - visible uniquement sur desktop */}
                    <Link
                      href={`/educator/${favorite.educator.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="hidden sm:inline-flex items-center gap-2 mt-3 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Voir le profil
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
