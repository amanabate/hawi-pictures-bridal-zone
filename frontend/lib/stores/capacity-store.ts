'use client';

import { useSyncExternalStore } from 'react';
import { Booking, getBookings } from '@/lib/storage';
import { logActivity } from '@/lib/data-store';

// ==========================================
// 1. CAPACITY SETTINGS & TYPES
// ==========================================

export interface PeriodLimits {
  morning: number;
  afternoon: number;
  evening: number;
}

export interface DateOverride {
  date: string; // YYYY-MM-DD
  maxEvents: number;
  notes?: string;
}

export interface BlockedDate {
  date: string; // YYYY-MM-DD
  reason: string;
  blockedAt: string;
}

export interface CapacitySettings {
  defaultMaxEventsPerDay: number;
  defaultPeriodLimits: PeriodLimits;
  weekdayLimits: Record<number, number>; // 0 = Sun, 1 = Mon, ..., 6 = Sat
  dateOverrides: Record<string, DateOverride>; // Key: YYYY-MM-DD
  blockedDates: Record<string, BlockedDate>; // Key: YYYY-MM-DD
  serviceLimits: {
    photographyTeams: number;
    makeupArtists: number;
    studioSessions: number;
  };
  expirationHours: number; // e.g. 48 hours for unconfirmed pending bookings
  telegramTemplates: {
    en: string;
    om: string;
    am: string;
  };
}

export interface WaitlistEntry {
  id: string;
  fullName: string;
  phone: string;
  telegramUsername?: string;
  eventDate: string;
  packageId?: string;
  packageName?: string;
  notes?: string;
  createdAt: string;
  status: 'waiting' | 'contacted' | 'resolved';
}

export interface StaffMember {
  id: string;
  name: string;
  role: 'Lead Photographer' | 'Master Salon Artist' | 'Cinematographer & Drone' | 'Bridal Stylist' | 'Senior Assistant';
  phone: string;
}

export const STAFF_ROSTER: StaffMember[] = [
  { id: 'staff-1', name: 'Abebe Kebede', role: 'Lead Photographer', phone: '0911245892' },
  { id: 'staff-2', name: 'Meron Tadesse', role: 'Master Salon Artist', phone: '0914878007' },
  { id: 'staff-3', name: 'Dawit Bekele', role: 'Cinematographer & Drone', phone: '0988018016' },
  { id: 'staff-4', name: 'Sintayehu Girma', role: 'Bridal Stylist', phone: '0922894103' },
  { id: 'staff-5', name: 'Henok Fisseha', role: 'Lead Photographer', phone: '0930129845' }
];

// Default storage keys
const CAPACITY_KEY = 'hawi_capacity_settings_v1';
const WAITLIST_KEY = 'hawi_booking_waitlist_v1';

// Initial default settings
export const DEFAULT_CAPACITY_SETTINGS: CapacitySettings = {
  defaultMaxEventsPerDay: 3,
  defaultPeriodLimits: {
    morning: 1,
    afternoon: 1,
    evening: 1
  },
  weekdayLimits: {
    0: 3, // Sunday: 3 weddings
    1: 1, // Monday: 1 event
    2: 1, // Tuesday: 1 event
    3: 1, // Wednesday: 1 event
    4: 2, // Thursday: 2 events
    5: 3, // Friday: 3 events
    6: 4  // Saturday: 4 events (Peak)
  },
  dateOverrides: {
    '2026-11-14': {
      date: '2026-11-14',
      maxEvents: 3,
      notes: 'Peak November wedding weekend'
    },
    '2026-12-05': {
      date: '2026-12-05',
      maxEvents: 4,
      notes: 'Holiday season high demand'
    }
  },
  blockedDates: {
    '2026-12-25': {
      date: '2026-12-25',
      reason: 'Christmas Holiday - Studio Closed',
      blockedAt: '2026-10-25T08:00:00Z'
    },
    '2027-01-07': {
      date: '2027-01-07',
      reason: 'Ethiopian Genna Celebration',
      blockedAt: '2026-10-25T08:00:00Z'
    },
    '2026-11-03': {
      date: '2026-11-03',
      reason: 'Camera equipment calibration & drone fleet maintenance',
      blockedAt: '2026-10-28T12:00:00Z'
    }
  },
  serviceLimits: {
    photographyTeams: 3,
    makeupArtists: 2,
    studioSessions: 2
  },
  expirationHours: 48,
  telegramTemplates: {
    en: 'Hello [Name], this is Hawi Pictures & Bridal Zone. Your booking [BookingCode] for [Package] on [Date] has been [Status]. Reason: [Reason]. You can book again on our website or call 0988018016.',
    om: 'Akkam [Name], kun Hawi Pictures & Bridal Zone irraayi. Qabannaan keessan [BookingCode] kan [Package] guyyaa [Date] [Status] ta\'eera. Sababni: [Reason]. Marsariitii keenya irra deebitanii qabachuu ykn bilbila 0988018016 fayyadamuu dandeessu.',
    am: 'ሰላም [Name]፣ ይህ ከሀዊ ፒክቸርስ እና ብራይዳል ዞን ነው። ለ[Package] የተያዘው የቦታ ማስያዣ ቁጥር [BookingCode] ለቀን [Date] [Status] ሆኗል። ምክንያት፦ [Reason]። በእኛ ድህረ ገጽ ላይ እንደገና መያዝ ወይም በ0988018016 መደወል ይችላሉ።'
  }
};

