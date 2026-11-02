'use client';

import React from 'react';
import { Sparkles, RotateCcw } from 'lucide-react';
import { usePWA } from '@/lib/use-pwa';
import { useLanguage } from '@/lib/language-context';
import { useIsMounted } from '@/lib/use-mounted';

export default function PWAUpdateToast() {
  const isMounted = useIsMounted();
  const { hasUpdate, applyUpdate } = usePWA();
  const { language } = useLanguage();

  if (!isMounted || !hasUpdate) return null;

  const messages = {
    en: 'New version available, refresh',
    om: 'Maxxansi haaraa jira, haaressaa',
    am: 'አዲስ ስሪት ዝግጁ ነው፣ ያድሱ'
  };

  const buttonText = {
    en: 'Refresh',
    om: 'Haaressee',
    am: 'አድስ'
  };

  return (
    <div
      role="alert"
      className="fixed top-5 left-1/2 -translate-x-1/2 z-50 max-w-md w-[92%] sm:w-auto bg-[var(--surface)] text-[var(--text)] border-2 border-[var(--gold)] px-4 py-3 rounded-2xl shadow-2xl flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top-3"
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-8 h-8 rounded-full bg-[var(--gold)]/20 text-[var(--gold)] flex items-center justify-center shrink-0">
          <Sparkles className="w-4 h-4" />
        </div>
        <span className="text-xs font-semibold leading-tight">
          {messages[language] || messages.en}
        </span>
      </div>

      <button
        type="button"
        onClick={applyUpdate}
        className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[var(--gold)] to-[var(--gold-dark)] text-black hover:brightness-105 shrink-0 flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        <span>{buttonText[language] || buttonText.en}</span>
      </button>
    </div>
  );
}
