import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ViewState, User, ModuleType } from '../types';
import { tokenStorage } from '../services/api';

interface AppState {
  // UI State
  view: ViewState;
  isAuthModalOpen: boolean;

  // User State
  user: User | null;

  // Email verification
  pendingVerificationEmail: string | null;

  // Exam State
  activeModule: ModuleType | null;

  // Actions
  setView: (view: ViewState) => void;
  toggleAuthModal: (isOpen: boolean) => void;
  login: (user: User) => void;
  logout: () => void;
  updateUser: (updatedData: Partial<User>) => void;
  openSeriesSelection: (module: ModuleType) => void;
  startExam: (module: ModuleType) => void;
  completeExam: () => void;
  upgradeUser: () => void;
  showCheckEmail: (email: string) => void;
  clearPendingEmail: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      view: 'LANDING',
      isAuthModalOpen: false,
      user: null,
      pendingVerificationEmail: null,
      activeModule: null,

      setView: (view) => set({ view }),

      toggleAuthModal: (isOpen) => set({ isAuthModalOpen: isOpen }),

      login: (user) => set({ user, isAuthModalOpen: false, view: 'DASHBOARD', pendingVerificationEmail: null }),

      logout: () => {
        tokenStorage.remove();
        localStorage.removeItem('auth-storage');
        set({ user: null, view: 'LANDING', activeModule: null, pendingVerificationEmail: null });
      },

      updateUser: (updatedData) => set((state) => ({
        user: state.user ? { ...state.user, ...updatedData } : null,
        view: 'PROFILE'
      })),

      openSeriesSelection: (module) => set({ activeModule: module, view: 'SERIES_SELECTION' }),

      startExam: (module) => set({ activeModule: module, view: 'EXAM_RUNNER' }),

      completeExam: () => set({ view: 'RESULTS' }),

      upgradeUser: () => set((state) => ({
        user: state.user ? { ...state.user, isPremium: true, subscriptionPlan: 'monthly' } : null,
        view: 'DASHBOARD'
      })),

      showCheckEmail: (email) => set({ pendingVerificationEmail: email, view: 'CHECK_EMAIL', isAuthModalOpen: false }),

      clearPendingEmail: () => set({ pendingVerificationEmail: null, view: 'LANDING' }),
    }),
    {
      name: 'tcf-storage',
      partialize: (state) => ({ user: state.user }),
    }
  )
);