const INITIAL_WAITLIST: WaitlistEntry[] = [
  {
    id: 'wait-1',
    fullName: 'Lensa Desta & Biniyam T.',
    phone: '0912345678',
    telegramUsername: 'lensa_desta',
    eventDate: '2026-11-03',
    packageId: 'gold-royal',
    packageName: 'Gold Royal',
    notes: 'Inquiring if maintenance date opens for afternoon ceremony.',
    createdAt: '2026-10-29T14:00:00Z',
    status: 'waiting'
  }
];

// ==========================================
// 2. PUB / SUB OBSERVERS
// ==========================================

let capacityListeners: Array<() => void> = [];
let waitlistListeners: Array<() => void> = [];

let cachedSettings: CapacitySettings | null = null;
let cachedWaitlist: WaitlistEntry[] | null = null;

function notifyCapacity() {
  for (const l of capacityListeners) l();
}
function notifyWaitlist() {
  for (const l of waitlistListeners) l();
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === CAPACITY_KEY) {
      cachedSettings = null;
      notifyCapacity();
    } else if (e.key === WAITLIST_KEY) {
      cachedWaitlist = null;
      notifyWaitlist();
    }
  });
}

export function subscribeCapacitySettings(listener: () => void) {
  capacityListeners.push(listener);
  return () => {
    capacityListeners = capacityListeners.filter((l) => l !== listener);
  };
}

export function subscribeWaitlist(listener: () => void) {
  waitlistListeners.push(listener);
  return () => {
    waitlistListeners = waitlistListeners.filter((l) => l !== listener);
  };
}

// ==========================================
// 3. STORAGE GETTERS & SETTERS
// ==========================================

export function getCapacitySettings(): CapacitySettings {
  if (typeof window === 'undefined') return DEFAULT_CAPACITY_SETTINGS;
  if (cachedSettings) return cachedSettings;

  try {
    const raw = localStorage.getItem(CAPACITY_KEY);
    if (!raw) {
      localStorage.setItem(CAPACITY_KEY, JSON.stringify(DEFAULT_CAPACITY_SETTINGS));
      cachedSettings = DEFAULT_CAPACITY_SETTINGS;
      return DEFAULT_CAPACITY_SETTINGS;
    }
    const parsed = JSON.parse(raw);
    cachedSettings = { ...DEFAULT_CAPACITY_SETTINGS, ...parsed };
    return cachedSettings as CapacitySettings;
  } catch (e) {
    console.error('Failed to read capacity settings:', e);
    cachedSettings = DEFAULT_CAPACITY_SETTINGS;
    return DEFAULT_CAPACITY_SETTINGS;
  }
}

export function saveCapacitySettings(settings: CapacitySettings): void {
  if (typeof window === 'undefined') return;
  cachedSettings = settings;
  localStorage.setItem(CAPACITY_KEY, JSON.stringify(settings));
  notifyCapacity();
}

export function getWaitlist(): WaitlistEntry[] {
  if (typeof window === 'undefined') return INITIAL_WAITLIST;
  if (cachedWaitlist) return cachedWaitlist;

  try {
    const raw = localStorage.getItem(WAITLIST_KEY);
    if (!raw) {
      localStorage.setItem(WAITLIST_KEY, JSON.stringify(INITIAL_WAITLIST));
      cachedWaitlist = INITIAL_WAITLIST;
      return INITIAL_WAITLIST;
    }
    const parsed = JSON.parse(raw);
    cachedWaitlist = Array.isArray(parsed) ? parsed : INITIAL_WAITLIST;
    return cachedWaitlist;
  } catch (e) {
    console.error('Failed to read waitlist:', e);
    cachedWaitlist = INITIAL_WAITLIST;
    return INITIAL_WAITLIST;
  }
}

