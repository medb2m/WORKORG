import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  initAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isInitialized: false,
      
      setAuth: (user, token) => {
        set({ user, token, isAuthenticated: true, isInitialized: true });
      },
      
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
      },
      
      initAuth: () => {
        // Check if we have stored auth data
        const state = get();
        if (state.token && state.user) {
          set({ isAuthenticated: true, isInitialized: true });
        } else {
          set({ isInitialized: true });
        }
      },
    }),
    {
      name: 'auth-storage', // name of item in localStorage
      storage: createJSONStorage(() => localStorage),
      partialSave: true,
    }
  )
);

