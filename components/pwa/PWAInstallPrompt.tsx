'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Download, Sparkles, X, Share2, PlusSquare, Smartphone } from 'lucide-react';
import { usePWA } from '@/lib/use-pwa';
import { useLanguage } from '@/lib/language-context';

export default function PWAInstallPrompt() {
  const { isInstallable, isInstalled, isPromptDismissed, installApp, dismissPrompt } = usePWA();
  const { language } = useLanguage();
  const [visible, setVisible] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // Show prompt after 7 seconds of browsing if not installed and not dismissed within last 14 days
  useEffect(() => {
    if (isInstalled || isPromptDismissed) {
      return;
    }

    const timer = setTimeout(() => {
      setVisible(true);
    }, 7000);

    return () => clearTimeout(timer);
  }, [isInstalled, isPromptDismissed]);

  if (!visible || isInstalled || isPromptDismissed) {
    return null;
  }

  const titles = {
    en: 'Install Hawi App',
    om: 'App Hawi Fe\'adhaa',
    am: 'የሃዊ መተግበሪያን ጫን'
  };

  const badges = {
    en: 'Fast & Offline Ready',
    om: 'Saffisaa & Tooraan Ala',
    am: 'ፈጣን እና ያለ ኢንተርኔት'
  };

  const descriptions = {
    en: 'Experience seamless wedding bookings, offline gallery viewing, and studio notifications right on your phone.',
    om: 'Qabannaa cidhaa salphaatti geggeessaa, galmee suuraa tooraan ala ilaalaa, fi beeksisa battalaa bilbila keessan irratti argadhaa.',
    am: 'የሰርግ ማስያዣን በቀላሉ ይፈጽሙ፣ ያለ ኢንተርኔት ፎቶዎችን ይመልከቱ፣ እንዲሁም ፈጣን ማሳወቂያዎችን በስልክዎ ላይ ያግኙ።'
  };

  const installBtnText = {
    en: 'Install App',
    om: 'App Fe\'i',
    am: 'መተግበሪያውን ጫን'
  };

  const notNowText = {
    en: 'Not Now (14 days)',
    om: 'Amma Miti',
    am: 'አሁን አይደለም'
  };

  const handleInstall = async () => {
    if (isInstallable) {
      const success = await installApp();
      if (success) {
        setVisible(false);
      }
    } else {
      setShowIOSGuide(true);
    }
  };

  const handleDismiss = () => {
    dismissPrompt();
    setVisible(false);
  };

  return (
    <>
      <aside
        aria-label="Install Hawi Progressive Web App"
        className="fixed bottom-5 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-40 bg-[var(--surface)] text-[var(--text)] border-2 border-[var(--gold)]/60 rounded-3xl p-5 sm:p-6 shadow-2xl animate-in fade-in slide-in-from-bottom-5 transition-colors duration-200"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#0B0803] border border-[var(--gold)]/50 p-1 flex items-center justify-center shrink-0 shadow-md">
              <Image
                src="/icon-192.png"
                alt="Hawi Logo"
                width={40}
                height={40}
                className="rounded-xl object-contain"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--gold-text)]">
                <Sparkles className="w-3 h-3 text-[var(--gold)]" />
                <span>{badges[language] || badges.en}</span>
              </div>
              <h3 className="font-serif text-lg font-bold text-[var(--text)] leading-tight">
                {titles[language] || titles.en}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDismiss}
            className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
            aria-label="Dismiss install prompt"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-[var(--text-muted)] leading-relaxed mt-2.5">
          {descriptions[language] || descriptions.en}
        </p>

        {/* Action Buttons */}
        <div className="mt-4 flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleInstall}
            className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold bg-gradient-to-r from-[var(--gold)] to-[var(--gold-dark)] text-black hover:brightness-105 flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{installBtnText[language] || installBtnText.en}</span>
          </button>

          <button
            type="button"
            onClick={handleDismiss}
            className="py-2.5 px-3.5 rounded-xl text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text)] border border-[var(--border)] bg-[var(--card-subtle)] hover:bg-[var(--surface)] transition-all"
          >
            {notNowText[language] || notNowText.en}
          </button>
        </div>
      </aside>

      {/* iOS Safari Guide Modal */}
      {showIOSGuide && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-[var(--overlay-bg)] backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setShowIOSGuide(false)}
        >
          <div
            className="bg-[var(--surface)] text-[var(--text)] border-2 border-[var(--gold)]/40 rounded-3xl p-6 max-w-sm w-full space-y-5 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[var(--gold)]/10 text-[var(--gold)] flex items-center justify-center border border-[var(--gold)]/30">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold">
                    {language === 'om' ? 'Bilbila Keessan Irratti Fe\'adhaa' : language === 'am' ? 'በስልክዎ ላይ ይጫኑ' : 'Install on iPhone / iPad'}
                  </h3>
                  <p className="text-[11px] text-[var(--gold-text)] font-semibold">
                    {language === 'om' ? 'Qajeelfama Fe\'iinsaa' : language === 'am' ? 'የመጫኛ መመሪያ' : 'Add to iOS Home Screen'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs bg-[var(--card-subtle)] p-4 rounded-2xl border border-[var(--border)]">
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-[var(--gold)] text-black font-bold flex items-center justify-center shrink-0 mt-0.5 text-[10px]">
                  1
                </div>
                <div className="leading-snug">
                  {language === 'om' ? (
                    <>Sarara Safari keessaa, mallattoo <strong className="text-[var(--gold-text)]">Share</strong> <Share2 className="w-3.5 h-3.5 inline-block text-sky-500 mx-0.5" /> tuqaa.</>
                  ) : language === 'am' ? (
                    <>በሳፋሪ መክፈቻ ላይ፣ <strong className="text-[var(--gold-text)]">የማጋሪያ ምልክቱን (Share)</strong> <Share2 className="w-3.5 h-3.5 inline-block text-sky-500 mx-0.5" /> ይጫኑ።</>
                  ) : (
                    <>In Safari, tap the <strong className="text-[var(--gold-text)]">Share button</strong> <Share2 className="w-3.5 h-3.5 inline-block text-sky-500 mx-0.5" /> in the toolbar.</>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-[var(--gold)] text-black font-bold flex items-center justify-center shrink-0 mt-0.5 text-[10px]">
                  2
                </div>
                <div className="leading-snug">
                  {language === 'om' ? (
                    <>Gadi siqsaatii filannoo <strong className="text-[var(--gold-text)]">Add to Home Screen</strong> <PlusSquare className="w-3.5 h-3.5 inline-block text-emerald-500 mx-0.5" /> filadhaa.</>
                  ) : language === 'am' ? (
                    <>ወደ ታች ዝቅ ብለው <strong className="text-[var(--gold-text)]">Add to Home Screen</strong> <PlusSquare className="w-3.5 h-3.5 inline-block text-emerald-500 mx-0.5" /> የሚለውን ይምረጡ።</>
                  ) : (
                    <>Scroll down the menu and select <strong className="text-[var(--gold-text)]">Add to Home Screen</strong> <PlusSquare className="w-3.5 h-3.5 inline-block text-emerald-500 mx-0.5" />.</>
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
                    <>Tap <strong className="text-[var(--text)]">Add</strong> in the top right. Launch Hawi anytime from your home screen!</>
                  )}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowIOSGuide(false);
                dismissPrompt();
                setVisible(false);
              }}
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
