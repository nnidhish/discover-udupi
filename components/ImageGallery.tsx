// components/ImageGallery.tsx
'use client';
import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, X, ZoomIn, Download, Share } from 'lucide-react';
import Image from 'next/image';

interface GalleryImage {
  id: string;
  url: string;
  alt: string;
  caption?: string;
  photographer?: string;
  takenAt?: string;
}

interface ImageGalleryProps {
  images: GalleryImage[];
  locationName: string;
  isOpen: boolean;
  onClose: () => void;
  initialIndex?: number;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ 
  images, 
  locationName, 
  isOpen, 
  onClose, 
  initialIndex = 0 
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
    setIsZoomed(false);
  }, [images.length]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    setIsZoomed(false);
  }, [images.length]);

  const downloadImage = async () => {
    const image = images[currentIndex];
    try {
      const response = await fetch(image.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${locationName}-${image.id}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const shareImage = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${locationName} - ${images[currentIndex].alt}`,
          text: `Check out this beautiful photo of ${locationName}!`,
          url: window.location.href
        });
      } catch (error) {
        console.log('Share failed:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') goToNext();
      if (e.key === 'ArrowLeft') goToPrevious();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, goToNext, goToPrevious]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/70 to-transparent p-6 z-10">
        <div className="flex justify-between items-center text-white">
          <div>
            <h2 className="text-2xl font-bold">{locationName}</h2>
            <p className="text-sm opacity-80">
              {currentIndex + 1} of {images.length}
              {images[currentIndex].photographer && 
                ` • Photo by ${images[currentIndex].photographer}`
              }
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsZoomed(!isZoomed)}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <ZoomIn className="w-6 h-6" />
            </button>
            <button
              onClick={downloadImage}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <Download className="w-6 h-6" />
            </button>
            <button
              onClick={shareImage}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <Share className="w-6 h-6" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Image */}
      <div className="relative w-full h-full flex items-center justify-center">
        <div className={`relative transition-all duration-300 ${
          isZoomed ? 'scale-150' : 'scale-100'
        }`}>
          <Image
            src={images[currentIndex].url}
            alt={images[currentIndex].alt}
            width={1200}
            height={800}
            className="max-w-[90vw] max-h-[90vh] object-contain"
            priority
          />
        </div>
      </div>

      {/* Navigation */}
      <button
        onClick={goToPrevious}
        className="absolute left-6 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/30 transition-colors"
        disabled={images.length <= 1}
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={goToNext}
        className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/30 transition-colors"
        disabled={images.length <= 1}
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Bottom Thumbnails */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-black/50 backdrop-blur-sm rounded-full p-4">
        <div className="flex space-x-2">
          {images.map((image, index) => (
            <button
              key={image.id}
              onClick={() => setCurrentIndex(index)}
              className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                index === currentIndex 
                  ? 'border-white scale-110' 
                  : 'border-transparent hover:border-white/50'
              }`}
            >
              <Image
                src={image.url}
                alt={image.alt}
                width={64}
                height={64}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Caption */}
      {images[currentIndex].caption && (
        <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 bg-black/70 backdrop-blur-sm text-white px-6 py-3 rounded-full max-w-md text-center">
          <p className="text-sm">{images[currentIndex].caption}</p>
        </div>
      )}
    </div>
  );
};

// components/PhotoGrid.tsx - For location detail view
interface PhotoGridProps {
  images: GalleryImage[];
  locationName: string;
  onImageClick: (index: number) => void;
}

const PhotoGrid: React.FC<PhotoGridProps> = ({ images, locationName, onImageClick }) => {
  const displayImages = images.slice(0, 6); // Show max 6 images in grid

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 rounded-xl overflow-hidden">
      {displayImages.map((image, index) => (
        <div
          key={image.id}
          className="relative cursor-pointer group"
          onClick={() => onImageClick(index)}
        >
          <Image
            src={image.url}
            alt={image.alt}
            width={300}
            height={200}
            className="w-full h-32 md:h-40 object-cover group-hover:scale-110 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center" aria-label={`Open photo from ${locationName}`}>
          <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          {index === displayImages.length - 1 && images.length > 6 && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
              <span className="text-white font-bold text-lg">+{images.length - 6}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ImageGallery;
export { PhotoGrid };