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
  activeSeriesId: number | null;
  activeAttemptId: number | null;
  selectedPlanId: number | null;

  // Actions
  setView: (view: ViewState) => void;
  toggleAuthModal: (isOpen: boolean) => void;
  login: (user: User) => void;
  logout: () => void;
  updateUser: (updatedData: Partial<User>) => void;
  openSeriesSelection: (module: ModuleType) => void;
  selectSeries: (seriesId: number) => void;
  startExam: (module: ModuleType) => void;
  completeExam: () => void;
  upgradeUser: () => void;
  showCheckEmail: (email: string) => void;
  clearPendingEmail: () => void;
  viewAttemptDetail: (attemptId: number) => void;
  selectPlanForCheckout: (planId: number) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      view: 'LANDING',
      isAuthModalOpen: false,
      user: null,
      pendingVerificationEmail: null,
      activeModule: null,
      activeSeriesId: null,
      activeAttemptId: null,
      selectedPlanId: null,

      setView: (view) => set({ view }),

      toggleAuthModal: (isOpen) => set({ isAuthModalOpen: isOpen }),

      login: (user) => set({ user, isAuthModalOpen: false, view: 'DASHBOARD', pendingVerificationEmail: null }),

      logout: () => {
        tokenStorage.remove();
        localStorage.removeItem('auth-storage');
        set({ user: null, view: 'LANDING', activeModule: null, activeSeriesId: null, activeAttemptId: null, pendingVerificationEmail: null });
      },

      updateUser: (updatedData) => set((state) => ({
        user: state.user ? { ...state.user, ...updatedData } : null,
        view: 'PROFILE'
      })),

      openSeriesSelection: (module) => set({ activeModule: module, view: 'SERIES_SELECTION' }),

      selectSeries: (seriesId) => set({ activeSeriesId: seriesId, view: 'EXAM_RUNNER' }),

      startExam: (module) => set({ activeModule: module, view: 'EXAM_RUNNER' }),

      completeExam: () => set({ view: 'RESULTS' }),

      upgradeUser: () => set((state) => ({
        user: state.user ? { ...state.user, isPremium: true, subscriptionPlan: 'monthly' } : null,
        view: 'DASHBOARD'
      })),

      showCheckEmail: (email) => set({ pendingVerificationEmail: email, view: 'CHECK_EMAIL', isAuthModalOpen: false }),

      clearPendingEmail: () => set({ pendingVerificationEmail: null, view: 'LANDING' }),

      viewAttemptDetail: (attemptId) => set({ activeAttemptId: attemptId, view: 'ATTEMPT_DETAIL' }),

      selectPlanForCheckout: (planId) => set({ selectedPlanId: planId, view: 'CHECKOUT' }),
    }),
    {
      name: 'tcf-storage',
      partialize: (state) => ({ user: state.user }),
    }
  )
);