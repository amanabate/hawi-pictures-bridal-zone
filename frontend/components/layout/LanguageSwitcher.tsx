'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/lib/language-context';
import { LanguageCode } from '@/locales';
import { Globe, ChevronDown } from 'lucide-react';

const LANGUAGES: Array<{ code: LanguageCode; label: string; short: string }> = [
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'om', label: 'Afaan Oromoo', short: 'OM' },
  { code: 'am', label: 'አማርኛ (Amharic)', short: 'AM' },
];

export default function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const currentLanguage = LANGUAGES.find((lang) => lang.code === language) || LANGUAGES[0];

  return (
    <div className="relative z-50" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2 rounded-full bg-[var(--card-subtle)] hover:bg-[var(--border)] border border-[var(--border)] transition-colors flex-shrink-0"
        aria-label="Select language"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Globe className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[var(--gold)]" />
        {!compact && (
          <>
            <span className="text-xs sm:text-sm font-bold text-[var(--text)]">
              {currentLanguage.short}
            </span>
            <ChevronDown className={`w-3.5 h-3.5 text-[var(--text-muted)] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-2xl z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2">
          <div className="py-1">
            {LANGUAGES.map((lang) => {
              const isActive = language === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => {
                    setLanguage(lang.code);
                    setIsOpen(false);
                  }}
                  className={`w-full px-4 py-2.5 text-left flex items-center justify-between gap-3 transition-colors ${
                    isActive
                      ? 'bg-[var(--gold)]/10 text-[var(--gold)] font-bold'
                      : 'text-[var(--text)] hover:bg-[var(--card-subtle)]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold w-6">{lang.short}</span>
                    <span className="text-sm">{lang.label}</span>
                  </div>
                  {isActive && (
                    <div className="w-2 h-2 rounded-full bg-[var(--gold)]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
