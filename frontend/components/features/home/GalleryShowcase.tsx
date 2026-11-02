'use client';

import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  Camera,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Calendar,
  Maximize2,
  MapPin
} from 'lucide-react';
import {
  GALLERY_SECTION_DATA,
  GALLERY_CATEGORIES,
  GalleryPhoto,
  GalleryCategoryFilter,
  getGalleryCaption
} from '@/data/gallery';
import { useLanguage } from '@/lib/language-context';

export default function GalleryShowcase() {
  const { t, language } = useLanguage();
  const { photos } = GALLERY_SECTION_DATA;

  const [activeCategory, setActiveCategory] = useState<GalleryCategoryFilter>('All');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Filter photos based on active category
  const filteredPhotos = useMemo(() => {
    if (activeCategory === 'All') return photos.slice(0, 10);
    return photos.filter((p) => p.category === activeCategory).slice(0, 10);
  }, [activeCategory, photos]);

  // Touch tracking for mobile swipe in lightbox
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const activePhotoList = useMemo(() => {
    if (activeCategory === 'All') return photos.slice(0, 10);
    return photos.filter((p) => p.category === activeCategory).slice(0, 10);
  }, [activeCategory, photos]);

  const handleOpenLightbox = (index: number) => {
    setLightboxIndex(index);
  };

  const handleCloseLightbox = useCallback(() => {
    setLightboxIndex(null);
  }, []);

  const handlePrev = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) => {
      if (prev === null) return 0;
      return prev === 0 ? activePhotoList.length - 1 : prev - 1;
    });
  }, [lightboxIndex, activePhotoList.length]);

  const handleNext = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) => {
      if (prev === null) return 0;
      return prev === activePhotoList.length - 1 ? 0 : prev + 1;
    });
  }, [lightboxIndex, activePhotoList.length]);

  // Keyboard controls for lightbox
  useEffect(() => {
    if (lightboxIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleCloseLightbox();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, handleCloseLightbox, handlePrev, handleNext]);

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const diffX = e.changedTouches[0].clientX - touchStartX.current;
    const diffY = e.changedTouches[0].clientY - touchStartY.current;

    // Detect horizontal swipe if delta X is dominant and > 45px
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 45) {
      if (diffX > 0) {
        handlePrev(); // Swiped right -> go to previous
      } else {
        handleNext(); // Swiped left -> go to next
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  const currentPhoto: GalleryPhoto | null =
    lightboxIndex !== null && activePhotoList[lightboxIndex]
      ? activePhotoList[lightboxIndex]
      : null;

  return (
    <section
      id="gallery"
      className="py-16 sm:py-24 bg-[var(--bg)] border-b border-[var(--border)] transition-colors duration-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-12">
        {/* Centered Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[var(--card-subtle)] border border-[var(--gold)]/30 text-[11px] font-bold uppercase tracking-widest text-[var(--gold)]">
            <Camera className="w-3.5 h-3.5 text-[var(--gold)]" />
            <span>{t('gallery.badge')}</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-[var(--gold)] via-[#FCD535] to-[var(--gold-dark)] bg-clip-text text-transparent">
              {t('gallery.title')}
            </span>
          </h2>

          <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed">
            {t('gallery.subtitle')}
          </p>
        </div>

        {/* Filter Pills: All, Wedding, Bridal, Makeup, Traditional, Studio */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          {GALLERY_CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat;
            const labelMap: Record<GalleryCategoryFilter, string> = {
              All: t('gallery.filters.all'),
              Wedding: t('gallery.filters.wedding'),
              Bridal: t('gallery.filters.bridal'),
              Makeup: t('gallery.filters.makeup'),
              Traditional: t('gallery.filters.traditional'),
              Studio: t('gallery.filters.studio'),
            };

            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--gold)]/50 ${
                  isActive
                    ? 'bg-gradient-to-r from-[var(--gold)] to-[var(--gold-dark)] text-[#141008] font-bold shadow-md shadow-[var(--gold)]/20 scale-105'
                    : 'bg-[var(--surface)] text-[var(--text-muted)] border border-[var(--border)] hover:text-[var(--text)] hover:bg-[var(--card-subtle)]'
                }`}
              >
                {labelMap[cat] || cat}
              </button>
            );
          })}
        </div>

        {/* Responsive Photo Grid: 5 cols on desktop, 2 on mobile */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-5">
          {filteredPhotos.map((photo, index) => {
            const caption = getGalleryCaption(photo, language);

            return (
              <div
                key={photo.id}
                onClick={() => handleOpenLightbox(index)}
                className="group relative rounded-2xl sm:rounded-3xl overflow-hidden cursor-pointer bg-[var(--card-subtle)] border border-[var(--border)] shadow-sm hover:shadow-xl hover:border-[var(--gold)] transition-all duration-300 aspect-[4/5] flex flex-col"
              >
                {/* Image with Lazy Loading */}
                <img
                  src={photo.imageUrl}
                  alt={photo.altText || caption}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                />

                {/* Scrim Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-300" />

                {/* Small Gold Pill Label in Top-Left Corner */}
                <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 z-10">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r from-[var(--gold)] to-[var(--gold-dark)] text-[#141008] shadow-sm">
                    {photo.category.toUpperCase()}
                  </span>
                </div>

                {/* Hover inspect icon top-right */}
                <div className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/50 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <Maximize2 className="w-3.5 h-3.5 text-[var(--gold)]" />
                </div>

                {/* Caption Preview at bottom */}
                <div className="absolute bottom-0 inset-x-0 p-3 sm:p-4 text-white z-10 translate-y-1 group-hover:translate-y-0 transition-transform">
                  <p className="text-[11px] sm:text-xs font-medium text-white/90 line-clamp-2 leading-snug drop-shadow-sm">
                    {caption}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* View Full Gallery Button */}
        <div className="text-center pt-4">
          <Link
            href="/packages"
            className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider text-[var(--text)] bg-[var(--surface)] border border-[var(--border)] hover:bg-[var(--card-subtle)] hover:border-[var(--gold)] shadow-sm hover:shadow-md transition-all group"
          >
            <Eye className="w-4 h-4 text-[var(--gold)] group-hover:scale-110 transition-transform" />
            <span>{t('gallery.viewFull')}</span>
          </Link>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* FULL-SCREEN LIGHTBOX VIEWER WITH NEXT/PREVIOUS ARROWS & MOBILE SWIPE */}
      {/* ========================================================================= */}
      {currentPhoto && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col justify-between p-3 sm:p-6 animate-in fade-in duration-200"
          onClick={handleCloseLightbox}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Top Bar: Category badge, counter, close button */}
          <div
            className="flex items-center justify-between z-20 w-full max-w-6xl mx-auto px-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-[var(--gold)] text-[#141008] shadow-sm">
                {currentPhoto.category}
              </span>
              <span className="text-xs sm:text-sm font-mono text-white/70 tabular-nums">
                {(lightboxIndex ?? 0) + 1} / {activePhotoList.length}
              </span>
            </div>

            <button
              type="button"
              onClick={handleCloseLightbox}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/10 hover:bg-white/25 active:scale-95 text-white flex items-center justify-center transition-all border border-white/20"
              aria-label={t('gallery.modal.close')}
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>

          {/* Central Media Stage: Prev Arrow, Image, Next Arrow */}
          <div
            className="relative flex-1 flex items-center justify-center my-3 sm:my-4 max-w-6xl w-full mx-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Previous Arrow Button */}
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-1 sm:left-4 z-20 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-black/60 hover:bg-[var(--gold)] hover:text-[#141008] active:scale-95 text-white border border-white/20 flex items-center justify-center transition-all shadow-xl backdrop-blur-md"
              aria-label={t('gallery.modal.prev')}
            >
              <ChevronLeft className="w-6 h-6 sm:w-7 sm:h-7" />
            </button>

            {/* Main Image Frame */}
            <div className="relative max-h-[70vh] sm:max-h-[75vh] w-auto max-w-full flex items-center justify-center rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={currentPhoto.imageUrl}
                alt={currentPhoto.altText || getGalleryCaption(currentPhoto, language)}
                className="max-h-[70vh] sm:max-h-[75vh] w-auto max-w-full object-contain mx-auto select-none rounded-xl"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Next Arrow Button */}
            <button
              type="button"
              onClick={handleNext}
              className="absolute right-1 sm:right-4 z-20 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-black/60 hover:bg-[var(--gold)] hover:text-[#141008] active:scale-95 text-white border border-white/20 flex items-center justify-center transition-all shadow-xl backdrop-blur-md"
              aria-label={t('gallery.modal.next')}
            >
              <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7" />
            </button>
          </div>

          {/* Bottom Caption & Action Bar */}
          <div
            className="w-full max-w-4xl mx-auto p-4 sm:p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 z-20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-1 max-w-xl">
              <div className="flex items-center gap-2 text-[11px] text-[var(--gold)] font-medium">
                {currentPhoto.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[var(--gold)]" />
                    <span>{currentPhoto.location}</span>
                  </span>
                )}
                <span>•</span>
                <span className="text-white/60">{t('gallery.modal.swipeHint')}</span>
              </div>
              <p className="font-serif text-sm sm:text-base font-semibold text-white/95 leading-snug">
                {getGalleryCaption(currentPhoto, language)}
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
              <Link
                href="/booking"
                onClick={handleCloseLightbox}
                className="w-full sm:w-auto px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider text-[#141008] bg-gradient-to-r from-[var(--gold)] to-[var(--gold-dark)] hover:brightness-110 active:scale-95 transition-all text-center flex items-center justify-center gap-2 shadow-md"
              >
                <Calendar className="w-3.5 h-3.5 text-[#141008]" />
                <span>{t('services.bookNow')}</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
