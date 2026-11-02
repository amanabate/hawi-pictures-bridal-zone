export type UserRole = 'owner' | 'receptionist' | 'staff' | 'client';
export type PackageBadge = 'none' | 'popular' | 'special';
export type PackageStatus = 'active' | 'hidden' | 'draft' | 'archived';
export type DepositType = 'fixed' | 'percent';
export type GalleryCategory = 'wedding' | 'bridal' | 'makeup' | 'traditional' | 'studio';
export type GalleryMediaType = 'image' | 'video_link';
export type BookingPeriod = 'morning' | 'afternoon' | 'evening' | 'full_day';
export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'rejected' | 'cancelled' | 'expired';
export type PaymentStatus = 'unpaid' | 'deposit_submitted' | 'deposit_paid' | 'fully_paid' | 'refunded';
export type PaymentKind = 'deposit' | 'balance' | 'refund';
export type PaymentMethod = 'telebirr' | 'cbe' | 'abyssinia' | 'dashen' | 'cash';
export type PaymentRecordStatus = 'submitted' | 'verified' | 'rejected';
export type ReviewStatus = 'pending' | 'approved' | 'hidden';

export interface MultilingualString {
  en: string;
  om: string;
  am: string;
}

export interface ProfileRow {
  id: string;
  full_name: string;
  phone: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PackageRow {
  id: string;
  code: string;
  name: MultilingualString;
  description: MultilingualString;
  price_birr: number;
  deposit_type: DepositType;
  deposit_value: number | null;
  included_items: MultilingualString[];
  badge: PackageBadge;
  status: PackageStatus;
  sort_order: number;
  old_price: number | null;
  discount_ends_at: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ServiceRow {
  id: string;
  name: MultilingualString;
  description: MultilingualString;
  image_url: string;
  starting_price: number | null;
  sort_order: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface GalleryItemRow {
  id: string;
  category: GalleryCategory;
  type: GalleryMediaType;
  url: string;
  caption: MultilingualString;
  alt_text: string;
  album_name: string | null;
  is_featured: boolean;
  is_visible: boolean;
  sort_order: number;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface BookingRow {
  id: string;
  booking_code: string;
  customer_name: string;
  phone: string;
  telegram_username: string | null;
  phone_only: boolean;
  package_id: string;
  package_name_snapshot: string;
  package_price_snapshot: number;
  deposit_amount_snapshot: number | null;
  event_date: string; // YYYY-MM-DD
  period: BookingPeriod;
  venue: string;
  city: string;
  notes: string | null;
  language: string;
  status: BookingStatus;
  payment_status: PaymentStatus;
  status_reason: string | null;
  hold_expires_at: string;
  assigned_staff_id: string | null;
  assigned_staff_names?: string[];
  notified_at: string | null;
  notified_by: string | null;
  is_overridden_by_owner: boolean;
  override_reason: string | null;
  admin_private_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaymentRow {
  id: string;
  booking_id: string;
  kind: PaymentKind;
  amount: number;
  method: PaymentMethod;
  reference_number: string;
  screenshot_path: string | null;
  status: PaymentRecordStatus;
  is_duplicate_ref: boolean;
  recorded_by: string | null;
  created_at: string;
}

export interface CapacityRulesRow {
  id: string;
  default_per_day: number;
  default_per_period: number;
  per_weekday: Record<string, number>;
  created_at: string;
  updated_at: string;
}

export interface CapacityOverrideRow {
  id: string;
  date: string;
  max_per_day: number;
  max_per_period: number;
  note: string | null;
  created_at: string;
  updated_at: string;
}

export interface BlockedDateRow {
  id: string;
  date: string;
  reason: string;
  created_at: string;
  updated_at: string;
}

export interface WaitlistRow {
  id: string;
  name: string;
  phone: string;
  desired_date: string;
  notified: boolean;
  created_at: string;
}

export interface ReviewRow {
  id: string;
  booking_id: string | null;
  customer_name: string;
  rating: number;
  text: string;
  status: ReviewStatus;
  created_at: string;
}

export interface SiteSettingsRow {
  id: string;
  phones: string[];
  social_links: Record<string, string>;
  address: MultilingualString;
  opening_hours: Record<string, string>;
  payment_accounts: Record<string, { name: string; number?: string; account?: string }>;
  cancellation_policy: MultilingualString;
  telegram_templates: MultilingualString;
  notice_text: {
    title: MultilingualString;
    en: string;
    om: string;
    am: string;
  };
  hold_times: {
    reminder_hours: number;
    expiry_hours: number;
  };
  created_at: string;
  updated_at: string;
}

export interface ActivityLogRow {
  id: string;
  actor_id: string | null;
  actor_name: string;
  action: string;
  entity: string;
  entity_id: string;
  before: unknown;
  after: unknown;
  created_at: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    messageKey: string;
    message: string;
    details?: unknown;
  };
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    hasMore?: boolean;
  };
}
