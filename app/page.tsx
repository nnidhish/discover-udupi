'use client';
import { locations as rawLocations, categories } from '@/data/locations';
import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Clock, Star, Heart, Share, Navigation, X } from 'lucide-react';
import dynamic from 'next/dynamic';
import { Location as BaseLocation } from '@/types/Location';
import { Search, Filter } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// Extend Location type to ensure image can be string or { url: string; blurDataURL?: string }
type Location = Omit<BaseLocation, 'image'> & {
  image: string | { url: string; blurDataURL?: string };
  blurDataURL?: string;
};
import ImageGallery, { PhotoGrid } from '@/components/ImageGallery';
import ReviewSystem from '@/components/ReviewSystem';
import { useAuth } from '@/hooks/useAuth';
import { reviewService, locationService } from '@/lib/supabase';
import toast from 'react-hot-toast';
import { getDirectionsUrl } from '@/utils/maps';
import { tripService } from '@/lib/supabase';
import { Trip } from '@/types/Trip';
import TripSection from '@/components/TripSection';

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

function mapReviewRow(r: SupabaseReviewRow): ReviewItem {
  return {
    id: r.id,
    userId: r.user_id,
    userName: r.profiles?.full_name || 'Explorer',
    userAvatar: r.profiles?.avatar_url || '/icon-192x192.png',
    rating: r.rating,
    title: r.title ?? '',
    comment: r.comment,
    images: (r.review_images ?? []).map(ri => ri.url),
    createdAt: r.created_at,
    helpfulCount: r.helpful_count ?? 0,
    isVerified: false,
    visitDate: r.visit_date ?? undefined,
  };
}

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
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [favorites, setFavorites] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showMapModal, setShowMapModal] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [reviewsError, setReviewsError] = useState(false);
  const [reviewCounts, setReviewCounts] = useState<Record<string, number>>({});
  const [locationRatings, setLocationRatings] = useState<Record<string, number>>({});
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [tripsLoading, setTripsLoading] = useState(true);
  const [filterBarVisible, setFilterBarVisible] = useState(true);

  const { user, profile, isAuthenticated, signOut, loading: authLoading } = useAuth();

  // Handle OAuth callback and errors from URL params
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const error = params.get('error');
      const authSuccess = params.get('auth');
      
      if (error) {
        toast.error(decodeURIComponent(error));
        // Clean up URL
        window.history.replaceState({}, '', window.location.pathname);
      } else if (authSuccess === 'success') {
        // Refresh session after successful OAuth callback
        setTimeout(() => {
          window.location.reload();
        }, 100);
      }
    }
  }, []);

  // Your existing locations data
  const locations: Location[] = rawLocations as Location[];

  // Load review counts + ratings from DB on mount
  useEffect(() => {
    const ids = locations.map(l => String(l.id));
    reviewService.getReviewStats(ids).then(({ counts, ratings }) => {
      if (counts) setReviewCounts(counts);
      if (ratings) setLocationRatings(ratings);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter locations based on category and search
  const filteredLocations = locations.filter(location => {
    const matchesCategory = selectedCategory === 'all' || location.category === selectedCategory;
    const matchesSearch = location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         location.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });


  const showMap = () => setShowMapModal(true);

  const scrollToCards = () => {
    const el = document.getElementById('featured-locations');
    if (!el) return;
    // offset = sticky nav (~65px) + category bar (~52px) + a little breathing room
    const offset = 125;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - offset, behavior: 'smooth' });
  };

  
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    tripService.getPublishedTrips().then(({ data }) => {
      if (data) setTrips(data as Trip[]);
      setTripsLoading(false);
    });
  }, []);

  // Hide filter bar only when "Recommended by Locals" has scrolled to the top of the screen.
  // rootMargin shrinks the observation zone to a narrow band just below the nav (~65px from top),
  // so the observer fires only when the section heading is near the top — not just anywhere in view.
  useEffect(() => {
    const el = document.getElementById('trip-section');
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setFilterBarVisible(!entry.isIntersecting),
      { threshold: 0, rootMargin: '-65px 0px -88% 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [tripsLoading]);

  // Save scroll position to sessionStorage so page reload restores it
  useEffect(() => {
    const save = () => sessionStorage.setItem('scrollY', String(window.scrollY));
    window.addEventListener('scroll', save, { passive: true });
    return () => window.removeEventListener('scroll', save);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      const saved = sessionStorage.getItem('scrollY');
      if (saved) requestAnimationFrame(() => window.scrollTo({ top: parseInt(saved), behavior: 'instant' as ScrollBehavior }));
    }
  }, [isLoading]);

  // Debounce search input 300ms
  useEffect(() => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => setSearchQuery(searchInput), 300);
    return () => { if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current); };
  }, [searchInput]);

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
    if (!selectedLocation) { setReviews([]); setReviewsError(false); return; }
    setReviewsError(false);
    (async () => {
      const { data, error, count } = await reviewService.getLocationReviews(String(selectedLocation.id), 5, 0);
      if (error) { console.error('[Reviews fetch]', error); setReviews([]); setReviewsError(true); return; }
      setReviews(((data ?? []) as SupabaseReviewRow[]).map(mapReviewRow));
      if (count != null) {
        setReviewCounts(prev => ({ ...prev, [String(selectedLocation.id)]: count }));
      }
    })();
  }, [selectedLocation]);

  // Load favorites from Supabase on mount
  useEffect(() => {
    if (isAuthenticated && user) {
      (async () => {
        const { data, error } = await locationService.getFavorites(user.id);
        if (!error && data) {
          const favoriteIds = (data as Array<{ location_id: string }>)
            .map((fav) => parseInt(fav.location_id, 10))
            .filter((id) => !isNaN(id));
          setFavorites(favoriteIds);
        }
      })();
    }
  }, [isAuthenticated, user]);

  const handleReviewSubmit = async (
    partial: { rating?: number; title?: string; comment?: string; visitDate?: string; images?: string[] }
  ): Promise<boolean> => {
    if (!isAuthenticated || !user || !selectedLocation) {
      toast.error('Please sign in to submit a review');
      return false;
    }

    const { rating, title, comment, visitDate, images } = partial;
    if (rating == null || !comment) {
      toast.error('Rating and comment are required');
      return false;
    }

    const payload = {
      location_id: String(selectedLocation.id),
      user_id: user.id,
      rating,
      title: title || undefined,
      comment,
      visit_date: visitDate || null,
    };
    const { error } = await reviewService.submitReview(payload);
    if (error) {
      toast.error('Failed to submit review');
      return false;
    }

    toast.success('Review submitted!');

    // Re-fetch from DB so the review list is always in sync
    const locationIdStr = String(selectedLocation.id);
    const { data: freshData, count: freshCount } = await reviewService.getLocationReviews(locationIdStr, 5, 0);
    if (freshData) {
      setReviews((freshData as SupabaseReviewRow[]).map(mapReviewRow));
    }
    if (freshCount != null) {
      setReviewCounts(prev => ({ ...prev, [locationIdStr]: freshCount }));
    }
    // Recompute average rating for this location
    if (freshData && (freshData as SupabaseReviewRow[]).length > 0) {
      const rows = freshData as SupabaseReviewRow[];
      const avg = rows.reduce((sum, r) => sum + r.rating, 0) / rows.length;
      setLocationRatings(prev => ({ ...prev, [locationIdStr]: avg }));
    }

    return true;
  };

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
      } catch {
        toast.error('Failed to copy link');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--background)]">
        {/* Skeleton nav */}
        <div className="h-16 bg-white border-b border-gray-100" />
        {/* Skeleton hero */}
        <div className="h-72 skeleton" />
        {/* Skeleton cards */}
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="skeleton h-6 w-48 mb-8 rounded-lg" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="skeleton-card">
                <div className="skeleton h-52 w-full rounded-none" />
                <div className="p-5 space-y-3">
                  <div className="skeleton h-5 w-3/4 rounded" />
                  <div className="skeleton h-4 w-full rounded" />
                  <div className="skeleton h-4 w-2/3 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

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
      <div className="min-h-screen bg-[#FAFAF8]">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-black/[0.06]" style={{ boxShadow: '0 1px 0 rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.04)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 60%, #D97706 100%)', boxShadow: '0 1px 4px rgba(180,83,9,0.25)' }}>
                <span className="font-bold text-lg" style={{ color: '#451a03' }}>U</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Discover Udupi</h1>
                <p className="text-xs text-gray-500">Your Local Guide</p>
              </div>
            </div>
            
            {/* Search Bar */}
            <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search temples, beaches, food…"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && searchInput.trim()) scrollToCards(); }}
                  className="w-full pl-10 pr-8 py-2 border border-gray-200 rounded-full focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none text-gray-900 bg-white placeholder:text-gray-400 text-sm"
                />
                {searchInput && (
                  <button
                    onClick={() => { setSearchInput(''); setSearchQuery(''); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {isAuthenticated && (
                <button
                  onClick={() => router.push('/bucketlist')}
                  className="p-2 text-gray-600 hover:text-amber-500 transition-colors relative"
                  title="View bucket list"
                >
                  <Heart className={`w-5 h-5 ${favorites.length > 0 ? 'fill-current text-red-500' : ''}`} />
                  {favorites.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {favorites.length}
                    </span>
                  )}
                </button>
              )}
              {isAuthenticated ? (
                <div className="flex items-center space-x-2">
                  <Image
                    src={profile?.avatar_url || 'https://www.gravatar.com/avatar/?d=mp'}
                    alt={profile?.full_name || user?.email || 'User'}
                    width={32}
                    height={32}
                    className="w-8 h-8 rounded-full border"
                  />
                  <span className="hidden sm:block text-sm font-medium text-gray-700">
                    {profile?.full_name || user?.email?.split('@')[0]}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => signOut()}
                    className="rounded-full"
                  >
                    Sign out
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push('/auth/signin')}
                    className="rounded-full"
                  >
                    Sign in
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => router.push('/auth/signup')}
                    className="rounded-full"
                  >
                    Sign up
                  </Button>
                </div>
              )}
            </div>
          </div>
          {/* Mobile Search */}
          <div className="md:hidden pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search temples, beaches, food…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && searchInput.trim()) scrollToCards(); }}
                className="w-full pl-10 pr-8 py-2 border border-gray-200 rounded-full focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none text-gray-900 bg-white placeholder:text-gray-400 text-sm"
              />
              {searchInput && (
                <button
                  onClick={() => { setSearchInput(''); setSearchQuery(''); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative text-white py-20 overflow-hidden">
        <Image
          src="/images/locations/beachdrone.webp"
          alt="Udupi Beach aerial view"
          fill
          className="object-cover object-center opacity-80 drop-shadow-lg"
          priority
        />
        {/* Two ambient orbs — reduced from four */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-16 left-8 w-80 h-80 bg-amber-300/25 rounded-full blur-3xl animate-float-1"></div>
          <div className="absolute bottom-16 right-12 w-96 h-96 bg-cyan-300/20 rounded-full blur-3xl animate-float-2"></div>
        </div>

        <div className="absolute inset-0 bg-black/30"></div>

        <motion.div
          className="relative max-w-7xl mx-auto px-4 text-center z-10"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.12 } }
          }}
        >
          <motion.p
            className="text-sm font-medium opacity-75 mb-3 tracking-[0.2em] uppercase"
            variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}
          >
            {isAuthenticated && profile?.full_name
              ? `Welcome back, ${profile.full_name}!`
              : 'Karnataka, India'}
          </motion.p>
          <motion.h2
            className="text-5xl md:text-6xl font-bold mb-5 leading-tight"
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.55 } } }}
          >
            Discover the Soul of
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-200">
              Udupi
            </span>
          </motion.h2>
          <motion.p
            className="text-lg md:text-xl mb-8 opacity-85 max-w-xl mx-auto leading-relaxed"
            variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}
          >
            Temples, beaches, legendary food, and hidden waterfalls —<br className="hidden sm:block" />
            all in one coastal Karnataka town.
          </motion.p>
          <motion.div
            className="flex flex-col sm:flex-row justify-center gap-3"
            variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45 } } }}
          >
            <button
              onClick={() => { setSelectedCategory('all'); scrollToCards(); }}
              className="bg-white font-semibold px-8 py-3.5 rounded-full hover:bg-amber-50 transition-all shadow-lg"
              style={{ color: 'var(--primary-dark)' }}
            >
              Start Exploring
            </button>
            <button
              onClick={showMap}
              className="border-2 border-white/80 text-white px-8 py-3.5 rounded-full font-semibold hover:bg-white/10 transition-all"
            >
              View on Map
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* Category filter pills — hides behind nav (z-50) when recommendations section is visible */}
      <section
        className="sticky top-[65px] z-40 bg-white/95 backdrop-blur-xl border-b border-black/[0.05]"
        style={{
          transform: filterBarVisible ? 'translateY(0%)' : 'translateY(-100%)',
          transition: 'transform 0.3s ease-in-out',
          pointerEvents: filterBarVisible ? 'auto' : 'none',
          boxShadow: '0 1px 0 rgba(0,0,0,0.04), 0 2px 6px rgba(0,0,0,0.03)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-2 py-3 overflow-x-auto scrollbar-none">
            {categories.map((category) => {
              const Icon = category.icon;
              const isActive = selectedCategory === category.id;
              const catVar = `--cat-${category.id}`;
              return (
                <button
                  key={category.id}
                  onClick={() => {
                    setSelectedCategory(category.id);
                    const el = document.getElementById('featured-locations');
                    if (el && el.getBoundingClientRect().top > 200) scrollToCards();
                  }}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all border ${
                    isActive
                      ? 'text-white border-transparent shadow-sm'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  style={isActive ? { background: `var(${catVar}, var(--primary))`, borderColor: 'transparent' } : {}}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {category.name}
                  <span className={`text-xs ${isActive ? 'opacity-80' : 'text-gray-400'}`}>
                    {category.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Locations Grid */}
      <section id="featured-locations" className="py-10 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-2">
            <div>
              <h3 className="text-3xl font-bold text-gray-900 tracking-tight">
                {selectedCategory === 'all' ? 'All Places' : categories.find(c => c.id === selectedCategory)?.name}
              </h3>
              <div className="mt-1.5 w-10 h-1 rounded-full bg-gradient-to-r from-amber-400 to-amber-500" />
            </div>
            <div className="flex items-center gap-1.5 text-sm text-gray-400 bg-gray-50 px-3 py-1.5 rounded-full">
              <Filter className="w-3.5 h-3.5" />
              <span>{filteredLocations.length} {filteredLocations.length === 1 ? 'place' : 'places'}</span>
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
                    <Button
                      onClick={() => { setSearchInput(''); setSearchQuery(''); }}
                      className="rounded-full px-6"
                    >
                      Clear Search
                    </Button>
                  )}
                  {selectedCategory !== 'all' && (
                    <Button
                      variant="outline"
                      onClick={() => setSelectedCategory('all')}
                      className="rounded-full px-6 border-2 border-primary text-primary hover:bg-accent"
                    >
                      View All Categories
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
            {filteredLocations.map((location, index) => (
              // Outer: opacity-only for AnimatePresence enter/exit
              <motion.div
                key={location.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { duration: 0.3, delay: index * 0.05 } }}
                exit={{ opacity: 0, transition: { duration: 0.15 } }}
              >
              {/* Inner: y+scale for paper-on-water scroll float */}
              <motion.div
                className="card-location group h-full"
                onClick={() => setSelectedLocation(location)}
                initial={{ y: 20, scale: 0.98 }}
                whileInView={{ y: 0, scale: 1 }}
                viewport={{ once: true, margin: '0px 0px -40px 0px' }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              >
                {/* Image */}
                <div className="relative h-56 w-full overflow-hidden">
                  <Image
                    src={typeof location.image === 'string' ? location.image : location.image?.url || '/fallback-image.jpg'}
                    alt={location.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    {...(location.blurDataURL ? { placeholder: "blur", blurDataURL: location.blurDataURL } : {})}
                    quality={75}
                  />
                  {/* Soft gradient fade at bottom of image */}
                  <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
                  {/* Category badge */}
                  <span className={`absolute top-3 left-3 cat-badge cat-badge-${location.category}`}>
                    {categories.find(c => c.id === location.category)?.name ?? location.category}
                  </span>
                  {/* Rating badge */}
                  <div className="absolute top-3 right-3 badge-rating-sm">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-current" />
                    <span className="text-sm font-semibold text-gray-900">
                    {locationRatings[String(location.id)] != null
                      ? locationRatings[String(location.id)].toFixed(1)
                      : location.rating}
                  </span>
                  </div>
                  {/* Favorite button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleFavorite(location.id); }}
                    className="absolute bottom-3 right-3 btn-icon-sm bg-white/90 backdrop-blur rounded-full hover:bg-white transition-colors shadow-sm"
                    aria-label={favorites.includes(location.id) ? 'Remove from favorites' : 'Save to favorites'}
                  >
                    <Heart className={`w-4 h-4 ${favorites.includes(location.id) ? 'text-red-500 fill-current' : 'text-gray-500'}`} />
                  </button>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h4 className="text-[17px] font-bold text-gray-900 mb-1 group-hover:text-amber-700 transition-colors leading-snug tracking-tight">
                    {location.name}
                  </h4>
                  <p className="text-gray-500 text-[13px] mb-3 line-clamp-2 leading-relaxed">{location.description}</p>

                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {(location.highlights ?? []).slice(0, 2).map((highlight, i) => (
                      <Badge key={i} variant="outline" className="text-[11px] font-normal text-gray-500 border-gray-200">
                        {highlight}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-[12px] text-gray-400 pt-3 border-t border-gray-100/80">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{location.bestTime}</span>
                    </div>
                    <span className="font-medium">{(reviewCounts[String(location.id)] ?? 0).toLocaleString()} reviews</span>
                  </div>
                </div>
              </motion.div>
              </motion.div>
            ))}
            </AnimatePresence>
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
                    <span className="text-lg text-rating">
                      {locationRatings[String(selectedLocation.id)] != null
                        ? locationRatings[String(selectedLocation.id)].toFixed(1)
                        : selectedLocation.rating}
                    </span>
                    <span className="text-rating-count">({reviewCounts[String(selectedLocation.id)] ?? 0})</span>
                  </div>
                </div>
                
                <p className="text-secondary mb-6 leading-relaxed">{selectedLocation.description}</p>
                
                <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl p-6 mb-6">
                  <h4 className="font-bold text-amber-800 mb-3 flex items-center">
                    <span className="mr-2">💡</span>
                    Local Tips
                  </h4>
                  <p className="text-amber-700">{selectedLocation.tips}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="flex items-center text-gray-600">
                    <Clock className="w-5 h-5 mr-3 text-amber-500" />
                    <div>
                      <span className="font-semibold">Hours:</span>
                      <br />
                      <span>{selectedLocation.hours}</span>
                    </div>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Navigation className="w-5 h-5 mr-3 text-amber-500" />
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
                      <Badge key={i} variant="outline" className="px-3 py-1 text-sm font-normal text-gray-700 rounded-full">
                        {highlight}
                      </Badge>
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
                  {reviewsError ? (
                    <div className="flex flex-col items-center py-8 text-center rounded-xl bg-red-50 gap-2">
                      <p className="text-red-600 text-sm font-medium">Couldn't load reviews</p>
                      <button
                        className="text-xs text-red-500 underline underline-offset-2"
                        onClick={() => {
                          setReviewsError(false);
                          if (selectedLocation) {
                            reviewService.getLocationReviews(String(selectedLocation.id), 10, 0).then(({ data, error }) => {
                              if (error) { setReviewsError(true); return; }
                              const rows = (data ?? []) as SupabaseReviewRow[];
                              setReviews(rows.map((r) => ({
                                id: r.id, userId: r.user_id,
                                userName: r.profiles?.full_name || 'Explorer',
                                userAvatar: r.profiles?.avatar_url || '/icon-192x192.png',
                                rating: r.rating, title: r.title ?? '', comment: r.comment,
                                images: (r.review_images ?? []).map((ri) => ri.url),
                                createdAt: r.created_at, helpfulCount: r.helpful_count ?? 0,
                                isVerified: r.profiles?.is_verified ?? false,
                                visitDate: r.visit_date ?? undefined,
                              })));
                            });
                          }
                        }}
                      >
                        Retry
                      </button>
                    </div>
                  ) : (
                    <ReviewSystem
                      locationId={String(selectedLocation.id)}
                      locationName={selectedLocation.name}
                      initialReviews={reviews}
                      onReviewSubmit={handleReviewSubmit}
                      currentUserId={user?.id}
                    />
                  )}
                </div>
                
                
              </div>
            </div>

            {/* Fixed Footer with Get Directions */}
            <div className="p-4 border-t border-black/[0.06] bg-white flex items-center gap-3">
              <Button
                onClick={() => {
                  const url = getDirectionsUrl({
                    lat: selectedLocation.lat,
                    lng: selectedLocation.lng,
                    name: selectedLocation.name
                  });
                  window.open(url, '_blank');
                }}
                className="flex-1 rounded-2xl h-14 text-base gap-2"
              >
                <Navigation className="w-5 h-5" />
                Get Directions
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={(e) => { e.stopPropagation(); toggleFavorite(selectedLocation.id); }}
                className={`rounded-2xl w-14 h-14 border-2 ${favorites.includes(selectedLocation.id) ? 'border-red-400 text-red-500 hover:bg-red-50' : 'hover:border-amber-400 hover:text-amber-700'}`}
              >
                <Heart className={`w-5 h-5 ${favorites.includes(selectedLocation.id) ? 'fill-current' : ''}`} />
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={(e) => { e.stopPropagation(); if (selectedLocation) handleShare(selectedLocation); }}
                className="rounded-2xl w-14 h-14 border-2 hover:border-amber-400 hover:text-amber-700"
                title="Share location"
              >
                <Share className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Recommended by Locals */}
      <TripSection
        trips={trips}
        tripsLoading={tripsLoading}
        locations={locations}
        onLocationClick={(loc) => setSelectedLocation(loc as Location)}
      />

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
        className="fixed bottom-8 right-8 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 z-40"
        style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)' }}
        aria-label="Open map"
      >
        <MapPin className="w-6 h-6" />
      </button>
      
      {/* Bottom padding to prevent content from being hidden behind floating button */}
      <div className="h-24"></div>
      </div>
    </main>
  );
}