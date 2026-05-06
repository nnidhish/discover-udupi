export type TripTheme = 'temple_trail' | 'beach_hopping' | 'foodie_tour' | 'nature' | 'mixed';

export interface TripStop {
  id: string;
  trip_id: string;
  location_id: number | null;
  stop_order: number;
  tip?: string | null;
  narrative?: string | null;
}

export interface Trip {
  id: string;
  title: string;
  description: string;
  author_id: string | null;
  theme: TripTheme;
  duration_label: string;
  cover_image_url: string | null;
  is_published: boolean;
  created_at: string;
  stops?: TripStop[];
  author?: { full_name?: string | null; avatar_url?: string | null };
}

export const THEME_LABELS: Record<TripTheme, string> = {
  temple_trail: 'Temple Trail',
  beach_hopping: 'Beach Hopping',
  foodie_tour: 'Foodie Tour',
  nature: 'Nature',
  mixed: 'Mixed',
};

export const THEME_COLORS: Record<TripTheme, string> = {
  temple_trail: 'bg-orange-100 text-orange-700',
  beach_hopping: 'bg-blue-100 text-blue-700',
  foodie_tour: 'bg-green-100 text-green-700',
  nature: 'bg-emerald-100 text-emerald-700',
  mixed: 'bg-amber-100 text-amber-700',
};
