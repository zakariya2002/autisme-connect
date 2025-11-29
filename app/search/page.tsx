'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { EducatorProfile, CertificationType } from '@/types';
import { getCurrentPosition, geocodeAddress, calculateDistance, reverseGeocode } from '@/lib/geolocation';
import Logo from '@/components/Logo';
import MobileMenu from '@/components/MobileMenu';
import TndToggle from '@/components/TndToggle';
import { useTnd } from '@/contexts/TndContext';
import SearchTnd from './page-tnd';

type EducatorWithDistance = EducatorProfile & { distance?: number };

export default function SearchPage() {
  const { tndMode } = useTnd();
  const [educators, setEducators] = useState<EducatorWithDistance[]>([]);
  const [loading, setLoading] = useState(true);
  const [geolocating, setGeolocating] = useState(false);
  const [userPosition, setUserPosition] = useState<{ latitude: number; longitude: number } | null>(null);
  const [userCity, setUserCity] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    location: '',
    certifications: [] as CertificationType[],
    minExperience: '',
    maxRate: '',
    minRating: '',
    nearMe: false,
  });

  useEffect(() => {
    fetchEducators();
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setIsAuthenticated(!!session);
    setUserRole(session?.user?.user_metadata?.role || null);
  };

  const fetchEducators = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('educator_profiles')
        .select(`
          *,
          certifications (*),
          subscriptions!educator_id (
            status
          )
        `)
        .eq('verification_badge', true) // IMPORTANT: Seuls les profils vérifiés
        .order('rating', { ascending: false });

      // Appliquer les filtres
      if (filters.location && !filters.nearMe) {
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

      // Filtrer par certifications si nécessaire
      let filtered = data || [];
      if (filters.certifications.length > 0) {
        filtered = filtered.filter(educator =>
          educator.certifications?.some((cert: any) =>
            filters.certifications.includes(cert.type)
          )
        );
      }

      // Si géolocalisation activée, calculer les distances
      if (filters.nearMe && userPosition) {
        const educatorsWithDistance = await Promise.all(
          filtered.map(async (educator) => {
            if (educator.location) {
              const coords = await geocodeAddress(educator.location);
              if (coords) {
                const distance = calculateDistance(
                  userPosition.latitude,
                  userPosition.longitude,
                  coords.latitude,
                  coords.longitude
                );
                return { ...educator, distance };
              }
            }
            return { ...educator, distance: undefined };
          })
        );

        // Trier d'abord par statut Premium, puis par distance
        educatorsWithDistance.sort((a, b) => {
          const aIsPremium = (a as any).subscriptions?.some((sub: any) =>
            ['active', 'trialing'].includes(sub.status)
          ) || false;
          const bIsPremium = (b as any).subscriptions?.some((sub: any) =>
            ['active', 'trialing'].includes(sub.status)
          ) || false;

          // Premium d'abord
          if (aIsPremium && !bIsPremium) return -1;
          if (!aIsPremium && bIsPremium) return 1;

          // Ensuite par distance
          if (a.distance === undefined) return 1;
          if (b.distance === undefined) return -1;
          return a.distance - b.distance;
        });

        setEducators(educatorsWithDistance as any);
      } else {
        // Trier d'abord par statut Premium, puis par rating
        const sortedFiltered = [...filtered].sort((a, b) => {
          // Vérifier si l'éducateur a un abonnement actif
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
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des éducateurs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCertificationToggle = (cert: CertificationType) => {
    const current = filters.certifications;
    if (current.includes(cert)) {
      setFilters({
        ...filters,
        certifications: current.filter(c => c !== cert),
      });
    } else {
      setFilters({
        ...filters,
        certifications: [...current, cert],
      });
    }
  };

  const handleSearch = () => {
    fetchEducators();
  };

  const handleNearMe = async () => {
    setGeolocating(true);
    try {
      const position = await getCurrentPosition();
      setUserPosition(position);

      // Récupérer le nom de la ville
      const address = await reverseGeocode(position.latitude, position.longitude);
      if (address) {
        setUserCity(address);
      }

      setFilters({
        ...filters,
        nearMe: true,
        location: '', // Vider le champ localisation
      });

      // Attendre que les filtres soient mis à jour puis rechercher
      setTimeout(() => {
        fetchEducators();
      }, 100);
    } catch (error: any) {
      alert(error.message || 'Impossible d\'obtenir votre position');
      console.error('Erreur de géolocalisation:', error);
    } finally {
      setGeolocating(false);
    }
  };

  const resetFilters = () => {
    setFilters({
      location: '',
      certifications: [],
      minExperience: '',
      maxRate: '',
      minRating: '',
      nearMe: false,
    });
    setUserPosition(null);
    setUserCity('');
    setTimeout(fetchEducators, 100);
  };

  if (tndMode) {
    return (
      <>
        <SearchTnd />
        <TndToggle />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-blue-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50 backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <Logo />
            <div className="md:hidden">
              <MobileMenu />
            </div>
            <div className="hidden md:flex items-center gap-2">
              {isAuthenticated ? (
                <Link
                  href={userRole === 'educator' ? '/dashboard/educator' : '/dashboard/family'}
                  className={`ml-4 inline-flex items-center gap-2 text-white px-6 py-2.5 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg ${
                    userRole === 'educator'
                      ? 'bg-gradient-to-r from-primary-500 to-green-500 hover:from-primary-600 hover:to-green-600'
                      : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Tableau de bord
                </Link>
              ) : (
                <>
                  <Link href="/" className="text-gray-700 hover:text-primary-600 px-3 lg:px-4 py-2 rounded-md font-medium transition-colors text-sm lg:text-base">
                    Accueil
                  </Link>
                  <Link href="/about" className="text-gray-700 hover:text-primary-600 px-3 lg:px-4 py-2 rounded-md font-medium transition-colors text-sm lg:text-base">
                    Qui sommes-nous ?
                  </Link>
                  <Link href="/search" className="text-gray-700 hover:text-primary-600 px-3 lg:px-4 py-2 rounded-md font-medium transition-colors text-sm lg:text-base inline-flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Trouver un éducateur
                  </Link>
                  <Link href="/pricing" className="text-gray-700 hover:text-primary-600 px-2 lg:px-4 py-2 rounded-md font-medium transition-colors text-sm lg:text-base inline-flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Tarifs
                  </Link>
                  <Link href="/contact" className="text-gray-700 hover:text-primary-600 px-2 lg:px-4 py-2 rounded-md font-medium transition-colors text-sm lg:text-base">
                    Contact
                  </Link>
                  <Link href="/auth/login" className="ml-4 text-gray-700 hover:text-primary-600 px-2 lg:px-4 py-2 rounded-md font-medium transition-colors text-sm lg:text-base">
                    Connexion
                  </Link>
                  <Link href="/auth/signup" className="bg-primary-600 text-white px-5 py-2.5 rounded-md hover:bg-primary-700 font-medium transition-colors shadow-sm text-sm lg:text-base">
                    Inscription
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 lg:py-12">
        {/* Header Section Amélioré */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 bg-white shadow-lg text-primary-700 px-4 sm:px-6 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-bold mb-4 sm:mb-6 border-2 border-primary-200">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span>Recherche d'éducateurs qualifiés</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
            Trouvez l'éducateur
            <span className="text-primary-600 block mt-1 sm:mt-2">qui correspond à vos besoins</span>
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto">
            Parcourez notre réseau de professionnels vérifiés et trouvez celui qui saura accompagner votre famille avec expertise et bienveillance.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Filtres */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-5 sm:p-6 lg:sticky lg:top-24 border border-gray-100">
              <div className="flex items-center gap-2 mb-4 sm:mb-5">
                <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                <h2 className="text-base sm:text-lg font-bold text-gray-900">Affiner ma recherche</h2>
              </div>

              <div className="space-y-5">
                {/* Localisation */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Localisation
                  </label>
                  <input
                    type="text"
                    placeholder="Ville, région..."
                    value={filters.location}
                    onChange={(e) => setFilters({ ...filters, location: e.target.value, nearMe: false })}
                    disabled={filters.nearMe}
                    className="w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all"
                  />
                  <button
                    onClick={handleNearMe}
                    disabled={geolocating}
                    className="mt-2 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-green-700 text-white py-2.5 px-4 rounded-lg hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md font-medium"
                  >
                    {geolocating ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                        Localisation...
                      </>
                    ) : (
                      <>
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {filters.nearMe && userCity ? `📍 ${userCity}` : filters.nearMe ? '📍 Recherche activée' : 'Ma position'}
                      </>
                    )}
                  </button>
                  {filters.nearMe && (
                    <p className="mt-1 text-xs text-green-600 font-medium">
                      ✓ Recherche par proximité activée
                    </p>
                  )}
                </div>

                {/* Certifications */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                    Certifications
                  </label>
                  <div className="space-y-2.5">
                    {(['ABA', 'TEACCH', 'PECS'] as CertificationType[]).map(cert => (
                      <label key={cert} className="flex items-center cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={filters.certifications.includes(cert)}
                          onChange={() => handleCertificationToggle(cert)}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded cursor-pointer"
                        />
                        <span className="ml-2.5 text-sm text-gray-700 group-hover:text-primary-600 transition-colors">{cert}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Expérience */}
                <div className="space-y-2">
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
                <div className="space-y-2">
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

                {/* Note */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <svg className="w-4 h-4 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    Note minimum
                  </label>
                  <select
                    value={filters.minRating}
                    onChange={(e) => setFilters({ ...filters, minRating: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all cursor-pointer"
                  >
                    <option value="">Toutes les notes</option>
                    <option value="4">4+ ⭐</option>
                    <option value="3">3+ ⭐</option>
                  </select>
                </div>

                <div className="pt-5 space-y-3 border-t border-gray-200">
                  <button
                    onClick={handleSearch}
                    className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 px-4 rounded-lg hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 font-semibold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Rechercher
                  </button>
                  <button
                    onClick={resetFilters}
                    className="w-full bg-white text-gray-700 py-2.5 px-4 rounded-lg border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400 font-medium transition-all flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Réinitialiser
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Résultats */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="text-center py-16 bg-white rounded-xl shadow-lg">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                <p className="text-gray-600 font-medium">Recherche en cours...</p>
              </div>
            ) : educators.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl shadow-lg border border-gray-100">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-600 font-medium mb-2">Aucun éducateur trouvé</p>
                <p className="text-sm text-gray-500">Essayez de modifier vos critères de recherche</p>
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-5">
                <div className="bg-white rounded-lg shadow-sm px-4 py-3 border border-gray-100">
                  <p className="text-sm sm:text-base font-semibold text-gray-700 flex items-center gap-2">
                    <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {educators.length} éducateur(s) trouvé(s)
                    {filters.nearMe && ' près de vous'}
                  </p>
                </div>
                {educators.map((educator) => (
                  <div key={educator.id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group">
                    <div className="p-5 sm:p-6">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                        <div className="flex gap-4 sm:gap-5">
                          {/* Photo de profil */}
                          <div className="flex-shrink-0">
                            {educator.avatar_url ? (
                              <img
                                src={educator.avatar_url}
                                alt={`${educator.first_name} ${educator.last_name}`}
                                className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl object-cover border-4 border-primary-100 shadow-lg group-hover:border-primary-200 transition-all"
                              />
                            ) : (
                              <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center border-4 border-primary-100 shadow-lg group-hover:border-primary-200 transition-all">
                                <svg className="w-10 h-10 sm:w-14 sm:h-14 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                              </div>
                            )}
                          </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                              {educator.first_name} {educator.last_name}
                            </h3>
                            {educator.verification_badge && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-600 text-white text-xs font-bold rounded-full">
                                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                Vérifié
                              </span>
                            )}
                            {(() => {
                              const subs = (educator as any).subscriptions;
                              if (!subs) return false;

                              // Si c'est un tableau
                              if (Array.isArray(subs)) {
                                return subs.some((sub: any) => ['active', 'trialing'].includes(sub.status));
                              }

                              // Si c'est un objet unique
                              if (typeof subs === 'object' && subs.status) {
                                return ['active', 'trialing'].includes(subs.status);
                              }

                              return false;
                            })() && (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white text-sm font-bold rounded-full shadow-lg border-2 border-yellow-300">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                PREMIUM
                              </span>
                            )}
                          </div>

                          {/* Note moyenne avec étoiles */}
                          {educator.rating > 0 ? (
                            <div className="flex items-center gap-1 mt-2 mb-2">
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <svg
                                    key={i}
                                    className={`w-4 h-4 sm:w-5 sm:h-5 ${
                                      i < Math.round(educator.rating)
                                        ? 'text-yellow-400 fill-current'
                                        : 'text-gray-300'
                                    }`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                                    />
                                  </svg>
                                ))}
                              </div>
                              <span className="text-sm sm:text-base font-bold text-gray-800">
                                {educator.rating.toFixed(1)}
                              </span>
                              <span className="text-xs sm:text-sm text-gray-500">
                                ({educator.total_reviews} avis)
                              </span>
                            </div>
                          ) : (
                            <p className="text-xs sm:text-sm text-gray-500 mt-2 mb-2">Aucun avis pour le moment</p>
                          )}

                          <p className="text-sm sm:text-base text-gray-600">{educator.location}</p>

                          {educator.bio && (
                            <p className="text-sm sm:text-base text-gray-700 mt-2 sm:mt-3 line-clamp-2 sm:line-clamp-3">{educator.bio}</p>
                          )}

                          <div className="mt-3 sm:mt-4 flex items-center gap-2 sm:gap-3 text-xs sm:text-sm flex-wrap">
                            {educator.distance !== undefined && (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg font-semibold border border-green-200">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                {educator.distance} km
                              </span>
                            )}
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg font-medium border border-blue-200">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              {educator.years_of_experience} ans
                            </span>
                            {educator.hourly_rate && (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg font-medium border border-purple-200">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {educator.hourly_rate}€/h
                              </span>
                            )}
                          </div>

                          {educator.specializations && educator.specializations.length > 0 && (
                            <div className="mt-2 sm:mt-3">
                              <span className="text-xs sm:text-sm text-gray-600">
                                Spécialisations: {educator.specializations.join(', ')}
                              </span>
                            </div>
                          )}

                          {educator.languages && educator.languages.length > 0 && (
                            <div className="mt-1 sm:mt-2">
                              <span className="text-xs sm:text-sm text-gray-600">
                                Langues: {educator.languages.join(', ')}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex sm:flex-col gap-2.5 w-full sm:w-auto sm:ml-4">
                        <Link
                          href={`/educator/${educator.id}`}
                          className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg hover:from-primary-700 hover:to-primary-800 text-center text-sm sm:text-base font-semibold shadow-md hover:shadow-lg transition-all whitespace-nowrap"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          Voir le profil
                        </Link>
                        <Link
                          href={`/messages?educator=${educator.id}`}
                          className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 bg-white text-primary-600 border-2 border-primary-600 rounded-lg hover:bg-primary-50 text-center text-sm sm:text-base font-semibold transition-all whitespace-nowrap"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          Contacter
                        </Link>
                      </div>
                    </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <TndToggle />
    </div>
  );
}
