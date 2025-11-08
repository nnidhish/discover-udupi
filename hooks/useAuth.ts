// hooks/useAuth.ts
'use client';
import { useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { createSupabaseClient, profileService } from '@/lib/supabase';
import toast from 'react-hot-toast';

export interface Profile {
  id: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  is_verified: boolean;
  is_local_guide: boolean;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  const supabase = createSupabaseClient();

  useEffect(() => {
    let mounted = true;

    // Get initial session
    const getInitialSession = async () => {
      try {
        // Force refresh session to get latest from server
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          if (mounted) {
            setLoading(false);
            setInitialized(true);
          }
          return;
        }

        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            await fetchProfile(session.user.id);
          }
        }
      } catch (error) {
        console.error('Session initialization error:', error);
      } finally {
        if (mounted) {
          setLoading(false);
          setInitialized(true);
        }
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        console.log('Auth state changed:', event, session?.user?.email);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchProfile(session.user.id);
          if (event === 'SIGNED_IN') {
            toast.success('Welcome back!');
          }
        } else {
          setProfile(null);
          if (event === 'SIGNED_OUT') {
            toast.success('Signed out successfully');
          }
        }
        
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await profileService.getProfile(userId);

      if (error) {
        // Profile doesn't exist, create one
        if (error.code === 'PGRST116') {
          const { data: userData } = await supabase.auth.getUser();
          if (userData.user) {
            const newProfile = {
              full_name: userData.user.user_metadata?.full_name || null,
              avatar_url: userData.user.user_metadata?.avatar_url || null,
            };
            
            const { data: createdProfile, error: createError } = await profileService.createProfile(userId, newProfile);
            
            if (!createError && createdProfile) {
              setProfile(createdProfile[0] as Profile);
            }
          }
        } else {
          console.error('Error fetching profile:', error);
        }
      } else {
        setProfile(data as Profile);
      }
    } catch (error) {
      console.error('Profile fetch error:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
      }

      return { data, error };
    } catch (error) {
      const message = 'An unexpected error occurred';
      toast.error(message);
      return { data: null, error: { message } };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        toast.error(error.message);
      } else if (data.user && !data.session) {
        toast.success('Check your email to confirm your account!');
      }

      return { data, error };
    } catch (error) {
      const message = 'An unexpected error occurred';
      toast.error(message);
      return { data: null, error: { message } };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        toast.error(error.message);
      }
      
      return { error };
    } catch (error) {
      const message = 'Error signing out';
      toast.error(message);
      return { error: { message } };
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: { message: 'Not authenticated' } };

    try {
      const { data, error } = await profileService.updateProfile(user.id, updates);

      if (error) {
        toast.error('Failed to update profile');
      } else {
        setProfile(prev => prev ? { ...prev, ...updates } : null);
        toast.success('Profile updated successfully');
      }

      return { data, error };
    } catch (error) {
      toast.error('Failed to update profile');
      return { error: { message: 'Failed to update profile' } };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

      return { data, error };
    } catch (error) {
      toast.error('Failed to sign in with Google');
      return { error: { message: 'Failed to sign in with Google' } };
    }
  };

  return {
    user,
    profile,
    session,
    loading,
    initialized,
    signIn,
    signUp,
    signOut,
    updateProfile,
    signInWithGoogle,
    isAuthenticated: !!user,
  };
};