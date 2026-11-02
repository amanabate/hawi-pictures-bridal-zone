'use client';

import React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Check,
  ArrowRight,
  Calendar,
  Crown,
  AlertCircle,
  Phone,
  Clock
} from 'lucide-react';
import { useManagedPackages } from '@/lib/data-store';
import {
  FLYER_NOTICE,
  BRAND_INFO,
  CONTACT_PHONES,
  getPackageName,
  getPackageTagline,
  getPackageFeatures
} from '@/data/packages';
import { useLanguage } from '@/lib/language-context';

export default function FeaturedPackages() {
  const { t, language, formatCurrency } = useLanguage();
  const managedPackages = useManagedPackages();
  const allActivePackages = managedPackages.filter((p) => p.status === 'active' && !p.deletedAt);

  return (
    <section className="py-16 sm:py-24 bg-[var(--card-subtle)] border-b border-[var(--border)] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--gold)]">
              <Sparkles className="w-4 h-4 text-[var(--gold)]" />
              <span>{t('featuredPackages.badge')}</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--text)] tracking-tight">
              {t('featuredPackages.title')}
            </h2>
            <p className="text-base font-serif italic text-[var(--gold-text)]">
              &ldquo;{BRAND_INFO.tagline}&rdquo;
            </p>
            <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed">
              {t('featuredPackages.subtitle')}
            </p>
          </div>

          <Link
            href="/packages"
            className="inline-flex items-center gap-2 self-start md:self-auto text-sm font-bold text-[var(--gold)] hover:brightness-125 group shrink-0"
          >
            <span>{t('featuredPackages.exploreAll')}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* All Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
          {allActivePackages.map((pkg) => {
            const isSpecial = pkg.badge === 'special' || pkg.id === 'special-package';
            const isPopular = pkg.badge === 'popular' || pkg.id === 'paakeejii-1ffaa';

            const localizedName = getPackageName(pkg, language);
            const localizedTagline = getPackageTagline(pkg, language);
            const localizedFeatures = getPackageFeatures(pkg, language);
            const formattedPrice = formatCurrency(pkg.price);

            return (
              <div
                key={pkg.id}
                className={`relative rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 ${
                  isSpecial
                    ? 'bg-[var(--surface)] text-[var(--text)] border-2 border-[var(--gold)] shadow-2xl scale-[1.01] lg:col-span-3 lg:grid lg:grid-cols-12 lg:gap-8 p-6 sm:p-8'
                    : isPopular
                    ? 'bg-[var(--card)] text-[var(--text)] border-2 border-[var(--gold)]/80 shadow-xl'
                    : 'bg-[var(--card)] text-[var(--text)] border border-[var(--border)] shadow-md'
                }`}
              >
                {/* Special Package Layout */}
                {isSpecial ? (
                  <>
                    <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
                      <div>
                        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-[var(--gold)] to-[var(--gold-dark)] text-[#141008] text-xs font-bold uppercase tracking-wider shadow-sm mb-3">
                          <Crown className="w-3.5 h-3.5 text-[#141008]" />
                          <span>{t('packagesPage.badges.special')}</span>
                        </div>
                        <h3 className="font-serif text-3xl sm:text-4xl font-bold text-[var(--text)]">
                          {localizedName}
                        </h3>
                        <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1.5 leading-relaxed">
                          {localizedTagline}
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl bg-[var(--card-subtle)] border border-[var(--border)]">
                        <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider font-semibold">
                          {t('packagesPage.officialRate')}
                        </div>
                        <div className="font-serif text-3xl sm:text-4xl font-bold text-[var(--gold)] tabular-nums mt-0.5">
                          {formattedPrice}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Link
                          href={`/booking?package=${pkg.id}`}
                          className="w-full py-3.5 px-6 rounded-full text-xs sm:text-sm font-bold flex items-center justify-center gap-2 bg-gradient-to-r from-[var(--gold)] to-[var(--gold-dark)] text-[#141008] hover:brightness-110 shadow-md"
                        >
                          <Calendar className="w-4 h-4 text-[#141008]" />
                          <span>{t('featuredPackages.bookThisPackage')}</span>
                        </Link>
                      </div>
                    </div>

                    <div className="lg:col-span-7 space-y-3 pt-4 lg:pt-0 lg:border-l lg:border-[var(--border)] lg:pl-8">
                      <div className="text-xs font-bold text-[var(--text)] uppercase tracking-wider">
                        {t('featuredPackages.whatIsIncluded')}:
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[var(--text)]">
                        {localizedFeatures.map((item, i) => (
                          <div key={i} className="flex items-start gap-2 p-2 rounded-xl bg-[var(--card-subtle)] border border-[var(--border)]">
                            <Check className="w-3.5 h-3.5 text-[var(--gold)] shrink-0 mt-0.5" />
                            <span className="leading-snug">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  /* Standard Packages 1 to 8 Layout */
                  <>
                    <div className="space-y-4">
                      {isPopular && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-[var(--gold)] to-[var(--gold-dark)] text-[#141008] text-[11px] font-bold uppercase tracking-wider shadow-sm mb-1">
                          <Sparkles className="w-3 h-3 text-[#141008]" />
                          <span>{t('packagesPage.badges.popular')}</span>
                        </div>
                      )}

                      <div className="space-y-1">
                        <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--gold)]">
                          {pkg.categoryLabel}
                        </div>
                        <h3 className="font-serif text-2xl font-bold tracking-tight text-[var(--text)]">
                          {localizedName}
                        </h3>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-[var(--card-subtle)] border border-[var(--border)]">
                        <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-semibold">
                          {t('packagesPage.priceLabel')}
                        </div>
                        <div className="font-serif text-2xl sm:text-3xl font-bold text-[var(--gold)] tabular-nums mt-0.5">
                          {formattedPrice}
                        </div>
                      </div>

                      <div className="space-y-2 pt-1">
                        <div className="text-[11px] font-bold text-[var(--text)] uppercase tracking-wider">
                          {t('featuredPackages.whatIsIncluded')}:
                        </div>
                        <ul className="space-y-1.5 text-xs text-[var(--text)]">
                          {localizedFeatures.map((feat, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <Check className="w-3.5 h-3.5 text-[var(--gold)] shrink-0 mt-0.5" />
                              <span className="leading-snug">{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="pt-6 mt-6 border-t border-dashed border-[var(--border)]">
                      <Link
                        href={`/booking?package=${pkg.id}`}
                        className={`w-full py-3 px-4 rounded-full text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm ${
                          isPopular
                            ? 'bg-gradient-to-r from-[var(--gold)] to-[var(--gold-dark)] text-[#141008] hover:brightness-110'
                            : 'bg-[var(--text)] text-[var(--bg)] hover:opacity-90'
                        }`}
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{t('featuredPackages.bookThisPackage')}</span>
                      </Link>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* ========================================================================= */}
        {/* OFFICIAL FLYER NOTICE (HUBACHIISA) & BRAND DETAILS UNDER PACKAGES */}
        {/* ========================================================================= */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[var(--surface)] border-2 border-[var(--gold)]/40 shadow-xl space-y-6">
          <div className="flex items-center gap-2.5 text-xs sm:text-sm font-bold uppercase tracking-wider text-[var(--gold)]">
            <AlertCircle className="w-5 h-5 text-[var(--gold)] shrink-0" />
            <span>{t('featuredPackages.flyerNoticeTitle')}</span>
          </div>

          <div className="space-y-2">
            <p className="font-serif text-base sm:text-xl font-bold text-[var(--text)] leading-relaxed">
              &ldquo;{t('featuredPackages.flyerNoticeText')}&rdquo;
            </p>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed italic">
              {FLYER_NOTICE.english}
            </p>
          </div>

          {/* Bottom Brand Icons & Services */}
          <div className="pt-5 border-t border-[var(--border)] grid grid-cols-2 sm:grid-cols-4 gap-4">
            {BRAND_INFO.bottomIcons.map((icon, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-[var(--card-subtle)] border border-[var(--border)] text-center space-y-1">
                <div className="font-serif font-bold text-sm text-[var(--gold)]">
                  {icon.title}
                </div>
                <div className="text-[11px] text-[var(--text-muted)] leading-tight">
                  {icon.desc}
                </div>
              </div>
            ))}
          </div>

          {/* Closing Greeting & Phones */}
          <div className="pt-4 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2 text-[var(--text-muted)]">
              <span className="font-semibold text-[var(--text)]">{BRAND_INFO.name}</span>
              <span>·</span>
              <a href={`tel:${CONTACT_PHONES[0].raw}`} className="font-mono text-[var(--gold-text)] hover:underline">
                {CONTACT_PHONES[0].display}
              </a>
              <span>/</span>
              <a href={`tel:${CONTACT_PHONES[1].raw}`} className="font-mono text-[var(--gold-text)] hover:underline">
                {CONTACT_PHONES[1].display}
              </a>
            </div>

            <div className="font-serif text-base font-bold text-[var(--gold-text)]">
              {BRAND_INFO.closingGreeting}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
