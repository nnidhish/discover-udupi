// components/LeafletMap.tsx - Replace your GoogleMap.tsx with this
'use client';
import { useRef, useState, useEffect } from 'react';
import L, { Map as LeafletMap, Marker } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Layers, ZoomOut } from 'lucide-react';
import type { Location } from '@/types/Location';

interface LeafletMapProps {
  locations: Location[];
  selectedLocation: Location | null;
  onLocationSelect: (location: Location) => void;
  className?: string;
}

export interface CustomMarker extends Marker {
  getElement(): HTMLElement | undefined;
}

declare global {
  interface Window {
    leafletSelectLocation: (locationId: number) => void;
  }
}

// Helper function for category icons
const getCategoryIcon = (category: string): string => {
  const icons: Record<string, string> = {
    temples: '🕉️',
    food: '🍽️',
    beaches: '🏖️',
    photography: '📸',
    shopping: '🛍️',
    culture: '🎭',
  };
  return icons[category] || '📍';
};

const LeafletMapComponent: React.FC<LeafletMapProps> = ({
  locations,
  selectedLocation,
  onLocationSelect,
  className = 'w-full h-full rounded-xl',
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef<CustomMarker[]>([]);
  const timeoutsRef = useRef<number[]>([]);
  const [mapStyle, setMapStyle] = useState<'street' | 'satellite'>('street');
  const [isLoading, setIsLoading] = useState(true);

  // Center map on selected location
  useEffect(() => {
    if (!selectedLocation || !mapInstanceRef.current) return;

    mapInstanceRef.current.setView(
      [selectedLocation.lat, selectedLocation.lng],
      16
    );

    // Recalculate size once centered to prevent tile misalignment on mobile
    setTimeout(() => mapInstanceRef.current?.invalidateSize(), 0);

    // Update marker selection
    markersRef.current.forEach((marker) => {
      const markerElement = marker.getElement();
      if (markerElement) {
        const markerDiv = markerElement.querySelector('.custom-marker');
        if (markerDiv) {
          markerDiv.classList.remove('selected');
        }
      }
    });

    // Highlight selected marker
    const selectedMarker = markersRef.current.find((marker) => {
      const pos = marker.getLatLng();
      return (
        Math.abs(pos.lat - selectedLocation.lat) < 0.001 &&
        Math.abs(pos.lng - selectedLocation.lng) < 0.001
      );
    });

    if (selectedMarker) {
      const markerElement = selectedMarker.getElement();
      if (markerElement) {
        const markerDiv = markerElement.querySelector('.custom-marker');
        if (markerDiv) {
          markerDiv.classList.add('selected');
        }
      }
    }
  }, [selectedLocation?.id]);

  // Initialize map and markers
  useEffect(() => {
    // Recalculate on resize/orientation change for proper tile alignment on mobile
    const handleResize = () => {
      requestAnimationFrame(() => {
        safeInvalidate();
      });
    };

    let resizeObserver: ResizeObserver | null = null;

    const safeInvalidate = () => {
      const m = mapInstanceRef.current;
      if (!m) return;
      const container: HTMLElement = m.getContainer();
      if (!container || !container.isConnected) return;
      try {
        m.invalidateSize();
      } catch {
        // no-op
      }
    };

    const initializeMap = async () => {
      if (typeof window === 'undefined' || !mapRef.current) return;

      setIsLoading(true);

      try {
        // Dynamically import Leaflet to avoid SSR issues
        const L = (await import('leaflet')).default;

        // Fix default marker icons issue
        delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl:
            'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
          iconUrl:
            'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
          shadowUrl:
            'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        });

        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
        }

        // Initialize map centered on Udupi
        const map = L.map(mapRef.current, {
          zoomControl: false, // We'll add custom controls
        }).setView([13.3409, 74.7421], 13);

        // Add tile layers
        const streetLayer = L.tileLayer(
          'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          {
            attribution:
              '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19,
          }
        );

        const satelliteLayer = L.tileLayer(
          'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          {
            attribution:
              'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
            maxZoom: 19,
          }
        );

        // Add default layer
        if (mapStyle === 'street') {
          streetLayer.addTo(map);
        } else {
          satelliteLayer.addTo(map);
        }

        mapInstanceRef.current = map;

        // Ensure proper sizing after modal open
        timeoutsRef.current.push(window.setTimeout(() => {
          safeInvalidate();
        }, 0));

        // Recalculate on resize/orientation change
        window.addEventListener('resize', handleResize);
        window.addEventListener('orientationchange', handleResize);

        // Observe container size changes to keep tiles aligned on mobile
        if (mapRef.current && 'ResizeObserver' in window) {
          resizeObserver = new ResizeObserver(() => {
            requestAnimationFrame(() => {
              safeInvalidate();
            });
          });
          resizeObserver.observe(mapRef.current);
        }

        // Additional delayed invalidation for mobile browsers after layout settles
        timeoutsRef.current.push(window.setTimeout(() => {
          safeInvalidate();
        }, 300));

        // Clear existing markers
        markersRef.current.forEach((marker) => marker.remove());
        markersRef.current = [];

        // Add custom CSS for markers
        if (!document.getElementById('leaflet-custom-styles')) {
          const style = document.createElement('style');
          style.id = 'leaflet-custom-styles';
          style.textContent = `
            .custom-marker {
              background: white;
              border-radius: 50%;
              width: 40px;
              height: 40px;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 4px 12px rgba(0,0,0,0.15);
              border: 3px solid white;
              cursor: pointer;
              transition: all 0.2s ease;
              font-size: 16px;
            }

            .custom-marker:hover {
              transform: scale(1.1);
              box-shadow: 0 6px 16px rgba(0,0,0,0.2);
            }

            .custom-marker.temples { border-color: #FF6B6B; }
            .custom-marker.food { border-color: #4ECDC4; }
            .custom-marker.beaches { border-color: #45B7D1; }
            .custom-marker.photography { border-color: #96CEB4; }
            .custom-marker.shopping { border-color: #FCEA2B; }
            .custom-marker.culture { border-color: #FF9F43; }

            .custom-marker.selected {
              transform: scale(1.2);
              border-width: 4px;
              z-index: 1000;
            }

            .custom-popup {
              min-width: 250px;
              max-width: 300px;
            }

            .custom-popup .popup-image {
              width: 100%;
              height: 120px;
              object-fit: cover;
              border-radius: 8px;
              margin-bottom: 12px;
            }

            .custom-popup .popup-title {
              font-weight: 600;
              font-size: 16px;
              margin-bottom: 8px;
              color: #1a202c;
            }

            .custom-popup .popup-description {
              font-size: 14px;
              color: #4a5568;
              margin-bottom: 12px;
              line-height: 1.4;
            }

            .custom-popup .popup-rating {
              display: flex;
              align-items: center;
              gap: 4px;
              margin-bottom: 12px;
              font-size: 14px;
            }

            .custom-popup .popup-button {
              background: #667eea;
              color: white;
              border: none;
              padding: 8px 16px;
              border-radius: 6px;
              font-size: 14px;
              cursor: pointer;
              width: 100%;
              transition: background-color 0.2s;
            }

            .custom-popup .popup-button:hover {
              background: #5a67d8;
            }

            .leaflet-popup-content-wrapper {
              border-radius: 12px;
              padding: 0;
            }

            .leaflet-popup-content {
              margin: 16px;
            }
          `;
          document.head.appendChild(style);
        }

        // Add location markers
        locations.forEach((location) => {
          const customIcon = L.divIcon({
            html: `<div class="custom-marker ${location.category} ${
              selectedLocation?.id === location.id ? 'selected' : ''
            }">
              ${getCategoryIcon(location.category)}
            </div>`,
            className: 'custom-div-icon',
            iconSize: [40, 40],
            iconAnchor: [20, 40],
          });

          const marker = L.marker([location.lat, location.lng], { 
            icon: customIcon 
          }) as CustomMarker;

          // Create rich popup content
          const imageUrl = typeof location.image === 'string' 
            ? location.image 
            : location.image?.url || '';
          
          const popupContent = `
            <div class="custom-popup">
              ${
                imageUrl
                  ? `<img src="${imageUrl}" alt="${location.name}" class="popup-image" />`
                  : ''
              }
              <div class="popup-title">${location.name}</div>
              <div class="popup-description">${location.description}</div>
              ${
                location.rating
                  ? `
                <div class="popup-rating">
                  <span style="color: #fbbf24;">★</span>
                  <span>${location.rating}</span>
                </div>
              `
                  : ''
              }
              <button
                onclick="window.leafletSelectLocation(${location.id})"
                class="popup-button"
              >
                View Full Details
              </button>
            </div>
          `;

          marker.bindPopup(popupContent, {
            maxWidth: 300,
            className: 'custom-popup-wrapper',
          });

          marker.addTo(map);
          markersRef.current.push(marker);

          // Click handler for marker
          marker.on('click', () => {
            onLocationSelect(location);
          });
        });

        // Global function for popup buttons
        (window as Window & typeof globalThis).leafletSelectLocation = (
          locationId: number
        ) => {
          const location = locations.find((loc) => loc.id === locationId);
          if (location) {
            onLocationSelect(location);
          }
        };
      } catch (error) {
        console.error('Error initializing map:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeMap();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      timeoutsRef.current.forEach(clearTimeout);
    };
  }, [locations, mapStyle, selectedLocation, onLocationSelect]);

  const toggleMapStyle = () => {
    const newStyle = mapStyle === 'street' ? 'satellite' : 'street';
    setMapStyle(newStyle);

    if (mapInstanceRef.current) {
      // Remove existing layers
      mapInstanceRef.current.eachLayer((layer) => {
        if (layer instanceof L.TileLayer) {
          mapInstanceRef.current?.removeLayer(layer);
        }
      });

      // Add new layer
      if (newStyle === 'street') {
        L.tileLayer(
          'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          {
            attribution:
              '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19,
          }
        ).addTo(mapInstanceRef.current);
      } else {
        L.tileLayer(
          'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          {
            attribution:
              'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
            maxZoom: 19,
          }
        ).addTo(mapInstanceRef.current);
      }
    }
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <span className="loader"></span>
      </div>
    );
  }

  return (
    <div ref={mapRef} className={className} id="map">
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={toggleMapStyle}
          className="bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-all duration-300"
          aria-label="Toggle map style"
        >
          {mapStyle === 'street' ? (
            <Layers className="w-5 h-5 text-gray-800" />
          ) : (
            <ZoomOut className="w-5 h-5 text-gray-800" />
          )}
        </button>
      </div>
    </div>
  );
};

export default LeafletMapComponent;