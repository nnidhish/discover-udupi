// types/database.ts
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string | null;
          full_name: string | null;
          avatar_url: string | null;
          bio: string | null;
          is_verified: boolean;
          is_local_guide: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          is_verified?: boolean;
          is_local_guide?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          is_verified?: boolean;
          is_local_guide?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          icon: string | null;
          color: string | null;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          icon?: string | null;
          color?: string | null;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          icon?: string | null;
          color?: string | null;
          description?: string | null;
          created_at?: string;
        };
      };
      locations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          short_description: string | null;
          category_id: string | null;
          coordinates: unknown | null;
          address: string | null;
          phone: string | null;
          website: string | null;
          opening_hours: Json | null;
          average_rating: number;
          total_reviews: number;
          price_range: number | null;
          features: string[] | null;
          tips: string | null;
          best_time_to_visit: string | null;
          created_by: string | null;
          is_featured: boolean;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          short_description?: string | null;
          category_id?: string | null;
          coordinates?: unknown | null;
          address?: string | null;
          phone?: string | null;
          website?: string | null;
          opening_hours?: Json | null;
          average_rating?: number;
          total_reviews?: number;
          price_range?: number | null;
          features?: string[] | null;
          tips?: string | null;
          best_time_to_visit?: string | null;
          created_by?: string | null;
          is_featured?: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          short_description?: string | null;
          category_id?: string | null;
          coordinates?: unknown | null;
          address?: string | null;
          phone?: string | null;
          website?: string | null;
          opening_hours?: Json | null;
          average_rating?: number;
          total_reviews?: number;
          price_range?: number | null;
          features?: string[] | null;
          tips?: string | null;
          best_time_to_visit?: string | null;
          created_by?: string | null;
          is_featured?: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      reviews: {
        Row: {
          id: string;
          location_id: string;
          user_id: string;
          rating: number;
          title: string | null;
          comment: string;
          visit_date: string | null;
          helpful_count: number;
          is_verified: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          location_id: string;
          user_id: string;
          rating: number;
          title?: string | null;
          comment: string;
          visit_date?: string | null;
          helpful_count?: number;
          is_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          location_id?: string;
          user_id?: string;
          rating?: number;
          title?: string | null;
          comment?: string;
          visit_date?: string | null;
          helpful_count?: number;
          is_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      favorites: {
        Row: {
          id: string;
          user_id: string;
          location_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          location_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          location_id?: string;
          created_at?: string;
        };
      };
      location_images: {
        Row: {
          id: string;
          location_id: string;
          url: string;
          alt_text: string | null;
          caption: string | null;
          photographer_credit: string | null;
          is_primary: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          location_id: string;
          url: string;
          alt_text?: string | null;
          caption?: string | null;
          photographer_credit?: string | null;
          is_primary?: boolean;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          location_id?: string;
          url?: string;
          alt_text?: string | null;
          caption?: string | null;
          photographer_credit?: string | null;
          is_primary?: boolean;
          sort_order?: number;
          created_at?: string;
        };
      };
    };
    Views: {
      location_details: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          category_name: string | null;
          category_icon: string | null;
          average_rating: number;
          total_reviews: number;
          images: Json;
        };
      };
    };
    Functions: {
      get_nearby_locations: {
        Args: {
          user_lat: number;
          user_lng: number;
          radius_km?: number;
          category_filter?: string;
        };
        Returns: {
          id: string;
          name: string;
          description: string;
          category_name: string;
          distance_km: number;
          average_rating: number;
          total_reviews: number;
        }[];
      };
    };
    Enums: {};
    CompositeTypes: {};
  };
}

type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];