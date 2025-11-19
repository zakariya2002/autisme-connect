'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const router = useRouter();
  const [educators, setEducators] = useState<any[]>([]);
  const [filteredEducators, setFilteredEducators] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);

  useEffect(() => {
    fetchEducators();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredEducators(educators);
    } else {
      const filtered = educators.filter((educator) => {
        const searchLower = searchTerm.toLowerCase();
        return (
          educator.first_name?.toLowerCase().includes(searchLower) ||
          educator.last_name?.toLowerCase().includes(searchLower) ||
          educator.location?.toLowerCase().includes(searchLower) ||
          educator.specialties?.toLowerCase().includes(searchLower) ||
          educator.certifications?.toLowerCase().includes(searchLower)
        );
      });
      setFilteredEducators(filtered);
    }
  }, [searchTerm, educators]);

  const fetchEducators = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('educator_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setEducators(data || []);
      setFilteredEducators(data || []);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const capitalizeFirstName = (name: string) => {
    if (!name) return '';
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  };

  const formatLastName = (name: string) => {
    if (!name) return '';
    return name.toUpperCase();
  };

  // Calcul de la distance entre deux points GPS (formule de Haversine)
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371; // Rayon de la Terre en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance en km
  };

  // Obtenir la position de l'utilisateur
  const getUserLocation = () => {
    setLocationLoading(true);
    if (!navigator.geolocation) {
      alert('La géolocalisation n\'est pas supportée par votre navigateur');
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });

        // Trier les éducateurs par distance
        const educatorsWithDistance = educators.map((educator) => {
          if (educator.latitude && educator.longitude) {
            const distance = calculateDistance(
              latitude,
              longitude,
              educator.latitude,
              educator.longitude
            );
            return { ...educator, distance };
          }
          return { ...educator, distance: Infinity };
        });

        const sorted = educatorsWithDistance.sort((a, b) => a.distance - b.distance);
        setFilteredEducators(sorted);
        setLocationLoading(false);
      },
      (error) => {
        console.error('Erreur de géolocalisation:', error);
        alert('Impossible d\'obtenir votre position. Veuillez autoriser l\'accès à votre localisation.');
        setLocationLoading(false);
      }
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary-600">Autisme Connect</h1>
            </div>
            <div className="flex space-x-4">
              <Link href="/auth/login" className="text-gray-700 hover:text-primary-600 px-3 py-2">
                Connexion
              </Link>
              <Link href="/auth/signup" className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700">
                Inscription
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section avec recherche */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Trouvez le bon éducateur{' '}
            <span className="text-primary-600">près de chez vous</span>
          </h2>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Découvrez les profils des éducateurs qualifiés en ABA, TEACCH, PECS et autres approches spécialisées.
          </p>
        </div>

        {/* Barre de recherche */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher par nom, localisation, spécialités..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500"
            />
            <svg
              className="absolute left-4 top-3.5 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Bouton Utiliser ma position */}
        <div className="max-w-2xl mx-auto mb-12 text-center">
          <button
            onClick={getUserLocation}
            disabled={locationLoading}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {locationLoading ? 'Localisation en cours...' : userLocation ? 'Actualiser ma position' : 'Utiliser ma position'}
          </button>
          {userLocation && (
            <p className="mt-2 text-sm text-green-600">
              ✓ Position activée - Éducateurs triés par proximité
            </p>
          )}
        </div>

        {/* Liste des éducateurs */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Chargement des éducateurs...</p>
          </div>
        ) : filteredEducators.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Aucun éducateur trouvé</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {filteredEducators.map((educator) => (
              <div
                key={educator.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden cursor-pointer"
                onClick={() => router.push(`/educator/${educator.id}`)}
              >
                <div className="p-6">
                  {/* Badge de distance si géolocalisation activée */}
                  {userLocation && educator.distance !== undefined && educator.distance !== Infinity && (
                    <div className="mb-3">
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                        {educator.distance < 1
                          ? `${Math.round(educator.distance * 1000)} m`
                          : `${educator.distance.toFixed(1)} km`}
                      </span>
                    </div>
                  )}

                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {educator.first_name?.trim() && (
                      <span className="text-primary-600">
                        {capitalizeFirstName(educator.first_name)}{' '}
                      </span>
                    )}
                    <span className="text-gray-900">
                      {formatLastName(educator.last_name)}
                    </span>
                  </h3>
                  <p className="text-gray-600 mb-4">{educator.location || 'Localisation non renseignée'}</p>
                  {educator.specialties && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700">Spécialités :</p>
                      <p className="text-sm text-gray-600">{educator.specialties}</p>
                    </div>
                  )}
                  {educator.certifications && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700">Certifications :</p>
                      <p className="text-sm text-gray-600">{educator.certifications}</p>
                    </div>
                  )}
                  <Link
                    href={`/educator/${educator.id}`}
                    className="inline-block mt-4 text-primary-600 hover:text-primary-700 font-medium"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Voir le profil →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Features Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="flex justify-center">
                <div className="bg-primary-100 rounded-full p-4">
                  <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Recherche avancée</h3>
              <p className="mt-2 text-gray-500">Filtrez par certifications, expérience, localisation et disponibilités</p>
            </div>

            <div className="text-center">
              <div className="flex justify-center">
                <div className="bg-primary-100 rounded-full p-4">
                  <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Messagerie sécurisée</h3>
              <p className="mt-2 text-gray-500">Communiquez directement avec les éducateurs en toute sécurité</p>
            </div>

            <div className="text-center">
              <div className="flex justify-center">
                <div className="bg-primary-100 rounded-full p-4">
                  <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Réservation facile</h3>
              <p className="mt-2 text-gray-500">Planifiez vos séances directement sur la plateforme</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-gray-400">© 2024 Autisme Connect. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}
