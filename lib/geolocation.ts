// Fonction pour calculer la distance entre deux coordonnées géographiques
// Utilise la formule de Haversine
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Rayon de la Terre en km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 10) / 10; // Arrondi à 1 décimale
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

// Obtenir la position actuelle de l'utilisateur
export async function getCurrentPosition(): Promise<{
  latitude: number;
  longitude: number;
}> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('La géolocalisation n\'est pas supportée par votre navigateur'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        let message = 'Erreur de géolocalisation';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Vous avez refusé l\'accès à votre position';
            break;
          case error.POSITION_UNAVAILABLE:
            message = 'Impossible de déterminer votre position';
            break;
          case error.TIMEOUT:
            message = 'La demande de géolocalisation a expiré';
            break;
        }
        reject(new Error(message));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
}

// Géocoder une adresse (convertir une adresse en coordonnées)
// Utilise l'API Nominatim d'OpenStreetMap (gratuite)
export async function geocodeAddress(address: string): Promise<{
  latitude: number;
  longitude: number;
} | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
      {
        headers: {
          'User-Agent': 'AutismeConnect/1.0',
        },
      }
    );

    const data = await response.json();

    if (data && data.length > 0) {
      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon),
      };
    }

    return null;
  } catch (error) {
    console.error('Erreur de géocodage:', error);
    return null;
  }
}

// Géocodage inversé (convertir des coordonnées en adresse)
// Utilise l'API Nominatim d'OpenStreetMap (gratuite)
export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<string | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
      {
        headers: {
          'User-Agent': 'AutismeConnect/1.0',
        },
      }
    );

    const data = await response.json();

    if (data && data.address) {
      // Construire une adresse lisible
      const parts = [];

      if (data.address.city || data.address.town || data.address.village) {
        parts.push(data.address.city || data.address.town || data.address.village);
      }

      if (data.address.country) {
        parts.push(data.address.country);
      }

      return parts.join(', ') || data.display_name;
    }

    return null;
  } catch (error) {
    console.error('Erreur de géocodage inversé:', error);
    return null;
  }
}
