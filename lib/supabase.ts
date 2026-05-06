import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Browser client — used for all client-side DB and auth operations
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _client: SupabaseClient<any> | null = null;

export const createSupabaseClient = () => {
  if (!_client) {
    _client = createClient(supabaseUrl, supabaseAnonKey);
  }
  return _client;
};

export const supabase = createSupabaseClient();

// Server-side admin client (never expose to browser)
export const createSupabaseServiceClient = () =>
  createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export const locationService = {
  async addToFavorites(locationId: string, userId: string) {
    return supabase
      .from('favorites')
      .insert({ location_id: locationId, user_id: userId });
  },

  async removeFromFavorites(locationId: string, userId: string) {
    return supabase
      .from('favorites')
      .delete()
      .match({ location_id: locationId, user_id: userId });
  },

  async getFavorites(userId: string) {
    return supabase
      .from('favorites')
      .select('location_id')
      .eq('user_id', userId);
  },
};

export const reviewService = {
  async getLocationReviews(locationId: string, limit = 5, offset = 0) {
    const { data, error, count } = await supabase
      .from('reviews')
      .select('*, profiles ( full_name, avatar_url )', { count: 'exact' })
      .eq('location_id', locationId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (!error) return { data, error: null, count };

    // Profile join failed — fall back to plain query
    console.warn('[reviewService] Profile join failed, falling back:', error.message);
    const fb = await supabase
      .from('reviews')
      .select('*', { count: 'exact' })
      .eq('location_id', locationId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    return fb;
  },

  async getReviewStats(locationIds: string[]) {
    const { data, error } = await supabase
      .from('reviews')
      .select('location_id, rating')
      .in('location_id', locationIds);

    if (error || !data) return { counts: {} as Record<string, number>, ratings: {} as Record<string, number>, error };

    const counts: Record<string, number> = {};
    const totals: Record<string, number> = {};
    for (const row of data as { location_id: string; rating: number }[]) {
      counts[row.location_id] = (counts[row.location_id] ?? 0) + 1;
      totals[row.location_id] = (totals[row.location_id] ?? 0) + row.rating;
    }
    const ratings: Record<string, number> = {};
    for (const id of Object.keys(counts)) {
      ratings[id] = totals[id] / counts[id];
    }
    return { counts, ratings, error: null };
  },

  async submitReview(review: {
    location_id: string;
    user_id: string;
    rating: number;
    title?: string;
    comment: string;
    visit_date?: string | null;
  }) {
    return supabase.from('reviews').insert(review);
  },

  // Upsert a vote; pass null to remove the vote (toggle off)
  async voteOnReview(reviewId: string, userId: string, voteType: 'up' | 'down' | null) {
    if (voteType === null) {
      return supabase
        .from('review_votes')
        .delete()
        .match({ review_id: reviewId, user_id: userId });
    }
    return supabase
      .from('review_votes')
      .upsert({ review_id: reviewId, user_id: userId, vote_type: voteType });
  },

  async reportReview(reviewId: string, userId: string) {
    return supabase
      .from('reported_reviews')
      .upsert({ review_id: reviewId, reporter_id: userId });
  },
};

export const tripService = {
  async getPublishedTrips() {
    return supabase
      .from('trips')
      .select('*, author:profiles ( full_name, avatar_url ), stops:trip_stops ( * )')
      .eq('is_published', true)
      .order('created_at', { ascending: false });
  },

  async getAllTrips() {
    return supabase
      .from('trips')
      .select('*, author:profiles ( full_name, avatar_url ), stops:trip_stops ( * )')
      .order('created_at', { ascending: false });
  },

  async createTrip(trip: {
    title: string;
    description: string;
    author_id: string;
    theme: string;
    duration_label: string;
    cover_image_url?: string;
    is_published?: boolean;
  }) {
    return supabase.from('trips').insert(trip).select().single();
  },

  async updateTrip(id: string, updates: Partial<{
    title: string;
    description: string;
    theme: string;
    duration_label: string;
    cover_image_url: string;
    is_published: boolean;
  }>) {
    return supabase.from('trips').update(updates).eq('id', id);
  },

  async deleteTrip(id: string) {
    return supabase.from('trips').delete().eq('id', id);
  },

  async upsertStops(tripId: string, stops: Array<{ location_id: number | null; stop_order: number; tip?: string; narrative?: string }>) {
    await supabase.from('trip_stops').delete().eq('trip_id', tripId);
    if (stops.length === 0) return { error: null };
    return supabase.from('trip_stops').insert(stops.map((s) => ({ ...s, trip_id: tripId })));
  },
};

export const profileService = {
  async getProfile(userId: string) {
    return supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
  },

  async updateProfile(
    userId: string,
    updates: { username?: string; full_name?: string; bio?: string; avatar_url?: string },
  ) {
    return supabase.from('profiles').update(updates).eq('id', userId);
  },

  async createProfile(
    userId: string,
    profile: { email?: string; username?: string; full_name?: string; avatar_url?: string },
  ) {
    return supabase.from('profiles').insert({ id: userId, ...profile });
  },
};
