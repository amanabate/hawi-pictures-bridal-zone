'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Sparkles,
  Check,
  Crown,
  Calendar,
  Search,
  Phone,
  AlertCircle,
  Clock,
} from 'lucide-react';
import {
  CONTACT_PHONES,
  FLYER_NOTICE,
  BRAND_INFO,
  getPackageName,
  getPackageTagline,
  getPackageFeatures
} from '@/data/packages';
import { useManagedPackages } from '@/lib/data-store';
import { useLanguage } from '@/lib/language-context';

export default function PackagesList() {
  const { t, language, formatCurrency } = useLanguage();
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';

  const managedPackages = useManagedPackages();
  const [activeCategory, setActiveCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'all', label: t('packagesPage.allPackagesTab') },
    { id: 'special', label: t('packagesPage.specialTab') },
    { id: 'popular', label: t('packagesPage.badgePopular') },
    { id: 'top_tier', label: t('packagesPage.fullWeddingTab') },
    { id: 'mid_tier', label: t('packagesPage.bridalSalonTab') }
  ];

  // Only display active, non-trashed packages on the public page
  const activePackages = useMemo(() => {
    return managedPackages.filter((p) => p.status === 'active' && !p.deletedAt);
  }, [managedPackages]);

  const filteredPackages = useMemo(() => {
    return activePackages.filter((pkg) => {
      // Category filter
      const isSpecial = pkg.badge === 'special' || pkg.id === 'special-package';
      const isPopular = pkg.badge === 'popular' || pkg.id === 'paakeejii-1ffaa';

      let matchesCategory = true;
      if (activeCategory === 'special') {
        matchesCategory = isSpecial;
      } else if (activeCategory === 'popular') {
        matchesCategory = isPopular;
      } else if (activeCategory === 'top_tier') {
        matchesCategory = ['paakeejii-1ffaa', 'paakeejii-2ffaa', 'paakeejii-3ffaa', 'paakeejii-4ffaa'].includes(pkg.id);
      } else if (activeCategory === 'mid_tier') {
        matchesCategory = ['paakeejii-5ffaa', 'paakeejii-6ffaa', 'paakeejii-7ffaa', 'paakeejii-8ffaa'].includes(pkg.id);
      }

      // Search query filter
      const query = searchQuery.toLowerCase().trim();
      if (!query) return matchesCategory;

      const localizedName = getPackageName(pkg, language).toLowerCase();
      const localizedTagline = getPackageTagline(pkg, language).toLowerCase();
      const localizedFeatures = getPackageFeatures(pkg, language).join(' ').toLowerCase();

      const matchesSearch =
        pkg.name.toLowerCase().includes(query) ||
        localizedName.includes(query) ||
        localizedTagline.includes(query) ||
        localizedFeatures.includes(query) ||
        pkg.priceDisplay.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [activePackages, activeCategory, searchQuery, language]);

  return (
    <div className="py-12 sm:py-20 bg-[var(--bg)] text-[var(--text)] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--gold)]">
            <Sparkles className="w-4 h-4 text-[var(--gold)]" />
            <span>{BRAND_INFO.name} · {t('packagesPage.badge')}</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-[var(--text)] tracking-tight">
            {t('packagesPage.title')}
          </h1>

          <p className="text-base sm:text-lg font-serif italic text-[var(--gold-text)]">
            &ldquo;{BRAND_INFO.tagline}&rdquo;
          </p>

          <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed max-w-2xl mx-auto">
            {t('packagesPage.subtitle')}
          </p>

          {/* Quick Tap-to-call banner */}
          <div className="inline-flex flex-wrap items-center justify-center gap-3 p-2.5 rounded-2xl bg-[var(--card-subtle)] border border-[var(--border)] text-xs text-[var(--text-muted)] shadow-xs">
            <span className="font-medium text-[var(--text)]">Direct Booking Hotline:</span>
            <div className="flex items-center gap-3">
              <a
                href={`tel:${CONTACT_PHONES[0].raw}`}
                className="font-bold text-[var(--gold)] hover:brightness-125 inline-flex items-center gap-1 font-mono tabular-nums"
              >
                <Phone className="w-3.5 h-3.5 text-[var(--gold)]" />
                {CONTACT_PHONES[0].display}
              </a>
              <span>/</span>
              <a
                href={`tel:${CONTACT_PHONES[1].raw}`}
                className="font-bold text-[var(--gold)] hover:brightness-125 inline-flex items-center gap-1 font-mono tabular-nums"
              >
                <Phone className="w-3.5 h-3.5 text-[var(--gold)]" />
                {CONTACT_PHONES[1].display}
              </a>
            </div>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Category Segmented Control */}
            <div className="flex items-center gap-1.5 p-1.5 bg-[var(--card-subtle)] rounded-2xl overflow-x-auto max-w-full border border-[var(--border)]">
              {categories.map((cat) => {
                const active = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
                      active
                        ? 'bg-[var(--surface)] text-[var(--text)] shadow-sm'
                        : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* Search Box */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="text"
                placeholder={t('packagesPage.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--card)] border border-[var(--border)] text-xs text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--gold)] transition-all"
              />
            </div>
          </div>

          <div className="text-xs text-[var(--text-muted)] flex items-center justify-between px-1">
            <span>
              Showing <strong className="text-[var(--text)]">{filteredPackages.length}</strong> package
              {filteredPackages.length !== 1 ? 's' : ''}
            </span>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs font-semibold text-[var(--gold)] hover:underline"
              >
                {t('packagesPage.clearSearch')}
              </button>
            )}
          </div>
        </div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
          {filteredPackages.map((pkg) => {
            const isSpecial = pkg.badge === 'special' || pkg.id === 'special-package';
            const isPopular = pkg.badge === 'popular' || pkg.id === 'paakeejii-1ffaa';

            const localizedName = getPackageName(pkg, language);
            const localizedTagline = getPackageTagline(pkg, language);
            const localizedFeatures = getPackageFeatures(pkg, language);
            const formattedPrice = formatCurrency(pkg.price);

            return (
              <div
                key={pkg.id}
                className={`group relative rounded-3xl overflow-hidden flex flex-col justify-between transition-all duration-300 ${
                  isSpecial
                    ? 'bg-[var(--surface)] text-[var(--text)] border-2 border-[var(--gold)] shadow-2xl lg:col-span-3 lg:grid lg:grid-cols-12 lg:gap-8 p-0'
                    : isPopular
                    ? 'bg-[var(--card)] text-[var(--text)] border-2 border-[var(--gold)]/80 shadow-xl p-6 sm:p-7'
                    : 'bg-[var(--card)] text-[var(--text)] border border-[var(--border)] shadow-md p-6 sm:p-7'
                }`}
              >
                {/* Special Package Layout */}
                {isSpecial ? (
                  <>
                    {/* Special Image Side */}
                    <div className="lg:col-span-5 relative min-h-[320px] lg:min-h-full bg-[var(--card-subtle)]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={pkg.image}
                        alt={localizedName}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-black/85 via-black/40 to-transparent" />
                      <div className="absolute top-4 left-4 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[var(--gold)] to-[var(--gold-dark)] text-[#141008] text-xs font-bold uppercase tracking-wider shadow-md flex items-center gap-1.5">
                        <Crown className="w-4 h-4 text-[#141008]" />
                        <span>{t('packagesPage.badgeSpecial')}</span>
                      </div>
                      <div className="absolute bottom-5 left-5 right-5 text-white space-y-1">
                        <div className="text-xs text-[var(--gold)] font-bold uppercase tracking-wider">
                          HAWI Flagship Collection
                        </div>
                        <div className="font-serif text-3xl font-bold">{localizedName}</div>
                        <div className="font-serif text-2xl font-bold text-[var(--gold)]">
                          {formattedPrice}
                        </div>
                      </div>
                    </div>

                    {/* Special Details Side */}
                    <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
                      <div className="space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                          <span className="font-bold text-[var(--gold)] uppercase tracking-wider flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Special Flagship Tier</span>
                          </span>
                          <span className="text-[var(--text-muted)] flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-[var(--gold)]" />
                            <span>{pkg.daysCoverage}</span>
                          </span>
                        </div>

                        <div>
                          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[var(--text)] tracking-tight">
                            {localizedName}
                          </h2>
                          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1.5 leading-relaxed">
                            {localizedTagline}
                          </p>
                        </div>

                        {/* Price Display */}
                        <div className="p-4 rounded-2xl bg-[var(--card-subtle)] border border-[var(--border)] flex flex-wrap items-center justify-between gap-4">
                          <div>
                            <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider font-semibold">
                              {t('packagesPage.priceLabel')}
                            </div>
                            <div className="font-serif text-3xl sm:text-4xl font-bold text-[var(--gold)] tabular-nums">
                              {formattedPrice}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-[11px] text-[var(--text-muted)]">{t('packagesPage.officialRate')}</div>
                            <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                              Comprehensive Luxury
                            </div>
                          </div>
                        </div>

                        {/* All Included Items */}
                        <div className="space-y-2.5 pt-1">
                          <div className="text-xs font-bold text-[var(--text)] uppercase tracking-wider flex items-center gap-1.5">
                            <Check className="w-4 h-4 text-[var(--gold)]" />
                            <span>{t('packagesPage.includedTitle')}:</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[var(--text)]">
                            {localizedFeatures.map((item, i) => (
                              <div key={i} className="flex items-start gap-2 p-2 rounded-xl bg-[var(--card-subtle)] border border-[var(--border)]">
                                <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] shrink-0 mt-1.5" />
                                <span className="font-medium">{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Card Action */}
                      <div className="pt-4 border-t border-[var(--border)] flex flex-col sm:flex-row items-center gap-3">
                        <Link
                          href={`/booking?package=${pkg.id}`}
                          className="w-full sm:flex-1 py-3.5 px-6 rounded-full text-xs sm:text-sm font-bold flex items-center justify-center gap-2 bg-gradient-to-r from-[var(--gold)] to-[var(--gold-dark)] text-[#141008] hover:brightness-110 transition-all shadow-md"
                        >
                          <Calendar className="w-4 h-4 text-[#141008]" />
                          <span>{t('packagesPage.bookButton')}</span>
                        </Link>
                        <a
                          href={`tel:${CONTACT_PHONES[0].raw}`}
                          className="w-full sm:w-auto py-3.5 px-5 rounded-full text-xs font-semibold text-[var(--text)] border border-[var(--border)] hover:bg-[var(--card-subtle)] flex items-center justify-center gap-2"
                        >
                          <Phone className="w-3.5 h-3.5 text-[var(--gold)]" />
                          <span>{t('packagesPage.callButton')}</span>
                        </a>
                      </div>
                    </div>
                  </>
                ) : (
                  /* Standard Packages 1 to 8 Layout */
                  <>
                    <div className="space-y-5">
                      {/* Popular Badge */}
                      {isPopular && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-[var(--gold)] to-[var(--gold-dark)] text-[#141008] text-[11px] font-bold uppercase tracking-wider shadow-sm mb-1">
                          <Sparkles className="w-3 h-3 text-[#141008]" />
                          <span>{t('packagesPage.badgePopular')}</span>
                        </div>
                      )}

                      {/* Package Title & Price */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                          <span className="font-bold text-[var(--gold)] uppercase tracking-wider">
                            {pkg.categoryLabel}
                          </span>
                          <span>{pkg.daysCoverage}</span>
                        </div>

                        <h3 className="font-serif text-2xl font-bold tracking-tight text-[var(--text)]">
                          {localizedName}
                        </h3>

                        <div className="p-3.5 rounded-2xl bg-[var(--card-subtle)] border border-[var(--border)]">
                          <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-semibold">
                            {t('packagesPage.priceLabel')}
                          </div>
                          <div className="font-serif text-3xl font-bold text-[var(--gold)] tabular-nums mt-0.5">
                            {formattedPrice}
                          </div>
                        </div>
                      </div>

                      {/* Included Items List */}
                      <div className="space-y-2 pt-1">
                        <div className="text-[11px] font-bold text-[var(--text)] uppercase tracking-wider">
                          {t('packagesPage.includedTitle')}:
                        </div>
                        <ul className="space-y-1.5 text-xs text-[var(--text)]">
                          {localizedFeatures.map((f, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <Check className="w-3.5 h-3.5 text-[var(--gold)] shrink-0 mt-0.5" />
                              <span className="leading-snug">{f}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Card Footer Action */}
                    <div className="pt-6 mt-6 border-t border-dashed border-[var(--border)] space-y-2">
                      <Link
                        href={`/booking?package=${pkg.id}`}
                        className={`w-full py-3 px-4 rounded-full text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-sm ${
                          isPopular
                            ? 'bg-gradient-to-r from-[var(--gold)] to-[var(--gold-dark)] text-[#141008] hover:brightness-110'
                            : 'bg-[var(--text)] text-[var(--bg)] hover:opacity-90'
                        }`}
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{t('packagesPage.bookButton')}</span>
                      </Link>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Empty state */}
        {filteredPackages.length === 0 && (
          <div className="text-center py-12 p-8 rounded-3xl bg-[var(--surface)] border border-[var(--border)] space-y-3">
            <h3 className="font-serif text-xl font-bold text-[var(--text)]">
              {t('packagesPage.noResultsTitle')}
            </h3>
            <p className="text-xs text-[var(--text-muted)] max-w-md mx-auto">
              {t('packagesPage.noResultsDesc')}
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('all');
              }}
              className="px-5 py-2 rounded-full text-xs font-bold bg-[var(--gold)] text-[#141008]"
            >
              {t('packagesPage.clearSearch')}
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* OFFICIAL FLYER NOTICE (HUBACHIISA) & BRAND DETAILS */}
        {/* ========================================================================= */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[var(--card)] border-2 border-[var(--gold)]/40 shadow-xl space-y-6">
          <div className="flex items-center gap-2.5 text-xs sm:text-sm font-bold uppercase tracking-wider text-[var(--gold)]">
            <AlertCircle className="w-5 h-5 text-[var(--gold)] shrink-0" />
            <span>{t('packagesPage.flyerNoticeTitle')}</span>
          </div>

          <div className="space-y-2">
            <p className="font-serif text-base sm:text-xl font-bold text-[var(--text)] leading-relaxed">
              &ldquo;{t('packagesPage.flyerNoticeDesc')}&rdquo;
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

          {/* Sub-brands & Closing Greeting */}
          <div className="pt-4 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[var(--text-muted)]">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-[var(--text)]">{BRAND_INFO.name}</span>
              <span>·</span>
              <span>Sub-brands: {BRAND_INFO.subBrands.join(', ')}</span>
            </div>
            <div className="font-serif text-base font-bold text-[var(--gold-text)]">
              {BRAND_INFO.closingGreeting}
            </div>
          </div>
        </div>

        {/* Custom destination callout */}
        <div className="rounded-3xl bg-[var(--surface)] text-[var(--text)] p-8 sm:p-10 border border-[var(--border)] shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="font-serif text-2xl font-bold text-[var(--text)]">
              {t('packagesPage.customTitle')}
            </h3>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-2xl leading-relaxed">
              {t('packagesPage.customDesc')}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <a
              href={`tel:${CONTACT_PHONES[0].raw}`}
              className="px-6 py-3.5 rounded-full text-xs font-bold bg-gradient-to-r from-[var(--gold)] to-[var(--gold-dark)] text-[#141008] hover:brightness-110 flex items-center gap-2 transition-colors whitespace-nowrap shadow-md"
            >
              <Phone className="w-4 h-4 text-[#141008]" />
              <span>{t('packagesPage.callButton')}</span>
            </a>
            <Link
              href="/booking"
              className="px-6 py-3.5 rounded-full text-xs font-bold bg-[var(--card-subtle)] text-[var(--text)] hover:bg-[var(--border)] border border-[var(--border)] flex items-center gap-2 transition-colors whitespace-nowrap"
            >
              <Calendar className="w-4 h-4 text-[var(--gold)]" />
              <span>{t('packagesPage.bookButton')}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
