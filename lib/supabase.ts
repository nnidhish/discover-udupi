// lib/supabase.ts
import { createClientComponentClient, createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';
import { cookies } from 'next/headers';

// For client-side usage
export const createSupabaseClient = () => {
  return createClientComponentClient<Database>();
};

// For server-side usage  
export const createSupabaseServerClient = () => {
  const cookieStore = cookies();
  return createServerComponentClient<Database>({ cookies: () => cookieStore });
};

// For service role operations (admin functions)
export const createSupabaseServiceClient = () => {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
};

// Default client for components
export const supabase = createSupabaseClient();

// Helper functions for common operations
export const locationService = {
  async getLocations(category?: string, limit = 10) {
    const query = supabase
      .from('location_details')
      .select('*')
      .eq('is_active', true)
      .limit(limit);
    
    if (category && category !== 'all') {
      query.eq('category_name', category);
    }
    
    return query.order('average_rating', { ascending: false });
  },

  async getLocationBySlug(slug: string) {
    return supabase
      .from('location_details')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();
  },

  async getNearbyLocations(lat: number, lng: number, radiusKm = 50) {
    return supabase.rpc('get_nearby_locations', {
      user_lat: lat,
      user_lng: lng,
      radius_km: radiusKm
    });
  },

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
      .select(`
        location_id,
        locations:location_id (
          id,
          name,
          slug,
          short_description,
          average_rating,
          location_images!location_images_location_id_fkey (
            url,
            alt_text
          )
        )
      `)
      .eq('user_id', userId);
  }
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
        ),
        review_images (
          url,
          alt_text
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
    visit_date?: string;
  }) {
    return supabase
      .from('reviews')
      .insert(review);
  },

  async voteHelpful(reviewId: string, userId: string, isHelpful: boolean) {
    return supabase
      .from('review_votes')
      .upsert({ 
        review_id: reviewId, 
        user_id: userId, 
        is_helpful: isHelpful 
      });
  }
};

export const profileService = {
  async getProfile(userId: string) {
    return supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
  },

  async updateProfile(userId: string, updates: {
    username?: string;
    full_name?: string;
    bio?: string;
    avatar_url?: string;
  }) {
    return supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);
  },

  async createProfile(userId: string, profile: {
    username?: string;
    full_name?: string;
    avatar_url?: string;
  }) {
    return supabase
      .from('profiles')
      .insert({ id: userId, ...profile });
  }
};