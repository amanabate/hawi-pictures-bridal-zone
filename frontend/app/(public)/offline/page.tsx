'use client';

import React from 'react';
import Link from 'next/link';
import { WifiOff, Phone, RotateCcw, Home, Sparkles, MapPin } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';
import { CONTACT_PHONES } from '@/data/packages';

export default function OfflinePage() {
  const { t, language } = useLanguage();

  const handleRetry = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  // Trilingual messages
  const titles = {
    en: 'You are Currently Offline',
    om: 'Yeroo Ammaa Toora Irra Hin Jirtan',
    am: 'በአሁኑ ሰዓት ከመስመር ውጭ ነዎት'
  };

  const descriptions = {
    en: 'Hawi Pictures & Bridal Zone has saved this session for you. Check your internet connection or call our studio directly.',
    om: 'Hawi Pictures & Bridal Zone tajaajila kana isiniif olkaa\'ee jira. Wal-qunnamsiisa interneetii keessan mirkaneeffadhaa yookiin bilbilaan nu qunnamaa.',
    am: 'ሃዊ ፒክቸርስ እና ብራይዳል ዞን ይህንን ክፍለ-ጊዜ ይዞልዎታል። እባክዎን የኢንተርኔት ግንኙነትዎን ያረጋግጡ ወይም በቀጥታ በስልክ ይደውሉልን።'
  };

  const retryLabels = {
    en: 'Check Connection & Retry',
    om: 'Irra Deebi\'aa Yaalaa',
    am: 'ግንኙነትን አረጋግጠው እንደገና ይሞክሩ'
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex items-center justify-center p-4 transition-colors duration-200">
      <div className="max-w-lg w-full bg-[var(--card)] border border-[var(--border)] rounded-3xl p-8 sm:p-10 shadow-xl text-center space-y-6">
        {/* Offline Icon Badge */}
        <div className="w-20 h-20 mx-auto rounded-full bg-amber-500/10 border-2 border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
          <WifiOff className="w-10 h-10" />
        </div>

        {/* Brand Label */}
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-widest uppercase bg-[var(--gold)]/10 text-[var(--gold-text)] border border-[var(--gold)]/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Hawi Pictures & Bridal Zone</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[var(--text)]">
            {titles[language] || titles.en}
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
            {descriptions[language] || descriptions.en}
          </p>
        </div>

        {/* Retry Button */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={handleRetry}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-[var(--gold)] to-[var(--gold-dark)] text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:opacity-90 shadow-md transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-black" />
            <span>{retryLabels[language] || retryLabels.en}</span>
          </button>

          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3 rounded-xl border border-[var(--border)] bg-[var(--card-subtle)] text-[var(--text)] font-semibold text-xs flex items-center justify-center gap-2 hover:bg-[var(--surface)] transition-all"
          >
            <Home className="w-4 h-4" />
            <span>Home</span>
          </Link>
        </div>

        {/* Offline Phone Direct Contacts (Works without internet) */}
        <div className="pt-6 border-t border-[var(--border)] space-y-3 text-left">
          <div className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider text-center">
            Offline Direct Studio Call
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <a
              href={`tel:${CONTACT_PHONES[0]?.raw || '0988018016'}`}
              className="p-3 rounded-2xl bg-[var(--card-subtle)] border border-[var(--border)] hover:border-[var(--gold)] transition-colors flex items-center gap-3 group"
            >
              <div className="w-8 h-8 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center text-[var(--gold)] group-hover:scale-105 transition-transform">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] text-[var(--text-muted)] uppercase font-semibold">Photography & Studio</div>
                <div className="font-mono text-xs font-bold text-[var(--text)]">{CONTACT_PHONES[0]?.display || '0988 01 80 16'}</div>
              </div>
            </a>

            <a
              href={`tel:${CONTACT_PHONES[1]?.raw || '0914878007'}`}
              className="p-3 rounded-2xl bg-[var(--card-subtle)] border border-[var(--border)] hover:border-[var(--gold)] transition-colors flex items-center gap-3 group"
            >
              <div className="w-8 h-8 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center text-[var(--gold)] group-hover:scale-105 transition-transform">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] text-[var(--text-muted)] uppercase font-semibold">Bridal Salon & Gowns</div>
                <div className="font-mono text-xs font-bold text-[var(--text)]">{CONTACT_PHONES[1]?.display || '0914 87 80 07'}</div>
              </div>
            </a>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-[var(--text-muted)] pt-1">
            <MapPin className="w-3.5 h-3.5 text-[var(--gold)]" />
            <span>Shager, Burayu Mariam</span>
          </div>
        </div>
      </div>
    </div>
  );
}
