import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthUser, AuthState } from '../types/auth';
import authService from '../services/authService';
import { tokenStorage } from '../services/api';

interface AuthActions {
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, phone: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  forgotPassword: (email: string) => Promise<string>;
  resetPassword: (token: string, email: string, password: string) => Promise<string>;
  verifyEmail: (token: string) => Promise<string>;
  resendVerification: () => Promise<string>;
  clearError: () => void;
  setUser: (user: AuthUser | null) => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: false,
      error: null,

      initialize: async () => {
        const token = tokenStorage.get();
        if (!token) {
          set({ isInitialized: true, isAuthenticated: false, user: null });
          return;
        }

        set({ isLoading: true });
        try {
          const user = await authService.getUser();
          set({
            user,
            token,
            isAuthenticated: true,
            isInitialized: true,
            isLoading: false,
          });
        } catch {
          tokenStorage.remove();
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isInitialized: true,
            isLoading: false,
          });
        }
      },

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.login({ email, password });
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Erreur de connexion';
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      register: async (name: string, email: string, phone: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.register({
            name,
            email,
            phone,
            password,
            password_confirmation: password,
          });
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : "Erreur d'inscription";
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await authService.logout();
        } finally {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      logoutAll: async () => {
        set({ isLoading: true });
        try {
          await authService.logoutAll();
        } finally {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      forgotPassword: async (email: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.forgotPassword({ email });
          set({ isLoading: false });
          return response.message;
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Erreur';
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      resetPassword: async (token: string, email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.resetPassword({
            token,
            email,
            password,
            password_confirmation: password,
          });
          set({ isLoading: false });
          return response.message;
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Erreur';
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      verifyEmail: async (token: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.verifyEmail(token);
          set({ isLoading: false });
          return response.message;
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Erreur';
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      resendVerification: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.resendVerification();
          set({ isLoading: false });
          return response.message;
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Erreur';
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      clearError: () => set({ error: null }),

      setUser: (user: AuthUser | null) => set({ user }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
