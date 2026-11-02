'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Home, Sparkles } from 'lucide-react';
import { usePWA } from '@/lib/use-pwa';
import { useLanguage } from '@/lib/language-context';
import { useIsMounted } from '@/lib/use-mounted';

export default function StandaloneHeader() {
  const isMounted = useIsMounted();
  const { isInstalled } = usePWA();
  const pathname = usePathname();
  const router = useRouter();
  const { t, language } = useLanguage();

  // Prevent accidental pull-to-refresh while filling a form or modal
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.closest('form') ||
          target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT')
      ) {
        document.body.style.overscrollBehaviorY = 'contain';
      } else {
        document.body.style.overscrollBehaviorY = 'auto';
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      document.body.style.overscrollBehaviorY = 'auto';
    };
  }, []);

  // In standalone mode on root page, provide safe-area spacing for the status bar
  if (!isMounted || !isInstalled) {
    return null;
  }

  if (pathname === '/') {
    return (
      <div
        className="w-full bg-[var(--bg)] pointer-events-none"
        style={{ height: 'env(safe-area-inset-top, 0px)' }}
        aria-hidden="true"
      />
    );
  }

  const getPageTitle = () => {
    if (pathname.startsWith('/booking')) {
      return language === 'om' ? 'Qabannaa Cidhaa' : language === 'am' ? 'የሰርግ ማስያዣ' : 'Wedding Booking';
    }
    if (pathname.startsWith('/packages')) {
      return language === 'om' ? 'Paakeejjiiwwan' : language === 'am' ? 'የሰርግ ጥቅሎች' : 'Wedding Packages';
    }
    if (pathname.startsWith('/admin')) {
      return language === 'om' ? 'Gulaalaa Olaanaa' : language === 'am' ? 'የአስተዳዳሪ ክፍል' : 'Admin Dashboard';
    }
    if (pathname.startsWith('/offline')) {
      return language === 'om' ? 'Tooraan Ala' : language === 'am' ? 'ያለ ኢንተርኔት' : 'Offline Mode';
    }
    return 'Hawi Pictures';
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };

  return (
    <header
      className="sticky top-0 z-40 bg-[var(--surface)]/95 backdrop-blur-md border-b border-[var(--border)] px-4 py-2.5 transition-colors duration-200"
      style={{ paddingTop: 'max(0.6rem, env(safe-area-inset-top))' }}
      aria-label="Standalone App Navigation"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Back Button */}
        <button
          type="button"
          onClick={handleBack}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[var(--card-subtle)] hover:bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] text-xs font-semibold transition-all active:scale-95"
          aria-label={t('common.back')}
        >
          <ArrowLeft className="w-4 h-4 text-[var(--gold)]" />
          <span className="hidden sm:inline">{t('common.back')}</span>
        </button>

        {/* Current Title & Branding */}
        <div className="flex items-center gap-2 text-center min-w-0">
          <Sparkles className="w-3.5 h-3.5 text-[var(--gold)] shrink-0 hidden xs:inline" />
          <h1 className="font-serif text-sm sm:text-base font-bold text-[var(--text)] truncate">
            {getPageTitle()}
          </h1>
        </div>

        {/* Home shortcut */}
        <Link
          href="/"
          className="p-1.5 rounded-xl bg-[var(--card-subtle)] hover:bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] transition-all active:scale-95 flex items-center justify-center"
          title={t('nav.home')}
          aria-label={t('nav.home')}
        >
          <Home className="w-4 h-4 text-[var(--gold)]" />
        </Link>
      </div>
    </header>
  );
}
