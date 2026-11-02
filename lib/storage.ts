export interface NotificationStatus {
  notified: boolean;
  notifiedAt?: string;
  notifiedBy?: string;
  method?: 'telegram' | 'phone_call' | 'copied';
}

export interface Booking {
  id: string;
  bookingCode: string;
  fullName: string;
  phone: string;
  telegramUsername?: string | null;
  isPhoneOnly?: boolean;
  clientLanguage?: 'en' | 'om' | 'am';
  packageId: string;
  packageName: string;
  packagePrice: string;
  priceNumeric: number;
  depositRequired: string;
  eventDate: string; // YYYY-MM-DD
  timeOfDay: string;
  venue: string;
  notes: string;
  paymentScreenshot?: string;
  paymentMethod: string;
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Rejected' | 'Cancelled' | 'Expired';
  rejectionReason?: string;
  cancellationReason?: string;
  assignedStaff?: string[]; // Staff names e.g. ["Abebe Kebede", "Meron Tadesse"]
  notificationStatus?: NotificationStatus;
  isOverriddenByOwner?: boolean;
  createdAt: string;
  adminNotes?: string;
}

const STORAGE_KEY = 'hawi_pictures_bookings_v3';

export const INITIAL_DEMO_BOOKINGS: Booking[] = [
  {
    id: 'HAWI-2026-9142',
    bookingCode: 'HAWI-2026-9142',
    fullName: 'Selamawit Tadesse & Dawit Bekele',
    phone: '0911245892',
    telegramUsername: 'selam_tadesse',
    isPhoneOnly: false,
    clientLanguage: 'en',
    packageId: 'special-package',
    packageName: 'Special Package',
    packagePrice: '60,000 Birr',
    priceNumeric: 60000,
    depositRequired: '',
    eventDate: '2026-11-14',
    timeOfDay: 'Full Day (All Day & Evening)',
    venue: 'Ethiopian Skylight Hotel, Grand Ballroom',
    notes: 'We want traditional Habesha Kemis photos in the garden before the reception. Bridal party consists of 6 bridesmaids.',
    paymentScreenshot: '/images/hawi_bridal_makeup_1793302556782.jpg',
    paymentMethod: 'Commercial Bank of Ethiopia (CBE)',
    status: 'Confirmed',
    assignedStaff: ['Abebe Kebede', 'Meron Tadesse'],
    notificationStatus: {
      notified: true,
      notifiedAt: '2026-10-24T12:00:00Z',
      notifiedBy: 'Studio Owner',
      method: 'telegram'
    },
    createdAt: '2026-10-24T10:15:00Z',
    adminNotes: 'CBE receipt confirmed (Ref #CBE984210). Assigned Lead Photographer Abebe & Salon Artist Meron.'
  },
  {
    id: 'HAWI-2026-8319',
    bookingCode: 'HAWI-2026-8319',
    fullName: 'Bethlehem Haile & Yonas Girma',
    phone: '0988018016',
    telegramUsername: 'bethy_haile',
    isPhoneOnly: false,
    clientLanguage: 'am',
    packageId: 'paakeejii-1ffaa',
    packageName: 'Paakeejii 1ffaa',
    packagePrice: '40,000 Birr',
    priceNumeric: 40000,
    depositRequired: '',
    eventDate: '2026-12-05',
    timeOfDay: 'Full Day (All Day & Evening)',
    venue: 'Sheraton Addis Luxury Collection & Kuriftu Resort',
    notes: '2-Day event: Day 1 at Sheraton, Day 2 Melse at Kuriftu Bishoftu. Need drone coverage for the lake.',
    paymentScreenshot: '/images/hawi_reception_celebration_1793302558086.jpg',
    paymentMethod: 'Telebirr',
    status: 'Pending',
    assignedStaff: ['Dawit Bekele'],
    notificationStatus: {
      notified: false
    },
    createdAt: '2026-10-28T16:40:00Z'
  },
  {
    id: 'HAWI-2026-7840',
    bookingCode: 'HAWI-2026-7840',
    fullName: 'Meron Mengistu & Dr. Henok Assefa',
    phone: '0914878007',
    telegramUsername: 'meron_m_ethio',
    isPhoneOnly: false,
    clientLanguage: 'om',
    packageId: 'paakeejii-2ffaa',
    packageName: 'Paakeejii 2ffaa',
    packagePrice: '36,000 Birr',
    priceNumeric: 36000,
    depositRequired: '',
    eventDate: '2026-11-28',
    timeOfDay: '3 Full Days (VIP Extended)',
    venue: 'Haile Grand Hotel Addis Ababa & Entoto Natural Park',
    notes: 'VIP 3-day coverage. Cathedral veil and imported European gown fitting scheduled for Nov 10.',
    paymentScreenshot: '/images/hawi_bridal_gown_1793302558528.jpg',
    paymentMethod: 'Commercial Bank of Ethiopia (CBE)',
    status: 'Confirmed',
    assignedStaff: ['Abebe Kebede', 'Dawit Bekele', 'Meron Tadesse'],
    notificationStatus: {
      notified: true,
      notifiedAt: '2026-10-26T16:00:00Z',
      notifiedBy: 'Studio Owner',
      method: 'telegram'
    },
    createdAt: '2026-10-26T14:20:00Z',
    adminNotes: 'VIP contract signed. 36,000 Birr package selected.'
  },
  {
    id: 'HAWI-2026-6412',
    bookingCode: 'HAWI-2026-6412',
    fullName: 'Helina Kebede & Fikadu Worku',
    phone: '0930129845',
    telegramUsername: null,
    isPhoneOnly: true,
    clientLanguage: 'en',
    packageId: 'paakeejii-3ffaa',
    packageName: 'Paakeejii 3ffaa',
    packagePrice: '32,000 Birr',
    priceNumeric: 32000,
    depositRequired: '',
    eventDate: '2026-11-08',
    timeOfDay: 'Morning (8:00 AM - 12:00 PM)',
    venue: 'Bole Studio Salon Suite & Hyatt Regency',
    notes: 'Bride + 4 bridesmaids hair styling and airbrush makeup. Trial completed.',
    paymentScreenshot: '/images/hawi_bridal_makeup_1793302556782.jpg',
    paymentMethod: 'Telebirr',
    status: 'Pending',
    notificationStatus: {
      notified: false
    },
    createdAt: '2026-10-29T08:30:00Z'
  },
  {
    id: 'HAWI-2026-5198',
    bookingCode: 'HAWI-2026-5198',
    fullName: 'Eden Solomon & Abel Tefera',
    phone: '0911839201',
    telegramUsername: 'eden_solomon_a',
    isPhoneOnly: false,
    clientLanguage: 'am',
    packageId: 'paakeejii-4ffaa',
    packageName: 'Paakeejii 4ffaa',
    packagePrice: '28,000 Birr',
    priceNumeric: 28000,
    depositRequired: '',
    eventDate: '2026-10-18',
    timeOfDay: 'Full Day (All Day & Evening)',
    venue: 'Capital Hotel and Spa Addis Ababa',
    notes: 'Drone coverage and cinematic film. Event finished successfully.',
    paymentScreenshot: '/images/hawi_wedding_photography_1793302557354.jpg',
    paymentMethod: 'Commercial Bank of Ethiopia (CBE)',
    status: 'Completed',
    createdAt: '2026-09-25T11:00:00Z',
    adminNotes: 'Albums printed and delivered to couple. Positive 5-star review received!'
  },
  {
    id: 'HAWI-2026-7201',
    bookingCode: 'HAWI-2026-7201',
    fullName: 'Tsion Alemu & Henok Fisseha',
    phone: '0922894103',
    telegramUsername: 'tsion_alemu22',
    isPhoneOnly: false,
    clientLanguage: 'en',
    packageId: 'paakeejii-5ffaa',
    packageName: 'Paakeejii 5ffaa',
    packagePrice: '24,000 Birr',
    priceNumeric: 24000,
    depositRequired: '',
    eventDate: '2026-11-01',
    timeOfDay: 'Morning (8:00 AM - 12:00 PM)',
    venue: 'St. George Cathedral Addis Ababa',
    notes: 'Urgent weekend booking. Small church ceremony.',
    paymentScreenshot: '/images/hawi_wedding_photography_1793302557354.jpg',
    paymentMethod: 'Awash Bank',
    status: 'Rejected',
    rejectionReason: 'Date unavailable - studio crews booked for Special Package at Skylight.',
    notificationStatus: {
      notified: false
    },
    createdAt: '2026-10-20T09:10:00Z',
    adminNotes: 'Date fully booked with Special Package at Skylight.'
  },
  {
    id: 'HAWI-2026-3044',
    bookingCode: 'HAWI-2026-3044',
    fullName: 'Genet Bekele & Tadesse W.',
    phone: '0944112233',
    telegramUsername: 'genet_bekele',
    isPhoneOnly: false,
    clientLanguage: 'om',
    packageId: 'paakeejii-6ffaa',
    packageName: 'Paakeejii 6ffaa',
    packagePrice: '20,000 Birr',
    priceNumeric: 20000,
    depositRequired: '',
    eventDate: '2026-10-25',
    timeOfDay: 'Afternoon (1:00 PM - 5:00 PM)',
    venue: 'Monarch Hotel Bole',
    notes: 'Inquiry for small afternoon reception.',
    paymentMethod: 'Telebirr',
    status: 'Expired',
    rejectionReason: 'Payment window exceeded (48 hours elapsed without deposit verification).',
    notificationStatus: {
      notified: false
    },
    createdAt: '2026-10-22T08:00:00Z',
    adminNotes: 'Auto-expired due to no response on Telebirr reference.'
  }
];

