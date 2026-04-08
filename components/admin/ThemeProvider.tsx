'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = 'neurocare-admin-theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark');
  const [mounted, setMounted] = useState(false);

  // On mount, read preference from localStorage and apply class
  useEffect(() => {
    const stored = (typeof window !== 'undefined'
      ? (localStorage.getItem(STORAGE_KEY) as Theme | null)
      : null);
    const initial: Theme = stored ?? 'dark';
    setThemeState(initial);
    setMounted(true);
  }, []);

  // Apply theme class to <html> whenever it changes
  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // ignore quota / privacy mode errors
    }
  }, [theme, mounted]);

  const setTheme = (t: Theme) => setThemeState(t);
  const toggle = () => setThemeState((t) => (t === 'dark' ? 'light' : 'dark'));

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useAdminTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    // Safe fallback during SSR / outside provider — avoids hard crashes
    return {
      theme: 'dark',
      setTheme: () => {},
      toggle: () => {},
    };
  }
  return ctx;
}
