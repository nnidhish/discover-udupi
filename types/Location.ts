export interface Location {
  id: number;
  name: string;
  category: string;
  address: string;
  tips?: string;
  hours?: string;
  rating?: number;
  reviews?: number;
  highlights?: string[];
  bestTime?: string;
  short_description?: string;
  description: string; // <-- always a string
  image?: string | { url?: string };
  lat: number;
  lng: number;
}