'use client';
import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, MapPin, Star, ArrowRight } from 'lucide-react';
import { locations as allLocations } from '@/data/locations';
import { Location } from '@/types/Location';
import { Suspense } from 'react';

const categoryColors: Record<string, string> = {
  temples: 'bg-orange-100 text-orange-700',
  beaches: 'bg-blue-100 text-blue-700',
  food: 'bg-green-100 text-green-700',
  photography: 'bg-purple-100 text-purple-700',
};

function getImageUrl(loc: Location) {
  return typeof loc.image === 'string' ? loc.image : loc.image?.url || '';
}

function ShareContent() {
  const searchParams = useSearchParams();
  const rawPlaces = searchParams.get('places') ?? '';

  const sharedLocations = useMemo(() => {
    const ids = rawPlaces
      .split(',')
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n));
    return allLocations.filter((loc) => ids.includes(loc.id));
  }, [rawPlaces]);

  if (sharedLocations.length === 0) {
    return (
      <div className="text-center py-24">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Heart className="w-10 h-10 text-gray-300" />
        </div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No places in this list</h3>
        <p className="text-gray-500 mb-6">This link doesn&apos;t contain any saved places.</p>
        <Link
          href="/"
          className="inline-flex items-center space-x-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-3 rounded-full font-semibold hover:from-amber-600 hover:to-amber-700 transition-all"
        >
          <span>Explore Udupi</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {sharedLocations.map((loc) => (
        <div
          key={loc.id}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
        >
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
            <span
              className={`absolute top-3 left-3 text-xs font-semibold px-2 py-1 rounded-full ${
                categoryColors[loc.category] || 'bg-gray-100 text-gray-700'
              }`}
            >
              {loc.category.charAt(0).toUpperCase() + loc.category.slice(1)}
            </span>
          </div>
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
            <p className="text-gray-600 text-sm line-clamp-2">{loc.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function BucketListSharePage() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 60%, #D97706 100%)',
                  boxShadow: '0 1px 4px rgba(180,83,9,0.25)',
                }}
              >
                <span className="font-bold text-lg" style={{ color: '#451a03' }}>U</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Discover Udupi</h1>
                <p className="text-xs text-gray-500">Shared Bucket List</p>
              </div>
            </div>
            <Link
              href="/"
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-4 py-2 rounded-full text-sm font-semibold hover:from-amber-600 hover:to-amber-700 transition-all"
            >
              <span>Explore Udupi</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center space-x-3 mb-8">
          <div className="p-2 bg-red-100 rounded-xl">
            <Heart className="w-6 h-6 text-red-500 fill-current" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Shared Bucket List</h2>
            <p className="text-gray-500 text-sm mt-0.5">Places someone wants to visit in Udupi</p>
          </div>
        </div>

        <Suspense fallback={
          <div className="flex justify-center py-24">
            <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        }>
          <ShareContent />
        </Suspense>
      </div>
    </main>
  );
}
