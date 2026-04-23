import { create } from 'zustand';
import { supabase } from '../services/supabaseClient';

export const useAuthStore = create((set) => ({
  user: null,
  session: null,
  loading: true,

  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),
  setLoading: (loading) => set({ loading }),

  // Helper inside the store to check auth status initially
  initializeAuth: async () => {
    if (!supabase) {
      set({ loading: false });
      return;
    }

    try {
      // Get current session
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error fetching session:', error.message);
      }

      set({ 
        session: session, 
        user: session?.user || null,
      });

      // Subscribe to auth state changes
      supabase.auth.onAuthStateChange((_event, newSession) => {
        set({ 
          session: newSession, 
          user: newSession?.user || null 
        });
      });
    } catch (err) {
      console.error('Auth initialization failed:', err);
    } finally {
      set({ loading: false });
    }
  },

  signOut: async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  }
}));
