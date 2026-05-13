'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';
import { api } from '@/lib/api';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  _hasHydrated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    phone?: string;
  }) => Promise<{ user: User; token: string; is_email_verified: boolean } | void>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      _hasHydrated: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const result = await api.login(email, password);
          set({ user: result.user, isAuthenticated: true });
        } finally {
          set({ isLoading: false });
        }
      },

      register: async (data) => {
        set({ isLoading: true });
        try {
          const result = await api.register(data);
          set({ user: result.user, isAuthenticated: true });
          return result; // is_email_verified bilgisini çağırana ilet
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await api.logout();
        } catch {
          // token might be expired, still clear state
        } finally {
          Cookies.remove('auth_token');
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      },

      fetchUser: async () => {
        const token = Cookies.get('auth_token');
        if (!token) {
          set({ isAuthenticated: false, user: null });
          return;
        }
        set({ isLoading: true });
        try {
          const user = await api.getUser();
          set({ user, isAuthenticated: true });
        } catch {
          Cookies.remove('auth_token');
          set({ user: null, isAuthenticated: false });
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
      skipHydration: true,
      onRehydrateStorage: () => (_state, error) => {
        if (!error) useAuthStore.setState({ _hasHydrated: true });
      },
    }
  )
);
