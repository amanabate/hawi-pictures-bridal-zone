'use client';

import React, { useState } from 'react';
import { Download, Sparkles, X, Share2, PlusSquare } from 'lucide-react';
import { usePWA } from '@/lib/use-pwa';
import { useLanguage } from '@/lib/language-context';

interface PWAInstallButtonProps {
  variant?: 'footer' | 'navbar' | 'compact';
  className?: string;
}

export default function PWAInstallButton({ variant = 'footer', className = '' }: PWAInstallButtonProps) {
  const { isInstallable, isInstalled, isIOS, installApp } = usePWA();
  const { language } = useLanguage();
  const [showIOSModal, setShowIOSModal] = useState(false);

  // Requirement: Hide footer install button when app is already installed (display-mode: standalone)
  if (isInstalled) {
    return null;
  }

  const buttonLabels = {
    en: 'Install Hawi App',
    om: 'App Hawi Fe\'adhaa',
    am: 'የሃዊ መተግበሪያን ጫን'
  };

  const handleInstallClick = async () => {
    if (isInstallable) {
      await installApp();
    } else {
      setShowIOSModal(true);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleInstallClick}
        className={
          className ||
          (variant === 'footer'
            ? 'px-4 py-2 rounded-xl text-xs font-bold text-black bg-gradient-to-r from-[var(--gold)] to-[var(--gold-dark)] hover:brightness-105 transition-all flex items-center gap-2 shadow-sm'
            : 'px-3 py-1.5 rounded-lg text-xs font-semibold text-[var(--gold)] hover:bg-[var(--card-subtle)] border border-[var(--gold)]/30 transition-all flex items-center gap-1.5')
        }
        title="Install Hawi Progressive Web App"
      >
        <Download className="w-3.5 h-3.5 shrink-0" />
        <span>{buttonLabels[language] || buttonLabels.en}</span>
      </button>

      {/* iOS Safari / Manual Installation Modal */}
      {showIOSModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-[var(--overlay-bg)] backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setShowIOSModal(false)}
        >
          <div
            className="bg-[var(--surface)] text-[var(--text)] border-2 border-[var(--gold)]/40 rounded-3xl p-6 sm:p-7 max-w-sm w-full space-y-5 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[var(--gold)]/10 text-[var(--gold)] flex items-center justify-center border border-[var(--gold)]/30">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold">
                    {language === 'om' ? 'Bilbila Keessan Irratti Fe\'adhaa' : language === 'am' ? 'በስልክዎ ላይ ይጫኑ' : 'Install Hawi on Your Device'}
                  </h3>
                  <p className="text-[11px] text-[var(--gold-text)] font-semibold">
                    {language === 'om' ? 'Qajeelfama Fe\'iinsaa' : language === 'am' ? 'የመጫኛ መመሪያ' : 'Add to Home Screen'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowIOSModal(false)}
                className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Steps Guide */}
            <div className="space-y-3 text-xs bg-[var(--card-subtle)] p-4 rounded-2xl border border-[var(--border)]">
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-[var(--gold)] text-black font-bold flex items-center justify-center shrink-0 mt-0.5 text-[10px]">
                  1
                </div>
                <div className="leading-snug">
                  {language === 'om' ? (
                    <>Sarara Safari keessaa, mallattoo <strong className="text-[var(--gold-text)]">Share</strong> <Share2 className="w-3 h-3 inline-block text-sky-500 mx-0.5" /> tuqaa.</>
                  ) : language === 'am' ? (
                    <>በሳፋሪ መክፈቻ ላይ፣ <strong className="text-[var(--gold-text)]">የማጋሪያ ምልክቱን (Share)</strong> <Share2 className="w-3 h-3 inline-block text-sky-500 mx-0.5" /> ይጫኑ።</>
                  ) : (
                    <>In Safari or Chrome menu, tap the <strong className="text-[var(--gold-text)]">Share button</strong> <Share2 className="w-3 h-3 inline-block text-sky-500 mx-0.5" />.</>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-[var(--gold)] text-black font-bold flex items-center justify-center shrink-0 mt-0.5 text-[10px]">
                  2
                </div>
                <div className="leading-snug">
                  {language === 'om' ? (
                    <>Gadi siqsaatii filannoo <strong className="text-[var(--gold-text)]">Add to Home Screen</strong> <PlusSquare className="w-3 h-3 inline-block text-emerald-500 mx-0.5" /> filadhaa.</>
                  ) : language === 'am' ? (
                    <>ወደ ታች ዝቅ ብለው <strong className="text-[var(--gold-text)]">Add to Home Screen</strong> <PlusSquare className="w-3 h-3 inline-block text-emerald-500 mx-0.5" /> የሚለውን ይምረጡ።</>
                  ) : (
                    <>Scroll down and select <strong className="text-[var(--gold-text)]">Add to Home Screen</strong> <PlusSquare className="w-3 h-3 inline-block text-emerald-500 mx-0.5" />.</>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-[var(--gold)] text-black font-bold flex items-center justify-center shrink-0 mt-0.5 text-[10px]">
                  3
                </div>
                <div className="leading-snug">
                  {language === 'om' ? (
                    <>Mirga gubbaatti <strong className="text-[var(--text)]">Add</strong> tuqaa. Hawi amma fe&apos;ameera!</>
                  ) : language === 'am' ? (
                    <>በላይኛው ቀኝ ጥግ ላይ <strong className="text-[var(--text)]">Add</strong> የሚለውን ይጫኑ። መተግበሪያው ተጭኗል!</>
                  ) : (
                    <>Tap <strong className="text-[var(--text)]">Add</strong> in the top right corner. Hawi is now installed!</>
                  )}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowIOSModal(false)}
              className="w-full py-2.5 rounded-xl bg-[var(--gold)] text-black font-bold text-xs hover:opacity-90 transition-opacity"
            >
              {language === 'om' ? 'Hubadheera' : language === 'am' ? 'ተረድቻለሁ' : 'Got it'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
