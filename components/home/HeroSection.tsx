'use client';

import React, { useState, useEffect, useSyncExternalStore } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Sparkles, Phone } from 'lucide-react';
import { CONTACT_PHONES } from '@/data/packages';
import { useLanguage } from '@/lib/language-context';

// Subscription for user's system "prefers-reduced-motion" preference
function subscribeReducedMotion(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  mediaQuery.addEventListener('change', callback);
  return () => mediaQuery.removeEventListener('change', callback);
}

function getReducedMotionSnapshot() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function getReducedMotionServerSnapshot() {
  return false;
}

// Inner Typewriter component keyed by language so it restarts automatically
function TypewriterHeadline({
  sentences,
  isReducedMotion,
}: {
  sentences: string[];
  isReducedMotion: boolean;
}) {
  const [sentenceIndex, setSentenceIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // If reduced motion is requested, render the first sentence statically
  const currentSentence = sentences[sentenceIndex % sentences.length] || sentences[0] || '';

  useEffect(() => {
    if (isReducedMotion) return;

    let timer: NodeJS.Timeout;

    if (!isDeleting) {
      // Typing forward letter by letter (~70ms)
      if (displayedText.length < currentSentence.length) {
        timer = setTimeout(() => {
          setDisplayedText(currentSentence.slice(0, displayedText.length + 1));
        }, 70);
      } else {
        // Full sentence typed: pause for ~2 seconds (2000ms) before deleting
        timer = setTimeout(() => {
          setIsDeleting(true);
        }, 2000);
      }
    } else {
      // Erasing backward letter by letter (~35ms)
      if (displayedText.length > 0) {
        timer = setTimeout(() => {
          setDisplayedText(currentSentence.slice(0, displayedText.length - 1));
        }, 35);
      } else {
        // Full sentence erased: short pause (~450ms) before typing next sentence
        timer = setTimeout(() => {
          setIsDeleting(false);
          setSentenceIndex((prev) => (prev + 1) % sentences.length);
        }, 450);
      }
    }

    return () => clearTimeout(timer);
  }, [displayedText, isDeleting, currentSentence, sentences, isReducedMotion]);

  if (isReducedMotion) {
    return (
      <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal tracking-tight leading-[1.18] sm:leading-[1.15] text-center drop-shadow-md break-words">
        <span className="sr-only">{sentences[0]}</span>
        <span
          aria-hidden="true"
          className="bg-gradient-to-r from-[var(--gold)] via-[#FCD535] to-[var(--gold-dark)] bg-clip-text text-transparent inline"
        >
          {sentences[0]}
        </span>
      </h1>
    );
  }

  return (
    <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal tracking-tight leading-[1.18] sm:leading-[1.15] text-center drop-shadow-md break-words">
      {/* Screen readers read the full current sentence cleanly */}
      <span className="sr-only" aria-live="polite">
        {currentSentence}
      </span>

      {/* Visible letter-by-letter animated text */}
      <span
        aria-hidden="true"
        className="bg-gradient-to-r from-[var(--gold)] via-[#FCD535] to-[var(--gold-dark)] bg-clip-text text-transparent inline"
      >
        {displayedText}
      </span>

      {/* Blinking thin gold cursor */}
      <span
        aria-hidden="true"
        className="inline-block w-[3px] sm:w-[4px] h-[0.82em] bg-[var(--gold)] ml-1.5 align-baseline animate-cursor-blink shadow-[0_0_8px_var(--gold)] rounded-xs"
      />
    </h1>
  );
}

export default function HeroSection() {
  const { t, rawDict, language } = useLanguage();
  const sentences = rawDict.hero.sentences;

  const isReducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );

  return (
    <section className="relative min-h-[580px] lg:min-h-[660px] flex items-center justify-center overflow-hidden bg-[var(--bg)] transition-colors duration-200">
      {/* Background Wedding Photography with scrim */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hawi_hero_wedding_1793302555646.jpg"
          alt="Hawi Pictures & Bridal Zone - Ethiopian Wedding Photography and Bridal Glamour"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center scale-105"
        />

        {/* Adaptive scrim overlay: preserves readability in light and dark mode */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/55 to-black/85 dark:from-black/90 dark:via-black/70 dark:to-black/95 transition-opacity" />
        <div className="absolute inset-0 bg-radial from-transparent via-black/35 to-black/75 pointer-events-none" />
      </div>

      {/* Hero Content Container */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-20 lg:py-24 text-center flex flex-col items-center justify-center space-y-5 sm:space-y-6">
        {/* 1. Top Small Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-[var(--gold)]/60 shadow-md">
          <span className="w-2 h-2 rounded-full bg-[var(--gold)] shadow-[0_0_8px_var(--gold)]" />
          <span className="text-[11px] sm:text-xs font-bold tracking-[0.16em] uppercase text-[var(--gold)]">
            {t('hero.badge')}
          </span>
        </div>

        {/* 2. Rotating Typewriter Headline with Fixed Reserved Height to Prevent Any Layout Shift */}
        <div className="w-full max-w-4xl mx-auto flex items-center justify-center min-h-[110px] sm:min-h-[130px] md:min-h-[150px] lg:min-h-[175px] px-2">
          <TypewriterHeadline
            key={language}
            sentences={sentences}
            isReducedMotion={isReducedMotion}
          />
        </div>

        {/* 3. Sub-line: "Photography • Bridal • Beauty • Makeup • Aadaa" in small, widely spaced letters */}
        <div className="pt-1">
          <p className="text-[11px] sm:text-xs md:text-sm font-semibold tracking-[0.24em] sm:tracking-[0.32em] uppercase text-white/95 drop-shadow-sm px-2">
            <span className="text-[var(--gold)]">Photography</span>
            <span className="text-white/40 mx-2 sm:mx-3">•</span>
            <span className="text-[var(--gold)]">Bridal</span>
            <span className="text-white/40 mx-2 sm:mx-3">•</span>
            <span className="text-[var(--gold)]">Beauty</span>
            <span className="text-white/40 mx-2 sm:mx-3">•</span>
            <span className="text-[var(--gold)]">Makeup</span>
            <span className="text-white/40 mx-2 sm:mx-3">•</span>
            <span className="text-[var(--gold)]">Aadaa</span>
          </p>
        </div>

        {/* 4. Action Buttons ("Book Now" and "View Packages") */}
        <div className="pt-3 flex flex-row items-center justify-center gap-3 sm:gap-4 flex-wrap">
          {/* Left Gold Button: BOOK NOW */}
          <Link
            href="/booking"
            className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider text-[#141008] bg-gradient-to-r from-[var(--gold)] to-[var(--gold-dark)] hover:brightness-110 active:scale-95 shadow-lg shadow-[var(--gold)]/25 transition-all"
          >
            <Calendar className="w-4 h-4 text-[#141008]" />
            <span>{t('hero.bookNow')}</span>
          </Link>

          {/* Right Frosted Button: VIEW PACKAGES */}
          <Link
            href="/packages"
            className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider text-white bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 active:scale-95 shadow-md transition-all"
          >
            <Sparkles className="w-4 h-4 text-[var(--gold)]" />
            <span>{t('hero.viewPackages')}</span>
          </Link>
        </div>

        {/* 5. Bottom Floating Glass Container (3 Pillars) */}
        <div className="w-full max-w-3xl mx-auto pt-6 sm:pt-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-2 p-4 sm:p-5 rounded-2xl bg-black/55 backdrop-blur-md border border-white/20 shadow-2xl">
            {/* Stat 1: 1,200+ */}
            <div className="flex flex-col items-center justify-center text-center px-2 py-1">
              <span className="font-serif text-xl sm:text-2xl font-bold text-[var(--gold)] tracking-tight tabular-nums">
                {t('hero.weddingsCount')}
              </span>
              <span className="text-[10px] sm:text-[11px] font-bold tracking-wider uppercase text-white/80 mt-0.5">
                {t('hero.weddingsLabel')}
              </span>
            </div>

            {/* Stat 2: Haute Couture */}
            <div className="flex flex-col items-center justify-center text-center px-2 py-1 sm:border-x sm:border-white/20">
              <span className="font-serif text-xl sm:text-2xl font-bold text-[var(--gold)] tracking-tight">
                {t('hero.coutureTitle')}
              </span>
              <span className="text-[10px] sm:text-[11px] font-bold tracking-wider uppercase text-white/80 mt-0.5">
                {t('hero.coutureLabel')}
              </span>
            </div>

            {/* Stat 3: Finfinnee & Beyond */}
            <div className="flex flex-col items-center justify-center text-center px-2 py-1">
              <span className="font-serif text-xl sm:text-2xl font-bold text-[var(--gold)] tracking-tight">
                {t('hero.destinationTitle')}
              </span>
              <span className="text-[10px] sm:text-[11px] font-bold tracking-wider uppercase text-white/80 mt-0.5">
                {t('hero.destinationLabel')}
              </span>
            </div>
          </div>
        </div>

        {/* Tap-To-Call Quick Link */}
        <div className="pt-2 flex items-center justify-center gap-4 text-xs text-white/80">
          <span>{t('hero.callStudio')}:</span>
          <a
            href={`tel:${CONTACT_PHONES[0].raw}`}
            className="inline-flex items-center gap-1 font-mono text-[var(--gold)] hover:underline font-semibold"
          >
            <Phone className="w-3 h-3 text-[var(--gold)]" />
            <span>0988 01 80 16</span>
          </a>
          <span>·</span>
          <a
            href={`tel:${CONTACT_PHONES[1].raw}`}
            className="inline-flex items-center gap-1 font-mono text-[var(--gold)] hover:underline font-semibold"
          >
            <Phone className="w-3 h-3 text-[var(--gold)]" />
            <span>0914 87 80 07</span>
          </a>
        </div>
      </div>
    </section>
  );
}
