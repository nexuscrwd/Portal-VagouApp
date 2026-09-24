/**
 * Utilitários de Geolocalização e Cálculo de Proximidade (Haversine)
 */

import { ServiceOffer } from '../types';

export interface UserCoordinates {
  lat: number;
  lng: number;
  accuracy?: number;
}

export interface ReadableAddress {
  neighborhood: string;
  city: string;
  state?: string;
  formatted: string;
}

// Coordenadas padrão de fallback (São Paulo / Região Central/Leste onde os salões do mock estão localizados)
export const DEFAULT_USER_COORDS: UserCoordinates = {
  lat: -23.535,
  lng: -46.452,
};

let cachedCoordinates: UserCoordinates | null = null;
const geocodeCache = new Map<string, ReadableAddress>();

/**
 * Converte coordenadas (lat, lng) em endereço legível (Bairro, Cidade) usando Nominatim/OpenStreetMap
 * com cache em memória e sessionStorage.
 */
export async function getAddressFromCoords(
  lat: number,
  lng: number
): Promise<ReadableAddress> {
  const cacheKey = `${lat.toFixed(3)},${lng.toFixed(3)}`;

  // 1. Checa cache em memória
  if (geocodeCache.has(cacheKey)) {
    return geocodeCache.get(cacheKey)!;
  }

  // 2. Checa sessionStorage
  try {
    const saved = sessionStorage.getItem(`vagou_addr_${cacheKey}`);
    if (saved) {
      const parsed = JSON.parse(saved) as ReadableAddress;
      geocodeCache.set(cacheKey, parsed);
      return parsed;
    }
  } catch {}

  // 3. Consulta serviço de Reverse Geocoding (Nominatim OpenStreetMap)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`;
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
      },
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};

      const neighborhood =
        addr.suburb ||
        addr.neighbourhood ||
        addr.quarter ||
        addr.city_district ||
        addr.residential ||
        addr.village ||
        addr.hamlet ||
        '';

      const city =
        addr.city ||
        addr.town ||
        addr.municipality ||
        addr.county ||
        'São Paulo';

      const state = addr.state_code || addr.state || 'SP';

      const formatted = neighborhood
        ? `${neighborhood}, ${city}`
        : `${city}, ${state}`;

      const result: ReadableAddress = {
        neighborhood,
        city,
        state,
        formatted,
      };

      geocodeCache.set(cacheKey, result);
      try {
        sessionStorage.setItem(`vagou_addr_${cacheKey}`, JSON.stringify(result));
      } catch {}

      return result;
    }
  } catch (err) {
    console.warn('[Geolocation] Erro ou timeout na geocodificação reversa:', err);
  }

  // Fallback amigável
  const fallbackResult: ReadableAddress = {
    neighborhood: 'Centro',
    city: 'São Paulo',
    state: 'SP',
    formatted: 'São Paulo, SP',
  };

  geocodeCache.set(cacheKey, fallbackResult);
  return fallbackResult;
}

export const reverseGeocodeCoords = getAddressFromCoords;


/**
 * Fórmula de Haversine para cálculo de distância em metros entre duas coordenadas geográficas
 */
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Raio da Terra em metros
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

/**
 * Formata distância em metros para exibição amigável (ex: '450 m' ou '2.1 km')
 */
export function formatDistanceString(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1).replace('.', ',')} km`;
}

/**
 * Obtém a localização atual do usuário via Geolocation API com cache em memória e sessionStorage
 */
export async function getDeviceCoordinates(): Promise<UserCoordinates | null> {
  // 1. Verificar cache em memória
  if (cachedCoordinates) {
    return cachedCoordinates;
  }

  // 2. Verificar cache em sessionStorage
  try {
    const saved = sessionStorage.getItem('vagou_user_coords');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (typeof parsed.lat === 'number' && typeof parsed.lng === 'number') {
        cachedCoordinates = parsed;
        return parsed;
      }
    }
  } catch {}

  // 3. Consultar Geolocation API
  if (typeof window === 'undefined' || !navigator.geolocation) {
    console.warn('Geolocation API não suportada neste ambiente.');
    return DEFAULT_USER_COORDS;
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords: UserCoordinates = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        };
        cachedCoordinates = coords;
        try {
          sessionStorage.setItem('vagou_user_coords', JSON.stringify(coords));
        } catch {}
        resolve(coords);
      },
      (error) => {
        console.warn('Erro ao obter geolocalização do dispositivo:', error.message);
        // Em caso de negação ou erro, utiliza coordenadas de referência padrão
        resolve(DEFAULT_USER_COORDS);
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 60000,
      }
    );
  });
}

/**
 * Ordena lista de ofertas por proximidade do usuário
 */
export function sortOffersByDistance(
  offers: ServiceOffer[],
  coords: UserCoordinates | null
): ServiceOffer[] {
  const userLat = coords?.lat ?? DEFAULT_USER_COORDS.lat;
  const userLng = coords?.lng ?? DEFAULT_USER_COORDS.lng;

  const withCalculatedDistances = offers.map((offer) => {
    // Se a oferta tiver lat/lng válidos, calcula a distância real
    if (typeof offer.lat === 'number' && typeof offer.lng === 'number') {
      const meters = calculateDistanceMeters(userLat, userLng, offer.lat, offer.lng);
      return {
        ...offer,
        distanceMeters: meters,
        distance: formatDistanceString(meters),
      };
    }
    return offer;
  });

  return [...withCalculatedDistances].sort((a, b) => {
    const distA = a.distanceMeters ?? (parseFloat(a.distance) * 1000 || 99999);
    const distB = b.distanceMeters ?? (parseFloat(b.distance) * 1000 || 99999);
    return distA - distB;
  });
}
