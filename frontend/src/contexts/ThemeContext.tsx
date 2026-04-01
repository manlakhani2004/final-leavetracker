'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type ThemeName = 
  | 'default' 
  | 'ocean' 
  | 'forest' 
  | 'sunset' 
  | 'rose' 
  | 'dark' 
  | 'midnight' 
  | 'lavender';

export interface ThemeOption {
  name: ThemeName;
  label: string;
  description: string;
  preview: {
    primary: string;
    secondary: string;
    accent: string;
    bg: string;
  };
}

export const themes: ThemeOption[] = [
  {
    name: 'default',
    label: 'Indigo',
    description: 'Clean and professional',
    preview: { primary: '#6366f1', secondary: '#8b5cf6', accent: '#a78bfa', bg: '#f8fafc' },
  },
  {
    name: 'ocean',
    label: 'Ocean Blue',
    description: 'Cool and calming',
    preview: { primary: '#0ea5e9', secondary: '#06b6d4', accent: '#22d3ee', bg: '#f0f9ff' },
  },
  {
    name: 'forest',
    label: 'Forest Green',
    description: 'Natural and fresh',
    preview: { primary: '#10b981', secondary: '#059669', accent: '#34d399', bg: '#f0fdf4' },
  },
  {
    name: 'sunset',
    label: 'Sunset Orange',
    description: 'Warm and energetic',
    preview: { primary: '#f97316', secondary: '#ef4444', accent: '#fb923c', bg: '#fff7ed' },
  },
  {
    name: 'rose',
    label: 'Rose Pink',
    description: 'Elegant and modern',
    preview: { primary: '#ec4899', secondary: '#d946ef', accent: '#f472b6', bg: '#fdf2f8' },
  },
  {
    name: 'lavender',
    label: 'Lavender',
    description: 'Soft and serene',
    preview: { primary: '#8b5cf6', secondary: '#7c3aed', accent: '#a78bfa', bg: '#f5f3ff' },
  },
  {
    name: 'dark',
    label: 'Dark Mode',
    description: 'Easy on the eyes',
    preview: { primary: '#818cf8', secondary: '#6366f1', accent: '#a78bfa', bg: '#0f172a' },
  },
  {
    name: 'midnight',
    label: 'Midnight',
    description: 'Deep and immersive',
    preview: { primary: '#38bdf8', secondary: '#0ea5e9', accent: '#7dd3fc', bg: '#020617' },
  },
];

interface ThemeContextType {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  themeOption: ThemeOption;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'leave-tracker-theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>('default');
  const [mounted, setMounted] = useState(false);

  // Load saved theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as ThemeName | null;
    if (savedTheme && themes.some(t => t.name === savedTheme)) {
      setThemeState(savedTheme);
    }
    setMounted(true);
  }, []);

  // Apply theme class to document
  useEffect(() => {
    if (!mounted) return;
    
    const root = document.documentElement;
    // Remove all theme classes
    themes.forEach(t => root.classList.remove(`theme-${t.name}`));
    // Add current theme class
    if (theme !== 'default') {
      root.classList.add(`theme-${theme}`);
    }
  }, [theme, mounted]);

  const setTheme = useCallback((newTheme: ThemeName) => {
    setThemeState(newTheme);
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
  }, []);

  const themeOption = themes.find(t => t.name === theme) || themes[0];

  // Prevent flash of wrong theme
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themeOption }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
