'use client';

import React from 'react';
import Link from 'next/link';
import { Phone, Calendar } from 'lucide-react';
import { CONTACT_PHONES } from '@/data/packages';
import { useLanguage } from '@/lib/language-context';

export default function MobileCallBar() {
  const { t } = useLanguage();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[var(--surface)]/95 backdrop-blur-md border-t border-[var(--border)] p-2.5 sm:hidden shadow-2xl transition-colors duration-200">
      <div className="grid grid-cols-3 gap-2">
        <a
          href={`tel:${CONTACT_PHONES[0].raw}`}
          className="flex flex-col items-center justify-center py-1.5 px-1 rounded-lg bg-[var(--card-subtle)] text-[var(--text)] active:opacity-80 transition-colors"
          title={t('mobileBar.callStudio')}
        >
          <Phone className="w-4 h-4 text-[var(--gold)] mb-0.5" />
          <span className="text-[10px] font-semibold leading-none tabular-nums">0988 018016</span>
          <span className="text-[9px] text-[var(--text-muted)] leading-none mt-0.5">{t('mobileBar.callStudio')}</span>
        </a>

        <a
          href={`tel:${CONTACT_PHONES[1].raw}`}
          className="flex flex-col items-center justify-center py-1.5 px-1 rounded-lg bg-[var(--card-subtle)] text-[var(--text)] active:opacity-80 transition-colors"
          title={t('mobileBar.callSalon')}
        >
          <Phone className="w-4 h-4 text-[var(--gold)] mb-0.5" />
          <span className="text-[10px] font-semibold leading-none tabular-nums">0914 878007</span>
          <span className="text-[9px] text-[var(--text-muted)] leading-none mt-0.5">{t('mobileBar.callSalon')}</span>
        </a>

        <Link
          href="/booking"
          className="flex flex-col items-center justify-center py-1.5 px-1 rounded-lg bg-gradient-to-r from-[var(--gold)] to-[var(--gold-dark)] text-[#141008] font-bold active:opacity-90 shadow-sm transition-all"
        >
          <Calendar className="w-4 h-4 text-[#141008] mb-0.5" />
          <span className="text-[11px] font-bold leading-none">{t('mobileBar.bookNow')}</span>
          <span className="text-[9px] text-[#141008]/80 leading-none mt-0.5">{t('booking.selectDateLabel')}</span>
        </Link>
      </div>
    </div>
  );
}
