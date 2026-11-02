-- ============================================================================
-- 001_initial_schema.sql
-- Hawi Pictures & Bridal Zone - Initial Database Schema
-- Wedding Photography, Bridal Salon & Aadaa Cultural Wear (Ethiopia)
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Custom enum types
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('owner', 'receptionist', 'staff', 'client');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE package_badge AS ENUM ('none', 'popular', 'special');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE package_status AS ENUM ('active', 'hidden', 'draft', 'archived');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE deposit_type AS ENUM ('fixed', 'percent');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE gallery_category AS ENUM ('wedding', 'bridal', 'makeup', 'traditional', 'studio');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE gallery_media_type AS ENUM ('image', 'video_link');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE booking_period AS ENUM ('morning', 'afternoon', 'evening', 'full_day');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'completed', 'rejected', 'cancelled', 'expired');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('unpaid', 'deposit_submitted', 'deposit_paid', 'fully_paid', 'refunded');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_kind AS ENUM ('deposit', 'balance', 'refund');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_record_status AS ENUM ('submitted', 'verified', 'rejected');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE review_status AS ENUM ('pending', 'approved', 'hidden');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Sequence for unique booking codes (format: HAWI-0001)
CREATE SEQUENCE IF NOT EXISTS booking_code_seq START WITH 1 INCREMENT BY 1;

