'use client';

import { useSyncExternalStore, useCallback } from 'react';

export const THEME_STORAGE_KEY = 'hawi_theme_preference';

export type Theme = 'light' | 'dark';

function getThemeSnapshot(): Theme {
  if (typeof window === 'undefined') return 'light';
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

function getServerSnapshot(): Theme {
  return 'light';
}

function subscribe(callback: () => void) {
  if (typeof window === 'undefined') return () => {};

  // 1. Storage event (multi-tab sync)
  const handleStorage = (e: StorageEvent) => {
    if (e.key === THEME_STORAGE_KEY) {
      if (e.newValue === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      callback();
    }
  };

  // 2. System theme preference changes if user hasn't set manual preference
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const handleMediaChange = (e: MediaQueryListEvent) => {
    const manual = localStorage.getItem(THEME_STORAGE_KEY);
    if (!manual) {
      if (e.matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      callback();
    }
  };

  // 3. Class mutation observer on <html> element
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.attributeName === 'class') {
        callback();
      }
    }
  });

  window.addEventListener('storage', handleStorage);
  mediaQuery.addEventListener('change', handleMediaChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

  return () => {
    window.removeEventListener('storage', handleStorage);
    mediaQuery.removeEventListener('change', handleMediaChange);
    observer.disconnect();
  };
}

// Client mount detection without triggering cascading setState in effect
const subscribeMount = () => () => {};
const getMountedSnapshot = () => true;
const getMountedServerSnapshot = () => false;

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getThemeSnapshot, getServerSnapshot);
  const mounted = useSyncExternalStore(subscribeMount, getMountedSnapshot, getMountedServerSnapshot);

  const toggleTheme = useCallback(() => {
    if (typeof window === 'undefined') return;

    const currentIsDark = document.documentElement.classList.contains('dark');
    const nextTheme: Theme = currentIsDark ? 'light' : 'dark';

    try {
      localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    } catch (e) {
      console.error('Error saving theme preference:', e);
    }

    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return { theme, toggleTheme, mounted };
}
