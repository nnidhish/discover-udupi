'use client';
import { useState, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Clock, MapPin, User, ChevronRight, Navigation, Share2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Trip, THEME_LABELS, THEME_COLORS } from '@/types/Trip';
import { Location } from '@/types/Location';

interface TripSectionProps {
  trips: Trip[];
  tripsLoading: boolean;
  locations: Location[];
  onLocationClick: (location: Location) => void;
}

const categoryColors: Record<string, string> = {
  temples: 'bg-orange-100 text-orange-700',
  beaches: 'bg-blue-100 text-blue-700',
  food: 'bg-green-100 text-green-700',
  photography: 'bg-purple-100 text-purple-700',
};

const heroTransition = { duration: 0.3, ease: 'easeOut' as const };

export default function TripSection({ trips, tripsLoading, locations, onLocationClick }: TripSectionProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const sectionRef = useRef<HTMLElement>(null);

  const selectedTrip = trips.find((t) => t.id === selectedId) ?? null;
  const otherTrips = trips.filter((t) => t.id !== selectedId);

  const handleSelect = (trip: Trip) => {
    setSelectedId(trip.id);
    requestAnimationFrame(() => {
      if (sectionRef.current) {
        const top = sectionRef.current.getBoundingClientRect().top + window.scrollY - 130;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  };

  const handleClose = () => setSelectedId(null);

  const getLocation = (locationId: number) => locations.find((l) => l.id === locationId);

  if (!tripsLoading && trips.length === 0) return null;

  return (
    <section id="trip-section" ref={sectionRef} className="py-10 bg-gray-50 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Recommended by Locals</h2>
            <p className="text-sm text-gray-500 mt-1">Curated itineraries by people who live here</p>
          </div>
          <AnimatePresence>
            {selectedId && (
              <motion.button
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                transition={{ duration: 0.2 }}
                onClick={handleClose}
                className="flex items-center gap-1.5 text-sm font-medium text-amber-700 hover:text-amber-800 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                All trips
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Loading skeletons */}
        {tripsLoading && (
          <div className="flex gap-4 overflow-hidden">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-72 shrink-0 rounded-2xl bg-white border border-gray-100 overflow-hidden animate-pulse">
                <div className="h-40 bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!tripsLoading && (
          <>
            {/* ── Expanded hero ── */}
            <AnimatePresence mode="wait">
              {selectedTrip && (
                <motion.div
                  key={`hero-${selectedTrip.id}`}
                  initial={{ opacity: 0, scale: 0.97, y: -8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97, y: -8 }}
                  transition={heroTransition}
                  className="w-full rounded-2xl bg-white shadow-md border border-gray-100 mb-6 overflow-hidden"
                >
                  {/* Cover image */}
                  <div className="relative w-full bg-gray-100" style={{ height: 260 }}>
                    {selectedTrip.cover_image_url ? (
                      <Image
                        src={selectedTrip.cover_image_url}
                        alt={selectedTrip.title}
                        fill
                        priority
                        className="object-cover"
                        sizes="(max-width: 1280px) 100vw, 1280px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-100 to-teal-100">
                        <MapPin className="w-14 h-14 text-amber-400" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

                    {/* Dismiss affordance — top-centre handle */}
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1, transition: { delay: 0.3 } }}
                      onClick={handleClose}
                      className="absolute top-3 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 group px-4 py-2"
                      aria-label="Collapse trip"
                    >
                      <div className="w-10 h-1.5 rounded-full bg-white/60 group-hover:bg-white/90 transition-colors" />
                    </motion.button>

                    {/* Theme badge */}
                    <span className={`absolute bottom-4 left-4 text-xs font-semibold px-2.5 py-1 rounded-full ${THEME_COLORS[selectedTrip.theme]}`}>
                      {THEME_LABELS[selectedTrip.theme]}
                    </span>

                    {/* Duration + stops */}
                    <div className="absolute bottom-4 right-4 flex items-center gap-3 text-xs text-white/90">
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{selectedTrip.duration_label}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{(selectedTrip.stops ?? []).length} stops</span>
                    </div>
                  </div>

                  {/* Title */}
                  <div className="px-6 pt-5 pb-2">
                    <h3 className="text-xl font-bold text-gray-900 leading-snug">{selectedTrip.title}</h3>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Detail content ── */}
            <AnimatePresence mode="wait">
              {selectedTrip && (
                <motion.div
                  key={`detail-${selectedTrip.id}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, transition: { delay: 0.2 } }}
                  exit={{ opacity: 0, transition: { duration: 0.15 } }}
                  className="mb-8"
                >
                  {/* Author + share */}
                  <div className="flex items-center justify-between px-1 mb-5">
                    <div className="flex items-center gap-2.5">
                      {selectedTrip.author?.avatar_url ? (
                        <Image src={selectedTrip.author.avatar_url} alt={selectedTrip.author.full_name ?? 'Local'} width={32} height={32} className="rounded-full border border-gray-200" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                          <User className="w-4 h-4 text-amber-600" />
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-semibold text-gray-900 leading-none">{selectedTrip.author?.full_name ?? 'Local'}</p>
                        <p className="text-xs text-amber-600 font-medium mt-0.5">Local Guide</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        const url = `${window.location.origin}/trips/${selectedTrip.id}`;
                        navigator.clipboard.writeText(url).then(() => toast.success('Link copied!'));
                      }}
                      className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-amber-700 border border-gray-200 hover:border-amber-300 rounded-full px-3 py-1.5 transition-colors"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      Share
                    </button>
                  </div>

                  {/* Description */}
                  <div className="mb-6 px-1">
                    <p className="text-xs text-amber-600 uppercase tracking-wide font-semibold mb-2">In the guide&apos;s words</p>
                    <div className="bg-amber-50/60 border-l-4 border-amber-400 rounded-r-xl px-4 py-3">
                      <p className="text-[15px] text-gray-700 leading-relaxed italic">{selectedTrip.description}</p>
                    </div>
                  </div>

                  {/* Itinerary */}
                  {(selectedTrip.stops ?? []).length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4 px-1">The Itinerary</h4>
                      <div className="space-y-3">
                        {(() => {
                          const sorted = [...(selectedTrip.stops ?? [])].sort((a, b) => a.stop_order - b.stop_order);
                          let locationCount = 0;
                          return sorted.map((stop, idx, arr) => {
                            const isTextBlock = stop.location_id === null;
                            const loc = isTextBlock ? null : getLocation(stop.location_id!);
                            if (!isTextBlock && !loc) return null;
                            if (!isTextBlock) locationCount++;
                            const stopNum = locationCount;

                            const imageUrl = loc
                              ? typeof loc.image === 'string' ? loc.image : (loc.image as { url: string })?.url ?? ''
                              : '';

                            return (
                              <motion.div
                                key={stop.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0, transition: { delay: 0.25 + idx * 0.07 } }}
                                className="relative"
                              >
                                {idx < arr.length - 1 && (
                                  <div className="absolute left-5 top-full h-3 w-px border-l-2 border-dashed border-amber-200 z-10" />
                                )}

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

                                    <button
                                      onClick={() => onLocationClick(loc!)}
                                      className="w-full text-left bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-amber-200 transition-all duration-200 overflow-hidden group/stop"
                                    >
                                      <div className="flex items-start gap-3 px-4 pt-4 pb-3">
                                        <div className="w-9 h-9 rounded-full bg-amber-500 text-white text-sm font-bold flex items-center justify-center shrink-0">
                                          {stopNum}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-start justify-between gap-2">
                                            <h5 className="font-bold text-gray-900 text-base leading-snug group-hover/stop:text-amber-700 transition-colors">
                                              {loc!.name}
                                            </h5>
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

                                      <div className="flex items-center justify-end px-4 pb-3">
                                        <span className="text-xs font-medium text-amber-600 group-hover/stop:text-amber-700 flex items-center gap-0.5 transition-colors">
                                          Tap to explore <ChevronRight className="w-3.5 h-3.5" />
                                        </span>
                                      </div>
                                    </button>
                                  </>
                                )}
                              </motion.div>
                            );
                          });
                        })()}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Collapsed card row ── */}
            {!selectedId && (
              <div className="flex gap-4 overflow-x-auto pb-2 scroll-smooth" style={{ scrollSnapType: 'x mandatory' }}>
                {trips.map((trip, i) => (
                  <TripCard key={trip.id} trip={trip} onSelect={handleSelect} />
                ))}
              </div>
            )}

            {/* ── More recommendations ── */}
            {selectedId && otherTrips.length > 0 && (
              <motion.div
                key="more-recs"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { delay: 0.4 } }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">More Recommendations</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>
                <div className="flex gap-4 overflow-x-auto pb-2 scroll-smooth" style={{ scrollSnapType: 'x mandatory' }}>
                  {otherTrips.map((trip, i) => (
                    <TripCard key={trip.id} trip={trip} onSelect={handleSelect} />
                  ))}
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

function TripCard({ trip, onSelect }: { trip: Trip; onSelect: (trip: Trip) => void }) {
  const stopCount = trip.stops?.length ?? 0;
  const authorName = trip.author?.full_name ?? 'Local';
  const avatarUrl = trip.author?.avatar_url;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(trip)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelect(trip); }}
      className="group w-72 shrink-0 text-left bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
      style={{ scrollSnapAlign: 'start' }}
    >
      {/* Cover image */}
      <div className="relative h-40 w-full overflow-hidden bg-gray-100">
        {trip.cover_image_url ? (
          <Image
            src={trip.cover_image_url}
            alt={trip.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="288px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-100 to-teal-100">
            <MapPin className="w-10 h-10 text-amber-400" />
          </div>
        )}
        <span className={`absolute top-3 left-3 text-xs font-semibold px-2 py-0.5 rounded-full ${THEME_COLORS[trip.theme]}`}>
          {THEME_LABELS[trip.theme]}
        </span>
      </div>

      {/* Card body */}
      <div className="p-4">
        <h3 className="font-bold text-gray-900 text-base leading-snug line-clamp-2 mb-3">{trip.title}</h3>
        <div className="flex items-center gap-2 mb-3">
          {avatarUrl ? (
            <Image src={avatarUrl} alt={authorName} width={20} height={20} className="rounded-full border border-gray-200" />
          ) : (
            <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
              <User className="w-3 h-3 text-amber-600" />
            </div>
          )}
          <span className="text-xs text-gray-500 truncate">by <span className="font-medium text-gray-700">{authorName}</span></span>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{trip.duration_label}</span>
          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{stopCount} {stopCount === 1 ? 'stop' : 'stops'}</span>
        </div>
      </div>
    </div>
  );
}