let listeners: Array<() => void> = [];
let cachedBookings: Booking[] | null = null;

function notify() {
  for (const listener of listeners) {
    listener();
  }
}

export function subscribeBookings(listener: () => void) {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

export function getBookings(): Booking[] {
  if (typeof window === 'undefined') {
    return INITIAL_DEMO_BOOKINGS;
  }
  if (cachedBookings) {
    return cachedBookings;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DEMO_BOOKINGS));
      cachedBookings = INITIAL_DEMO_BOOKINGS;
      return INITIAL_DEMO_BOOKINGS;
    }
    const parsed = JSON.parse(raw);
    cachedBookings = Array.isArray(parsed) ? parsed : INITIAL_DEMO_BOOKINGS;
    return cachedBookings;
  } catch (e) {
    console.error('Error reading bookings from localStorage:', e);
    cachedBookings = INITIAL_DEMO_BOOKINGS;
    return INITIAL_DEMO_BOOKINGS;
  }
}

export function saveBooking(booking: Booking): void {
  if (typeof window === 'undefined') return;
  const current = getBookings();
  const updated = [booking, ...current];
  cachedBookings = updated;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  notify();
}

export interface UpdateBookingOptions {
  status?: Booking['status'];
  rejectionReason?: string;
  cancellationReason?: string;
  adminNotes?: string;
  assignedStaff?: string[];
  notificationStatus?: NotificationStatus;
  isOverriddenByOwner?: boolean;
}

