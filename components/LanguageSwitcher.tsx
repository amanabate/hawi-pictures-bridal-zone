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
      className="inline-flex items-center gap-1 p-1 rounded-full bg-[var(--card-subtle)] border border-[var(--border)] text-xs font-medium"
      role="group"
      aria-label="Select language"
    >
      {!compact && (
        <span className="pl-1.5 pr-0.5 text-[var(--gold)] flex items-center">
          <Globe className="w-3.5 h-3.5" />
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
            className={`px-2 py-1 rounded-full text-[11px] font-bold uppercase transition-all ${
              isActive
                ? 'bg-gradient-to-r from-[var(--gold)] to-[var(--gold-dark)] text-[#141008] shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface)]'
            }`}
          >
            {item.short}
          </button>
        );
      })}
    </div>
  );
}
