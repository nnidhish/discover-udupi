'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, MapPin, Star, ArrowLeft, Trash2 } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { locationService } from '@/lib/supabase';
import { locations as allLocations } from '@/data/locations';
import { Location } from '@/types/Location';

export default function BucketList() {
  const router = useRouter();
  const { user, profile, isAuthenticated, initialized, signOut } = useAuth();
  const [savedLocations, setSavedLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (initialized && !isAuthenticated) {
      router.replace('/auth/signin');
    }
  }, [initialized, isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    (async () => {
      setLoading(true);
      const { data, error } = await locationService.getFavorites(user.id);
      if (!error && data) {
        const ids = (data as Array<{ location_id: string }>)
          .map((fav) => parseInt(fav.location_id, 10))
          .filter((id) => !isNaN(id));
        setSavedLocations(allLocations.filter((loc) => ids.includes(loc.id)));
      }
      setLoading(false);
    })();
  }, [isAuthenticated, user]);

  const handleRemove = async (location: Location) => {
    if (!user) return;
    const { error } = await locationService.removeFromFavorites(String(location.id), user.id);
    if (error) {
      toast.error('Failed to remove');
      return;
    }
    setSavedLocations((prev) => prev.filter((l) => l.id !== location.id));
    toast.success(`Removed "${location.name}" from bucket list`);
  };

  const getImageUrl = (loc: Location) =>
    typeof loc.image === 'string' ? loc.image : loc.image?.url || '';

  const categoryColors: Record<string, string> = {
    temples: 'bg-orange-100 text-orange-700',
    beaches: 'bg-blue-100 text-blue-700',
    food: 'bg-green-100 text-green-700',
    photography: 'bg-purple-100 text-purple-700',
  };

  if (!initialized || (initialized && !isAuthenticated)) return null;

  return (
    <main className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />

      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200">
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
            <div className="flex items-center space-x-3">
              <Link
                href="/"
                className="flex items-center space-x-1 text-sm text-gray-600 hover:text-amber-600 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to exploring</span>
              </Link>
              {profile && (
                <div className="flex items-center space-x-2">
                  <Image
                    src={profile.avatar_url || 'https://www.gravatar.com/avatar/?d=mp'}
                    alt={profile.full_name || 'User'}
                    width={32}
                    height={32}
                    className="w-8 h-8 rounded-full border"
                  />
                  <button
                    onClick={() => signOut()}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-full hover:bg-gray-50"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Page header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center space-x-3 mb-8">
          <div className="p-2 bg-red-100 rounded-xl">
            <Heart className="w-6 h-6 text-red-500 fill-current" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Your Bucket List</h2>
            <p className="text-gray-500 text-sm mt-0.5">
              {savedLocations.length} place{savedLocations.length !== 1 ? 's' : ''} saved
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-24">
            <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : savedLocations.length === 0 ? (
          /* Empty state */
          <div className="text-center py-24">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No saved places yet</h3>
            <p className="text-gray-500 mb-6">
              Tap the heart icon on any place to save it here.
            </p>
            <Link
              href="/"
              className="inline-block bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-3 rounded-full font-semibold hover:from-amber-600 hover:to-amber-700 transition-all"
            >
              Browse places
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedLocations.map((loc) => (
              <div
                key={loc.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Image */}
                <div className="relative h-48 w-full overflow-hidden">
                  <Image
                    src={getImageUrl(loc)}
                    alt={loc.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    placeholder={loc.blurDataURL ? 'blur' : 'empty'}
                    blurDataURL={loc.blurDataURL}
                  />
                  {/* Category badge */}
                  <span
                    className={`absolute top-3 left-3 text-xs font-semibold px-2 py-1 rounded-full ${
                      categoryColors[loc.category] || 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {loc.category.charAt(0).toUpperCase() + loc.category.slice(1)}
                  </span>
                </div>

                {/* Details */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-bold text-gray-900 text-lg leading-tight">{loc.name}</h3>
                    <div className="flex items-center space-x-1 ml-2 shrink-0">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-semibold text-gray-700">{loc.rating.toFixed(1)}</span>
                    </div>
                  </div>
                  <div className="flex items-center text-gray-400 text-xs mb-3">
                    <MapPin className="w-3 h-3 mr-1 shrink-0" />
                    <span className="truncate">{loc.address}</span>
                  </div>
                  <p className="text-gray-600 text-sm line-clamp-2 mb-4">{loc.description}</p>

                  <button
                    onClick={() => handleRemove(loc)}
                    className="w-full flex items-center justify-center space-x-2 py-2 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 transition-colors text-sm font-medium"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Remove from bucket list</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
