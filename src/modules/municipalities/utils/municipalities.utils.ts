import { Municipality } from '../types/municipalities.types';

/**
 * Search municipalities by name or postal code
 */
export function searchMunicipalities(municipalities: Municipality[], query: string): Municipality[] {
  if (!query.trim()) return municipalities;

  const lowerQuery = query.toLowerCase();
  return municipalities.filter(municipality =>
    municipality.name.toLowerCase().includes(lowerQuery) ||
    (municipality.postalCode && municipality.postalCode.toLowerCase().includes(lowerQuery))
  );
}

/**
 * Get municipality display name with postal code
 */
export function getMunicipalityDisplayName(municipality: Municipality): string {
  if (municipality.postalCode) {
    return `${municipality.name} (${municipality.postalCode})`;
  }
  return municipality.name;
}

/**
 * Calculate distance between two municipalities (if coordinates are available)
 */
export function calculateDistance(
  municipality1: Municipality,
  municipality2: Municipality
): number | null {
  if (
    !municipality1.latitude ||
    !municipality1.longitude ||
    !municipality2.latitude ||
    !municipality2.longitude
  ) {
    return null;
  }

  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(municipality2.latitude - municipality1.latitude);
  const dLon = toRadians(municipality2.longitude - municipality1.longitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(municipality1.latitude)) *
      Math.cos(toRadians(municipality2.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}