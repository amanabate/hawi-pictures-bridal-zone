'use client';

import React from 'react';
import { useLanguage } from '@/lib/language-context';
import { LanguageCode } from '@/locales';
import { Globe } from 'lucide-react';

const LANGUAGES: Array<{ code: LanguageCode; label: string; short: string }> = [
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'om', label: 'Afaan Oromoo', short: 'OM' },
  { code: 'am', label: 'አማርኛ (Amharic)', short: 'AM' },
];

export default function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { language, setLanguage } = useLanguage();

  return (
    <div
      className="inline-flex items-center gap-0.5 sm:gap-1 p-0.5 sm:p-1 rounded-full bg-[var(--card-subtle)] border border-[var(--border)] text-xs font-medium flex-shrink-0"
      role="group"
      aria-label="Select language"
    >
      {!compact && (
        <span className="pl-1 sm:pl-1.5 pr-0.5 text-[var(--gold)] flex items-center flex-shrink-0">
          <Globe className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
        </span>
      )}
      {LANGUAGES.map((item) => {
        const isActive = language === item.code;
        return (
          <button
            key={item.code}
            type="button"
            onClick={() => setLanguage(item.code)}
            title={item.label}
            className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-bold uppercase transition-all whitespace-nowrap ${
              isActive
                ? 'bg-gradient-to-r from-[var(--gold)] to-[var(--gold-dark)] text-[#141008] shadow-sm scale-105'
                : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface)] hover:scale-105'
            }`}
          >
            {item.short}
          </button>
        );
      })}
    </div>
  );
}
