'use client';

import React from 'react';
import { WifiOff, RotateCcw } from 'lucide-react';
import { usePWA } from '@/lib/use-pwa';
import { useLanguage } from '@/lib/language-context';
import { useIsMounted } from '@/lib/use-mounted';

export default function OfflineBanner() {
  const isMounted = useIsMounted();
  const { isOnline } = usePWA();
  const { language } = useLanguage();

  if (!isMounted || isOnline) return null;

  const messages = {
    en: 'You are currently offline. Showing cached content.',
    om: 'Yeroo ammaa toora irra hin jirtan. Qabiyyee olkaa\'ame agarsiisaa jira.',
    am: 'በአሁኑ ሰዓት ከመስመር ውጭ ነዎት። የተቀመጠ ይዘት እየታየ ነው።'
  };

  const retryText = {
    en: 'Retry',
    om: 'Irra Deebi\'i',
    am: 'እንደገና ይሞክሩ'
  };

  const handleRetry = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 left-4 right-4 md:left-6 md:right-auto md:max-w-md z-50 bg-[#1A140A] text-[#FAF7F2] border-2 border-amber-500/60 rounded-2xl p-3.5 shadow-2xl flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-3"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
          <WifiOff className="w-4 h-4 animate-pulse" />
        </div>
        <p className="text-xs font-semibold leading-snug truncate">
          {messages[language] || messages.en}
        </p>
      </div>

      <button
        type="button"
        onClick={handleRetry}
        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 text-black hover:bg-amber-400 shrink-0 flex items-center gap-1 shadow-xs transition-colors"
      >
        <RotateCcw className="w-3 h-3" />
        <span>{retryText[language] || retryText.en}</span>
      </button>
    </div>
  );
}
