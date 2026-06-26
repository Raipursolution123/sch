import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { STORAGE_KEYS } from '@constants/index';
import type { User } from '@app-types/auth';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  setUser: (user: User) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      setAuth: (user, accessToken, refreshToken) => {
        localStorage.setItem(STORAGE_KEYS.accessToken, accessToken);
        localStorage.setItem(STORAGE_KEYS.refreshToken, refreshToken);
        set({ user, isAuthenticated: true });
      },

      setUser: (user) => set({ user }),

      clearAuth: () => {
        localStorage.removeItem(STORAGE_KEYS.accessToken);
        localStorage.removeItem(STORAGE_KEYS.refreshToken);
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: 'school-erp-auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
