import { DirectionsParams } from '../types/Location';

type Latitude = number & { _brand: 'Latitude' };
type Longitude = number & { _brand: 'Longitude' };

const assertLatitude = (n: number): Latitude => {
  if (!isFinite(n) || n < -90 || n > 90) {
    throw new Error('Invalid latitude');
  }
  return n as Latitude;
};

const assertLongitude = (n: number): Longitude => {
  if (!isFinite(n) || n < -180 || n > 180) {
    throw new Error('Invalid longitude');
  }
  return n as Longitude;
};

export const getDirectionsUrl = ({ lat, lng, name }: DirectionsParams): string => {
  // Validate coordinates
  if (!isFinite(lat) || !isFinite(lng)) {
    throw new Error('Invalid coordinates provided');
  }

  if (lat < -90 || lat > 90) {
    throw new Error('Latitude must be between -90 and 90 degrees');
  }

  if (lng < -180 || lng > 180) {
    throw new Error('Longitude must be between -180 and 180 degrees');
  }

  const encodedName = encodeURIComponent(name);
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_name=${encodedName}`;
};

export { assertLatitude, assertLongitude };