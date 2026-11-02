'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useSyncExternalStore } from 'react';
import {
  LanguageCode,
  TranslationSchema,
  translations,
  DEFAULT_LANGUAGE,
  SUPPORTED_LANGUAGES,
} from '@/locales';
import { translate, formatCurrency as formatCurr, formatDate as formatDt } from './i18n';
import { OWNER_PLACEHOLDERS, OwnerPlaceholders } from '@/data/about';

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  formatCurrency: (amount: number | string) => string;
  formatDate: (dateStr: string, options?: Intl.DateTimeFormatOptions) => string;
  rawDict: TranslationSchema;
  owner: OwnerPlaceholders;
  supportedLanguages: typeof SUPPORTED_LANGUAGES;
}

const LanguageContext = createContext<LanguageContextType>({
  language: DEFAULT_LANGUAGE,
  setLanguage: () => {},
  t: (key: string, params?: Record<string, string | number>) => translate(DEFAULT_LANGUAGE, key, params),
  formatCurrency: (amount: number | string) => formatCurr(amount, DEFAULT_LANGUAGE),
  formatDate: (dateStr: string) => formatDt(dateStr, DEFAULT_LANGUAGE),
  rawDict: translations[DEFAULT_LANGUAGE],
  owner: OWNER_PLACEHOLDERS,
  supportedLanguages: SUPPORTED_LANGUAGES,
});

function subscribeLanguage(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('storage', callback);
  window.addEventListener('hawi_language_change', callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener('hawi_language_change', callback);
  };
}

function getLanguageSnapshot(): LanguageCode {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE;
  try {
    const saved = localStorage.getItem('hawi_language') as LanguageCode;
    if (saved && (saved === 'en' || saved === 'om' || saved === 'am')) {
      return saved;
    }
  } catch {
    // Ignore localStorage access restrictions
  }
  return DEFAULT_LANGUAGE;
}

function getLanguageServerSnapshot(): LanguageCode {
  return DEFAULT_LANGUAGE;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const language = useSyncExternalStore(
    subscribeLanguage,
    getLanguageSnapshot,
    getLanguageServerSnapshot
  );

  const setLanguage = useCallback((lang: LanguageCode) => {
    try {
      localStorage.setItem('hawi_language', lang);
      window.dispatchEvent(new Event('hawi_language_change'));
    } catch {
      // Ignore localStorage access restrictions
    }
  }, []);

  // Update HTML lang attribute, document title, and meta description dynamically
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
      const dict = translations[language] || translations[DEFAULT_LANGUAGE];
      if (dict?.meta?.title) {
        document.title = dict.meta.title;
      }
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc && dict?.meta?.description) {
        metaDesc.setAttribute('content', dict.meta.description);
      }
    }
  }, [language]);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) => {
      return translate(language, key, params);
    },
    [language]
  );

  const formatCurrency = useCallback(
    (amount: number | string) => {
      return formatCurr(amount, language);
    },
    [language]
  );

  const formatDate = useCallback(
    (dateStr: string, options?: Intl.DateTimeFormatOptions) => {
      return formatDt(dateStr, language, options);
    },
    [language]
  );

  const rawDict = useMemo(() => {
    return translations[language] || translations[DEFAULT_LANGUAGE];
  }, [language]);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t,
      formatCurrency,
      formatDate,
      rawDict,
      owner: OWNER_PLACEHOLDERS,
      supportedLanguages: SUPPORTED_LANGUAGES,
    }),
    [language, setLanguage, t, formatCurrency, formatDate, rawDict]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
