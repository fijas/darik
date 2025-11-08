'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

/**
 * Theme options:
 * - 'light': Force light mode
 * - 'dark': Force dark mode
 * - 'auto': Follow system preference
 */
export type Theme = 'light' | 'dark' | 'auto';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark'; // Actual theme being displayed
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'darik-theme';

/**
 * Theme Provider Component
 * Manages theme state and persistence in localStorage
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('auto');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  // Load theme from localStorage on mount
  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
    if (savedTheme && ['light', 'dark', 'auto'].includes(savedTheme)) {
      setThemeState(savedTheme);
    }
  }, []);

  // Apply theme to document and determine resolved theme
  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    let isDark = false;

    if (theme === 'auto') {
      // Remove manual classes and let CSS media query handle it
      root.classList.remove('light', 'dark');
      // Detect system preference
      isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    } else {
      // Apply manual theme class
      root.classList.remove('light', 'dark');
      root.classList.add(theme);
      isDark = theme === 'dark';
    }

    setResolvedTheme(isDark ? 'dark' : 'light');

    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', isDark ? '#0a0a0a' : '#3b82f6');
    }
  }, [theme, mounted]);

  // Listen to system theme changes when in auto mode
  useEffect(() => {
    if (theme !== 'auto') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setResolvedTheme(e.matches ? 'dark' : 'light');

      // Update meta theme-color
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', e.matches ? '#0a0a0a' : '#3b82f6');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
  };

  // Prevent flash of wrong theme on initial load
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook to access theme context
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
