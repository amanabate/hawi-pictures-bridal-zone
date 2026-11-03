'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Phone, Calendar, Menu, X, Sparkles, Heart } from 'lucide-react';
import { CONTACT_PHONES } from '@/data/packages';
import ThemeToggle from '@/components/ThemeToggle';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useLanguage } from '@/lib/language-context';

export default function Navbar() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showCallDropdown, setShowCallDropdown] = useState(false);

  // Navigation Links with "About" placed between "Gallery" and "Contact"
  const navLinks = [
    { label: t('nav.home'), href: '/' },
    { label: t('nav.services'), href: '/#services' },
    { label: t('nav.gallery'), href: '/#gallery' },
    { label: t('nav.about'), href: '/#about' },
    { label: t('nav.contact'), href: '/#contact' },
    { label: t('nav.packages'), href: '/packages' },
    { label: t('nav.booking'), href: '/booking' },
    { label: t('booking.checkBookingLink') || 'Check Status', href: '/booking/check' },
    // Admin link removed - access via direct URL /admin with login
  ];

  const handleLinkClick = (href: string, e: React.MouseEvent) => {
    if (href.startsWith('/#') && pathname === '/') {
      e.preventDefault();
      const id = href.replace('/#', '');
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        window.history.pushState(null, '', href.replace('/', ''));
      }
    }
    setMobileMenuOpen(false);
  };

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    if (href.startsWith('/#')) return false;
    return pathname.startsWith(href);
  };

  return (
    <>


      {/* Main Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[var(--surface)]/95 backdrop-blur-md border-b border-[var(--border)] transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-2 sm:px-3 lg:px-6 h-16 sm:h-20 flex items-center justify-between gap-1 sm:gap-1.5 md:gap-2 lg:gap-3 overflow-hidden">
          {/* Zone 1: Brand title wordmark */}
          <Link
            href="/"
            className="flex items-center gap-1 sm:gap-1.5 group whitespace-nowrap flex-shrink min-w-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)] rounded-lg p-0.5 sm:p-1 max-w-[100px] sm:max-w-[140px] md:max-w-none"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 rounded-full bg-gradient-to-br from-[var(--gold)] via-[var(--gold-dark)] to-[#785414] p-0.5 shadow-sm group-hover:scale-105 transition-transform flex items-center justify-center flex-shrink-0">
              <div className="w-full h-full rounded-full bg-[#141008] flex items-center justify-center text-[var(--gold)]">
                <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5 text-[var(--gold)]" />
              </div>
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="font-serif text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl font-bold tracking-tight text-[var(--text)] leading-tight truncate">
                Hawi Pictures
              </span>
              <span className="text-[6px] sm:text-[7px] md:text-[8px] lg:text-[9px] tracking-[0.12em] sm:tracking-[0.15em] md:tracking-[0.18em] uppercase font-bold text-[var(--gold-text)] truncate">
                & Bridal Zone
              </span>
            </div>
          </Link>

          {/* Zone 2: Navigation Links (Desktop XL) */}
          <nav className="hidden xl:flex items-center gap-4 2xl:gap-6 text-xs 2xl:text-sm font-medium text-[var(--text-muted)] flex-shrink min-w-0">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleLinkClick(link.href, e)}
                  className={`relative py-1 whitespace-nowrap transition-colors hover:text-[var(--text)] ${
                    active ? 'text-[var(--gold)] font-bold' : 'text-[var(--text-muted)]'
                  }`}
                >
                  {link.label}
                  {active && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[var(--gold)] rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Compact nav for tablet / medium desktop */}
          <nav className="hidden md:flex xl:hidden items-center gap-2 lg:gap-3 text-[10px] lg:text-xs font-medium text-[var(--text-muted)] flex-shrink min-w-0">
            {navLinks.slice(1, 6).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={(e) => handleLinkClick(link.href, e)}
                className="py-1 whitespace-nowrap hover:text-[var(--text)] transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Zone 3: Actions (Desktop/Tablet - Language Switcher + ThemeToggle + Quick Call + Primary CTA) */}
          <div className="hidden md:flex items-center gap-1 flex-shrink-0">
            {/* Language Switcher Pill */}
            <LanguageSwitcher />

            {/* Theme Toggle Button */}
            <ThemeToggle />

            {/* Quick Call Pill - Only show on large screens */}
            <div className="relative hidden xl:block">
              <button
                type="button"
                onClick={() => setShowCallDropdown(!showCallDropdown)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-[var(--text)] bg-[var(--card-subtle)] hover:bg-[var(--border)] border border-[var(--border)] rounded-full transition-colors whitespace-nowrap"
              >
                <Phone className="w-3.5 h-3.5 text-[var(--gold)]" />
                <span className="hidden 2xl:inline">{t('common.callUs')}</span>
              </button>

              {showCallDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-[var(--surface)] rounded-xl shadow-xl border border-[var(--border)] p-3 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2 px-2">
                    {t('nav.directStudioLines')}
                  </div>
                  <a
                    href={`tel:${CONTACT_PHONES[0].raw}`}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-[var(--card-subtle)] transition-colors group"
                    onClick={() => setShowCallDropdown(false)}
                  >
                    <div>
                      <div className="text-xs font-semibold text-[var(--text)] group-hover:text-[var(--gold)]">
                        {t('nav.callStudio')}
                      </div>
                      <div className="text-xs text-[var(--text-muted)] font-mono tabular-nums">
                        {CONTACT_PHONES[0].display}
                      </div>
                    </div>
                    <Phone className="w-4 h-4 text-[var(--gold)]" />
                  </a>
                  <a
                    href={`tel:${CONTACT_PHONES[1].raw}`}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-[var(--card-subtle)] transition-colors group"
                    onClick={() => setShowCallDropdown(false)}
                  >
                    <div>
                      <div className="text-xs font-semibold text-[var(--text)] group-hover:text-[var(--gold)]">
                        {t('nav.callSalon')}
                      </div>
                      <div className="text-xs text-[var(--text-muted)] font-mono tabular-nums">
                        {CONTACT_PHONES[1].display}
                      </div>
                    </div>
                    <Phone className="w-4 h-4 text-[var(--gold)]" />
                  </a>
                </div>
              )}
            </div>

            {/* Book Now Primary CTA */}
            <Link
              href="/booking"
              className="inline-flex items-center gap-1 lg:gap-1.5 px-2.5 lg:px-3 py-1.5 text-[11px] lg:text-xs font-bold text-[#141008] bg-gradient-to-r from-[var(--gold)] to-[var(--gold-dark)] hover:brightness-110 shadow-sm rounded-full transition-all hover:shadow-md whitespace-nowrap max-w-[120px] lg:max-w-none"
              title={t('nav.bookNowNav')}
            >
              <Calendar className="w-3 h-3 lg:w-3.5 lg:h-3.5 flex-shrink-0 text-[#141008]" />
              <span className="truncate">{t('nav.bookShort') || 'Book'}</span>
            </Link>
          </div>

          {/* Mobile Header Right (LanguageSwitcher + ThemeToggle + Book Now + Hamburger) */}
          <div className="flex md:hidden items-center gap-1 flex-shrink-0">
            <LanguageSwitcher compact />
            <ThemeToggle />
            <Link
              href="/booking"
              className="inline-flex items-center px-2 py-1 text-[10px] font-bold text-[#141008] bg-[var(--gold)] rounded-full whitespace-nowrap"
            >
              <Calendar className="w-3 h-3 mr-1" />
              {t('nav.bookShort') || 'Book'}
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 text-[var(--text)] hover:bg-[var(--card-subtle)] rounded-lg focus:outline-none flex-shrink-0"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[var(--surface)] border-b border-[var(--border)] px-4 pt-3 pb-6 space-y-4 shadow-lg animate-in fade-in">
            <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--border)]">
              <span className="text-xs font-medium text-[var(--text-muted)]">{t('nav.preferences')}</span>
              <div className="flex items-center gap-2">
                <LanguageSwitcher />
                <ThemeToggle />
              </div>
            </div>

            <div className="space-y-1">
              {navLinks.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={(e) => handleLinkClick(link.href, e)}
                    className={`block px-3 py-2.5 rounded-lg text-base font-medium transition-colors ${
                      active
                        ? 'bg-[var(--card-subtle)] text-[var(--gold)] font-bold'
                        : 'text-[var(--text)] hover:bg-[var(--card-subtle)]'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>

            {/* Mobile Call Buttons */}
            <div className="pt-2 border-t border-[var(--border)] space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] px-1">
                {t('nav.directStudioLines')}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <a
                  href={`tel:${CONTACT_PHONES[0].raw}`}
                  className="flex items-center justify-between p-3 rounded-xl bg-[var(--card)] border border-[var(--border)] text-[var(--text)]"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[var(--card-subtle)] flex items-center justify-center text-[var(--gold)]">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-medium text-[var(--text-muted)]">
                        {t('nav.callStudio')}
                      </div>
                      <div className="text-sm font-semibold font-mono tabular-nums">
                        {CONTACT_PHONES[0].display}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-[var(--gold)]">{t('common.tapToCall')}</span>
                </a>

                <a
                  href={`tel:${CONTACT_PHONES[1].raw}`}
                  className="flex items-center justify-between p-3 rounded-xl bg-[var(--card)] border border-[var(--border)] text-[var(--text)]"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[var(--card-subtle)] flex items-center justify-center text-[var(--gold)]">
                      <Heart className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-medium text-[var(--text-muted)]">
                        {t('nav.callSalon')}
                      </div>
                      <div className="text-sm font-semibold font-mono tabular-nums">
                        {CONTACT_PHONES[1].display}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-[var(--gold)]">{t('common.tapToCall')}</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
