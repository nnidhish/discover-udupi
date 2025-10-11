import { LatLngExpression } from 'leaflet';

export interface Location {
  id: number;
  name: string;
  position: LatLngExpression;
  // ... other properties
}

export interface MarkerData {
  element: HTMLElement;
  location: Location;
}