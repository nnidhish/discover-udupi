'use client';

import { X, Navigation, Heart } from 'lucide-react';
import Image from 'next/image';
import { Location } from '@/types/Location';
import { shimmer, toBase64 } from '@/utils/image';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface LocationCardProps {
  location: Location;
  onClose: () => void;
  onFavorite: (id: number) => void;
  isFavorite: boolean;
}

const LocationCard: React.FC<LocationCardProps> = ({
  location,
  onClose,
  onFavorite,
  isFavorite,
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
        </div>
      </div>

      {/* Fixed Footer */}
      <div className="sticky bottom-0 left-0 right-0 p-4 bg-white border-t flex items-center gap-3">
        <Button
          onClick={handleGetDirections}
          className="flex-1 rounded-2xl h-14 gap-2 text-base font-semibold"
        >
          <Navigation className="w-5 h-5" />
          Get Directions
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={() => onFavorite(location.id)}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          className={cn(
            'rounded-2xl w-14 h-14 border-2',
            isFavorite
              ? 'border-red-400 text-red-500 hover:bg-red-50'
              : 'border-border text-muted-foreground hover:border-primary hover:text-primary',
          )}
        >
          <Heart className={cn('w-5 h-5', isFavorite && 'fill-current')} />
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={onClose}
          aria-label="Close details"
          className="rounded-2xl w-14 h-14 border-2"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};

export default LocationCard;
