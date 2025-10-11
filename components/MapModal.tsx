// components/MapModal.tsx - Updated for Leaflet
'use client';
import { X, Navigation } from 'lucide-react';
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import type { Location } from '@/types/Location';

// Fix Leaflet icon issue
interface IconDefault extends L.Icon.Default {
  _getIconUrl?: string;
}

delete (L.Icon.Default.prototype as IconDefault)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/images/marker-icon-2x.png',
  iconUrl: '/images/marker-icon.png',
  shadowUrl: '/images/marker-shadow.png',
});

// MapBounds component to handle map fitting
function MapBounds({ locations }: { locations: Location[] }) {
  const map = useMap();
  
  useEffect(() => {
    if (locations.length > 0) {
      const bounds = L.latLngBounds(locations.map(loc => [loc.lat, loc.lng]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [map, locations]);

  return null;
}

interface MapModalProps {
  isOpen: boolean;
  onClose: () => void;
  locations: Location[];
  onLocationSelect: (location: Location) => void;
  selectedCategory: string;
}

const MapModal: React.FC<MapModalProps> = ({ 
  isOpen, 
  onClose, 
  locations, 
  onLocationSelect, 
  selectedCategory 
}) => {
  const [selectedMapLocation, setSelectedMapLocation] = useState<Location | null>(null);

  const handleLocationSelect = (location: Location) => {
    setSelectedMapLocation(location);
    onLocationSelect(location);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute inset-4 md:inset-10 bg-white rounded-3xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-purple-600 to-blue-600 text-white">
          <div>
            <h2 className="text-2xl font-bold">Explore Udupi Map</h2>
            <p className="text-purple-100 mt-1">
              {locations.length} amazing places to discover
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Map and sidebar container */}
        <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
          {/* Map */}
          <div className="flex-1 relative min-h-[50vh] md:min-h-0">
            <MapContainer
              center={[13.3409, 74.7421]}
              zoom={13}
              className="w-full h-full"
              style={{ height: '100%', minHeight: '400px' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapBounds locations={locations} />
              {locations.map((location) => (
                <Marker
                  key={location.id}
                  position={[location.lat, location.lng]}
                  eventHandlers={{
                    click: () => handleLocationSelect(location),
                  }}
                >
                  <Popup>
                    <div className="p-2">
                      <h3 className="font-semibold">{location.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {location.description.substring(0, 100)}...
                      </p>
                      <button
                        onClick={() => handleLocationSelect(location)}
                        className="mt-2 text-sm text-purple-600 hover:text-purple-800 font-semibold"
                      >
                        View Details
                      </button>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          {/* Sidebar */}
          <div className="w-full md:w-80 md:border-l border-t md:border-t-0 bg-gray-50 overflow-y-auto">
            {/* Search/Filter */}
            <div className="p-4 bg-white border-b">
              <h3 className="font-semibold text-gray-900 mb-3">Locations</h3>
              <div className="space-y-2">
                {['all', 'temples', 'food', 'beaches', 'photography'].map((category) => (
                  <button
                    key={category}
                    className="block w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-purple-100 hover:text-purple-700 transition-colors capitalize"
                  >
                    {category === 'all' ? 'All Categories' : category}
                    <span className="float-right text-gray-500">
                      {category === 'all' 
                        ? locations.length 
                        : locations.filter(loc => loc.category === category).length
                      }
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Location List */}
            <div className="p-4 space-y-3">
              {locations.map((location) => (
                <div
                  key={location.id}
                  className={`p-3 bg-white rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                    selectedMapLocation?.id === location.id 
                      ? 'ring-2 ring-purple-500 border-purple-500' 
                      : 'hover:border-purple-300'
                  }`}
                  onClick={() => handleLocationSelect(location)}
                >
                  <div className="flex items-start gap-3">
                    {/* Category icon */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${getCategoryBg(location.category)}`}>
                      {getCategoryIcon(location.category)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">
                        {location.name}
                      </h4>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {location.description}
                      </p>
                      
                      {/* Rating */}
                      {location.rating && (
                        <div className="flex items-center gap-1 mt-2">
                          <span className="text-yellow-500 text-sm">★</span>
                          <span className="text-xs text-gray-600">
                            {location.rating}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Click on any marker or location to view details
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Close
            </button>
            {selectedMapLocation && (
              <button
                onClick={() => {
                  onLocationSelect(selectedMapLocation);
                  onClose();
                }}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                <Navigation className="w-4 h-4" />
                View Details
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper functions
const getLocationCoordinates = (name: string) => {
  const coordinates: { [key: string]: { lat: number; lng: number } } = {
    'Sri Krishna Temple': { lat: 13.3409, lng: 74.7421 },
    'Malpe Beach': { lat: 13.3496, lng: 74.7014 },
    'Woodlands Restaurant': { lat: 13.3378, lng: 74.7419 },
    'Kudlu Falls': { lat: 13.2500, lng: 74.8000 },
    "St. Mary's Island": { lat: 13.3628, lng: 74.6814 },
    'Anantheshwar Temple': { lat: 13.3200, lng: 74.7300 },
    'Diana Restaurant': { lat: 13.3385, lng: 74.7425 },
    'Krishna Mutt': { lat: 13.3405, lng: 74.7418 },
    'Kaup Beach': { lat: 13.2333, lng: 74.7500 },
    'Manipal Lake': { lat: 13.3478, lng: 74.7869 }
  };
  return coordinates[name] || { lat: 13.3409, lng: 74.7421 };
};

const getCategoryIcon = (category: string) => {
  const icons = {
    temples: '🕉️',
    food: '🍽️',
    beaches: '🏖️',
    photography: '📸',
    shopping: '🛍️',
    culture: '🎭'
  };
  return icons[category as keyof typeof icons] || '📍';
};

const getCategoryBg = (category: string) => {
  const backgrounds = {
    temples: 'bg-red-100',
    food: 'bg-teal-100',
    beaches: 'bg-blue-100',
    photography: 'bg-green-100',
    shopping: 'bg-yellow-100',
    culture: 'bg-orange-100'
  };
  return backgrounds[category as keyof typeof backgrounds] || 'bg-gray-100';
};

export default MapModal;