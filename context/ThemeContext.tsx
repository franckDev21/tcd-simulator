import React, { createContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    // 1. Check LocalStorage (User preference overrides system)
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('ui-theme') as Theme;
      if (savedTheme === 'light' || savedTheme === 'dark') {
        return savedTheme;
      }
      
      // 2. Check System Preference
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    }
    return 'light'; // Default fallback
  });

  // Apply theme to HTML element and Persist to LocalStorage
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('ui-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setThemeState(prev => {
      const newTheme = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('ui-theme', newTheme); // Explicit User Action
      return newTheme;
    });
  };
  
  // Real-time System Listener Implementation
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleSystemChange = (e: MediaQueryListEvent) => {
      // If NO user preference is saved in localStorage, follow the system
      if (!localStorage.getItem('ui-theme')) {
        setThemeState(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleSystemChange);
    return () => mediaQuery.removeEventListener('change', handleSystemChange);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};