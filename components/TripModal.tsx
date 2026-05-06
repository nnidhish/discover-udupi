'use client';
import { useEffect } from 'react';
import Image from 'next/image';
import { X, Clock, MapPin, User, ChevronRight } from 'lucide-react';
import { Trip, THEME_LABELS, THEME_COLORS } from '@/types/Trip';
import { Location } from '@/types/Location';

interface TripModalProps {
  trip: Trip;
  locations: Location[];
  onClose: () => void;
  onLocationClick: (location: Location) => void;
}

const categoryColors: Record<string, string> = {
  temples: 'bg-orange-100 text-orange-700',
  beaches: 'bg-blue-100 text-blue-700',
  food: 'bg-green-100 text-green-700',
  photography: 'bg-purple-100 text-purple-700',
};

export default function TripModal({ trip, locations, onClose, onLocationClick }: TripModalProps) {
  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const stops = (trip.stops ?? []).sort((a, b) => a.stop_order - b.stop_order);
  const authorName = trip.author?.full_name ?? 'Local';
  const avatarUrl = trip.author?.avatar_url;

  const getLocation = (locationId: number) => locations.find((l) => l.id === locationId);

  const getImageUrl = (loc: Location) =>
    typeof loc.image === 'string' ? loc.image : loc.image?.url ?? '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl">
        {/* Cover image */}
        <div className="relative h-52 w-full bg-gray-100 rounded-t-3xl overflow-hidden">
          {trip.cover_image_url ? (
            <Image
              src={trip.cover_image_url}
              alt={trip.title}
              fill
              className="object-cover"
              sizes="(max-width: 512px) 100vw, 512px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-100 to-teal-100">
              <MapPin className="w-14 h-14 text-amber-400" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center text-white transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Theme badge */}
          <span className={`absolute bottom-4 left-4 text-xs font-semibold px-2.5 py-1 rounded-full ${THEME_COLORS[trip.theme]}`}>
            {THEME_LABELS[trip.theme]}
          </span>
        </div>

        {/* Content */}
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{trip.title}</h2>

          {/* Author + meta row */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {avatarUrl ? (
                <Image src={avatarUrl} alt={authorName} width={28} height={28} className="rounded-full border" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-amber-600" />
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-gray-900">{authorName}</p>
                <p className="text-xs text-amber-600 font-medium">Local Guide</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {trip.duration_label}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {stops.length} stops
              </span>
            </div>
          </div>

          <p className="text-sm text-gray-600 leading-relaxed mb-6">{trip.description}</p>

          {/* Stops */}
          {stops.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                The Itinerary
              </h3>
              <div className="space-y-1">
                {stops.map((stop, idx) => {
                  if (stop.location_id === null) return null;
                  const loc = getLocation(stop.location_id);
                  if (!loc) return null;
                  return (
                    <div key={stop.id} className="relative">
                      {/* Connector line */}
                      {idx < stops.length - 1 && (
                        <div className="absolute left-4 top-10 bottom-0 w-px bg-gray-200" />
                      )}
                      <button
                        onClick={() => { onLocationClick(loc); onClose(); }}
                        className="w-full flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left group/stop"
                      >
                        {/* Stop number */}
                        <div className="w-8 h-8 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-semibold text-gray-900 text-sm truncate">{loc.name}</span>
                            <span className={`text-xs px-1.5 py-0.5 rounded-full shrink-0 ${categoryColors[loc.category] ?? 'bg-gray-100 text-gray-600'}`}>
                              {loc.category.charAt(0).toUpperCase() + loc.category.slice(1)}
                            </span>
                          </div>
                          {stop.tip && (
                            <p className="text-xs text-gray-500 italic">"{stop.tip}"</p>
                          )}
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover/stop:text-amber-500 transition-colors shrink-0 mt-1" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
