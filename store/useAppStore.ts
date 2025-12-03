import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ViewState, User, ModuleType } from '../types';

interface AppState {
  // UI State
  view: ViewState;
  isAuthModalOpen: boolean;
  
  // User State
  user: User | null;
  
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
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      view: 'LANDING',
      isAuthModalOpen: false,
      user: null,
      activeModule: null,

      setView: (view) => set({ view }),
      
      toggleAuthModal: (isOpen) => set({ isAuthModalOpen: isOpen }),

      login: (user) => set({ user, isAuthModalOpen: false, view: 'DASHBOARD' }),
      
      logout: () => set({ user: null, view: 'LANDING', activeModule: null }),

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
      }))
    }),
    {
      name: 'tcf-storage', 
      partialize: (state) => ({ user: state.user }), 
    }
  )
);