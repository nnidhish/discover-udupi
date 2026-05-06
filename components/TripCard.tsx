'use client';
import Image from 'next/image';
import { Clock, MapPin, User } from 'lucide-react';
import { Trip, THEME_LABELS, THEME_COLORS } from '@/types/Trip';

interface TripCardProps {
  trip: Trip;
  onClick: (trip: Trip) => void;
}

export default function TripCard({ trip, onClick }: TripCardProps) {
  const stopCount = trip.stops?.length ?? 0;
  const authorName = trip.author?.full_name ?? 'Local';
  const avatarUrl = trip.author?.avatar_url;

  return (
    <button
      onClick={() => onClick(trip)}
      className="group w-72 shrink-0 text-left bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 scroll-snap-align-start"
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
        {/* Theme badge */}
        <span className={`absolute top-3 left-3 text-xs font-semibold px-2 py-0.5 rounded-full ${THEME_COLORS[trip.theme]}`}>
          {THEME_LABELS[trip.theme]}
        </span>
      </div>

      {/* Card body */}
      <div className="p-4">
        <h3 className="font-bold text-gray-900 text-base leading-snug line-clamp-2 mb-3">
          {trip.title}
        </h3>

        {/* Author */}
        <div className="flex items-center gap-2 mb-3">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={authorName}
              width={20}
              height={20}
              className="rounded-full border border-gray-200"
            />
          ) : (
            <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
              <User className="w-3 h-3 text-amber-600" />
            </div>
          )}
          <span className="text-xs text-gray-500 truncate">by <span className="font-medium text-gray-700">{authorName}</span></span>
        </div>

        {/* Meta chips */}
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {trip.duration_label}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {stopCount} {stopCount === 1 ? 'stop' : 'stops'}
          </span>
        </div>
      </div>
    </button>
  );
}
