'use client';

import React from 'react';
import Link from 'next/link';
import { Phone, MapPin, Clock, Sparkles, Heart, Camera, Send, MessageCircle, ExternalLink } from 'lucide-react';
import { OWNER_PLACEHOLDERS } from '@/data/about';
import { useLanguage } from '@/lib/language-context';
import PWAInstallButton from '@/components/pwa/PWAInstallButton';

export default function Footer() {
  const { t } = useLanguage();
  const owner = OWNER_PLACEHOLDERS;

  return (
    <footer className="bg-[var(--surface)] text-[var(--text)] border-t border-[var(--border)] pt-16 pb-24 sm:pb-16 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Col 1: Studio Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--gold)] to-[var(--gold-dark)] flex items-center justify-center text-[#141008]">
                <Sparkles className="w-5 h-5 text-[#141008]" />
              </div>
              <div>
                <span className="font-serif text-xl font-bold tracking-tight text-[var(--text)] block">
                  Hawi Pictures & Bridal Zone
                </span>
                <span className="text-[11px] font-semibold text-[var(--gold)] block tracking-wide">
                  {t('footer.servicesLine')}
                </span>
              </div>
            </div>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              {t('footer.description')}
            </p>
            <div className="flex items-center gap-2 text-xs text-[var(--gold)] font-medium">
              <Camera className="w-4 h-4 text-[var(--gold)]" />
              <span>{t('footer.celebrationsCount')}</span>
            </div>
          </div>

          {/* Col 2: Direct Contact & Tap-to-Call */}
          <div className="space-y-4">
            <h4 className="font-serif text-base font-semibold text-[var(--text)] tracking-wide">
              {t('footer.directContactHeader')}
            </h4>
            <div className="space-y-3">
              <a
                href={`tel:${owner.phonePrimary}`}
                className="flex items-start gap-3 p-3 rounded-xl bg-[var(--card-subtle)] hover:bg-[var(--border)] border border-[var(--border)] transition-colors group"
              >
                <div className="p-2 rounded-lg bg-[var(--surface)] text-[var(--gold)] group-hover:scale-110 transition-transform">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs text-[var(--text-muted)]">{t('footer.mainStudioLabel')}</div>
                  <div className="text-sm font-semibold text-[var(--text)] font-mono tabular-nums">
                    {owner.phonePrimaryDisplay}
                  </div>
                  <div className="text-[10px] text-[var(--gold)] mt-0.5">{t('contact.tapToCall')}</div>
                </div>
              </a>

              <a
                href={`tel:${owner.phoneSecondary}`}
                className="flex items-start gap-3 p-3 rounded-xl bg-[var(--card-subtle)] hover:bg-[var(--border)] border border-[var(--border)] transition-colors group"
              >
                <div className="p-2 rounded-lg bg-[var(--surface)] text-[var(--gold)] group-hover:scale-110 transition-transform">
                  <Heart className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs text-[var(--text-muted)]">{t('footer.bridalSalonLabel')}</div>
                  <div className="text-sm font-semibold text-[var(--text)] font-mono tabular-nums">
                    {owner.phoneSecondaryDisplay}
                  </div>
                  <div className="text-[10px] text-[var(--gold)] mt-0.5">{t('contact.tapToCall')}</div>
                </div>
              </a>
            </div>
          </div>

          {/* Col 3: Quick Navigation */}
          <div className="space-y-4">
            <h4 className="font-serif text-base font-semibold text-[var(--text)] tracking-wide">
              {t('footer.exploreHeader')}
            </h4>
            <ul className="space-y-2 text-xs text-[var(--text-muted)]">
              <li>
                <Link href="/" className="hover:text-[var(--gold)] transition-colors">
                  {t('nav.home')}
                </Link>
              </li>
              <li>
                <Link href="/#services" className="hover:text-[var(--gold)] transition-colors">
                  {t('nav.services')}
                </Link>
              </li>
              <li>
                <Link href="/#gallery" className="hover:text-[var(--gold)] transition-colors">
                  {t('nav.gallery')}
                </Link>
              </li>
              <li>
                <Link href="/#about" className="hover:text-[var(--gold)] transition-colors">
                  {t('nav.about')}
                </Link>
              </li>
              <li>
                <Link href="/#contact" className="hover:text-[var(--gold)] transition-colors">
                  {t('nav.contact')}
                </Link>
              </li>
              <li>
                <Link href="/packages" className="hover:text-[var(--gold)] transition-colors">
                  {t('nav.packages')}
                </Link>
              </li>
              <li>
                <Link href="/booking" className="hover:text-[var(--gold)] transition-colors">
                  {t('nav.booking')}
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-[var(--gold)] transition-colors">
                  {t('nav.admin')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Studio Location & Hours */}
          <div className="space-y-4">
            <h4 className="font-serif text-base font-semibold text-[var(--text)] tracking-wide">
              {t('footer.hoursHeader')}
            </h4>
            <div className="space-y-2.5 text-xs text-[var(--text-muted)]">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[var(--gold)] shrink-0 mt-0.5" />
                <span>{owner.address}, {owner.city}, Ethiopia</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-[var(--gold)] shrink-0 mt-0.5" />
                <div>
                  <div className="text-[var(--text)] font-medium">{t('footer.hoursMonSun')}</div>
                  <div className="text-[11px] text-[var(--text-muted)]">{t('footer.hoursNote')}</div>
                </div>
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <div className="text-[11px] uppercase tracking-wider font-semibold text-[var(--text-muted)]">
                {t('footer.servicesProvidedHeader')}:
              </div>
              <div className="text-xs text-[var(--gold)] font-medium">
                Photography, Bridal, Beauty, Makeup, Aadaa
              </div>

              {/* Direct App Actions (Telegram, WhatsApp, Maps) */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <a
                  href="https://t.me/hawipictures"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1.5 rounded-lg bg-[var(--card-subtle)] hover:bg-sky-500/10 border border-[var(--border)] hover:border-sky-500/40 text-xs font-semibold text-sky-500 flex items-center gap-1.5 transition-colors"
                  title="Open Telegram Channel"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Telegram</span>
                </a>

                <a
                  href="https://wa.me/251988018016"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1.5 rounded-lg bg-[var(--card-subtle)] hover:bg-emerald-500/10 border border-[var(--border)] hover:border-emerald-500/40 text-xs font-semibold text-emerald-500 flex items-center gap-1.5 transition-colors"
                  title="Direct WhatsApp Chat"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>

                <a
                  href="https://maps.app.goo.gl/7V8wNiNob81BmDN89"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1.5 rounded-lg bg-[var(--card-subtle)] hover:bg-[var(--gold)]/10 border border-[var(--border)] hover:border-[var(--gold)]/40 text-xs font-semibold text-[var(--gold-text)] flex items-center gap-1.5 transition-colors"
                  title="Open in Google Maps"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Maps</span>
                  <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom divider and copyright */}
        <div className="pt-8 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--text-muted)]">
          <div>
            {t('footer.copyright')}
          </div>
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <PWAInstallButton variant="footer" />
            <Link href="/packages" className="hover:text-[var(--gold)] transition-colors">
              {t('footer.pricingLink')}
            </Link>
            <Link href="/booking" className="hover:text-[var(--gold)] transition-colors">
              {t('footer.reservationsLink')}
            </Link>
            <Link href="/admin" className="hover:text-[var(--gold)] transition-colors">
              {t('footer.adminLink')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
