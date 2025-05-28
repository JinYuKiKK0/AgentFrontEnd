// src/stores/authStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User } from '@/types/auth';

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  setAuthDetails: (token: string, user: User) => void;
  clearAuthDetails: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      setAuthDetails: (token, user) => {
        set({
          token,
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      },
      clearAuthDetails: () => {
        set({
          token: null,
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      },
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error, isLoading: false }),
    }),
    {
      name: 'auth-storage', // Name of the item in local storage
      storage: createJSONStorage(() => localStorage), // Use localStorage for persistence
      partialize: (state) => ({ token: state.token, user: state.user, isAuthenticated: state.isAuthenticated }), // Only persist token, user and isAuthenticated status
    }
  )
);

// Selector to easily check if user is authenticated
export const selectIsAuthenticated = (state: AuthState) => state.isAuthenticated;

// Selector to get current user
export const selectCurrentUser = (state: AuthState) => state.user;

// Selector to get current token
export const selectAuthToken = (state: AuthState) => state.token;
