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
    { label: t('nav.admin'), href: '/admin' },
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
      <header className="sticky top-0 z-40 bg-[var(--surface)]/95 backdrop-blur-md border-b border-[var(--border)] transition-colors duration-200 overflow-hidden">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-1 sm:gap-2 md:gap-3 lg:gap-4">
          {/* Zone 1: Brand title wordmark */}
          <Link
            href="/"
            className="flex items-center gap-1.5 sm:gap-2 group whitespace-nowrap flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)] rounded-lg p-1"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-full bg-gradient-to-br from-[var(--gold)] via-[var(--gold-dark)] to-[#785414] p-0.5 shadow-sm group-hover:scale-105 transition-transform flex items-center justify-center flex-shrink-0">
              <div className="w-full h-full rounded-full bg-[#141008] flex items-center justify-center text-[var(--gold)]">
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-[var(--gold)]" />
              </div>
            </div>
            <div className="flex flex-col min-w-0 max-w-[120px] sm:max-w-none">
              <span className="font-serif text-sm sm:text-base lg:text-lg xl:text-xl font-bold tracking-tight text-[var(--text)] leading-tight truncate">
                Hawi Pictures
              </span>
              <span className="text-[7px] sm:text-[8px] lg:text-[9px] tracking-[0.15em] sm:tracking-[0.2em] uppercase font-bold text-[var(--gold-text)] truncate">
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
          <div className="hidden md:flex items-center gap-1 lg:gap-2 flex-shrink-0">
            {/* Language Switcher Pill */}
            <LanguageSwitcher />

            {/* Theme Toggle Button */}
            <ThemeToggle />

            {/* Quick Call Pill */}
            <div className="relative hidden lg:block">
              <button
                type="button"
                onClick={() => setShowCallDropdown(!showCallDropdown)}
                className="inline-flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 text-xs font-semibold text-[var(--text)] bg-[var(--card-subtle)] hover:bg-[var(--border)] border border-[var(--border)] rounded-full transition-colors whitespace-nowrap"
              >
                <Phone className="w-3.5 h-3.5 text-[var(--gold)]" />
                <span className="hidden xl:inline">{t('common.callUs')}</span>
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
              className="inline-flex items-center gap-1.5 lg:gap-2 px-3 lg:px-4 py-1.5 lg:py-2 text-xs lg:text-sm font-semibold text-[#141008] bg-gradient-to-r from-[var(--gold)] to-[var(--gold-dark)] hover:brightness-110 shadow-sm rounded-full transition-all hover:shadow-md whitespace-nowrap"
            >
              <Calendar className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-[#141008]" />
              <span className="hidden lg:inline">{t('nav.bookNowNav')}</span>
              <span className="lg:hidden">{t('nav.bookShort') || 'Book'}</span>
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
