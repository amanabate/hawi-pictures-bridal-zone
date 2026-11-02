'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Phone,
  MapPin,
  Clock,
  Sparkles,
  PackageCheck,
  Video,
  Crown,
  Calendar,
  Layers,
  ExternalLink,
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Camera,
  Send,
  Share2,
} from 'lucide-react';
import { STUDIO_PHOTOS, StudioPhoto, OWNER_PLACEHOLDERS } from '@/data/about';
import { useLanguage } from '@/lib/language-context';

export default function AboutSection() {
  const { t } = useLanguage();
  const owner = OWNER_PLACEHOLDERS;

  // Inside Our Studio Lightbox state
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);

  const handleOpenPhoto = (idx: number) => {
    setSelectedPhotoIndex(idx);
  };

  const handleCloseModal = useCallback(() => {
    setSelectedPhotoIndex(null);
  }, []);

  const handlePrev = useCallback(() => {
    if (selectedPhotoIndex === null) return;
    setSelectedPhotoIndex((prev) =>
      prev !== null ? (prev === 0 ? STUDIO_PHOTOS.length - 1 : prev - 1) : null
    );
  }, [selectedPhotoIndex]);

  const handleNext = useCallback(() => {
    if (selectedPhotoIndex === null) return;
    setSelectedPhotoIndex((prev) =>
      prev !== null ? (prev === STUDIO_PHOTOS.length - 1 ? 0 : prev + 1) : null
    );
  }, [selectedPhotoIndex]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (selectedPhotoIndex === null) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleCloseModal();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedPhotoIndex, handleCloseModal, handlePrev, handleNext]);

  const whyChooseUsFeatures = [
    {
      icon: Sparkles,
      title: t('whyUs.items.everything.title'),
      description: t('whyUs.items.everything.description'),
    },
    {
      icon: PackageCheck,
      title: t('whyUs.items.pricing.title'),
      description: t('whyUs.items.pricing.description'),
    },
    {
      icon: Video,
      title: t('whyUs.items.video.title'),
      description: t('whyUs.items.video.description'),
    },
    {
      icon: Crown,
      title: t('whyUs.items.bridal.title'),
      description: t('whyUs.items.bridal.description'),
    },
  ];

  const activeModalPhoto: StudioPhoto | null =
    selectedPhotoIndex !== null ? STUDIO_PHOTOS[selectedPhotoIndex] : null;

  return (
    <>
      {/* =========================================================================
          SECTION 1: ABOUT HEADER & FOUNDER CARD
          ========================================================================= */}
      <section
        id="about"
        className="py-16 sm:py-24 bg-[var(--bg)] border-b border-[var(--border)] scroll-mt-20 transition-colors duration-200"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 sm:space-y-20">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[var(--card-subtle)] border border-[var(--gold)]/30 text-[11px] font-bold uppercase tracking-widest text-[var(--gold)]">
              <Sparkles className="w-3.5 h-3.5 text-[var(--gold)]" />
              <span>{t('about.badge')}</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-[var(--gold)] via-[#FCD535] to-[var(--gold-dark)] bg-clip-text text-transparent">
                {t('about.title')}
              </span>
            </h2>

            <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed">
              {t('about.subtitle')}
            </p>
          </div>

          {/* Founder Card: Two columns on desktop, stacked on mobile */}
          <div className="rounded-3xl bg-[var(--surface)] border border-[var(--border)] p-6 sm:p-10 lg:p-12 shadow-sm transition-all">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Left Column: Large rounded photo card with soft gold glow */}
              <div className="lg:col-span-5 flex flex-col items-center">
                <div className="relative w-full max-w-sm aspect-[4/5] rounded-3xl overflow-hidden shadow-[0_0_35px_rgba(201,162,77,0.22)] dark:shadow-[0_0_40px_rgba(252,213,53,0.18)] border-2 border-[var(--gold)]/40 group">
                  <Image
                    src={owner.founderImage}
                    alt={owner.ownerName}
                    fill
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, 400px"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#141008]/80 via-transparent to-transparent pointer-events-none" />

                  {/* Corner Emblem */}
                  <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#141008]/80 backdrop-blur-md border border-[var(--gold)]/40 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--gold)]">
                    <Camera className="w-3 h-3 text-[var(--gold)]" />
                    <span>Hawi Creative Studio</span>
                  </div>
                </div>

                {/* Under the photo: Gold caption role */}
                <div className="mt-4 text-center">
                  <span className="inline-block px-4 py-1.5 rounded-full bg-[var(--card-subtle)] border border-[var(--gold)]/30 text-xs sm:text-sm font-semibold text-[var(--gold)] tracking-wide">
                    {t('about.founderRole')}
                  </span>
                </div>
              </div>

              {/* Right Column: Heading "Meet [Owner name]" with name in gold, then 3 paragraphs */}
              <div className="lg:col-span-7 space-y-6">
                <div>
                  <div className="text-xs font-bold uppercase tracking-widest text-[var(--gold)] mb-1">
                    {t('about.founderBadge')}
                  </div>
                  <h3 className="font-serif text-3xl sm:text-4xl lg:text-4xl font-bold tracking-tight text-[var(--text)]">
                    {t('about.meetPrefix')}{' '}
                    <span className="bg-gradient-to-r from-[var(--gold)] via-[#FCD535] to-[var(--gold-dark)] bg-clip-text text-transparent">
                      {owner.ownerName}
                    </span>
                  </h3>
                </div>

                <div className="space-y-4 text-sm sm:text-base text-[var(--text-muted)] leading-relaxed">
                  <p className="border-l-2 border-[var(--gold)]/40 pl-4 py-0.5 text-[var(--text)] font-medium">
                    {t('about.p1')}
                  </p>
                  <p>{t('about.p2')}</p>
                  <p>{t('about.p3')}</p>
                </div>

                {/* Direct quick action buttons */}
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <Link
                    href="/booking"
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold bg-gradient-to-r from-[var(--gold)] to-[var(--gold-dark)] text-[#141008] hover:brightness-110 shadow-sm transition-all"
                  >
                    <Calendar className="w-4 h-4 text-[#141008]" />
                    <span>{t('about.bookStudio')}</span>
                  </Link>

                  <a
                    href={`tel:${owner.phonePrimary}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold bg-[var(--card-subtle)] text-[var(--text)] hover:bg-[var(--border)] border border-[var(--border)] transition-colors"
                  >
                    <Phone className="w-4 h-4 text-[var(--gold)]" />
                    <span>{t('about.talkWithFounder', { name: owner.ownerName.split(' ')[0] })}</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: INSIDE OUR STUDIO
          ========================================================================= */}
      <section className="py-16 sm:py-24 bg-[var(--surface)] border-b border-[var(--border)] transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[var(--card-subtle)] border border-[var(--gold)]/30 text-[11px] font-bold uppercase tracking-widest text-[var(--gold)]">
              <Sparkles className="w-3.5 h-3.5 text-[var(--gold)]" />
              <span>{t('insideStudio.badge')}</span>
            </div>

            <h3 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[var(--text)]">
              {t('insideStudio.title')}
            </h3>

            <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed">
              {t('insideStudio.subtitle')}
            </p>
          </div>

          {/* Grid of studio photos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {STUDIO_PHOTOS.map((photo, idx) => (
              <div
                key={photo.id}
                onClick={() => handleOpenPhoto(idx)}
                className="group relative rounded-2xl overflow-hidden bg-[var(--card-subtle)] border border-[var(--border)] shadow-sm hover:shadow-xl hover:border-[var(--gold)]/50 transition-all cursor-pointer aspect-[4/3]"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') handleOpenPhoto(idx);
                }}
                aria-label={`Open photo: ${photo.title}`}
              >
                <Image
                  src={photo.image}
                  alt={photo.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />

                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#141008]/90 via-[#141008]/20 to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />

                {/* Maximize prompt icon */}
                <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-[#141008]/70 backdrop-blur-md flex items-center justify-center text-[var(--gold)] opacity-0 group-hover:opacity-100 transition-opacity">
                  <Maximize2 className="w-4 h-4" />
                </div>

                {/* Content at bottom */}
                <div className="absolute bottom-0 inset-x-0 p-4 text-left space-y-1">
                  <h4 className="text-sm font-bold text-[#FAF8F5] leading-snug group-hover:text-[var(--gold)] transition-colors">
                    {photo.title}
                  </h4>
                  <p className="text-xs text-[#D8CEBC] line-clamp-2">{photo.caption}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center text-xs text-[var(--text-muted)] italic">
            {t('insideStudio.clickToView')}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: WHY CHOOSE US
          ========================================================================= */}
      <section className="py-16 sm:py-24 bg-[var(--bg)] border-b border-[var(--border)] transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[var(--card-subtle)] border border-[var(--gold)]/30 text-[11px] font-bold uppercase tracking-widest text-[var(--gold)]">
              <Crown className="w-3.5 h-3.5 text-[var(--gold)]" />
              <span>{t('whyUs.badge')}</span>
            </div>

            <h3 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[var(--text)]">
              <span className="bg-gradient-to-r from-[var(--gold)] via-[#FCD535] to-[var(--gold-dark)] bg-clip-text text-transparent">
                {t('whyUs.title')}
              </span>
            </h3>

            <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed">
              {t('whyUs.subtitle')}
            </p>
          </div>

          {/* 4 Cards with gold icons */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyChooseUsFeatures.map((feature, idx) => {
              const IconComp = feature.icon;
              return (
                <div
                  key={idx}
                  className="group p-6 sm:p-7 rounded-3xl bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--gold)] hover:-translate-y-1 hover:shadow-xl hover:shadow-[var(--gold)]/5 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--card-subtle)] to-[var(--surface)] border border-[var(--border)] group-hover:border-[var(--gold)]/40 flex items-center justify-center transition-colors">
                      <IconComp className="w-6 h-6 text-[var(--gold)]" />
                    </div>
                    <h4 className="font-serif text-lg font-bold text-[var(--text)] group-hover:text-[var(--gold)] transition-colors">
                      {feature.title}
                    </h4>
                    <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
                      {feature.description}
                    </p>
                  </div>

                  <div className="pt-2 text-[11px] font-bold text-[var(--gold)] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>{t('whyUs.standardTag')}</span>
                    <span>→</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: CALL TO ACTION BANNER
          ========================================================================= */}
      <section className="py-16 sm:py-20 bg-gradient-to-b from-[var(--surface)] to-[var(--bg)] border-b border-[var(--border)] transition-colors duration-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl p-8 sm:p-12 lg:p-14 bg-gradient-to-br from-[#1C160C] via-[#141008] to-[#0D0A05] text-[#FAF8F5] border-2 border-[var(--gold)]/40 shadow-2xl text-center space-y-6 relative overflow-hidden">
            {/* Background luxury glow element */}
            <div className="absolute -top-24 -left-24 w-72 h-72 bg-[var(--gold)]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-[var(--gold)]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-2xl mx-auto space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--gold)]/10 border border-[var(--gold)]/30 text-xs font-bold uppercase tracking-wider text-[var(--gold)]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t('cta.locationTag')}</span>
              </div>

              <h3 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#FAF8F5]">
                {t('cta.title')}
              </h3>

              <p className="text-sm sm:text-base text-[#D4C8B8] leading-relaxed">
                {t('cta.subtitle')}
              </p>

              {/* Action Buttons: "Book Now" and "View Packages" */}
              <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/booking"
                  className="inline-flex items-center gap-2 px-7 py-3 rounded-full text-sm font-bold bg-gradient-to-r from-[var(--gold)] via-[#FCD535] to-[var(--gold-dark)] text-[#141008] hover:brightness-110 shadow-lg hover:shadow-xl transition-all"
                >
                  <Calendar className="w-4 h-4 text-[#141008]" />
                  <span>{t('cta.bookNow')}</span>
                </Link>

                <Link
                  href="/packages"
                  className="inline-flex items-center gap-2 px-7 py-3 rounded-full text-sm font-bold bg-white/10 hover:bg-white/20 text-[#FAF8F5] border border-white/20 hover:border-[var(--gold)] backdrop-blur-sm transition-all"
                >
                  <Layers className="w-4 h-4 text-[var(--gold)]" />
                  <span>{t('cta.viewPackages')}</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: CONTACT INFORMATION (Smooth scroll anchor #contact)
          ========================================================================= */}
      <section
        id="contact"
        className="py-16 sm:py-24 bg-[var(--surface)] border-b border-[var(--border)] scroll-mt-20 transition-colors duration-200"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[var(--card-subtle)] border border-[var(--gold)]/30 text-[11px] font-bold uppercase tracking-widest text-[var(--gold)]">
              <Phone className="w-3.5 h-3.5 text-[var(--gold)]" />
              <span>{t('contact.badge')}</span>
            </div>

            <h3 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[var(--text)]">
              <span className="bg-gradient-to-r from-[var(--gold)] via-[#FCD535] to-[var(--gold-dark)] bg-clip-text text-transparent">
                {t('contact.title')}
              </span>
            </h3>

            <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed">
              {t('contact.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Call Us Cards: 0988018016 & 0914878007 (tap to call) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                {t('contact.callUs')} ({t('contact.callUsNote')}):
              </div>

              <div className="space-y-3">
                <a
                  href={`tel:${owner.phonePrimary}`}
                  className="flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-[var(--card)] border border-[var(--border)] hover:border-[var(--gold)] hover:shadow-md transition-all group"
                  title="Tap to call Photography Studio"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-full bg-[var(--card-subtle)] group-hover:bg-[var(--gold)]/10 text-[var(--gold)] flex items-center justify-center transition-colors">
                      <Phone className="w-5 h-5 text-[var(--gold)]" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[var(--gold)] uppercase tracking-wider">
                        {t('contact.mainPhotoLabel')}
                      </div>
                      <div className="font-mono text-lg font-bold text-[var(--text)] tabular-nums">
                        {owner.phonePrimaryDisplay}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[var(--gold)] bg-[var(--card-subtle)] px-3 py-1.5 rounded-full group-hover:bg-[var(--gold)] group-hover:text-[#141008] transition-colors">
                    {t('contact.tapToCall')}
                  </span>
                </a>

                <a
                  href={`tel:${owner.phoneSecondary}`}
                  className="flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-[var(--card)] border border-[var(--border)] hover:border-[var(--gold)] hover:shadow-md transition-all group"
                  title="Tap to call Bridal Salon & Gowns"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-full bg-[var(--card-subtle)] group-hover:bg-[var(--gold)]/10 text-[var(--gold)] flex items-center justify-center transition-colors">
                      <Crown className="w-5 h-5 text-[var(--gold)]" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[var(--gold)] uppercase tracking-wider">
                        {t('contact.bridalSalonLabel')}
                      </div>
                      <div className="font-mono text-lg font-bold text-[var(--text)] tabular-nums">
                        {owner.phoneSecondaryDisplay}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[var(--gold)] bg-[var(--card-subtle)] px-3 py-1.5 rounded-full group-hover:bg-[var(--gold)] group-hover:text-[#141008] transition-colors">
                    {t('contact.tapToCall')}
                  </span>
                </a>
              </div>

              {/* Follow & Explore Icons */}
              <div className="pt-4 space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-[var(--gold)]" />
                  <span>{t('contact.followExplore')}</span>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <a
                    href={owner.socialLinks.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--card)] border border-[var(--border)] hover:border-[var(--gold)] hover:text-[var(--gold)] text-xs font-semibold text-[var(--text)] transition-all"
                  >
                    <span>Instagram</span>
                    <ExternalLink className="w-3 h-3 text-[var(--gold)]" />
                  </a>

                  <a
                    href={owner.socialLinks.tiktok}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--card)] border border-[var(--border)] hover:border-[var(--gold)] hover:text-[var(--gold)] text-xs font-semibold text-[var(--text)] transition-all"
                  >
                    <span>TikTok</span>
                    <ExternalLink className="w-3 h-3 text-[var(--gold)]" />
                  </a>

                  <a
                    href={owner.socialLinks.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--card)] border border-[var(--border)] hover:border-[var(--gold)] hover:text-[var(--gold)] text-xs font-semibold text-[var(--text)] transition-all"
                  >
                    <span>Facebook</span>
                    <ExternalLink className="w-3 h-3 text-[var(--gold)]" />
                  </a>

                  <a
                    href={owner.socialLinks.telegram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--card)] border border-[var(--border)] hover:border-[var(--gold)] hover:text-[var(--gold)] text-xs font-semibold text-[var(--text)] transition-all"
                  >
                    <Send className="w-3 h-3 text-[var(--gold)]" />
                    <span>Telegram</span>
                    <ExternalLink className="w-3 h-3 text-[var(--gold)]" />
                  </a>
                </div>
              </div>
            </div>

            {/* Location & Opening Hours Card + View on Google Maps button */}
            <div className="lg:col-span-7 rounded-3xl bg-[var(--card)] border border-[var(--border)] p-6 sm:p-8 space-y-6 shadow-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Location */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[var(--gold)] font-bold text-sm">
                    <MapPin className="w-4 h-4 text-[var(--gold)]" />
                    <span>{t('contact.locationTitle')}</span>
                  </div>
                  <div className="text-sm font-semibold text-[var(--text)]">{owner.address}</div>
                  <div className="text-xs text-[var(--text-muted)] leading-relaxed">
                    {owner.landmark}
                  </div>
                </div>

                {/* Opening Hours */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[var(--gold)] font-bold text-sm">
                    <Clock className="w-4 h-4 text-[var(--gold)]" />
                    <span>{t('contact.openingHoursTitle')}</span>
                  </div>
                  <div className="text-sm font-semibold text-[var(--text)]">{owner.openingHours}</div>
                  <div className="text-xs text-[var(--text-muted)] leading-relaxed">
                    {owner.openingHoursDetails}
                  </div>
                </div>
              </div>

              {/* View on Google Maps Button */}
              <div className="pt-2 border-t border-[var(--border)] flex flex-wrap items-center justify-between gap-4">
                <div className="text-xs text-[var(--text-muted)]">
                  {t('contact.parkingNote')}
                </div>

                <a
                  href={owner.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold bg-gradient-to-r from-[var(--gold)] to-[var(--gold-dark)] text-[#141008] hover:brightness-110 shadow-sm transition-all"
                >
                  <MapPin className="w-4 h-4 text-[#141008]" />
                  <span>{t('contact.viewGoogleMaps')}</span>
                  <ExternalLink className="w-3 h-3 text-[#141008]" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          FULL SCREEN LIGHTBOX VIEWER FOR INSIDE OUR STUDIO
          ========================================================================= */}
      {selectedPhotoIndex !== null && activeModalPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          {/* Close button */}
          <button
            type="button"
            onClick={handleCloseModal}
            className="absolute top-4 right-4 z-50 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors focus:outline-none"
            aria-label={t('insideStudio.closeModal')}
          >
            <X className="w-6 h-6" />
          </button>

          {/* Prev / Next controls */}
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 transition-all focus:outline-none"
            aria-label="Previous photo"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 transition-all focus:outline-none"
            aria-label="Next photo"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Modal Content container */}
          <div className="relative max-w-4xl w-full max-h-[85vh] flex flex-col items-center">
            <div className="relative w-full h-[60vh] sm:h-[70vh] rounded-2xl overflow-hidden border border-white/15 shadow-2xl">
              <Image
                src={activeModalPhoto.image}
                alt={activeModalPhoto.title}
                fill
                className="object-contain"
                sizes="(max-width: 1200px) 100vw, 1200px"
                priority
              />
            </div>

            {/* Caption bar */}
            <div className="mt-4 text-center max-w-xl text-white space-y-1">
              <div className="text-xs uppercase tracking-widest text-[var(--gold)] font-bold">
                {t('insideStudio.count')} {selectedPhotoIndex + 1} / {STUDIO_PHOTOS.length}
              </div>
              <h4 className="text-lg font-serif font-bold text-white">
                {activeModalPhoto.title}
              </h4>
              <p className="text-xs text-neutral-300">{photoCaptionsMap[activeModalPhoto.id] || activeModalPhoto.caption}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const photoCaptionsMap: Record<string, string> = {
  'studio-1': 'State-of-the-art continuous lighting, backdrops, and portrait studio staging.',
  'studio-2': 'Private fitting rooms featuring imported European gowns, crystal veils, and royal tiaras.',
  'studio-3': 'Dedicated professional makeup mirrors, hair styling stations, and luxury skincare prep.',
  'studio-4': 'Authentic Habesha cultural attire, Tilfi embroidery, and Melse celebration wardrobe.',
  'studio-5': 'Color-calibrated editing workstations producing master 4K film and highlight teasers.',
  'studio-6': 'Browse physical crystal albums, 60x120 canvas boards, and hexagon wall displays in comfort.',
};
