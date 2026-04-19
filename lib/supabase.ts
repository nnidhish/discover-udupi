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
  async getLocationReviews(locationId: string, limit = 10, offset = 0) {
    return supabase
      .from('reviews')
      .select(`
        *,
        profiles:user_id (
          full_name,
          avatar_url,
          is_verified
        )
      `)
      .eq('location_id', locationId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
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
