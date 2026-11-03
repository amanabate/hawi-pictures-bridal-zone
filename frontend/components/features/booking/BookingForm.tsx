'use client';

import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  User,
  Upload,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  CreditCard,
  Copy,
  Check,
  Send,
  Lock,
  Info,
  UserCheck,
  Phone,
  WifiOff,
  Search
} from 'lucide-react';
import {
  PACKAGES_DATA,
  PAYMENT_METHODS,
  CONTACT_PHONES,
  getPackageName,
  getPackageTagline,
  getPackageFeatures
} from '@/data/packages';
import { saveBooking, generateBookingCode, Booking } from '@/lib/storage';
import { useManagedPackages, toPublicWeddingPackage, logActivity } from '@/lib/data-store';
import {
  useCapacitySettings,
  getCapacityForDate,
  validateTelegramUsername,
  addWaitlistEntry,
  DateCapacityResult
} from '@/lib/capacity-store';
import { useLanguage } from '@/lib/language-context';
import { usePWA } from '@/lib/use-pwa';

export default function BookingForm() {
  const { t, language, formatCurrency } = useLanguage();
  const searchParams = useSearchParams();
  const preSelectedPackageId = searchParams.get('package');

  const managedPackages = useManagedPackages();
  const capacitySettings = useCapacitySettings();

  const activePackages = useMemo(() => {
    const list = managedPackages.filter((p) => p.status === 'active' && !p.deletedAt);
    return list.map(toPublicWeddingPackage);
  }, [managedPackages]);

  // Form State (initialized cleanly to ensure 100% identical SSR & client hydration)
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [telegramUsername, setTelegramUsername] = useState('');
  const [isPhoneOnly, setIsPhoneOnly] = useState(false);
  const [clientLanguage, setClientLanguage] = useState<'en' | 'om' | 'am'>((language as 'en' | 'om' | 'am') || 'om');

  const [selectedPackageId, setSelectedPackageId] = useState(
    preSelectedPackageId || (activePackages[0]?.id || 'special-package')
  );

  // Initial event date (default stable upcoming weekend date)
  const [eventDate, setEventDate] = useState('2026-11-14');
  const [timeOfDay, setTimeOfDay] = useState('Full Day (All Day & Evening)');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Commercial Bank of Ethiopia (CBE)');
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [referenceNumber, setReferenceNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { isOnline } = usePWA();

  // Waitlist form state for full dates
  const [showWaitlistModal, setShowWaitlistModal] = useState(false);
  const [waitlistNotes, setWaitlistNotes] = useState('');
  const [waitlistSubmitted, setWaitlistSubmitted] = useState(false);

  // Confirmation modal state
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedAccountIndex, setCopiedAccountIndex] = useState<number | null>(null);
  const [hasLoadedDraft, setHasLoadedDraft] = useState(false);

  // Restore saved offline draft on client mount only after initial hydration completes
  React.useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const saved = localStorage.getItem('hawi_booking_draft_v1');
        if (saved) {
          const draft = JSON.parse(saved);
          if (draft.fullName) setFullName(draft.fullName);
          if (draft.phone) setPhone(draft.phone);
          if (draft.telegramUsername) setTelegramUsername(draft.telegramUsername);
          if (typeof draft.isPhoneOnly === 'boolean') setIsPhoneOnly(draft.isPhoneOnly);
          if (draft.eventDate) setEventDate(draft.eventDate);
          if (draft.timeOfDay) setTimeOfDay(draft.timeOfDay);
          if (draft.notes) setNotes(draft.notes);
          if (draft.paymentMethod) setPaymentMethod(draft.paymentMethod);
        }
      } catch {
        // ignore
      } finally {
        setHasLoadedDraft(true);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Keep what the user typed saved locally so offline disconnect never loses work
  React.useEffect(() => {
    if (!hasLoadedDraft) return;
    try {
      const draft = {
        fullName,
        phone,
        telegramUsername,
        isPhoneOnly,
        notes,
        eventDate,
        timeOfDay,
        paymentMethod
      };
      localStorage.setItem('hawi_booking_draft_v1', JSON.stringify(draft));
    } catch {
      // ignore
    }
  }, [hasLoadedDraft, fullName, phone, telegramUsername, isPhoneOnly, notes, eventDate, timeOfDay, paymentMethod]);

  // Synchronize package selection if URL parameter updates
  const [prevParam, setPrevParam] = useState(preSelectedPackageId);
  if (preSelectedPackageId !== prevParam) {
    setPrevParam(preSelectedPackageId);
    if (preSelectedPackageId) {
      setSelectedPackageId(preSelectedPackageId);
    }
  }

  const currentPackage =
    activePackages.find((p) => p.id === selectedPackageId) ||
    activePackages[0] ||
    PACKAGES_DATA[0];

  // Evaluate capacity for currently selected event date
  const capacityInfo: DateCapacityResult = useMemo(() => {
    if (!eventDate) {
      return getCapacityForDate('2026-11-14', undefined, capacitySettings);
    }
    return getCapacityForDate(eventDate, undefined, capacitySettings);
  }, [eventDate, capacitySettings]);

  // Handle image upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1 * 1024 * 1024) {
        setErrorMsg(t('booking.errors.fileTooLarge'));
        return;
      }
      setScreenshotFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreview(reader.result as string);
        setErrorMsg('');
      };
      reader.readAsDataURL(file);
    }
  };

  // Waitlist submission
  const handleJoinWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || !eventDate) {
      setErrorMsg(t('booking.errors.enterName'));
      return;
    }

    try {
      await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fullName.trim(),
          phone: phone.trim(),
          desiredDate: eventDate
        })
      });

      addWaitlistEntry({
        fullName: fullName.trim(),
        phone: phone.trim(),
        telegramUsername: isPhoneOnly ? undefined : telegramUsername.trim().replace(/^@+/, ''),
        eventDate,
        packageId: currentPackage.id,
        packageName: getPackageName(currentPackage, language),
        notes: waitlistNotes.trim()
      });
      setWaitlistSubmitted(true);
      setTimeout(() => {
        setShowWaitlistModal(false);
        setWaitlistSubmitted(false);
      }, 3000);
    } catch (err) {
      console.warn('[Waitlist API Error]', err);
    }
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName.trim()) {
      setErrorMsg(t('booking.errors.enterName'));
      return;
    }
    if (!phone.trim()) {
      setErrorMsg(t('booking.errors.enterPhone'));
      return;
    }

    // Validate Telegram username if not marked phone-only
    let cleanTelegram: string | null = null;
    if (!isPhoneOnly) {
      const tgValidation = validateTelegramUsername(telegramUsername);
      if (!tgValidation.isValid) {
        setErrorMsg(tgValidation.error || t('booking.errors.validTelegram'));
        return;
      }
      cleanTelegram = tgValidation.clean;
    }

    if (!eventDate) {
      setErrorMsg(t('booking.errors.selectDate'));
      return;
    }

    setIsSubmitting(true);

    try {
      // Determine period
      let period = 'full_day';
      const timeLower = timeOfDay.toLowerCase();
      if (timeLower.includes('morning')) period = 'morning';
      else if (timeLower.includes('afternoon')) period = 'afternoon';
      else if (timeLower.includes('evening')) period = 'evening';

      let normPaymentMethod = 'cbe';
      const pmLower = paymentMethod.toLowerCase();
      if (pmLower.includes('telebirr')) normPaymentMethod = 'telebirr';
      else if (pmLower.includes('abyssinia')) normPaymentMethod = 'abyssinia';
      else if (pmLower.includes('dashen')) normPaymentMethod = 'dashen';
      else if (pmLower.includes('cash')) normPaymentMethod = 'cash';

      const formData = new FormData();
      formData.append('customerName', fullName.trim());
      formData.append('phone', phone.trim());
      if (cleanTelegram) formData.append('telegramUsername', cleanTelegram);
      formData.append('phoneOnly', String(isPhoneOnly));
      formData.append('packageId', currentPackage.id);
      formData.append('eventDate', eventDate);
      formData.append('period', period);
      formData.append('venue', '');
      formData.append('city', 'Addis Ababa');
      formData.append('notes', notes.trim());
      formData.append('language', clientLanguage);
      formData.append('paymentMethod', normPaymentMethod);
      formData.append('referenceNumber', referenceNumber.trim() || `TXN-${Date.now().toString().slice(-6)}`);

      if (screenshotFile) {
        formData.append('screenshot', screenshotFile);
      }

      const res = await fetch('/api/bookings', {
        method: 'POST',
        body: formData
      });

      const resJson = await res.json();

      if (!res.ok || !resJson.success) {
        const errObj = resJson?.error;
        let displayError = errObj?.message || t('booking.errors.saveFailed');
        if (errObj?.code === 'DATE_UNAVAILABLE') {
          displayError = t('booking.errors.dateUnavailable') || 'This date just became unavailable, please choose another.';
        }
        setErrorMsg(displayError);
        setIsSubmitting(false);
        return;
      }

      const serverBooking = resJson.data;
      const localizedPkgName = getPackageName(currentPackage, language);

      const newBooking: Booking = {
        id: serverBooking.booking_code,
        bookingCode: serverBooking.booking_code,
        fullName: serverBooking.customer_name,
        phone: phone.trim(),
        telegramUsername: cleanTelegram,
        isPhoneOnly: isPhoneOnly,
        clientLanguage,
        packageId: currentPackage.id,
        packageName: localizedPkgName,
        packagePrice: formatCurrency(currentPackage.price),
        priceNumeric: currentPackage.price,
        depositRequired: currentPackage.depositAmount,
        eventDate: serverBooking.event_date,
        timeOfDay,
        venue: '',
        notes: notes.trim(),
        paymentScreenshot: screenshotPreview || undefined,
        paymentMethod,
        status: 'Pending',
        notificationStatus: {
          notified: false
        },
        createdAt: new Date().toISOString()
      };

      // Save client cache
      saveBooking(newBooking);
      try {
        localStorage.removeItem('hawi_booking_draft_v1');
      } catch {
        // ignore
      }

      logActivity(
        'New Booking Received',
        'bookings',
        `Reservation ${newBooking.bookingCode} submitted by ${newBooking.fullName} for ${newBooking.eventDate}.`
      );

      setConfirmedBooking(newBooking);
      setIsSubmitting(false);
    } catch (err) {
      console.error('[Booking Submit Exception]', err);
      setErrorMsg(t('booking.errors.saveFailed'));
      setIsSubmitting(false);
    }
  };

  const copyBookingCode = () => {
    if (confirmedBooking) {
      navigator.clipboard.writeText(confirmedBooking.bookingCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    }
  };

  // Generate quick upcoming date suggestions with capacity badges
  const upcomingSampleDates = useMemo(() => {
    const dates: Array<{ date: string; label: string; result: DateCapacityResult }> = [];
    const base = new Date();
    for (let i = 7; i < 28; i++) {
      const d = new Date();
      d.setDate(base.getDate() + i);
      const dayOfWeek = d.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 5 || dayOfWeek === 6) {
        const dateStr = d.toISOString().slice(0, 10);
        const dayName = d.toLocaleDateString(language === 'am' ? 'am-ET' : 'en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        const res = getCapacityForDate(dateStr, undefined, capacitySettings);
        dates.push({ date: dateStr, label: dayName, result: res });
      }
    }
    return dates.slice(0, 6);
  }, [capacitySettings, language]);

  return (
    <div className="py-12 sm:py-20 bg-[var(--bg)] text-[var(--text)] transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--gold)]">
            <Sparkles className="w-4 h-4 text-[var(--gold)]" />
            <span>{t('booking.headerBadge')}</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--text)] tracking-tight">
            {t('booking.headerTitle')}
          </h1>
          <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed">
            {t('booking.headerSubtitle')}
          </p>
          <div className="pt-2">
            <Link
              href="/booking/check"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--card-subtle)] border border-[var(--border)] text-xs font-semibold text-[var(--gold)] hover:border-[var(--gold)] hover:bg-[var(--surface)] transition-all"
            >
              <Search className="w-3.5 h-3.5" />
              <span>{t('booking.checkBookingLink')}</span>
            </Link>
          </div>
        </div>

        {/* Main Grid: Form + Package Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Form (8 Cols) */}
          <div className="lg:col-span-8 bg-[var(--surface)] text-[var(--text)] rounded-3xl p-6 sm:p-10 border border-[var(--border)] shadow-sm">
            {errorMsg && (
              <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs sm:text-sm flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Step 1: Client Info & Telegram */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--gold)]">
                    <User className="w-4 h-4 text-[var(--gold)]" />
                    <span>{t('booking.coupleSectionTitle')}</span>
                  </div>

                  {/* Language Selector */}
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-[var(--text-muted)] hidden sm:inline">{t('booking.clientLanguageLabel')}:</span>
                    <div className="flex rounded-lg border border-[var(--border)] p-0.5 bg-[var(--card-subtle)]">
                      <button
                        type="button"
                        onClick={() => setClientLanguage('en')}
                        className={`px-2 py-0.5 text-[11px] font-semibold rounded ${
                          clientLanguage === 'en'
                            ? 'bg-[var(--surface)] text-[var(--gold)] shadow-xs'
                            : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                        }`}
                      >
                        English
                      </button>
                      <button
                        type="button"
                        onClick={() => setClientLanguage('om')}
                        className={`px-2 py-0.5 text-[11px] font-semibold rounded ${
                          clientLanguage === 'om'
                            ? 'bg-[var(--surface)] text-[var(--gold)] shadow-xs'
                            : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                        }`}
                      >
                        Oromoo
                      </button>
                      <button
                        type="button"
                        onClick={() => setClientLanguage('am')}
                        className={`px-2 py-0.5 text-[11px] font-semibold rounded ${
                          clientLanguage === 'am'
                            ? 'bg-[var(--surface)] text-[var(--gold)] shadow-xs'
                            : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                        }`}
                      >
                        አማርኛ
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[var(--text)]">
                      {t('booking.fullNameLabel')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={t('booking.fullNamePlaceholder')}
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[var(--input-bg)] border border-[var(--border)] text-xs sm:text-sm text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--gold)] transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[var(--text)]">
                      {t('booking.phoneLabel')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder={t('booking.phonePlaceholder')}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[var(--input-bg)] border border-[var(--border)] text-xs sm:text-sm text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--gold)] transition-all font-mono"
                    />
                  </div>
                </div>

                {/* Telegram Username Section */}
                <div className="p-4 rounded-2xl bg-[var(--card-subtle)] border border-[var(--border)] space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <label className="text-xs font-semibold text-[var(--text)] flex items-center gap-1.5">
                      <Send className="w-3.5 h-3.5 text-sky-500" />
                      <span>{t('booking.telegramLabel')}</span>
                      {!isPhoneOnly && <span className="text-red-500">*</span>}
                    </label>

                    <label className="inline-flex items-center gap-2 cursor-pointer text-xs text-[var(--text-muted)] hover:text-[var(--text)]">
                      <input
                        type="checkbox"
                        checked={isPhoneOnly}
                        onChange={(e) => setIsPhoneOnly(e.target.checked)}
                        className="rounded border-[var(--border)] text-[var(--gold)] focus:ring-[var(--gold)] w-3.5 h-3.5 cursor-pointer"
                      />
                      <span>{t('booking.phoneOnlyCheckbox')}</span>
                    </label>
                  </div>

                  {!isPhoneOnly ? (
                    <div className="space-y-1.5">
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-[var(--text-muted)]">
                          @
                        </span>
                        <input
                          type="text"
                          required={!isPhoneOnly}
                          placeholder={t('booking.telegramPlaceholder')}
                          value={telegramUsername}
                          onChange={(e) => setTelegramUsername(e.target.value)}
                          className="w-full pl-8 pr-4 py-2 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-xs sm:text-sm text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--gold)] transition-all font-mono"
                        />
                      </div>
                      <p className="text-[11px] text-[var(--text-muted)]">
                        {t('booking.telegramHint')}
                      </p>
                    </div>
                  ) : (
                    <div className="text-xs text-[var(--text-muted)] flex items-center gap-2 bg-[var(--surface)] p-2.5 rounded-xl border border-[var(--border)]">
                      <Info className="w-4 h-4 text-[var(--gold)] shrink-0" />
                      <span>You have opted for phone communication. Our studio managers will contact you via direct phone call.</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Step 2: Package Selection */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--gold)]">
                    <Sparkles className="w-4 h-4 text-[var(--gold)]" />
                    <span>{t('booking.packageSectionTitle')}</span>
                  </div>
                  <Link
                    href="/packages"
                    className="text-xs text-[var(--gold)] hover:underline font-bold"
                  >
                    Compare all packages →
                  </Link>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-[var(--text)]">
                    {t('booking.selectPackageLabel')} <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedPackageId}
                    onChange={(e) => setSelectedPackageId(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[var(--input-bg)] border border-[var(--border)] text-xs sm:text-sm text-[var(--text)] font-medium focus:outline-none focus:ring-2 focus:ring-[var(--gold)] transition-all cursor-pointer"
                  >
                    {activePackages.map((pkg) => {
                      const name = getPackageName(pkg, language);
                      const price = formatCurrency(pkg.price);
                      return (
                        <option key={pkg.id} value={pkg.id} className="bg-[var(--surface)] text-[var(--text)]">
                          {pkg.isSpecial ? '⭐ SPECIAL: ' : ''}
                          {name} — {price} ({pkg.categoryLabel})
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              {/* Step 3: Event Date, Capacity Badges & Period Selection */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--gold)]">
                    <Calendar className="w-4 h-4 text-[var(--gold)]" />
                    <span>{t('booking.dateSectionTitle')}</span>
                  </div>
                  <span className="text-[11px] text-[var(--text-muted)] font-mono">
                    Live capacity
                  </span>
                </div>

                {/* Quick Date Availability Grid */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-[var(--text)] flex items-center justify-between">
                    <span>{t('booking.quickDatesTitle')}:</span>
                    <span className="text-[10px] text-[var(--text-muted)]">Click date to auto-fill</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {upcomingSampleDates.map((item) => {
                      const isSelected = eventDate === item.date;
                      const res = item.result;
                      let badgeColor = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
                      let statusText = t('booking.capacityAvailable');

                      if (res.isBlocked) {
                        badgeColor = 'bg-red-500/10 text-red-500 border-red-500/30';
                        statusText = t('booking.capacityBlocked');
                      } else if (res.isFull) {
                        badgeColor = 'bg-zinc-500/10 text-zinc-500 border-zinc-500/30';
                        statusText = t('booking.capacityFull');
                      } else if (res.isLimited) {
                        badgeColor = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30';
                        statusText = t('booking.capacityLimited');
                      }

                      return (
                        <button
                          key={item.date}
                          type="button"
                          disabled={res.isBlocked || res.isFull}
                          onClick={() => setEventDate(item.date)}
                          className={`p-2.5 rounded-xl border text-left transition-all relative ${
                            isSelected
                              ? 'border-[var(--gold)] bg-[var(--card-subtle)] ring-2 ring-[var(--gold)]/30'
                              : 'border-[var(--border)] bg-[var(--surface)] hover:border-[var(--gold)]/50'
                          } ${res.isBlocked || res.isFull ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          <div className="font-semibold text-xs text-[var(--text)]">{item.label}</div>
                          <div className="flex items-center justify-between mt-1 text-[10px]">
                            <span className="font-mono text-[var(--text-muted)]">{item.date}</span>
                            <span className={`px-1.5 py-0.5 rounded-md font-semibold border ${badgeColor}`}>
                              {statusText}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Primary Date Input */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[var(--text)] flex items-center justify-between">
                      <span>{t('booking.selectDateLabel')} <span className="text-red-500">*</span></span>
                      {capacityInfo.isBlocked ? (
                        <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-red-500/10 text-red-600 border border-red-500/20">
                          {t('booking.capacityBlocked')}
                        </span>
                      ) : capacityInfo.isFull ? (
                        <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-red-500/10 text-red-600 border border-red-500/20">
                          {t('booking.capacityFull')} ({capacityInfo.bookedCount}/{capacityInfo.maxCapacity})
                        </span>
                      ) : capacityInfo.isLimited ? (
                        <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                          {t('booking.capacityLimited')}
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          {t('booking.capacityAvailable')}
                        </span>
                      )}
                    </label>

                    <input
                      type="date"
                      required
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      className={`w-full px-4 py-2.5 rounded-xl bg-[var(--input-bg)] border text-xs sm:text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--gold)] transition-all font-mono [color-scheme:light] dark:[color-scheme:dark] ${
                        capacityInfo.isFull || capacityInfo.isBlocked
                          ? 'border-red-500/50 bg-red-500/5'
                          : 'border-[var(--border)]'
                      }`}
                    />
                  </div>

                  {/* Period Selector */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[var(--text)]">
                      {t('booking.timeSectionTitle')} <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={timeOfDay}
                      onChange={(e) => setTimeOfDay(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[var(--input-bg)] border border-[var(--border)] text-xs sm:text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--gold)] transition-all cursor-pointer"
                    >
                      <option
                        value="Full Day (All Day & Evening)"
                        disabled={capacityInfo.isFull || capacityInfo.periodStats.morning.isFull || capacityInfo.periodStats.afternoon.isFull}
                        className="bg-[var(--surface)] text-[var(--text)]"
                      >
                        {t('booking.fullDayLabel')} ({t('booking.fullDayDesc')})
                      </option>
                      <option
                        value="Morning (8:00 AM - 12:00 PM)"
                        disabled={capacityInfo.periodStats.morning.isFull}
                        className="bg-[var(--surface)] text-[var(--text)]"
                      >
                        {t('booking.morningLabel')} {capacityInfo.periodStats.morning.isFull ? `(${t('booking.capacityFull')})` : ''}
                      </option>
                      <option
                        value="Afternoon (1:00 PM - 5:00 PM)"
                        disabled={capacityInfo.periodStats.afternoon.isFull}
                        className="bg-[var(--surface)] text-[var(--text)]"
                      >
                        {t('booking.afternoonLabel')} {capacityInfo.periodStats.afternoon.isFull ? `(${t('booking.capacityFull')})` : ''}
                      </option>
                      <option
                        value="Evening Reception (5:00 PM - 11:00 PM)"
                        disabled={capacityInfo.periodStats.evening.isFull}
                        className="bg-[var(--surface)] text-[var(--text)]"
                      >
                        {t('booking.eveningLabel')} {capacityInfo.periodStats.evening.isFull ? `(${t('booking.capacityFull')})` : ''}
                      </option>
                    </select>
                  </div>
                </div>

                {/* CAPACITY WARNING OR FULL BANNER */}
                {capacityInfo.isBlocked ? (
                  <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 space-y-3">
                    <div className="flex items-start gap-2.5">
                      <Lock className="w-5 h-5 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-xs sm:text-sm">{t('booking.capacityBlocked')}</div>
                        <div className="text-xs mt-0.5 text-red-600/90 dark:text-red-300">
                          {capacityInfo.blockedReason || 'Studio maintenance or official holiday.'}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <a
                        href={`tel:${CONTACT_PHONES[0].raw}`}
                        className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold inline-flex items-center gap-1.5 hover:bg-red-700"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Call {CONTACT_PHONES[0].display}</span>
                      </a>
                      <a
                        href="https://t.me/HawiPictures"
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-sky-500 text-white text-xs font-semibold inline-flex items-center gap-1.5 hover:bg-sky-600"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Telegram Us</span>
                      </a>
                    </div>
                  </div>
                ) : capacityInfo.isFull ? (
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-200 space-y-3">
                    <div className="flex items-start gap-2.5">
                      <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-xs sm:text-sm">
                          {t('booking.capacityFull')} ({capacityInfo.bookedCount}/{capacityInfo.maxCapacity})
                        </div>
                        <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                          Our main photography and cinema units are committed for this date. You can call us directly for emergency arrangements, reach us on Telegram, or join our priority waitlist.
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <a
                        href={`tel:${CONTACT_PHONES[0].raw}`}
                        className="px-3 py-1.5 rounded-lg bg-[var(--gold)] text-black font-semibold text-xs inline-flex items-center gap-1.5 hover:opacity-90 shadow-sm"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Call {CONTACT_PHONES[0].display}</span>
                      </a>
                      <a
                        href="https://t.me/HawiPictures"
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-sky-500 text-white font-semibold text-xs inline-flex items-center gap-1.5 hover:bg-sky-600 shadow-sm"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Telegram @HawiPictures</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => setShowWaitlistModal(true)}
                        className="px-3 py-1.5 rounded-lg bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] text-xs font-semibold hover:border-[var(--gold)] transition-colors"
                      >
                        {t('booking.waitlist.openWaitlistPrompt')}
                      </button>
                    </div>
                  </div>
                ) : null}

                {/* Notes */}
                <div className="space-y-1.5 pt-1">
                  <label className="text-xs font-semibold text-[var(--text)]">
                    {t('booking.notesLabel')}
                  </label>
                  <textarea
                    rows={3}
                    placeholder={t('booking.notesPlaceholder')}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[var(--input-bg)] border border-[var(--border)] text-xs sm:text-sm text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--gold)] transition-all resize-y"
                  />
                </div>
              </div>

              {/* Step 4: Payment Screenshot Upload */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--gold)] border-b border-[var(--border)] pb-2">
                  <CreditCard className="w-4 h-4 text-[var(--gold)]" />
                  <span>{t('booking.paymentSectionTitle')}</span>
                </div>

                {/* Bank Account Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {PAYMENT_METHODS.map((method, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setPaymentMethod(method.name);
                        navigator.clipboard.writeText(method.accountNumber);
                        setCopiedAccountIndex(idx);
                        setTimeout(() => setCopiedAccountIndex(null), 2000);
                      }}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        paymentMethod === method.name
                          ? 'border-[var(--gold)] bg-[var(--card-subtle)] ring-2 ring-[var(--gold)]/30'
                          : 'border-[var(--border)] bg-[var(--surface)] hover:border-[var(--gold)]/50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="text-xs font-semibold text-[var(--text)] mb-1">
                            {method.name}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-[var(--gold)]">
                              {method.accountNumber}
                            </span>
                            {copiedAccountIndex === idx ? (
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                            )}
                          </div>
                        </div>
                        {paymentMethod === method.name && (
                          <CheckCircle2 className="w-4 h-4 text-[var(--gold)] shrink-0" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                {/* File Upload Box */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-[var(--text)]">
                    {t('booking.uploadLabel')} <span className="text-[var(--text-muted)] font-normal">{t('booking.uploadHint')}</span>
                  </label>

                  {screenshotPreview ? (
                    <div className="relative rounded-2xl overflow-hidden border border-[var(--gold)] bg-[var(--card-subtle)] p-3 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-[var(--surface)] overflow-hidden border border-[var(--border)] shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={screenshotPreview}
                            alt="Receipt preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-[var(--text)] flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Receipt attached successfully</span>
                          </div>
                          <div className="text-[11px] text-[var(--text-muted)]">{t('booking.changeImage')}</div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setScreenshotPreview(null)}
                        className="text-xs text-red-500 hover:underline px-2 py-1"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <label className="border-2 border-dashed border-[var(--border)] hover:border-[var(--gold)]/60 rounded-2xl p-6 text-center cursor-pointer block bg-[var(--input-bg)] transition-colors">
                      <input
                        type="file"
                        accept="image/*,image/png,image/jpeg,image/webp"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <Upload className="w-8 h-8 mx-auto text-[var(--gold)] mb-2" />
                      <div className="text-xs font-semibold text-[var(--text)]">
                        {t('booking.uploadButton')}
                      </div>
                      <div className="text-[11px] text-[var(--text-muted)] mt-1">
                        Camera or Gallery (PNG, JPG, or WEBP up to 1MB)
                      </div>
                    </label>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4 space-y-2">
                {!isOnline && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-200 text-xs">
                    <WifiOff className="w-4 h-4 shrink-0 text-amber-500" />
                    <span>{t('booking.offlineSubmitMessage')}</span>
                  </div>
                )}
                <button
                  type="submit"
                  disabled={!isOnline || isSubmitting || capacityInfo.isFull || capacityInfo.isBlocked}
                  className={`w-full py-4 rounded-2xl font-bold text-sm tracking-wide transition-all duration-200 flex items-center justify-center gap-2 ${
                    !isOnline || capacityInfo.isFull || capacityInfo.isBlocked
                      ? 'bg-zinc-400 dark:bg-zinc-700 text-zinc-200 cursor-not-allowed'
                      : 'bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#AA771C] text-black shadow-lg hover:shadow-xl hover:scale-[1.005] active:scale-[0.995]'
                  }`}
                >
                  {!isOnline ? (
                    <span className="flex items-center gap-2 text-xs sm:text-sm">
                      <WifiOff className="w-4 h-4" />
                      {t('booking.offlineSubmitMessage')}
                    </span>
                  ) : isSubmitting ? (
                    <span>{t('booking.submittingButton')}</span>
                  ) : capacityInfo.isFull ? (
                    <span>Date is Full — Join Waitlist Above</span>
                  ) : capacityInfo.isBlocked ? (
                    <span>Date Unavailable — Please Select Another Date</span>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-black" />
                      <span>{t('booking.submitButton')}</span>
                    </>
                  )}
                </button>
                <p className="text-center text-[11px] text-[var(--text-muted)] mt-2">
                  {t('booking.securityNote')}
                </p>
              </div>
            </form>
          </div>

          {/* Right Summary Card (4 Cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Selected Package Details */}
            <div className="bg-[var(--surface)] text-[var(--text)] rounded-3xl p-6 sm:p-8 border border-[var(--border)] shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
                <div>
                  <div className="text-[10px] uppercase font-bold tracking-wider text-[var(--gold)]">
                    Reservation Summary
                  </div>
                  <h3 className="font-serif text-xl font-bold text-[var(--text)] mt-0.5">
                    {getPackageName(currentPackage, language)}
                  </h3>
                </div>
                <div className="text-right">
                  <div className="font-serif text-lg font-bold text-[var(--gold)]">
                    {formatCurrency(currentPackage.price)}
                  </div>
                  <div className="text-[10px] text-[var(--text-muted)]">Official Price</div>
                </div>
              </div>

              {/* Package Snapshot */}
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between py-1.5 border-b border-[var(--border)]">
                  <span className="text-[var(--text-muted)]">Coverage Duration:</span>
                  <span className="font-semibold text-[var(--text)]">{currentPackage.daysCoverage}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-[var(--border)]">
                  <span className="text-[var(--text-muted)]">Production Crew:</span>
                  <span className="font-semibold text-[var(--text)]">{currentPackage.team}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-[var(--border)]">
                  <span className="text-[var(--text-muted)]">Deposit to Lock Date:</span>
                  <span className="font-bold text-[var(--gold)]">{currentPackage.depositAmount || 'Inquire with Studio'}</span>
                </div>
              </div>

              {/* What's included preview */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-[var(--text)] uppercase tracking-wider">
                  {t('booking.packageIncludedItems')}:
                </div>
                <ul className="space-y-1.5 text-xs text-[var(--text-muted)]">
                  {getPackageFeatures(currentPackage, language).slice(0, 5).map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-[var(--gold)] shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                  {currentPackage.features.length > 5 && (
                    <li className="text-[11px] text-[var(--gold)] font-medium pl-5">
                      + {currentPackage.features.length - 5} additional luxury deliverables
                    </li>
                  )}
                </ul>
              </div>

              {/* Call Hotline direct */}
              <div className="pt-4 border-t border-[var(--border)] space-y-2">
                <div className="text-xs font-semibold text-[var(--text)]">Questions before booking?</div>
                <div className="flex flex-col gap-1.5 text-xs">
                  <a
                    href={`tel:${CONTACT_PHONES[0].raw}`}
                    className="p-2.5 rounded-xl bg-[var(--card-subtle)] hover:bg-[var(--input-bg)] border border-[var(--border)] flex items-center justify-between transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-[var(--gold)]" />
                      <span>{t('contact.mainPhotoLabel')}</span>
                    </span>
                    <span className="font-mono font-bold text-[var(--gold-text)]">{CONTACT_PHONES[0].display}</span>
                  </a>
                  <a
                    href={`tel:${CONTACT_PHONES[1].raw}`}
                    className="p-2.5 rounded-xl bg-[var(--card-subtle)] hover:bg-[var(--input-bg)] border border-[var(--border)] flex items-center justify-between transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-[var(--gold)]" />
                      <span>{t('contact.bridalSalonLabel')}</span>
                    </span>
                    <span className="font-mono font-bold text-[var(--gold-text)]">{CONTACT_PHONES[1].display}</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CONFIRMATION MODAL */}
      {confirmedBooking && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-[var(--overlay-bg)] backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in"
        >
          <div className="bg-[var(--surface)] border border-[var(--gold)]/40 rounded-3xl p-6 sm:p-10 max-w-lg w-full text-center space-y-6 shadow-2xl relative">
            <div className="w-16 h-16 rounded-full bg-[var(--gold)]/10 text-[var(--gold)] mx-auto flex items-center justify-center border border-[var(--gold)]/30">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-widest text-[var(--gold)]">
                {t('booking.confirmation.badge')}
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[var(--text)]">
                {t('booking.confirmation.title')}, {confirmedBooking.fullName}!
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
                {t('booking.confirmation.subtitle')}
              </p>
            </div>

            {/* Booking Code Card */}
            <div className="p-4 rounded-2xl bg-[var(--card-subtle)] border border-[var(--border)] space-y-2">
              <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-semibold">
                {t('booking.confirmation.codeLabel')}
              </div>
              <div className="flex items-center justify-center gap-2">
                <span className="font-mono text-xl sm:text-2xl font-bold text-[var(--gold)] tracking-wide">
                  {confirmedBooking.bookingCode}
                </span>
                <button
                  type="button"
                  onClick={copyBookingCode}
                  className="p-1.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--gold)] transition-colors text-[var(--text)]"
                  title="Copy Code"
                >
                  {copiedCode ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              {copiedCode && <div className="text-[11px] text-emerald-600 font-semibold">{t('booking.confirmation.copied')}</div>}
            </div>

            {/* Summary Details */}
            <div className="text-left text-xs space-y-2 p-4 rounded-xl bg-[var(--card-subtle)] border border-[var(--border)]">
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">{t('booking.confirmation.packageLabel')}:</span>
                <span className="font-semibold text-[var(--text)]">{confirmedBooking.packageName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">{t('booking.confirmation.dateLabel')}:</span>
                <span className="font-mono font-semibold text-[var(--text)]">{confirmedBooking.eventDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">{t('booking.confirmation.periodLabel')}:</span>
                <span className="font-semibold text-[var(--text)]">{confirmedBooking.timeOfDay}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">{t('booking.confirmation.telegramLabel')}:</span>
                <span className="font-mono text-[var(--gold-text)]">
                  {confirmedBooking.telegramUsername ? `@${confirmedBooking.telegramUsername}` : t('booking.confirmation.phoneOnlyLabel')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">{t('booking.confirmation.depositLabel')}:</span>
                <span className="font-bold text-[var(--gold)]">{confirmedBooking.depositRequired}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">{t('booking.confirmation.statusLabel')}:</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/30">
                  {confirmedBooking.status} ({t('booking.confirmation.reviewingReceipt')})
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-2">
              <Link
                href="/admin"
                className="block w-full py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#AA771C] text-black font-bold text-xs uppercase tracking-wider hover:opacity-90 shadow-md"
              >
                {t('booking.confirmation.viewAdminButton')}
              </Link>
              <button
                type="button"
                onClick={() => setConfirmedBooking(null)}
                className="w-full py-2.5 rounded-xl border border-[var(--border)] text-xs font-semibold text-[var(--text)] hover:bg-[var(--card-subtle)]"
              >
                {t('booking.confirmation.closeButton')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WAITLIST MODAL FOR FULL DATES */}
      {showWaitlistModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-[var(--overlay-bg)] backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in"
        >
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl relative">
            <div className="space-y-1">
              <div className="text-[10px] uppercase font-bold tracking-wider text-[var(--gold)]">
                {t('booking.waitlist.title')}
              </div>
              <h3 className="font-serif text-xl font-bold text-[var(--text)]">
                {t('booking.waitlist.title')} ({eventDate})
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                {t('booking.waitlist.subtitle')}
              </p>
            </div>

            {waitlistSubmitted ? (
              <div className="p-6 text-center space-y-2 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-600 dark:text-emerald-400">
                <UserCheck className="w-8 h-8 mx-auto" />
                <div className="font-bold text-sm">{t('booking.waitlist.submittedSuccess')}</div>
                <div className="text-xs">We have saved your details for {eventDate}.</div>
              </div>
            ) : (
              <form onSubmit={handleJoinWaitlist} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="font-semibold text-[var(--text)]">{t('booking.waitlist.nameLabel')}</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Bride & Groom Names"
                    className="w-full px-3 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--border)] text-[var(--text)] focus:ring-1 focus:ring-[var(--gold)]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[var(--text)]">{t('booking.waitlist.phoneLabel')}</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="09..."
                    className="w-full px-3 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--border)] text-[var(--text)] font-mono focus:ring-1 focus:ring-[var(--gold)]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[var(--text)]">{t('booking.waitlist.notesLabel')}</label>
                  <textarea
                    rows={2}
                    value={waitlistNotes}
                    onChange={(e) => setWaitlistNotes(e.target.value)}
                    placeholder={t('booking.waitlist.notesPlaceholder')}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--border)] text-[var(--text)]"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowWaitlistModal(false)}
                    className="px-4 py-2 rounded-xl border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)]"
                  >
                    {t('booking.waitlist.closeButton')}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[var(--gold)] text-black font-bold hover:opacity-90"
                  >
                    {t('booking.waitlist.submitButton')}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