-- Function to generate booking code
CREATE OR REPLACE FUNCTION generate_booking_code()
RETURNS text AS $$
BEGIN
  RETURN 'HAWI-' || lpad(nextval('booking_code_seq')::text, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- 1. Profiles Table (Linked to auth.users)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  phone text NOT NULL,
  role user_role NOT NULL DEFAULT 'client',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 2. Packages Table (Real flyer packages)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.packages (
  id text PRIMARY KEY,
  code text NOT NULL UNIQUE,
  name jsonb NOT NULL, -- {en: "...", om: "...", am: "..."}
  description jsonb NOT NULL, -- {en: "...", om: "...", am: "..."}
  price_birr numeric(12, 2) NOT NULL CHECK (price_birr >= 0),
  deposit_type deposit_type NOT NULL DEFAULT 'fixed',
  deposit_value numeric(12, 2) DEFAULT NULL,
  included_items jsonb NOT NULL DEFAULT '[]'::jsonb, -- array of {en, om, am}
  badge package_badge NOT NULL DEFAULT 'none',
  status package_status NOT NULL DEFAULT 'active',
  sort_order integer NOT NULL DEFAULT 0,
  old_price numeric(12, 2) DEFAULT NULL,
  discount_ends_at timestamptz DEFAULT NULL,
  deleted_at timestamptz DEFAULT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 3. Services Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.services (
  id text PRIMARY KEY,
  name jsonb NOT NULL,
  description jsonb NOT NULL,
  image_url text NOT NULL,
  starting_price numeric(12, 2) DEFAULT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  is_visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 4. Gallery Items Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.gallery_items (
  id text PRIMARY KEY,
  category gallery_category NOT NULL DEFAULT 'wedding',
  type gallery_media_type NOT NULL DEFAULT 'image',
  url text NOT NULL,
  caption jsonb NOT NULL DEFAULT '{}'::jsonb,
  alt_text text NOT NULL DEFAULT '',
  album_name text DEFAULT NULL,
  is_featured boolean NOT NULL DEFAULT false,
  is_visible boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  deleted_at timestamptz DEFAULT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 5. Bookings Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_code text NOT NULL UNIQUE DEFAULT generate_booking_code(),
  customer_name text NOT NULL,
  phone text NOT NULL CHECK (phone ~ '^09[0-9]{8}$'),
  telegram_username text DEFAULT NULL,
  phone_only boolean NOT NULL DEFAULT false,
  preferred_language text NOT NULL DEFAULT 'om' CHECK (preferred_language IN ('en', 'om', 'am')),
  language text NOT NULL DEFAULT 'om', -- Backwards compatibility alias
  package_id text NOT NULL REFERENCES public.packages(id),
  package_name_snapshot text NOT NULL,
  package_price_snapshot numeric(12, 2) NOT NULL,
  deposit_amount_snapshot numeric(12, 2) DEFAULT NULL,
  package_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb, -- Full package snapshot at booking time
  event_date date NOT NULL,
  period booking_period NOT NULL DEFAULT 'full_day',
  venue text NOT NULL,
  city text NOT NULL DEFAULT 'Addis Ababa',
  notes text DEFAULT NULL,
  status booking_status NOT NULL DEFAULT 'pending',
  payment_status payment_status NOT NULL DEFAULT 'deposit_submitted',
  status_reason text DEFAULT NULL,
  hold_expires_at timestamptz NOT NULL,
  created_by uuid DEFAULT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  assigned_staff_id uuid DEFAULT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  notified_at timestamptz DEFAULT NULL,
  notified_by text DEFAULT NULL,
  is_overridden_by_owner boolean NOT NULL DEFAULT false,
  override_reason text DEFAULT NULL,
  admin_private_notes text DEFAULT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 6. Payments Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  kind payment_kind NOT NULL DEFAULT 'deposit',
  amount_birr numeric(12, 2) NOT NULL CHECK (amount_birr >= 0),
  amount numeric(12, 2) GENERATED ALWAYS AS (amount_birr) STORED, -- compatibility
  payment_method text NOT NULL DEFAULT 'telebirr', -- telebirr, cbe, abyssinia, dashen, awash, boa, cash, in_person
  method text GENERATED ALWAYS AS (payment_method) STORED, -- compatibility
  transaction_reference text NOT NULL,
  reference_number text GENERATED ALWAYS AS (transaction_reference) STORED, -- compatibility
  screenshot_url text DEFAULT NULL,
  screenshot_path text GENERATED ALWAYS AS (screenshot_url) STORED, -- compatibility
  verified_by uuid DEFAULT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  verified_at timestamptz DEFAULT NULL,
  status payment_record_status NOT NULL DEFAULT 'submitted',
  note text DEFAULT NULL,
  is_duplicate_ref boolean NOT NULL DEFAULT false,
  recorded_by uuid DEFAULT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 7. Capacity Rules & Overrides
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.capacity_rules (
  id text PRIMARY KEY DEFAULT 'default',
  default_per_day integer NOT NULL DEFAULT 4 CHECK (default_per_day >= 1),
  default_per_period integer NOT NULL DEFAULT 2 CHECK (default_per_period >= 1),
  per_weekday jsonb NOT NULL DEFAULT '{"0":2,"1":2,"2":2,"3":2,"4":3,"5":5,"6":6}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.capacity_overrides (
  date date PRIMARY KEY,
  id uuid DEFAULT gen_random_uuid(),
  max_events integer NOT NULL DEFAULT 2 CHECK (max_events >= 0),
  max_per_day integer GENERATED ALWAYS AS (max_events) STORED,
  morning_limit integer NOT NULL DEFAULT 1 CHECK (morning_limit >= 0),
  afternoon_limit integer NOT NULL DEFAULT 1 CHECK (afternoon_limit >= 0),
  evening_limit integer NOT NULL DEFAULT 1 CHECK (evening_limit >= 0),
  max_per_period integer GENERATED ALWAYS AS (GREATEST(morning_limit, afternoon_limit, evening_limit)) STORED,
  is_blocked boolean NOT NULL DEFAULT false,
  reason text DEFAULT NULL,
  note text GENERATED ALWAYS AS (reason) STORED,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.blocked_dates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL UNIQUE,
  reason text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 8. Waitlist Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.waitlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  name text GENERATED ALWAYS AS (customer_name) STORED, -- compatibility
  phone text NOT NULL CHECK (phone ~ '^09[0-9]{8}$'),
  telegram_username text DEFAULT NULL,
  preferred_date date NOT NULL,
  desired_date date GENERATED ALWAYS AS (preferred_date) STORED, -- compatibility
  preferred_period text DEFAULT 'full_day',
  notes text DEFAULT NULL,
  status text NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'notified', 'converted', 'expired')),
  notified boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 9. Reviews Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid DEFAULT NULL REFERENCES public.bookings(id) ON DELETE SET NULL,
  customer_name text NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  text text NOT NULL,
  status review_status NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 10. Site Settings Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.site_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  updated_by uuid DEFAULT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 11. Notification Templates Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notification_templates (
  id text PRIMARY KEY,
  channel text NOT NULL CHECK (channel IN ('telegram', 'sms')),
  event text NOT NULL CHECK (event IN ('booking_submitted', 'booking_confirmed', 'payment_received', 'hold_expiring', 'date_reminder')),
  language text NOT NULL CHECK (language IN ('en', 'om', 'am')),
  body_template text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 12. Activity Log Table (Insert-only, strictly immutable)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid DEFAULT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  actor_id uuid DEFAULT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  actor_name text DEFAULT 'System',
  action text NOT NULL,
  entity_type text NOT NULL DEFAULT 'general',
  entity text GENERATED ALWAYS AS (entity_type) STORED,
  entity_id text NOT NULL,
  details jsonb DEFAULT '{}'::jsonb,
  before jsonb DEFAULT NULL,
  after jsonb DEFAULT NULL,
  ip_address text DEFAULT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- Indexes for High Performance & Query Optimization
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_bookings_event_date ON public.bookings(event_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_booking_code ON public.bookings(booking_code);
CREATE INDEX IF NOT EXISTS idx_bookings_phone ON public.bookings(phone);
CREATE INDEX IF NOT EXISTS idx_bookings_hold_expires_at ON public.bookings(hold_expires_at);
CREATE INDEX IF NOT EXISTS idx_bookings_created_by ON public.bookings(created_by);
CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON public.payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_reference ON public.payments(transaction_reference);
CREATE INDEX IF NOT EXISTS idx_packages_status_deleted ON public.packages(status, deleted_at);
CREATE INDEX IF NOT EXISTS idx_packages_sort ON public.packages(sort_order);
CREATE INDEX IF NOT EXISTS idx_gallery_items_category_visible ON public.gallery_items(category, is_visible, deleted_at);
CREATE INDEX IF NOT EXISTS idx_waitlist_preferred_date ON public.waitlist(preferred_date);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON public.reviews(status);
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON public.activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_log_entity ON public.activity_log(entity_type, entity_id);

-- ----------------------------------------------------------------------------
-- Triggers: Automatic updated_at
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_packages_updated_at ON public.packages;
CREATE TRIGGER trg_packages_updated_at BEFORE UPDATE ON public.packages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_services_updated_at ON public.services;
CREATE TRIGGER trg_services_updated_at BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_gallery_items_updated_at ON public.gallery_items;
CREATE TRIGGER trg_gallery_items_updated_at BEFORE UPDATE ON public.gallery_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_bookings_updated_at ON public.bookings;
CREATE TRIGGER trg_bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_payments_updated_at ON public.payments;
CREATE TRIGGER trg_payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_capacity_overrides_updated_at ON public.capacity_overrides;
CREATE TRIGGER trg_capacity_overrides_updated_at BEFORE UPDATE ON public.capacity_overrides FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_waitlist_updated_at ON public.waitlist;
CREATE TRIGGER trg_waitlist_updated_at BEFORE UPDATE ON public.waitlist FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_site_settings_updated_at ON public.site_settings;
CREATE TRIGGER trg_site_settings_updated_at BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_notification_templates_updated_at ON public.notification_templates;
CREATE TRIGGER trg_notification_templates_updated_at BEFORE UPDATE ON public.notification_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------------
-- Trigger: Automatic Booking Code Assignment
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_booking_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.booking_code IS NULL OR NEW.booking_code = '' THEN
    NEW.booking_code := public.generate_booking_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_booking_code ON public.bookings;
CREATE TRIGGER trg_set_booking_code BEFORE INSERT ON public.bookings FOR EACH ROW EXECUTE FUNCTION set_booking_code();
