'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { EducatorProfile, CertificationType } from '@/types';
import { getCurrentPosition, geocodeAddress, calculateDistance, reverseGeocode } from '@/lib/geolocation';
import Logo from '@/components/Logo';
import MobileMenu from '@/components/MobileMenu';

type EducatorWithDistance = EducatorProfile & { distance?: number };

export default function SearchPage() {
  const [educators, setEducators] = useState<EducatorWithDistance[]>([]);
  const [loading, setLoading] = useState(true);
  const [geolocating, setGeolocating] = useState(false);
  const [userPosition, setUserPosition] = useState<{ latitude: number; longitude: number } | null>(null);
  const [userCity, setUserCity] = useState<string>('');
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
  }, []);

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
        .eq('diploma_verification_status', 'verified') // IMPORTANT: Seuls les diplômes vérifiés
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
          const aIsPremium = (a as any).subscriptions?.some((sub: any) =>
            ['active', 'trialing'].includes(sub.status)
          ) || false;
          const bIsPremium = (b as any).subscriptions?.some((sub: any) =>
            ['active', 'trialing'].includes(sub.status)
          ) || false;

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="hidden md:block">
              <Logo />
            </div>
            <div className="md:hidden">
              <MobileMenu />
            </div>
            <div className="hidden md:flex items-center space-x-1">
              <Link href="/search" className="text-gray-700 hover:text-primary-600 px-4 py-2 rounded-md font-medium transition-colors">
                Trouver un éducateur
              </Link>
              <Link href="/pricing" className="text-gray-700 hover:text-primary-600 px-4 py-2 rounded-md font-medium transition-colors">
                Tarifs
              </Link>
              <Link href="/auth/login" className="text-gray-700 hover:text-primary-600 px-4 py-2 rounded-md font-medium transition-colors">
                Connexion
              </Link>
              <Link href="/auth/signup" className="bg-primary-600 text-white px-5 py-2.5 rounded-md hover:bg-primary-700 font-medium transition-colors shadow-sm">
                Inscription
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-8">
          Trouver un éducateur spécialisé
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-8">
          {/* Filtres */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-4 sm:p-6 lg:sticky lg:top-8">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Filtres</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Localisation
                  </label>
                  <input
                    type="text"
                    placeholder="Ville, région..."
                    value={filters.location}
                    onChange={(e) => setFilters({ ...filters, location: e.target.value, nearMe: false })}
                    disabled={filters.nearMe}
                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                  <button
                    onClick={handleNearMe}
                    disabled={geolocating}
                    className="mt-2 w-full flex items-center justify-center gap-2 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
                    <p className="mt-1 text-xs text-green-600">
                      ✓ Recherche par proximité activée
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Certifications
                  </label>
                  <div className="space-y-2">
                    {(['ABA', 'TEACCH', 'PECS'] as CertificationType[]).map(cert => (
                      <label key={cert} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.certifications.includes(cert)}
                          onChange={() => handleCertificationToggle(cert)}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">{cert}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expérience minimum (années)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={filters.minExperience}
                    onChange={(e) => setFilters({ ...filters, minExperience: e.target.value })}
                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tarif maximum (€/h)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={filters.maxRate}
                    onChange={(e) => setFilters({ ...filters, maxRate: e.target.value })}
                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Note minimum
                  </label>
                  <select
                    value={filters.minRating}
                    onChange={(e) => setFilters({ ...filters, minRating: e.target.value })}
                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Toutes</option>
                    <option value="4">4+ ⭐</option>
                    <option value="3">3+ ⭐</option>
                  </select>
                </div>

                <div className="pt-4 space-y-2">
                  <button
                    onClick={handleSearch}
                    className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Rechercher
                  </button>
                  <button
                    onClick={resetFilters}
                    className="w-full bg-white text-gray-700 py-2 px-4 rounded-md border border-gray-300 hover:bg-gray-50"
                  >
                    Réinitialiser
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Résultats */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Chargement...</p>
              </div>
            ) : educators.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <p className="text-gray-500">Aucun éducateur trouvé avec ces critères.</p>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                  {educators.length} éducateur(s) trouvé(s)
                  {filters.nearMe && ' près de vous (triés par distance)'}
                </p>
                {educators.map((educator) => (
                  <div key={educator.id} className="bg-white rounded-lg shadow p-4 sm:p-6 hover:shadow-lg transition">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                      <div className="flex gap-3 sm:gap-4">
                        {/* Photo de profil */}
                        <div className="flex-shrink-0">
                          {educator.avatar_url ? (
                            <img
                              src={educator.avatar_url}
                              alt={`${educator.first_name} ${educator.last_name}`}
                              className="w-16 h-16 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-primary-200"
                            />
                          ) : (
                            <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-primary-100 flex items-center justify-center border-2 border-primary-200">
                              <svg className="w-8 h-8 sm:w-12 sm:h-12 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                            {((educator as any).subscriptions?.some((sub: any) =>
                              ['active', 'trialing'].includes(sub.status)
                            )) && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white text-xs font-bold rounded-full shadow-md">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                Premium
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

                          <div className="mt-3 sm:mt-4 flex items-center gap-3 sm:gap-6 text-xs sm:text-sm text-gray-600 flex-wrap">
                            {educator.distance !== undefined && (
                              <span className="font-semibold text-green-600">
                                📍 {educator.distance} km
                              </span>
                            )}
                            <span>📅 {educator.years_of_experience} ans</span>
                            {educator.hourly_rate && (
                              <span>💰 {educator.hourly_rate}€/h</span>
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

                      <div className="flex sm:flex-col gap-2 w-full sm:w-auto sm:ml-4">
                        <Link
                          href={`/educator/${educator.id}`}
                          className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 text-center text-sm sm:text-base whitespace-nowrap"
                        >
                          Voir le profil
                        </Link>
                        <Link
                          href={`/messages?educator=${educator.id}`}
                          className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-white text-primary-600 border border-primary-600 rounded-md hover:bg-primary-50 text-center text-sm sm:text-base whitespace-nowrap"
                        >
                          Contacter
                        </Link>
                      </div>
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
