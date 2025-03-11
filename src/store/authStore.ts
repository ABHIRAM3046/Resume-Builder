import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  signIn: async (email, password) => {
    const { error, data } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    set({ user: data.user });
  },
  signUp: async (email, password) => {
    try {
      // First try to sign up
      const { error: signUpError, data: signUpData } = await supabase.auth.signUp({
        email,
        password,
      });

      // If user already exists, try to sign in instead
      if (signUpError?.message === 'User already registered') {
        const { error: signInError, data: signInData } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
        set({ user: signInData.user });
        return;
      }

      // If there was a different error during signup, throw it
      if (signUpError) throw signUpError;

      // If signup was successful, set the user
      set({ user: signUpData.user });
    } catch (error) {
      throw error;
    }
  },
  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null });
  },
  checkAuth: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    set({ user: session?.user ?? null, loading: false });
  },
}));