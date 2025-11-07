'use client';
import { locations as rawLocations, categories } from '@/data/locations';
import React, { useState, useEffect } from 'react';
import { MapPin, Clock, Star, Heart, Share, Navigation, X } from 'lucide-react';
import dynamic from 'next/dynamic';
import { Location as BaseLocation } from '@/types/Location';
import { shimmer, toBase64 } from '@/utils/image';
import { Search, Filter } from 'lucide-react';
import Image from 'next/image';

// Extend Location type to ensure image can be string or { url: string; blurDataURL?: string }
type Location = Omit<BaseLocation, 'image'> & {
  image: string | { url: string; blurDataURL?: string };
  blurDataURL?: string;
};
import ImageGallery, { PhotoGrid } from '@/components/ImageGallery';
import ReviewSystem from '@/components/ReviewSystem';
import { useAuth } from '@/hooks/useAuth';
import { reviewService, locationService } from '@/lib/supabase';
import toast, { Toaster } from 'react-hot-toast';
import { getDirectionsUrl } from '@/utils/maps';

// Types for reviews
export type ReviewItem = {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  rating: number;
  title: string;
  comment: string;
  images?: string[];
  createdAt: string;
  helpfulCount: number;
  isVerified: boolean;
  visitDate?: string;
};

export type ReviewDraft = {
  rating: number;
  title?: string;
  comment: string;
  visitDate?: string;
  images?: string[];
};

type SupabaseReviewRow = {
  id: string;
  user_id: string;
  rating: number;
  title: string | null;
  comment: string;
  visit_date: string | null;
  helpful_count: number | null;
  created_at: string;
  profiles?: { full_name?: string | null; avatar_url?: string | null; is_verified?: boolean | null } | null;
  review_images?: { url: string }[] | null;
};