export function updateBooking(id: string, updates: UpdateBookingOptions): Booking[] {
  if (typeof window === 'undefined') return [];
  const current = getBookings();
  const updated = current.map((item) => {
    if (item.id === id) {
      return {
        ...item,
        ...updates
      };
    }
    return item;
  });
  cachedBookings = updated;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  notify();
  return updated;
}

export function updateBookingStatus(
  id: string,
  status: Booking['status'],
  adminNotes?: string,
  reason?: string
): Booking[] {
  const updates: UpdateBookingOptions = {
    status,
    ...(adminNotes !== undefined ? { adminNotes } : {})
  };
  if (status === 'Rejected') {
    updates.rejectionReason = reason;
    updates.notificationStatus = { notified: false };
  } else if (status === 'Cancelled') {
    updates.cancellationReason = reason;
    updates.notificationStatus = { notified: false };
  }
  return updateBooking(id, updates);
}

export function markBookingNotified(
  id: string,
  adminName: string = 'Studio Admin',
  method: 'telegram' | 'phone_call' | 'copied' = 'telegram'
): Booking[] {
  if (typeof window === 'undefined') return [];
  const current = getBookings();
  const updated = current.map((b) => {
    if (b.id === id) {
      return {
        ...b,
        notificationStatus: {
          notified: true,
          notifiedAt: new Date().toISOString(),
          notifiedBy: adminName,
          method
        }
      };
    }
    return b;
  });
  cachedBookings = updated;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  notify();
  return updated;
}

export function assignStaffToBooking(id: string, staff: string[]): Booking[] {
  return updateBooking(id, { assignedStaff: staff });
}

export function deleteBooking(id: string): Booking[] {
  if (typeof window === 'undefined') return [];
  const current = getBookings();
  const updated = current.filter((item) => item.id !== id);
  cachedBookings = updated;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  notify();
  return updated;
}

export function resetDemoBookings(): Booking[] {
  if (typeof window === 'undefined') return INITIAL_DEMO_BOOKINGS;
  cachedBookings = INITIAL_DEMO_BOOKINGS;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DEMO_BOOKINGS));
  notify();
  return INITIAL_DEMO_BOOKINGS;
}

export function generateBookingCode(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `HAWI-${year}-${random}`;
}
