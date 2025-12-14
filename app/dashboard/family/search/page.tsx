'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { EducatorProfile } from '@/types';
import { getCurrentPosition, reverseGeocode, geocodeAddress, calculateDistance } from '@/lib/geolocation';
import FamilyNavbar from '@/components/FamilyNavbar';
import { professions, getProfessionByValue } from '@/lib/professions-config';

// Composant Modal Vidéo Story
function VideoStoryModal({
  isOpen,
  onClose,
  videoUrl,
  educatorName,
  avatarUrl
}: {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  educatorName: string;
  avatarUrl?: string;
}) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header avec info éducateur */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 p-0.5">
            <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden">
              {avatarUrl ? (
                <img src={avatarUrl} alt={educatorName} className="w-full h-full object-cover" />
              ) : (
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              )}
            </div>
          </div>
          <span className="text-white font-semibold">{educatorName}</span>
        </div>

        {/* Vidéo */}
        <div className="relative rounded-2xl overflow-hidden bg-black aspect-video shadow-2xl">
          <video
            src={videoUrl}
            controls
            autoPlay
            className="w-full h-full object-contain"
          />
        </div>

        {/* Bouton fermer */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white/80 hover:text-white transition-colors p-2"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// Composant bouton favori
function FavoriteButton({ educatorId, familyId, isFavorite, onToggle }: {
  educatorId: string;
  familyId: string | null;
  isFavorite: boolean;
  onToggle: (educatorId: string, newState: boolean) => void;
}) {
  const [loading, setLoading] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!familyId) {
      alert('Veuillez vous connecter en tant que famille pour ajouter des favoris');
      return;
    }

    setLoading(true);
    try {
      if (isFavorite) {
        // Supprimer des favoris
        await supabase
          .from('favorite_educators')
          .delete()
          .eq('family_id', familyId)
          .eq('educator_id', educatorId);
        onToggle(educatorId, false);
      } else {
        // Ajouter aux favoris
        await supabase
          .from('favorite_educators')
          .insert({ family_id: familyId, educator_id: educatorId });
        onToggle(educatorId, true);
      }
    } catch (error) {
      console.error('Erreur lors de la gestion des favoris:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`p-2 rounded-full transition-all ${
        isFavorite
          ? 'bg-red-100 text-red-500 hover:bg-red-200'
          : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-red-400'
      } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      aria-label={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
      title={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
    >
      <svg
        className="w-5 h-5"
        fill={isFavorite ? 'currentColor' : 'none'}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    </button>
  );
}


// Catégories de professions pour les filtres
const professionCategories = [
  {
    name: 'Éducatif',
    icon: '👨‍🏫',
    professions: professions.filter(p => p.category === 'Éducatif'),
  },
  {
    name: 'Psychologie',
    icon: '🧠',
    professions: professions.filter(p => p.category === 'Psychologie'),
  },
  {
    name: 'Thérapies',
    icon: '💆',
    professions: professions.filter(p => p.category === 'Thérapies'),
  },
  {
    name: 'Autres',
    icon: '✨',
    professions: professions.filter(p => p.category === 'Autres'),
  },
];

type EducatorWithDistance = EducatorProfile & { distance?: number };

const ITEMS_PER_PAGE = 10;

export default function FamilySearchPage() {
  const router = useRouter();
  const [educators, setEducators] = useState<EducatorWithDistance[]>([]);
  const [loading, setLoading] = useState(true);
  const [geolocating, setGeolocating] = useState(false);
  const [familyId, setFamilyId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [familyProfile, setFamilyProfile] = useState<any>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedVideo, setSelectedVideo] = useState<{
    url: string;
    name: string;
    avatar?: string;
  } | null>(null);
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [filters, setFilters] = useState({
    location: '',
    professionTypes: [] as string[],
    minExperience: '',
    maxRate: '',
    minRating: '',
    radius: '', // Rayon en km
    gender: '', // Genre: 'male', 'female' ou ''
  });

  useEffect(() => {
    fetchEducators();
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
      router.push('/auth/login');
      return;
    }

    setUserId(session.user.id);

    // Récupérer le familyId et les favoris
    const { data: familyProfileData } = await supabase
      .from('family_profiles')
      .select('*')
      .eq('user_id', session.user.id)
      .single();

    if (!familyProfileData) {
      router.push('/auth/login');
      return;
    }

    setFamilyId(familyProfileData.id);
    setFamilyProfile(familyProfileData);

    // Récupérer les favoris
    const { data: favoritesData } = await supabase
      .from('favorite_educators')
      .select('educator_id')
      .eq('family_id', familyProfileData.id);

    if (favoritesData) {
      setFavorites(new Set(favoritesData.map(f => f.educator_id)));
    }
  };

  const handleFavoriteToggle = (educatorId: string, newState: boolean) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newState) {
        newFavorites.add(educatorId);
      } else {
        newFavorites.delete(educatorId);
      }
      return newFavorites;
    });
  };

  const fetchEducators = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('educator_profiles')
        .select(`
          *,
          subscriptions!educator_id (
            status
          )
        `)
        .eq('verification_badge', true) // IMPORTANT: Seuls les profils vérifiés
        .gte('years_of_experience', 1) // Minimum 1 an d'expérience requis
        .order('rating', { ascending: false });

      // Appliquer les filtres (sauf location si rayon est défini)
      if (filters.location && !filters.radius) {
        query = query.ilike('location', `%${filters.location}%`);
      }
      if (filters.minExperience) {
        query = query.gte('years_of_experience', parseInt(filters.minExperience));
      }
      if (filters.maxRate) {
        query = query.lte('hourly_rate', parseFloat(filters.maxRate));
      }
      if (filters.minRating) {
        query = query.gte('rating', parseFloat(filters.minRating));
      }

      const { data, error } = await query;

      if (error) throw error;

      // Filtrer les éducateurs suspendus
      let filtered = (data || []).filter(educator => {
        const suspendedUntil = (educator as any).suspended_until;
        if (!suspendedUntil) return true; // Non suspendu
        return new Date(suspendedUntil) < new Date(); // Suspension expirée
      });

      // Filtrer par type de profession
      if (filters.professionTypes.length > 0) {
        filtered = filtered.filter(educator =>
          filters.professionTypes.includes(educator.profession_type || 'educator')
        );
      }

      // Filtrer par genre
      if (filters.gender) {
        filtered = filtered.filter(educator =>
          educator.gender === filters.gender
        );
      }

      // Si un rayon est défini et une localisation, filtrer par distance
      if (filters.location && filters.radius) {
        const radiusKm = parseInt(filters.radius);
        const searchCoords = await geocodeAddress(filters.location);

        if (searchCoords) {
          const educatorsWithDistance = await Promise.all(
            filtered.map(async (educator) => {
              if (educator.location) {
                const coords = await geocodeAddress(educator.location);
                if (coords) {
                  const distance = calculateDistance(
                    searchCoords.latitude,
                    searchCoords.longitude,
                    coords.latitude,
                    coords.longitude
                  );
                  return { ...educator, distance };
                }
              }
              return { ...educator, distance: undefined };
            })
          );

          // Filtrer par rayon et trier par distance
          filtered = educatorsWithDistance
            .filter(e => e.distance !== undefined && e.distance <= radiusKm)
            .sort((a, b) => {
              // Premium d'abord
              const aSubscription = (a as any).subscriptions;
              const bSubscription = (b as any).subscriptions;
              const aIsPremium = aSubscription && ['active', 'trialing'].includes(aSubscription.status);
              const bIsPremium = bSubscription && ['active', 'trialing'].includes(bSubscription.status);

              if (aIsPremium && !bIsPremium) return -1;
              if (!aIsPremium && bIsPremium) return 1;

              // Ensuite par distance
              return (a.distance || 0) - (b.distance || 0);
            });

          setEducators(filtered as any);
          return;
        }
      }

      // Trier d'abord par statut Premium, puis par rating
      const sortedFiltered = [...filtered].sort((a, b) => {
        // Vérifier si le professionnel a un abonnement actif
        const aSubscription = (a as any).subscriptions;
        const bSubscription = (b as any).subscriptions;

        const aIsPremium = aSubscription &&
          ['active', 'trialing'].includes(aSubscription.status);
        const bIsPremium = bSubscription &&
          ['active', 'trialing'].includes(bSubscription.status);

        // Premium d'abord
        if (aIsPremium && !bIsPremium) return -1;
        if (!aIsPremium && bIsPremium) return 1;

        // Ensuite par rating
        return (b.rating || 0) - (a.rating || 0);
      });

      setEducators(sortedFiltered as any);
    } catch (error) {
      console.error('Erreur lors de la récupération des professionnels:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfessionToggle = (professionValue: string) => {
    const current = filters.professionTypes;
    if (current.includes(professionValue)) {
      setFilters({
        ...filters,
        professionTypes: current.filter(p => p !== professionValue),
      });
    } else {
      setFilters({
        ...filters,
        professionTypes: [...current, professionValue],
      });
    }
  };

  const handleSearch = () => {
    setCurrentPage(1); // Réinitialiser à la page 1 lors d'une nouvelle recherche
    fetchEducators();
  };

  // Calcul de la pagination
  const totalPages = Math.ceil(educators.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedEducators = educators.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGetLocation = async () => {
    setGeolocating(true);
    try {
      const position = await getCurrentPosition();
      const address = await reverseGeocode(position.latitude, position.longitude);
      if (address) {
        setFilters({ ...filters, location: address });
      }
    } catch (error: any) {
      alert(error.message || 'Impossible d\'obtenir votre position');
      console.error('Erreur de géolocalisation:', error);
    } finally {
      setGeolocating(false);
    }
  };

  // Arrondissements de Paris
  const parisArrondissements = [
    'Paris 1er', 'Paris 2e', 'Paris 3e', 'Paris 4e', 'Paris 5e',
    'Paris 6e', 'Paris 7e', 'Paris 8e', 'Paris 9e', 'Paris 10e',
    'Paris 11e', 'Paris 12e', 'Paris 13e', 'Paris 14e', 'Paris 15e',
    'Paris 16e', 'Paris 17e', 'Paris 18e', 'Paris 19e', 'Paris 20e'
  ];

  // Recherche d'adresse avec autocomplétion
  const searchLocationSuggestions = async (query: string) => {
    if (query.length < 2) {
      setLocationSuggestions([]);
      setShowLocationSuggestions(false);
      return;
    }

    // Cas spécial pour Paris - montrer les arrondissements
    const queryLower = query.toLowerCase();
    if (queryLower.startsWith('paris')) {
      const filtered = parisArrondissements.filter(arr =>
        arr.toLowerCase().includes(queryLower)
      );
      if (filtered.length > 0) {
        setLocationSuggestions(['Paris', ...filtered]);
        setShowLocationSuggestions(true);
        return;
      }
    }

    try {
      const response = await fetch(
        `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&limit=10&type=municipality`
      );
      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const suggestions = data.features.map((feature: any) => feature.properties.label);
        setLocationSuggestions(suggestions.slice(0, 8));
        setShowLocationSuggestions(true);
      } else {
        setLocationSuggestions([]);
        setShowLocationSuggestions(false);
      }
    } catch (error) {
      console.error('Erreur recherche adresse:', error);
      setLocationSuggestions([]);
    }
  };

  const handleLocationChange = (value: string) => {
    setFilters({ ...filters, location: value });
    searchLocationSuggestions(value);
  };

  const selectLocationSuggestion = (suggestion: string) => {
    setFilters({ ...filters, location: suggestion });
    setLocationSuggestions([]);
    setShowLocationSuggestions(false);
  };

  const resetFilters = () => {
    setFilters({
      location: '',
      professionTypes: [],
      minExperience: '',
      maxRate: '',
      minRating: '',
      radius: '',
      gender: '',
    });
    setCurrentPage(1);
    setTimeout(fetchEducators, 100);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.location) count++;
    if (filters.radius) count++;
    if (filters.professionTypes.length > 0) count += filters.professionTypes.length;
    if (filters.minExperience) count++;
    if (filters.maxRate) count++;
    if (filters.minRating) count++;
    if (filters.gender) count++;
    return count;
  };

  // Fonction pour obtenir le label de la profession
  const getProfessionLabel = (professionType: string | undefined) => {
    if (!professionType) return 'Professionnel';
    const profession = getProfessionByValue(professionType);
    return profession?.label || 'Professionnel';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-blue-50 relative">
      {/* Éléments décoratifs de fond - masqués sur mobile */}
      <div className="hidden sm:block absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
      <div className="hidden sm:block absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-primary-200/30 to-blue-200/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
      <div className="hidden sm:block absolute top-1/2 left-1/4 w-64 h-64 bg-gradient-to-r from-green-100/20 to-teal-100/20 rounded-full blur-3xl pointer-events-none"></div>

      {/* Navigation */}
      <FamilyNavbar profile={familyProfile} familyId={familyId} userId={userId} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 relative z-10">
        {/* Bouton filtres mobile amélioré */}
        <div className="lg:hidden mb-5">
          <button
            onClick={() => setShowFilters(!showFilters)}
            aria-expanded={showFilters}
            aria-controls="filters-panel"
            className="w-full flex items-center justify-between bg-white rounded-2xl shadow-lg px-5 py-4 border border-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 group hover:shadow-xl transition-all"
          >
            <span className="flex items-center gap-3 font-bold text-gray-800">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <div className="text-left">
                <span className="block">Filtrer les résultats</span>
                {getActiveFiltersCount() > 0 && (
                  <span className="text-xs font-medium text-primary-600">{getActiveFiltersCount()} filtre(s) actif(s)</span>
                )}
              </div>
            </span>
            <div className={`w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center transition-all ${showFilters ? 'bg-primary-100' : ''}`}>
              <svg className={`w-5 h-5 transition-transform duration-300 ${showFilters ? 'rotate-180 text-primary-600' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Filtres avec design amélioré */}
          <div id="filters-panel" className={`lg:col-span-1 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-2xl shadow-xl p-5 sm:p-6 lg:sticky lg:top-24 border border-gray-100 overflow-hidden relative">
              {/* Barre décorative supérieure */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 via-purple-500 to-pink-500"></div>

              <div className="flex items-center gap-3 mb-5 sm:mb-6 pt-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center shadow-lg">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Filtrer</h2>
                  <p className="text-xs text-gray-500">Affinez votre recherche</p>
                </div>
              </div>

              <div className="space-y-5">
                {/* Type de professionnel */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Type de professionnel
                  </label>

                  <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
                    {professionCategories.map((category) => (
                      <div key={category.name} className="space-y-2">
                        <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wide">
                          <span>{category.icon}</span>
                          <span>{category.name}</span>
                        </div>
                        <div className="space-y-1.5 pl-2">
                          {category.professions.map((profession) => (
                            <label key={profession.value} className="flex items-center cursor-pointer group">
                              <input
                                type="checkbox"
                                checked={filters.professionTypes.includes(profession.value)}
                                onChange={() => handleProfessionToggle(profession.value)}
                                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded cursor-pointer"
                              />
                              <span className="ml-2 text-sm text-gray-700 group-hover:text-primary-600 transition-colors">
                                {profession.label}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Localisation */}
                <div className="space-y-2 pt-3 border-t border-gray-200">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Localisation
                  </label>
                  <div className="relative">
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Tapez une ville..."
                        value={filters.location}
                        onChange={(e) => handleLocationChange(e.target.value)}
                        onFocus={() => filters.location.length >= 2 && setShowLocationSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowLocationSuggestions(false), 200)}
                        className="w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                      />
                      <button
                        type="button"
                        onClick={handleGetLocation}
                        disabled={geolocating}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 font-medium text-sm shadow-md hover:shadow-lg"
                        style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 25%, #a855f7 50%, #c084fc 75%, #e879f9 100%)' }}
                      >
                        {geolocating ? (
                          <>
                            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                            <span>Localisation en cours...</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2-1.343-2-3-2z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                            </svg>
                            <span>Utiliser ma position actuelle</span>
                          </>
                        )}
                      </button>
                    </div>
                    {/* Liste des suggestions */}
                    {showLocationSuggestions && locationSuggestions.length > 0 && (
                      <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {locationSuggestions.map((suggestion, index) => (
                          <li
                            key={index}
                            onClick={() => selectLocationSuggestion(suggestion)}
                            className="px-4 py-2.5 hover:bg-primary-50 cursor-pointer text-sm text-gray-700 border-b border-gray-100 last:border-b-0 flex items-center gap-2"
                          >
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            </svg>
                            {suggestion}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Rayon de recherche */}
                  {filters.location && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-medium text-gray-600">Rayon de recherche</label>
                        <span className="text-sm font-bold text-primary-600">
                          {filters.radius ? `${filters.radius} km` : 'Ville exacte'}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={filters.radius || '0'}
                        onChange={(e) => setFilters({ ...filters, radius: e.target.value === '0' ? '' : e.target.value })}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        aria-label={`Rayon de recherche: ${filters.radius ? `${filters.radius} kilomètres` : 'ville exacte'}`}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={parseInt(filters.radius) || 0}
                        aria-valuetext={filters.radius ? `${filters.radius} kilomètres` : 'Ville exacte'}
                      />
                      <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>0</span>
                        <span>25</span>
                        <span>50</span>
                        <span>75</span>
                        <span>100 km</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Expérience */}
                <div className="space-y-2 pt-3 border-t border-gray-200">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Expérience minimum
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      placeholder="Nombre d'années"
                      value={filters.minExperience}
                      onChange={(e) => setFilters({ ...filters, minExperience: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">ans</span>
                  </div>
                </div>

                {/* Tarif */}
                <div className="space-y-2 pt-3 border-t border-gray-200">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Tarif maximum
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Tarif horaire max"
                      value={filters.maxRate}
                      onChange={(e) => setFilters({ ...filters, maxRate: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">€/h</span>
                  </div>
                </div>

                {/* Genre */}
                <div className="space-y-2 pt-3 border-t border-gray-200">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Genre
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setFilters({ ...filters, gender: filters.gender === 'male' ? '' : 'male' })}
                      className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-all border ${
                        filters.gender === 'male'
                          ? 'bg-primary-600 text-white border-primary-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-primary-400'
                      }`}
                    >
                      Homme
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilters({ ...filters, gender: filters.gender === 'female' ? '' : 'female' })}
                      className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-all border ${
                        filters.gender === 'female'
                          ? 'bg-primary-600 text-white border-primary-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-primary-400'
                      }`}
                    >
                      Femme
                    </button>
                  </div>
                </div>

                <div className="pt-5 space-y-3 border-t border-gray-200">
                  <button
                    onClick={handleSearch}
                    className="w-full text-white py-3.5 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 group hover:opacity-90"
                    style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 25%, #a855f7 50%, #c084fc 75%, #e879f9 100%)' }}
                  >
                    <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Rechercher
                  </button>
                  <button
                    onClick={resetFilters}
                    className="w-full bg-gray-50 text-gray-700 py-3 px-4 rounded-xl border border-gray-200 hover:bg-gray-100 hover:border-gray-300 font-medium transition-all flex items-center justify-center gap-2 group"
                  >
                    <svg className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Réinitialiser les filtres
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Résultats */}
          <div className="lg:col-span-3" role="region" aria-label="Résultats de recherche" aria-live="polite">
            {loading ? (
              <div className="text-center py-20 bg-white rounded-2xl shadow-xl border border-gray-100">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full border-4 border-primary-100"></div>
                  </div>
                  <div className="animate-spin rounded-full h-20 w-20 border-4 border-t-primary-600 border-r-purple-500 border-b-pink-500 border-l-primary-200 mx-auto"></div>
                </div>
                <p className="text-gray-700 font-semibold mt-6 text-lg">Recherche en cours...</p>
                <p className="text-gray-500 text-sm mt-1">Nous trouvons les meilleurs professionnels pour vous</p>
              </div>
            ) : educators.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl shadow-xl border border-gray-100">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">Aucun professionnel trouvé</h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">Nous n'avons pas trouvé de professionnels correspondant à vos critères. Essayez de modifier vos filtres.</p>
                <button
                  onClick={resetFilters}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Réinitialiser les filtres
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                {paginatedEducators.map((educator) => (
                  <div
                    key={educator.id}
                    className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 overflow-hidden group hover:-translate-y-1 relative cursor-pointer"
                    onClick={() => router.push(`/educator/${educator.id}`)}
                  >
                    {/* Bouton favori mobile - position absolue en haut à droite */}
                    <div className="absolute top-4 right-4 z-10 sm:hidden">
                      <FavoriteButton
                        educatorId={educator.id}
                        familyId={familyId}
                        isFavorite={favorites.has(educator.id)}
                        onToggle={handleFavoriteToggle}
                      />
                    </div>
                    <div className="p-4 sm:p-6 pr-14 sm:pr-6">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4">
                        <div className="flex gap-3 sm:gap-5">
                          {/* Photo de profil avec effet story */}
                          <div
                            className={`flex-shrink-0 ${(educator as any).video_presentation_url ? 'cursor-pointer' : ''}`}
                            onClick={(e) => {
                              if ((educator as any).video_presentation_url) {
                                e.stopPropagation();
                                setSelectedVideo({
                                  url: (educator as any).video_presentation_url,
                                  name: `${educator.first_name} ${educator.last_name}`,
                                  avatar: educator.avatar_url || undefined
                                });
                              }
                            }}
                          >
                            {/* Conteneur avec cercle story si vidéo */}
                            <div className={`rounded-full ${
                              (educator as any).video_presentation_url
                                ? 'p-[2px] sm:p-[3px] bg-gradient-to-tr from-violet-600 via-purple-500 to-fuchsia-500'
                                : ''
                            }`}>
                              {educator.avatar_url ? (
                                <div className="relative group/avatar">
                                  {!(educator as any).video_presentation_url && (
                                    <div className="absolute -inset-1 bg-gradient-to-r from-primary-500 to-purple-500 rounded-full blur opacity-25 group-hover/avatar:opacity-50 transition-opacity"></div>
                                  )}
                                  <img
                                    src={educator.avatar_url}
                                    alt={`${educator.first_name} ${educator.last_name}`}
                                    className={`relative w-16 h-16 sm:w-28 sm:h-28 rounded-full object-cover shadow-xl transition-all ${
                                      (educator as any).video_presentation_url
                                        ? 'border-2 sm:border-[3px] border-white hover:opacity-90'
                                        : 'border-2 sm:border-3 border-white ring-2 ring-primary-100 group-hover:ring-primary-300'
                                    }`}
                                  />
                                  {/* Icône play si vidéo */}
                                  {(educator as any).video_presentation_url && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-full opacity-0 hover:opacity-100 transition-opacity">
                                      <div className="w-8 h-8 sm:w-12 sm:h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                                        <svg className="w-4 h-4 sm:w-6 sm:h-6 text-violet-600 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                          <path d="M8 5v14l11-7z" />
                                        </svg>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="relative group/avatar">
                                  {!(educator as any).video_presentation_url && (
                                    <div className="absolute -inset-1 bg-gradient-to-r from-primary-500 to-purple-500 rounded-full blur opacity-25 group-hover/avatar:opacity-50 transition-opacity"></div>
                                  )}
                                  <div className={`relative w-16 h-16 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-primary-100 via-purple-50 to-pink-100 flex items-center justify-center shadow-xl transition-all ${
                                    (educator as any).video_presentation_url
                                      ? 'border-2 sm:border-[3px] border-white hover:opacity-90'
                                      : 'border-2 sm:border-3 border-white ring-2 ring-primary-100 group-hover:ring-primary-300'
                                  }`}>
                                    <svg className="w-8 h-8 sm:w-14 sm:h-14 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                  </div>
                                  {/* Icône play si vidéo */}
                                  {(educator as any).video_presentation_url && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-full opacity-0 hover:opacity-100 transition-opacity">
                                      <div className="w-8 h-8 sm:w-12 sm:h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                                        <svg className="w-4 h-4 sm:w-6 sm:h-6 text-violet-600 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                          <path d="M8 5v14l11-7z" />
                                        </svg>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-2">
                            <h3 className="text-base sm:text-xl font-bold text-gray-900 group-hover:text-primary-700 transition-colors truncate">
                              {educator.first_name} {educator.last_name}
                            </h3>
                            {educator.verification_badge && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-emerald-500 to-green-500 text-white text-[10px] sm:text-xs font-bold rounded-full shadow-sm w-fit flex-shrink-0">
                                <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                Vérifié
                              </span>
                            )}
                            {(educator as any).video_presentation_url && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-violet-500 to-purple-500 text-white text-[10px] sm:text-xs font-bold rounded-full shadow-sm w-fit flex-shrink-0">
                                <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                Vidéo
                              </span>
                            )}
                          </div>

                          {/* Badge profession avec style amélioré */}
                          <div className="mb-2 sm:mb-3">
                            <span className="inline-flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-gradient-to-r from-primary-50 to-purple-50 text-primary-700 text-xs sm:text-sm font-semibold rounded-lg sm:rounded-xl border border-primary-200 shadow-sm">
                              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary-500 rounded-full animate-pulse"></span>
                              <span className="truncate max-w-[150px] sm:max-w-none">{getProfessionLabel(educator.profession_type)}</span>
                            </span>
                          </div>

                          {/* Note moyenne avec étoiles améliorées */}
                          {educator.rating > 0 && (
                            <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3 bg-gradient-to-r from-amber-50 to-yellow-50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl w-fit border border-amber-100">
                              <div className="flex items-center gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                  <svg
                                    key={i}
                                    className={`w-3.5 h-3.5 sm:w-5 sm:h-5 ${
                                      i < Math.round(educator.rating)
                                        ? 'text-amber-400'
                                        : 'text-gray-300'
                                    }`}
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                ))}
                              </div>
                              <span className="text-xs sm:text-base font-bold text-amber-700">
                                {educator.rating.toFixed(1)}
                              </span>
                              <span className="text-[10px] sm:text-sm text-amber-600 font-medium">
                                ({educator.total_reviews} avis)
                              </span>
                            </div>
                          )}

                          {/* Localisation avec style amélioré */}
                          <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3 text-gray-600">
                            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="text-xs sm:text-base truncate">{educator.location}</span>
                          </div>

                          {/* Badges expérience et taux horaire */}
                          <div className="flex items-center gap-1.5 sm:gap-3 text-[10px] sm:text-sm flex-wrap mb-2 sm:mb-3">
                            {educator.years_of_experience && educator.years_of_experience > 0 && (
                              <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 bg-blue-50 text-blue-700 rounded-md sm:rounded-lg font-medium border border-blue-100">
                                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                {educator.years_of_experience} ans
                              </span>
                            )}
                            {educator.hourly_rate && educator.hourly_rate > 0 && (
                              <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 bg-green-50 text-green-700 rounded-md sm:rounded-lg font-medium border border-green-100">
                                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {educator.hourly_rate}€/h
                              </span>
                            )}
                          </div>

                          {/* Badge distance si recherche par rayon */}
                          {educator.distance !== undefined && (
                            <div className="flex items-center gap-1.5 sm:gap-3 text-[10px] sm:text-sm flex-wrap">
                              <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-lg sm:rounded-xl font-semibold shadow-sm">
                                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                {educator.distance} km
                              </span>
                            </div>
                          )}
                          </div>
                        </div>

                        {/* Bouton favori desktop */}
                        <div className="hidden sm:flex flex-col gap-2 items-center ml-4">
                          <FavoriteButton
                            educatorId={educator.id}
                            familyId={familyId}
                            isFavorite={favorites.has(educator.id)}
                            onToggle={handleFavoriteToggle}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Pagination améliorée */}
                {totalPages > 1 && (
                  <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100 mt-6">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      {/* Info pagination */}
                      <p className="text-sm text-gray-500 order-2 sm:order-1">
                        Affichage {startIndex + 1} - {Math.min(endIndex, educators.length)} sur {educators.length} résultats
                      </p>

                      {/* Contrôles de pagination */}
                      <div className="flex items-center gap-2 order-1 sm:order-2">
                        {/* Bouton Précédent */}
                        <button
                          onClick={() => goToPage(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all group"
                        >
                          <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                          <span className="hidden sm:inline">Précédent</span>
                        </button>

                        {/* Numéros de page */}
                        <div className="flex items-center gap-1">
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                            if (
                              page === 1 ||
                              page === totalPages ||
                              (page >= currentPage - 1 && page <= currentPage + 1)
                            ) {
                              return (
                                <button
                                  key={page}
                                  onClick={() => goToPage(page)}
                                  className={`min-w-[44px] h-11 px-3 py-2 text-sm font-bold rounded-xl transition-all ${
                                    currentPage === page
                                      ? 'bg-gradient-to-r from-primary-600 to-purple-600 text-white shadow-lg scale-105'
                                      : 'text-gray-600 bg-gray-50 border border-gray-200 hover:bg-gray-100 hover:border-primary-300 hover:text-primary-600'
                                  }`}
                                >
                                  {page}
                                </button>
                              );
                            } else if (
                              page === currentPage - 2 ||
                              page === currentPage + 2
                            ) {
                              return (
                                <span key={page} className="px-1 text-gray-300 font-bold">
                                  ...
                                </span>
                              );
                            }
                            return null;
                          })}
                        </div>

                        {/* Bouton Suivant */}
                        <button
                          onClick={() => goToPage(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-primary-600 to-purple-600 rounded-xl hover:from-primary-700 hover:to-purple-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg group"
                        >
                          <span className="hidden sm:inline">Suivant</span>
                          <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Vidéo Story */}
      <VideoStoryModal
        isOpen={selectedVideo !== null}
        onClose={() => setSelectedVideo(null)}
        videoUrl={selectedVideo?.url || ''}
        educatorName={selectedVideo?.name || ''}
        avatarUrl={selectedVideo?.avatar}
      />
    </div>
  );
}
