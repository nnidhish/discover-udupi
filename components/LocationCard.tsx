'use client';

import { X, Navigation } from 'lucide-react';
import Image from 'next/image';
import { Location } from '@/types/Location';
import { shimmer, toBase64 } from '@/utils/image';

interface LocationCardProps {
  location: Location;
  onClose: () => void;
  onFavorite: (id: number) => void;
  isFavorite: boolean;
}

// Remove onSelect from props destructuring
const LocationCard: React.FC<LocationCardProps> = ({ 
  location, 
  onClose,
  onFavorite,
  isFavorite 
}) => {
  const handleGetDirections = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}`;
    window.open(url, '_blank');
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden relative">
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto max-h-[85vh]">
        <div className="relative h-72 w-full">
          <Image 
            src={typeof location.image === 'string' ? location.image : location.image?.url || ''}
            alt={location.name}
            fill
            className="object-cover"
            placeholder="blur"
            blurDataURL={location.blurDataURL || `data:image/svg+xml;base64,${toBase64(shimmer(800, 600))}`}
            priority
          />
        </div>

        <div className="p-6">
          <h2 className="text-2xl font-bold mb-2">{location.name}</h2>
          <p className="text-gray-600 mb-4">{location.description}</p>
          
          {/* Location details */}
          <div className="space-y-4 mb-6">
            {/* Add your location details here */}
          </div>
        </div>
      </div>

      {/* Fixed Footer */}
      <div className="sticky bottom-0 left-0 right-0 p-4 bg-white border-t flex items-center gap-3">
        <button
          onClick={handleGetDirections}
          className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 rounded-2xl 
            font-semibold hover:from-purple-700 hover:to-blue-700 transition-all flex items-center 
            justify-center gap-2 active:scale-[0.99]"
        >
          <Navigation className="w-5 h-5" />
          Get Directions
        </button>

        <button 
          onClick={() => onFavorite(location.id)}
          className="p-4 border-2 border-purple-600 text-purple-600 rounded-2xl 
            hover:bg-purple-50 transition-colors"
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <svg 
            className={`w-6 h-6 ${isFavorite ? 'fill-current' : ''}`}
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </button>

        <button
          onClick={onClose}
          className="p-4 border-2 border-gray-200 text-gray-600 rounded-2xl 
            hover:bg-gray-50 transition-colors"
          aria-label="Close details"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default LocationCard;