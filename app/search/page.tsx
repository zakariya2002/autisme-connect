'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { EducatorProfile, CertificationType } from '@/types';
import { getCurrentPosition, geocodeAddress, calculateDistance } from '@/lib/geolocation';

type EducatorWithDistance = EducatorProfile & { distance?: number };

export default function SearchPage() {
  const [educators, setEducators] = useState<EducatorWithDistance[]>([]);
  const [loading, setLoading] = useState(true);
  const [geolocating, setGeolocating] = useState(false);
  const [userPosition, setUserPosition] = useState<{ latitude: number; longitude: number } | null>(null);
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
          certifications (*)
        `)
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

        // Trier par distance (les plus proches en premier)
        educatorsWithDistance.sort((a, b) => {
          if (a.distance === undefined) return 1;
          if (b.distance === undefined) return -1;
          return a.distance - b.distance;
        });

        setEducators(educatorsWithDistance as any);
      } else {
        setEducators(filtered as any);
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
    setTimeout(fetchEducators, 100);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Link href="/search" className="text-2xl font-bold text-primary-600">
                Autisme Connect
              </Link>
            </div>
            <div className="flex space-x-4">
              <Link href="/dashboard/family" className="text-gray-700 hover:text-primary-600 px-3 py-2">
                Mon tableau de bord
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Trouver un éducateur spécialisé
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filtres */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Filtres</h2>

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
                        {filters.nearMe ? '📍 Recherche activée' : 'Autour de moi'}
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
              <div className="space-y-4">
                <p className="text-sm text-gray-600 mb-4">
                  {educators.length} éducateur(s) trouvé(s)
                  {filters.nearMe && ' près de vous (triés par distance)'}
                </p>
                {educators.map((educator) => (
                  <div key={educator.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {educator.first_name} {educator.last_name}
                        </h3>
                        <p className="text-gray-600 mt-1">{educator.location}</p>

                        {educator.bio && (
                          <p className="text-gray-700 mt-3 line-clamp-2">{educator.bio}</p>
                        )}

                        <div className="mt-4 flex flex-wrap gap-2">
                          {educator.certifications?.map((cert: any) => (
                            <span
                              key={cert.id}
                              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                            >
                              {cert.type}
                            </span>
                          ))}
                        </div>

                        <div className="mt-4 flex items-center gap-6 text-sm text-gray-600 flex-wrap">
                          {educator.distance !== undefined && (
                            <span className="font-semibold text-green-600">
                              📍 {educator.distance} km
                            </span>
                          )}
                          <span>📅 {educator.years_of_experience} ans d'expérience</span>
                          {educator.hourly_rate && (
                            <span>💰 {educator.hourly_rate}€/h</span>
                          )}
                          {educator.rating > 0 && (
                            <span>⭐ {educator.rating.toFixed(1)} ({educator.total_reviews} avis)</span>
                          )}
                        </div>

                        {educator.specializations && educator.specializations.length > 0 && (
                          <div className="mt-3">
                            <span className="text-sm text-gray-600">
                              Spécialisations: {educator.specializations.join(', ')}
                            </span>
                          </div>
                        )}

                        {educator.languages && educator.languages.length > 0 && (
                          <div className="mt-2">
                            <span className="text-sm text-gray-600">
                              Langues: {educator.languages.join(', ')}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="ml-4 flex flex-col gap-2">
                        <Link
                          href={`/educator/${educator.id}`}
                          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 text-center whitespace-nowrap"
                        >
                          Voir le profil
                        </Link>
                        <Link
                          href={`/messages?educator=${educator.id}`}
                          className="px-4 py-2 bg-white text-primary-600 border border-primary-600 rounded-md hover:bg-primary-50 text-center whitespace-nowrap"
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
