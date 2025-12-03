import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ViewState, User, ModuleType } from '../types';

interface AppState {
  // UI State
  view: ViewState;
  theme: 'dark' | 'light';
  isAuthModalOpen: boolean;
  
  // User State
  user: User | null;
  
  // Exam State
  activeModule: ModuleType | null;

  // Actions
  setView: (view: ViewState) => void;
  toggleTheme: () => void;
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
      // Default to system preference if window is available, otherwise light
      theme: (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light',
      isAuthModalOpen: false,
      user: null,
      activeModule: null,

      setView: (view) => set({ view }),
      
      toggleTheme: () => set((state) => {
        const newTheme = state.theme === 'dark' ? 'light' : 'dark';
        // Update HTML class for Tailwind
        if (newTheme === 'dark') {
          document.documentElement.classList.add('dark');
          document.documentElement.classList.remove('light');
        } else {
          document.documentElement.classList.remove('dark');
          document.documentElement.classList.add('light');
        }
        return { theme: newTheme };
      }),

      toggleAuthModal: (isOpen) => set({ isAuthModalOpen: isOpen }),

      login: (user) => set({ user, isAuthModalOpen: false, view: 'DASHBOARD' }),
      
      logout: () => set({ user: null, view: 'LANDING', activeModule: null }),

      updateUser: (updatedData) => set((state) => ({
        user: state.user ? { ...state.user, ...updatedData } : null,
        view: 'PROFILE' // Return to profile after update
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
      name: 'tcf-storage', // unique name for localStorage
      partialize: (state) => ({ user: state.user, theme: state.theme }), // Only persist user and theme
    }
  )
);