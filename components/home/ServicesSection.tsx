'use client';

import React from 'react';
import Link from 'next/link';
import { Camera, Crown, Sparkles, Palette, Heart, ArrowRight, Calendar } from 'lucide-react';
import { SERVICES_SECTION_DATA, ServiceItem, getServiceName, getServiceDescription } from '@/data/services';
import { useLanguage } from '@/lib/language-context';

const ICON_MAP = {
  Camera,
  Crown,
  Sparkles,
  Palette,
  Heart
};

export default function ServicesSection() {
  const { t, language } = useLanguage();
  const { viewPackagesUrl, services } = SERVICES_SECTION_DATA;

  return (
    <section
      id="services"
      className="py-16 sm:py-24 bg-[var(--bg)] border-b border-[var(--border)] transition-colors duration-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-14">
        {/* Centered Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[var(--card-subtle)] border border-[var(--gold)]/30 text-[11px] font-bold uppercase tracking-widest text-[var(--gold)]">
            <Sparkles className="w-3.5 h-3.5 text-[var(--gold)]" />
            <span>Hawi Pictures & Bridal Zone</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-[var(--gold)] via-[#FCD535] to-[var(--gold-dark)] bg-clip-text text-transparent">
              {t('services.title')}
            </span>
          </h2>

          <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed">
            {t('services.subtitle')}
          </p>
        </div>

        {/* 5 Cards Grid: 5 cols on desktop, 2 on tablet, 1 on mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 lg:gap-4 items-stretch">
          {services.map((service: ServiceItem) => {
            const IconComponent = ICON_MAP[service.iconName] || Sparkles;
            const localizedName = getServiceName(service, language);
            const localizedDesc = getServiceDescription(service, language);

            return (
              <div
                key={service.id}
                className="group relative flex flex-col justify-between rounded-3xl p-6 bg-[var(--surface)] border border-[var(--border)] shadow-sm transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-[0_16px_36px_rgba(201,162,77,0.20)] dark:hover:shadow-[0_16px_36px_rgba(252,213,53,0.18)] hover:border-[var(--gold)]"
              >
                {/* Decorative background ambient glow on hover */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-[var(--gold)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                {/* Top: Icon & Category */}
                <div className="relative z-10 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-[var(--card-subtle)] border border-[var(--border)] flex items-center justify-center text-[var(--gold)] group-hover:scale-110 group-hover:bg-[var(--gold)]/10 group-hover:border-[var(--gold)]/40 transition-all duration-300 shadow-sm">
                      <IconComponent className="w-6 h-6 sm:w-7 sm:h-7 text-[var(--gold)] transition-transform group-hover:rotate-3" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] font-mono">
                      0{services.indexOf(service) + 1}
                    </span>
                  </div>

                  {/* Title & Tagline */}
                  <div className="space-y-1">
                    <h3 className="font-serif text-lg sm:text-xl font-bold text-[var(--text)] tracking-tight leading-snug group-hover:text-[var(--gold)] transition-colors">
                      {localizedName}
                    </h3>
                    <div className="text-[11px] font-semibold text-[var(--gold)] uppercase tracking-wide">
                      {service.tagline}
                    </div>
                  </div>

                  {/* 1-2 line description */}
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed line-clamp-3">
                    {localizedDesc}
                  </p>
                </div>

                {/* Bottom CTA: Book Now Button */}
                <div className="relative z-10 pt-5 mt-4 border-t border-[var(--border)]/70">
                  <Link
                    href={service.bookingUrl}
                    className="w-full py-2.5 px-4 rounded-full text-xs font-bold flex items-center justify-center gap-2 bg-[var(--card-subtle)] text-[var(--text)] border border-[var(--border)] hover:bg-[var(--gold)] hover:text-[#141008] hover:border-[var(--gold)] transition-all duration-200 shadow-sm group/btn"
                  >
                    <Calendar className="w-3.5 h-3.5 text-[var(--gold)] group-hover/btn:text-[#141008] transition-colors" />
                    <span>{t('services.bookNow')}</span>
                    <ArrowRight className="w-3 h-3 text-[var(--text-muted)] group-hover/btn:text-[#141008] group-hover/btn:translate-x-0.5 transition-all" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* View Packages Button under the Grid */}
        <div className="text-center pt-2">
          <Link
            href={viewPackagesUrl}
            className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider text-[#141008] bg-gradient-to-r from-[var(--gold)] to-[var(--gold-dark)] hover:brightness-110 active:scale-95 shadow-md hover:shadow-lg hover:shadow-[var(--gold)]/25 transition-all"
          >
            <Sparkles className="w-4 h-4 text-[#141008]" />
            <span>{t('services.viewPackages')}</span>
            <ArrowRight className="w-4 h-4 text-[#141008]" />
          </Link>
        </div>
      </div>
    </section>
  );
}
