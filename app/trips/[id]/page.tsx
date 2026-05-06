import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Clock, MapPin, User, ArrowLeft, Navigation, ExternalLink } from 'lucide-react';
import { createSupabaseServiceClient } from '@/lib/supabase';
import { locations as allLocations } from '@/data/locations';
import { Trip, THEME_LABELS, THEME_COLORS } from '@/types/Trip';
import type { Metadata } from 'next';

const categoryColors: Record<string, string> = {
  temples: 'bg-orange-100 text-orange-700',
  beaches: 'bg-blue-100 text-blue-700',
  food: 'bg-green-100 text-green-700',
  photography: 'bg-purple-100 text-purple-700',
};

async function getTrip(id: string): Promise<Trip | null> {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from('trips')
    .select('*, author:profiles ( full_name, avatar_url ), stops:trip_stops ( * )')
    .eq('id', id)
    .eq('is_published', true)
    .single();
  if (error || !data) return null;
  return data as Trip;
}

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params;
  const trip = await getTrip(id);
  if (!trip) return { title: 'Trip not found — Discover Udupi' };
  return {
    title: `${trip.title} — Discover Udupi`,
    description: trip.description,
    openGraph: {
      title: trip.title,
      description: trip.description,
      images: trip.cover_image_url ? [trip.cover_image_url] : [],
    },
  };
}

export default async function TripPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const trip = await getTrip(id);
  if (!trip) notFound();

  const stops = [...(trip.stops ?? [])].sort((a, b) => a.stop_order - b.stop_order);
  const authorName = trip.author?.full_name ?? 'Local Guide';
  const avatarUrl = trip.author?.avatar_url;

  const getLocation = (locationId: number) =>
    allLocations.find((l) => l.id === locationId);

  const getImageUrl = (loc: ReturnType<typeof getLocation>) => {
    if (!loc) return '';
    return typeof loc.image === 'string' ? loc.image : (loc.image as { url: string })?.url ?? '';
  };

  let locationCount = 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-black/[0.06]">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-amber-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Discover Udupi
          </Link>
          <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full">
            Shared Itinerary
          </span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pb-16">
        {/* Cover image */}
        <div className="relative w-full bg-gray-100 rounded-b-3xl overflow-hidden" style={{ height: 260 }}>
          {trip.cover_image_url ? (
            <Image
              src={trip.cover_image_url}
              alt={trip.title}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 672px) 100vw, 672px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-100 to-teal-100">
              <MapPin className="w-14 h-14 text-amber-400" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <span className={`absolute bottom-4 left-4 text-xs font-semibold px-2.5 py-1 rounded-full ${THEME_COLORS[trip.theme]}`}>
            {THEME_LABELS[trip.theme]}
          </span>
          <div className="absolute bottom-4 right-4 flex items-center gap-3 text-xs text-white/90">
            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{trip.duration_label}</span>
            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{stops.length} stops</span>
          </div>
        </div>

        {/* Trip header */}
        <div className="pt-6 pb-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{trip.title}</h1>

          {/* Author */}
          <div className="flex items-center gap-2.5">
            {avatarUrl ? (
              <Image src={avatarUrl} alt={authorName} width={36} height={36} className="rounded-full border border-gray-200" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                <User className="w-5 h-5 text-amber-600" />
              </div>
            )}
            <div>
              <p className="text-sm font-semibold text-gray-900">{authorName}</p>
              <p className="text-xs text-amber-600 font-medium">Local Guide</p>
            </div>
          </div>
        </div>

        <div className="w-full h-px bg-gray-100 mb-5" />

        {/* Description */}
        <div className="mb-7">
          <p className="text-xs text-amber-600 uppercase tracking-wide font-semibold mb-2">In the guide&apos;s words</p>
          <div className="bg-amber-50/60 border-l-4 border-amber-400 rounded-r-xl px-4 py-3">
            <p className="text-[15px] text-gray-700 leading-relaxed italic">{trip.description}</p>
          </div>
        </div>

        {/* Itinerary */}
        {stops.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">The Itinerary</h2>
            <div className="space-y-3">
              {stops.map((stop) => {
                const isTextBlock = stop.location_id === null;
                const loc = isTextBlock ? null : getLocation(stop.location_id!);
                if (!isTextBlock && !loc) return null;
                if (!isTextBlock) locationCount++;
                const stopNum = locationCount;
                const imageUrl = getImageUrl(loc ?? undefined);

                return (
                  <div key={stop.id}>
                    {isTextBlock ? (
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 w-8 flex items-start justify-center pt-1">
                          <Navigation className="w-4 h-4 text-amber-400 mt-1" />
                        </div>
                        <div className="flex-1 bg-amber-50/60 border border-dashed border-amber-200 rounded-xl px-4 py-3">
                          {stop.narrative?.split('\n').map((line, li) => (
                            <p key={li} className={`text-sm text-gray-700 leading-relaxed${li > 0 ? ' mt-2' : ''}`}>
                              {line}
                            </p>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <>
                        {stop.narrative && (
                          <div className="flex gap-3 mb-2 px-1">
                            <div className="flex-shrink-0 w-8 flex items-start justify-center pt-0.5">
                              <Navigation className="w-4 h-4 text-amber-400" />
                            </div>
                            <div className="flex-1 bg-white/80 border border-dashed border-amber-200 rounded-xl px-3 py-2.5">
                              {stop.narrative.split('\n').map((line, li) => (
                                <p key={li} className={`text-sm text-gray-600 leading-relaxed${li > 0 ? ' mt-1' : ''}`}>
                                  {line}
                                </p>
                              ))}
                            </div>
                          </div>
                        )}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                          <div className="flex items-start gap-3 px-4 pt-4 pb-3">
                            <div className="w-9 h-9 rounded-full bg-amber-500 text-white text-sm font-bold flex items-center justify-center shrink-0">
                              {stopNum}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <h3 className="font-bold text-gray-900 text-base leading-snug">{loc!.name}</h3>
                                <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 font-medium ${categoryColors[loc!.category] ?? 'bg-gray-100 text-gray-600'}`}>
                                  {loc!.category.charAt(0).toUpperCase() + loc!.category.slice(1)}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-3 px-4 pb-3">
                            <div className="flex-1 min-w-0 space-y-1">
                              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                <MapPin className="w-3 h-3 shrink-0" />
                                <span className="truncate">{loc!.address}</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                <Clock className="w-3 h-3 shrink-0" />
                                <span>Best time: {loc!.bestTime}</span>
                              </div>
                            </div>
                            {imageUrl && (
                              <div className="relative w-20 h-14 rounded-xl overflow-hidden shrink-0 bg-gray-100">
                                <Image src={imageUrl} alt={loc!.name} fill className="object-cover" sizes="80px" />
                              </div>
                            )}
                          </div>
                          {stop.tip && (
                            <div className="mx-4 mb-3 border-l-2 border-amber-400 bg-amber-50 rounded-r-xl px-3 py-2">
                              <p className="text-xs text-amber-800 italic leading-relaxed">&ldquo;{stop.tip}&rdquo;</p>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer CTA */}
        <div className="mt-10 text-center border-t border-gray-100 pt-8">
          <p className="text-sm text-gray-500 mb-3">Discover more places in Udupi</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Open Discover Udupi
          </Link>
        </div>
      </main>
    </div>
  );
}