// Dynamically import MapModal with ssr: false to prevent window errors on the server
const MapModal = dynamic(
  () => import('@/components/MapModal'),
  { 
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading map...</p>
        </div>
      </div>
    )
  }
);

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showMapModal, setShowMapModal] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);

  const { user, profile, isAuthenticated, signInWithGoogle, signOut, loading: authLoading } = useAuth();

  // Your existing locations data
  const locations: Location[] = rawLocations as Location[];

  // Filter locations based on category and search
  const filteredLocations = locations.filter(location => {
    const matchesCategory = selectedCategory === 'all' || location.category === selectedCategory;
    const matchesSearch = location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         location.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });


  const showMap = () => {
    setShowMapModal(true);
  };

  
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Build gallery images for selected location
  type GalleryImageItem = { id: string; url: string; alt: string; caption?: string; photographer?: string; takenAt?: string };

  const currentGalleryImages: GalleryImageItem[] = React.useMemo(() => {
    if (!selectedLocation) return [];
    const primaryUrl = typeof selectedLocation.image === 'string' ? selectedLocation.image : selectedLocation.image?.url || '';
    const extras = [
      `https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&h=800&fit=crop&auto=format&q=75&sig=${selectedLocation.id}`,
      `https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&h=800&fit=crop&auto=format&q=75&sig=${selectedLocation.id + 1}`
    ];
    const images = [primaryUrl, ...extras].filter(Boolean);
    return images.map((url, idx) => ({
      id: `${selectedLocation.id}-${idx}`,
      url,
      alt: `${selectedLocation.name} photo ${idx + 1}`,
    }));
  }, [selectedLocation]);

  // Fetch reviews when a location is selected
  useEffect(() => {
    if (!selectedLocation) { setReviews([]); return; }
    (async () => {
      const { data, error } = await reviewService.getLocationReviews(String(selectedLocation.id), 10, 0);
      if (error) { setReviews([]); return; }
      const rows = (data ?? []) as SupabaseReviewRow[];
      const mapped: ReviewItem[] = rows.map((r) => ({
        id: r.id,
        userId: r.user_id,
        userName: r.profiles?.full_name || 'Explorer',
        userAvatar: r.profiles?.avatar_url || '/icon-192x192.png',
        rating: r.rating,
        title: r.title ?? '',
        comment: r.comment,
        images: (r.review_images ?? []).map((ri) => ri.url),
        createdAt: r.created_at,
        helpfulCount: r.helpful_count ?? 0,
        isVerified: r.profiles?.is_verified ?? false,
        visitDate: r.visit_date ?? undefined,
      }));
      setReviews(mapped);
    })();
  }, [selectedLocation]);

  const handleReviewSubmit = async (
    partial: { rating?: number; title?: string; comment?: string; visitDate?: string; images?: string[] }
  ) => {
    if (!isAuthenticated || !user || !selectedLocation) {
      toast.error('Please sign in to submit a review');
      return;
    }

    const { rating, title, comment, visitDate, images } = partial;
    if (rating == null || !comment) {
      toast.error('Rating and comment are required');
      return;
    }

    const payload = {
      location_id: String(selectedLocation.id),
      user_id: user.id,
      rating,
      title,
      comment,
      visit_date: visitDate ?? null,
    };
    const { error } = await reviewService.submitReview(payload);
    if (error) {
      toast.error('Failed to submit review');
      return;
    }
    const newReview = {
      id: `${Date.now()}`,
      userId: user.id,
      userName: profile?.full_name || user.email || 'You',
      userAvatar: profile?.avatar_url || '/icon-192x192.png',
      rating,
      title: title || '',
      comment,
      images: images || [],
      createdAt: new Date().toISOString(),
      helpfulCount: 0,
      isVerified: !!profile?.is_verified,
      visitDate: visitDate || undefined,
    } as const;
    setReviews(prev => [newReview, ...prev]);
    toast.success('Review submitted');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-teal-500 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold">Discovering Udupi...</h2>
        </div>
      </div>
    );
  }

  // Share location functionality
  const handleShare = async (location: Location) => {
    const shareData = {
      title: `Check out ${location.name} on Discover Udupi`,
      text: location.description,
      url: `${typeof window !== 'undefined' ? window.location.origin : ''}/?location=${location.id}`,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        toast.success('Shared successfully!');
      } catch (error) {
        // User cancelled or error occurred
        if ((error as Error).name !== 'AbortError') {
          toast.error('Failed to share');
        }
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(shareData.url);
        toast.success('Link copied to clipboard!');
      } catch (error) {
        toast.error('Failed to copy link');
      }
    }
  };

  // Load favorites from Supabase on mount
  useEffect(() => {
    if (isAuthenticated && user) {
      (async () => {
        const { data, error } = await locationService.getFavorites(user.id);
        if (!error && data) {
          const favoriteIds = data
            .map((fav: any) => fav.locations?.id)
            .filter(Boolean)
            .map((id: string) => parseInt(id, 10))
            .filter((id: number) => !isNaN(id));
          setFavorites(favoriteIds);
        }
      })();
    }
  }, [isAuthenticated, user]);

  // Persist favorites to Supabase
  const toggleFavorite = async (locationId: number) => {
    if (!isAuthenticated || !user) {
      toast.error('Please sign in to save favorites');
      return;
    }

    const isFavorite = favorites.includes(locationId);
    const locationIdStr = String(locationId);

    if (isFavorite) {
      const { error } = await locationService.removeFromFavorites(locationIdStr, user.id);
      if (error) {
        toast.error('Failed to remove from favorites');
        return;
      }
      setFavorites(prev => prev.filter(id => id !== locationId));
      toast.success('Removed from favorites');
    } else {
      const { error } = await locationService.addToFavorites(locationIdStr, user.id);
      if (error) {
        toast.error('Failed to add to favorites');
        return;
      }
      setFavorites(prev => [...prev, locationId]);
      toast.success('Added to favorites');
    }
  };

  return (
    <main>
      <Toaster position="top-right" />
      <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">U</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Discover Udupi</h1>
                <p className="text-xs text-gray-500">Your Local Guide</p>
              </div>
            </div>
            
            {/* Search Bar */}
            <div className="hidden md:flex items-center space-x-4 flex-1 max-w-md mx-8">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search places..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {isAuthenticated && (
                <button 
                  onClick={() => {
                    const favoriteCount = favorites.length;
                    if (favoriteCount > 0) {
                      // Could navigate to favorites page in future
                      toast.success(`You have ${favoriteCount} favorite${favoriteCount > 1 ? 's' : ''}`);
                    } else {
                      toast('No favorites yet. Click the heart icon on any location to add favorites!', {
                        icon: '💡',
                      });
                    }
                  }}
                  className="p-2 text-gray-600 hover:text-purple-600 transition-colors relative"
                  title="View favorites"
                >
                  <Heart className={`w-5 h-5 ${favorites.length > 0 ? 'fill-current text-red-500' : ''}`} />
                  {favorites.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {favorites.length}
                    </span>
                  )}
                </button>
              )}
              {authLoading ? (
                <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
              ) : isAuthenticated ? (
                <div className="flex items-center space-x-2">
                  <img
                    src={profile?.avatar_url || 'https://www.gravatar.com/avatar/?d=mp'}
                    alt={profile?.full_name || user?.email || 'User'}
                    className="w-8 h-8 rounded-full border"
                  />
                  <button
                    onClick={() => signOut()}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-full hover:bg-gray-50"
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => signInWithGoogle()}
                  className="px-3 py-1 text-sm bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full hover:from-purple-700 hover:to-blue-700"
                >
                  Sign in
                </button>
              )}
            </div>
          </div>
          {/* Mobile Search */}
          <div className="md:hidden pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search places..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-purple-600 via-blue-600 to-teal-500 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            Explore the Soul of 
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
              Udupi
            </span>
          </h2>
          <p className="text-xl md:text-2xl mb-8 opacity-90 max-w-2xl mx-auto">
            Discover hidden gems, taste authentic flavors, and capture unforgettable moments in the cultural heart of Karnataka
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button 
              onClick={() => setSelectedCategory('all')}
              className="bg-white text-purple-600 px-8 py-4 rounded-full font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
            >
              Start Exploring
            </button>
            <button 
              onClick={showMap}
              className="border-2 border-white px-8 py-4 rounded-full font-semibold hover:bg-white hover:text-purple-600 transition-all transform hover:scale-105"
            >
              View on Map
            </button>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-12 text-gray-900">What would you like to explore?</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {categories.map((category) => {
              const Icon = category.icon;
              const isActive = selectedCategory === category.id;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`relative p-6 rounded-2xl transition-all transform hover:scale-105 ${
                    isActive 
                      ? 'bg-gradient-to-br from-purple-600 to-blue-600 text-white shadow-lg' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  <div className="text-center">
                    <Icon className={`w-8 h-8 mx-auto mb-3 ${isActive ? 'text-white' : 'text-purple-600'}`} />
                    <h4 className="font-semibold mb-1">{category.name}</h4>
                    <span className={`text-sm ${isActive ? 'text-purple-200' : 'text-gray-500'}`}>
                      {category.count} places
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Locations Grid */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <h3 className="text-3xl font-bold text-gray-900 mb-4 md:mb-0">
              {selectedCategory === 'all' ? 'Featured Locations' : categories.find(c => c.id === selectedCategory)?.name}
            </h3>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">{filteredLocations.length} results</span>
            </div>
          </div>

          {filteredLocations.length === 0 ? (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No locations found</h3>
                <p className="text-gray-600 mb-6">
                  {searchQuery 
                    ? `Try adjusting your search "${searchQuery}" or browse all categories.`
                    : `No locations found in "${categories.find(c => c.id === selectedCategory)?.name || 'this category'}".`
                  }
                </p>
                <div className="flex gap-3 justify-center">
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="px-6 py-3 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors"
                    >
                      Clear Search
                    </button>
                  )}
                  {selectedCategory !== 'all' && (
                    <button
                      onClick={() => setSelectedCategory('all')}
                      className="px-6 py-3 border-2 border-purple-600 text-purple-600 rounded-full hover:bg-purple-50 transition-colors"
                    >
                      View All Categories
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredLocations.map((location) => (
              <div 
                key={location.id} 
                className="bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer group"
                onClick={() => setSelectedLocation(location)}
              >
                <div className="relative overflow-hidden">
                  <div className="relative h-56 w-full overflow-hidden">
                    <Image 
                      src={typeof location.image === 'string' ? location.image : location.image?.url || '/fallback-image.jpg'}
                      alt={location.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                      {...(location.blurDataURL ? {
                        placeholder: "blur",
                        blurDataURL: location.blurDataURL
                      } : {})}
                      quality={75}
                    />
                  </div>
                  <div className="absolute top-4 right-4 badge-rating-sm">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm text-rating">{location.rating}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(location.id);
                    }}
                    className="absolute top-4 left-4 btn-icon-sm bg-white/90 backdrop-blur rounded-full hover:bg-white transition-colors"
                  >
                    <Heart 
                      className={`w-4 h-4 ${
                        favorites.includes(location.id) 
                          ? 'text-red-500 fill-current' 
                          : 'text-gray-600'
                      }`} 
                    />
                  </button>
                </div>
                
                <div className="p-6">
                  <h4 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                    {location.name}
                  </h4>
                  <p className="text-secondary mb-4">{location.description.substring(0, 100)}...</p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {(location.highlights ?? []).slice(0, 2).map((highlight, i) => (
                      <span key={i} className="px-3 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                        {highlight}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-muted">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>{location.bestTime}</span>
                    </div>
                    <div className="flex items-center text-sm text-muted">
                      <span>{location.reviews} reviews</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          )}
        </div>
      </section>

      {/* Location Detail Modal - Your existing modal code */}
      {selectedLocation && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-hidden">
          <div className="card-modal w-full max-w-3xl h-[85vh] relative flex flex-col" style={{ overflow: 'hidden' }}>
            {/* Fixed Header with Close Button */}
            <div className="absolute top-4 right-4 z-20">
              <button
                onClick={() => setSelectedLocation(null)}
                className="btn-close"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-blend" style={{ overflowX: 'hidden' }}>
              
              <div className="relative h-72 w-full">
                <Image
                  src={typeof selectedLocation.image === 'string' 
                    ? selectedLocation.image 
                    : selectedLocation.image?.url || '/fallback-image.jpg'}
                  alt={selectedLocation.name}
                  fill
                  className="object-cover w-full h-full"
                  priority
                />
              </div>
              
                
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-2">{selectedLocation.name}</h3>
                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span className="text-sm">{selectedLocation.address}</span>
                    </div>
                  </div>
                  <div className="badge-rating">
                    <Star className="w-5 h-5 text-yellow-500 fill-current" />
                    <span className="text-lg text-rating">{selectedLocation.rating}</span>
                    <span className="text-rating-count">({selectedLocation.reviews})</span>
                  </div>
                </div>
                
                <p className="text-secondary mb-6 leading-relaxed">{selectedLocation.description}</p>
                
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6 mb-6">
                  <h4 className="font-bold text-purple-800 mb-3 flex items-center">
                    <span className="mr-2">💡</span>
                    Local Tips
                  </h4>
                  <p className="text-purple-700">{selectedLocation.tips}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="flex items-center text-gray-600">
                    <Clock className="w-5 h-5 mr-3 text-purple-600" />
                    <div>
                      <span className="font-semibold">Hours:</span>
                      <br />
                      <span>{selectedLocation.hours}</span>
                    </div>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Navigation className="w-5 h-5 mr-3 text-purple-600" />
                    <div>
                      <span className="font-semibold">Best Time:</span>
                      <br />
                      <span>{selectedLocation.bestTime}</span>
                    </div>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h4 className="font-semibold mb-3">Highlights</h4>
                  <div className="flex flex-wrap gap-2">
                    {(selectedLocation.highlights ?? []).map((highlight, i) => (
                      <span key={i} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm">
                        {highlight}
                      </span>
                    ))}
                  </div>
                </div>

                {currentGalleryImages.length > 0 && (
                  <div className="mb-8">
                    <h4 className="font-semibold mb-3">Photos</h4>
                    <PhotoGrid
                      images={currentGalleryImages}
                      locationName={selectedLocation.name}
                      onImageClick={(i) => {
                        setGalleryIndex(i);
                        setIsGalleryOpen(true);
                      }}
                    />
                  </div>
                )}

                <div className="mb-8">
                  <h4 className="font-semibold mb-3">Reviews</h4>
                  <ReviewSystem
                    locationId={String(selectedLocation.id)}
                    locationName={selectedLocation.name}
                    initialReviews={reviews}
                    onReviewSubmit={handleReviewSubmit}
                  />
                </div>
                
                
              </div>
            </div>

            {/* Fixed Footer with Get Directions */}
            <div className="p-4 border-t bg-white flex items-center gap-3" >
              <button
                onClick={() => {
                  const url = getDirectionsUrl({
                    lat: selectedLocation.lat,
                    lng: selectedLocation.lng,
                    name: selectedLocation.name
                  });
                  window.open(url, '_blank');
                }}
                className="flex-1 btn-primary py-4 rounded-2xl flex items-center justify-center gap-2"
              >
                <Navigation className="w-5 h-5" />
                Get Directions
              </button>

              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(selectedLocation.id);
                }}
                className="btn-icon-lg btn-outline-primary rounded-2xl"
              >
                <Heart className={`w-5 h-5 ${favorites.includes(selectedLocation.id) ? 'fill-current' : ''}`} />
              </button>
              
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  if (selectedLocation) {
                    handleShare(selectedLocation);
                  }
                }}
                className="btn-icon-lg btn-outline-secondary rounded-2xl"
                title="Share location"
              >
                <Share className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Map Modal */}
      {showMapModal && (
        <MapModal
          isOpen={showMapModal}
          onClose={() => setShowMapModal(false)}
          locations={filteredLocations.map(l => ({
            ...l,
            image: typeof l.image === 'string' ? l.image : l.image?.url || ''
          }))}
          onLocationSelect={setSelectedLocation}
          selectedCategory={selectedCategory}
        />
      )}

      <ImageGallery
        images={currentGalleryImages}
        locationName={selectedLocation?.name || 'Discover Udupi'}
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        initialIndex={galleryIndex}
      />

      {/* Floating Action Button */}
      <button 
        onClick={showMap}
        className="fixed bottom-8 right-8 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-110 z-40"
      >
        <MapPin className="w-6 h-6" />
      </button>
      
      {/* Bottom padding to prevent content from being hidden behind floating button */}
      <div className="h-24"></div>
      </div>
    </main>
  );
}