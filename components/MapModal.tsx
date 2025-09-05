// components/MapModal.tsx - Updated for Leaflet
'use client';
import { useState } from 'react';
import { X, MapPin, Navigation } from 'lucide-react';
import LeafletMap from './LeafletMap';
import type { Location } from '@/types/Location';

interface MapModalProps {
  isOpen: boolean;
  onClose: () => void;
  locations: Location[];
  onLocationSelect: (location: Location) => void;
  selectedCategory: string; // <-- Add this line
}

const MapModal: React.FC<MapModalProps> = ({ isOpen, onClose, locations, onLocationSelect, selectedCategory }) => {
  const [selectedMapLocation, setSelectedMapLocation] = useState<Location | null>(null);

  if (!isOpen) return null;

  // Convert your locations to the format expected by LeafletMap
  const convertedLocations: Location[] = locations.map(loc => ({
    id: loc.id,
    name: loc.name,
    category: loc.category,
    image: typeof loc.image === 'string' ? loc.image : loc.image?.url || '',
    description: loc.description ?? '', // <-- Ensure string, never undefined
    tips: loc.tips ?? '',
    hours: loc.hours ?? '',
    rating: loc.rating ?? 0,
    reviews: loc.reviews ?? 0,
    address: loc.address ?? '',
    highlights: loc.highlights ?? [],
    bestTime: loc.bestTime ?? '',
    lat: loc.lat,
    lng: loc.lng,
  }));

  const handleLocationSelect = (location: Location) => {
    setSelectedMapLocation(location);
    onLocationSelect(location);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-7xl h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-purple-600 to-blue-600 text-white">
          <div>
            <h2 className="text-2xl font-bold">Explore Udupi Map</h2>
            <p className="text-purple-100 mt-1">
              {convertedLocations.length} amazing places to discover
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
        <div className="flex flex-1 overflow-hidden">
          {/* Map */}
          <div className="flex-1">
            <LeafletMap 
              locations={convertedLocations}
              selectedLocation={selectedMapLocation}
              onLocationSelect={handleLocationSelect}
              className="w-full h-full"
            />
          </div>

          {/* Sidebar */}
          <div className="w-80 border-l bg-gray-50 overflow-y-auto">
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
                        ? convertedLocations.length 
                        : convertedLocations.filter(loc => loc.category === category).length
                      }
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Location List */}
            <div className="p-4 space-y-3">
              {convertedLocations.map((location) => (
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
                        {location.short_description || location.description}
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