export function addWaitlistEntry(entry: Omit<WaitlistEntry, 'id' | 'createdAt' | 'status'>): WaitlistEntry {
  const current = getWaitlist();
  const newEntry: WaitlistEntry = {
    ...entry,
    id: `wait-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    createdAt: new Date().toISOString(),
    status: 'waiting'
  };
  const updated = [newEntry, ...current];
  cachedWaitlist = updated;
  if (typeof window !== 'undefined') {
    localStorage.setItem(WAITLIST_KEY, JSON.stringify(updated));
  }
  notifyWaitlist();
  logActivity('Waitlist Joined', 'bookings', `Client ${newEntry.fullName} joined waitlist for ${newEntry.eventDate}.`);
  return newEntry;
}

export function updateWaitlistStatus(id: string, status: 'waiting' | 'contacted' | 'resolved'): void {
  const current = getWaitlist();
  const updated = current.map((item) => (item.id === id ? { ...item, status } : item));
  cachedWaitlist = updated;
  if (typeof window !== 'undefined') {
    localStorage.setItem(WAITLIST_KEY, JSON.stringify(updated));
  }
  notifyWaitlist();
}

// ==========================================
// 4. CAPACITY EVALUATION LOGIC
// ==========================================

export interface DateCapacityResult {
  date: string;
  bookedCount: number;
  maxCapacity: number;
  remainingSlots: number;
  isFull: boolean;
  isLimited: boolean; // 1 slot remaining
  isAvailable: boolean;
  isBlocked: boolean;
  blockedReason?: string;
  hasOverride: boolean;
  overrideNote?: string;
  periodStats: {
    morning: { count: number; max: number; isFull: boolean };
    afternoon: { count: number; max: number; isFull: boolean };
    evening: { count: number; max: number; isFull: boolean };
  };
  activeBookings: Booking[];
}

/**
 * Checks whether a booking status consumes capacity.
 * Pending & Confirmed count towards limit.
 * Rejected, Cancelled, Expired RELEASE it.
 */
export function doesStatusConsumeCapacity(status: Booking['status']): boolean {
  return status === 'Pending' || status === 'Confirmed';
}

/**
 * Evaluates the date's booking capacity against current bookings & settings
 */
export function getCapacityForDate(
  dateStr: string,
  bookingsList?: Booking[],
  settings?: CapacitySettings
): DateCapacityResult {
  const cfg = settings || getCapacitySettings();
  const allBookings = bookingsList || getBookings();

  // Normalize date string (YYYY-MM-DD)
  const cleanDate = dateStr.slice(0, 10);

  // Check if date is blocked
  const blockedInfo = cfg.blockedDates[cleanDate];
  const isBlocked = !!blockedInfo;
  const blockedReason = blockedInfo?.reason;

  // Determine max events for this date
  let maxCapacity = cfg.defaultMaxEventsPerDay;
  let hasOverride = false;
  let overrideNote: string | undefined;

  // 1. Check date override
  if (cfg.dateOverrides[cleanDate]) {
    maxCapacity = cfg.dateOverrides[cleanDate].maxEvents;
    hasOverride = true;
    overrideNote = cfg.dateOverrides[cleanDate].notes;
  } else {
    // 2. Fallback to weekday limit
    try {
      // Parse with noon time to avoid UTC day boundary shift
      const d = new Date(`${cleanDate}T12:00:00Z`);
      if (!isNaN(d.getTime())) {
        const dayOfWeek = d.getUTCDay();
        if (cfg.weekdayLimits[dayOfWeek] !== undefined) {
          maxCapacity = cfg.weekdayLimits[dayOfWeek];
        }
      }
    } catch {
      // Keep default
    }
  }

  // Active bookings on this date that consume capacity
  const activeBookings = allBookings.filter(
    (b) => b.eventDate.slice(0, 10) === cleanDate && doesStatusConsumeCapacity(b.status)
  );

  const bookedCount = activeBookings.length;
  const remainingSlots = Math.max(0, maxCapacity - bookedCount);
  const isFull = isBlocked || bookedCount >= maxCapacity;
  const isLimited = !isFull && remainingSlots <= 1;
  const isAvailable = !isFull && !isLimited && !isBlocked;

  // Evaluate Period Limits (Morning, Afternoon, Evening)
  let morningCount = 0;
  let afternoonCount = 0;
  let eveningCount = 0;

  for (const b of activeBookings) {
    const timeStr = (b.timeOfDay || '').toLowerCase();
    if (timeStr.includes('morning')) {
      morningCount++;
    } else if (timeStr.includes('afternoon')) {
      afternoonCount++;
    } else if (timeStr.includes('evening')) {
      eveningCount++;
    } else if (timeStr.includes('full day') || timeStr.includes('days')) {
      // Full day consumes all 3 periods
      morningCount++;
      afternoonCount++;
      eveningCount++;
    }
  }

  const periodStats = {
    morning: {
      count: morningCount,
      max: cfg.defaultPeriodLimits.morning,
      isFull: morningCount >= cfg.defaultPeriodLimits.morning || isFull
    },
    afternoon: {
      count: afternoonCount,
      max: cfg.defaultPeriodLimits.afternoon,
      isFull: afternoonCount >= cfg.defaultPeriodLimits.afternoon || isFull
    },
    evening: {
      count: eveningCount,
      max: cfg.defaultPeriodLimits.evening,
      isFull: eveningCount >= cfg.defaultPeriodLimits.evening || isFull
    }
  };

  return {
    date: cleanDate,
    bookedCount,
    maxCapacity,
    remainingSlots,
    isFull,
    isLimited,
    isAvailable,
    isBlocked,
    blockedReason,
    hasOverride,
    overrideNote,
    periodStats,
    activeBookings
  };
}

// ==========================================
// 5. AUTO-EXPIRATION ROUTINE
// ==========================================

/**
 * Automatically marks unconfirmed/pending bookings past expiration time or event date as Expired.
 * Returns count of newly expired bookings.
 */
export function checkAndExpireBookings(): number {
  if (typeof window === 'undefined') return 0;
  const bookings = getBookings();
  const cfg = getCapacitySettings();
  const now = new Date();
  let expiredCount = 0;

  const updated = bookings.map((b) => {
    // Only check Pending bookings
    if (b.status !== 'Pending') return b;

    let shouldExpire = false;
    let reason = '';

    // Condition A: Event date has already passed
    const eventDate = new Date(`${b.eventDate}T23:59:59`);
    if (!isNaN(eventDate.getTime()) && eventDate < now) {
      shouldExpire = true;
      reason = 'Event date passed without confirmation deposit verification.';
    }

    // Condition B: Pending for longer than configured expiration hours
    if (!shouldExpire && b.createdAt) {
      const createdDate = new Date(b.createdAt);
      if (!isNaN(createdDate.getTime())) {
        const hoursElapsed = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60);
        if (hoursElapsed > cfg.expirationHours) {
          shouldExpire = true;
          reason = `Payment window exceeded (${cfg.expirationHours} hours elapsed).`;
        }
      }
    }

    if (shouldExpire) {
      expiredCount++;
      return {
        ...b,
        status: 'Expired' as const,
        rejectionReason: reason,
        adminNotes: b.adminNotes ? `${b.adminNotes} · Auto-expired: ${reason}` : `Auto-expired: ${reason}`,
        notificationStatus: {
          notified: false
        }
      };
    }
    return b;
  });

  if (expiredCount > 0) {
    localStorage.setItem('hawi_pictures_bookings_v2', JSON.stringify(updated));
    logActivity(
      'Bookings Auto-Expired',
      'bookings',
      `${expiredCount} pending reservation(s) expired due to time-out or past event date and released capacity.`
    );
  }

  return expiredCount;
}

// ==========================================
// 6. TELEGRAM FORMATTING & NOTIFICATION HELPERS
// ==========================================

export function validateTelegramUsername(username: string): { isValid: boolean; clean: string; error?: string } {
  const clean = username.trim().replace(/^@+/, '');
  if (!clean) {
    return { isValid: false, clean: '', error: 'Telegram username is required.' };
  }
  // 5 to 32 characters, letters, numbers and underscores, starts with a letter
  const regex = /^[a-zA-Z][a-zA-Z0-9_]{4,31}$/;
  if (!regex.test(clean)) {
    return {
      isValid: false,
      clean,
      error: 'Username must be 5-32 characters, start with a letter, and only use letters, numbers, and underscores.'
    };
  }
  return { isValid: true, clean };
}

export function formatTelegramMessage(
  template: string,
  booking: {
    fullName: string;
    bookingCode: string;
    packageName: string;
    eventDate: string;
    status: string;
  },
  reason?: string
): string {
  let msg = template;
  msg = msg.replace(/\[Name\]/g, booking.fullName);
  msg = msg.replace(/\[BookingCode\]/g, booking.bookingCode);
  msg = msg.replace(/\[Package\]/g, booking.packageName);
  msg = msg.replace(/\[Date\]/g, booking.eventDate);
  msg = msg.replace(/\[Status\]/g, (booking.status || '').toLowerCase());
  msg = msg.replace(/\[Reason\]/g, reason || 'Requested slot unavailable / payment unverified');
  return msg;
}

export function buildTelegramUrl(username: string, text: string): string {
  const cleanUser = username.trim().replace(/^@+/, '');
  const encodedText = encodeURIComponent(text);
  return `https://t.me/${cleanUser}?text=${encodedText}`;
}

// ==========================================
// 7. REACT HOOKS
// ==========================================

export function useCapacitySettings() {
  return useSyncExternalStore(subscribeCapacitySettings, getCapacitySettings, () => DEFAULT_CAPACITY_SETTINGS);
}

export function useWaitlist() {
  return useSyncExternalStore(subscribeWaitlist, getWaitlist, () => INITIAL_WAITLIST);
}
