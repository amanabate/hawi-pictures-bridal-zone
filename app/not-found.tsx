'use client';

import React from 'react';
import Link from 'next/link';
import { Home, Layers, Sparkles } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function NotFound() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--text)] transition-colors duration-200">
      <Navbar />
      <main className="flex-1 flex items-center justify-center py-20 px-4">
        <div className="max-w-md w-full text-center space-y-6 bg-[var(--surface)] p-8 sm:p-10 rounded-3xl border border-[var(--border)] shadow-xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--card-subtle)] border border-[var(--gold)]/30 text-xs font-bold uppercase tracking-wider text-[var(--gold)]">
            <Sparkles className="w-3.5 h-3.5 text-[var(--gold)]" />
            <span>{t('notFound.badge')}</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[var(--text)]">
            {t('notFound.title')}
          </h1>

          <p className="text-sm text-[var(--text-muted)] leading-relaxed">
            {t('notFound.subtitle')}
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-[var(--gold)] to-[var(--gold-dark)] text-[#141008] hover:brightness-110 shadow-md transition-all"
            >
              <Home className="w-4 h-4 text-[#141008]" />
              <span>{t('notFound.homeButton')}</span>
            </Link>

            <Link
              href="/packages"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[var(--card-subtle)] text-[var(--text)] hover:bg-[var(--border)] border border-[var(--border)] transition-all"
            >
              <Layers className="w-4 h-4 text-[var(--gold)]" />
              <span>{t('notFound.packagesButton')}</span>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
