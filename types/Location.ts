export interface Coordinates {
  lat: number;
  lng: number;
}

export interface DirectionsParams extends Coordinates {
  name: string;
}

export interface Location {
  id: number;
  name: string;
  category: string;
  image: string | { url: string; blurDataURL?: string };
  description: string;
  tips: string;
  hours: string;
  rating: number;
  reviews: number;
  address: string;
  highlights: string[];
  bestTime: string;
  lat: number;
  lng: number;
  blurDataURL?: string;
}