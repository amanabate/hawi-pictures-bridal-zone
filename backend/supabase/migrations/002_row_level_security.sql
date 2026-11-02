-- ============================================================================
-- 002_row_level_security.sql
-- Hawi Pictures & Bridal Zone - Row Level Security (RLS)
-- ============================================================================

-- Helper functions to check user roles from public.profiles
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS user_role AS $$
DECLARE
  v_role user_role;
BEGIN
  SELECT role INTO v_role
  FROM public.profiles
  WHERE id = auth.uid() AND is_active = true;
  RETURN v_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_owner()
RETURNS boolean AS $$
BEGIN
  RETURN (public.current_user_role() = 'owner');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_receptionist_or_owner()
RETURNS boolean AS $$
DECLARE
  r user_role;
BEGIN
  r := public.current_user_role();
  RETURN (r = 'owner' OR r = 'receptionist');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_staff_or_above()
RETURNS boolean AS $$
DECLARE
  r user_role;
BEGIN
  r := public.current_user_role();
  RETURN (r IN ('owner', 'receptionist', 'staff'));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ----------------------------------------------------------------------------
-- 1. Enable RLS on All Tables
-- ----------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.capacity_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.capacity_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- 2. Profiles Policies
-- ----------------------------------------------------------------------------
-- Users can view their own profile
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Owner can read and manage all profiles
CREATE POLICY "Owner can manage all profiles"
  ON public.profiles FOR ALL
  USING (public.is_owner());

-- Receptionist can read active staff profiles for assigning
CREATE POLICY "Receptionist can read profiles"
  ON public.profiles FOR SELECT
  USING (public.is_receptionist_or_owner());

-- ----------------------------------------------------------------------------
-- 3. Packages Policies
-- ----------------------------------------------------------------------------
-- Public: read active & non-deleted
CREATE POLICY "Public read active packages"
  ON public.packages FOR SELECT
  USING (status = 'active' AND deleted_at IS NULL);

-- Staff: read active packages
CREATE POLICY "Staff read active packages"
  ON public.packages FOR SELECT
  USING (public.is_staff_or_above());

-- Owner: full access
CREATE POLICY "Owner full packages access"
  ON public.packages FOR ALL
  USING (public.is_owner());

-- Receptionist: can update package description/items, but cannot delete or change price
CREATE POLICY "Receptionist update package content"
  ON public.packages FOR UPDATE
  USING (public.is_receptionist_or_owner())
  WITH CHECK (
    public.is_owner() OR (
      -- Receptionist cannot alter price_birr or soft-delete
      price_birr = (SELECT p.price_birr FROM public.packages p WHERE p.id = packages.id) AND
      deleted_at IS NOT DISTINCT FROM (SELECT p.deleted_at FROM public.packages p WHERE p.id = packages.id)
    )
  );

-- ----------------------------------------------------------------------------
-- 4. Services Policies
-- ----------------------------------------------------------------------------
-- Public: read visible
CREATE POLICY "Public read visible services"
  ON public.services FOR SELECT
  USING (is_visible = true);

-- Owner: full access
CREATE POLICY "Owner manage services"
  ON public.services FOR ALL
  USING (public.is_owner());

-- Receptionist: update services visibility/order
CREATE POLICY "Receptionist read all services"
  ON public.services FOR SELECT
  USING (public.is_receptionist_or_owner());

-- ----------------------------------------------------------------------------
-- 5. Gallery Items Policies
-- ----------------------------------------------------------------------------
-- Public: read visible & non-deleted
CREATE POLICY "Public read visible gallery"
  ON public.gallery_items FOR SELECT
  USING (is_visible = true AND deleted_at IS NULL);

-- Owner & Receptionist: full gallery management
CREATE POLICY "Owner and Receptionist manage gallery"
  ON public.gallery_items FOR ALL
  USING (public.is_receptionist_or_owner());

-- ----------------------------------------------------------------------------
-- 6. Bookings Policies
-- ----------------------------------------------------------------------------
-- Owner & Receptionist: full access
CREATE POLICY "Owner and Receptionist manage bookings"
  ON public.bookings FOR ALL
  USING (public.is_receptionist_or_owner());

-- Staff: read only bookings assigned to them
CREATE POLICY "Staff read assigned bookings"
  ON public.bookings FOR SELECT
  USING (
    public.is_staff_or_above() AND (
      assigned_staff_id = auth.uid() OR
      public.is_receptionist_or_owner()
    )
  );

-- Clients: can read only bookings where phone matches their authenticated profile phone
CREATE POLICY "Client read own bookings"
  ON public.bookings FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND
    phone = (SELECT p.phone FROM public.profiles p WHERE p.id = auth.uid())
  );

-- Note: Public booking submission and status check are routed through server route handlers
-- with service role key, enforcing anti-spam, duplicate checks and atomic capacity locks.

-- ----------------------------------------------------------------------------
-- 7. Payments Policies
-- ----------------------------------------------------------------------------
-- Owner & Receptionist: view and manage payment records
CREATE POLICY "Owner and Receptionist manage payments"
  ON public.payments FOR ALL
  USING (public.is_receptionist_or_owner());

-- Clients: read only payments for their own bookings
CREATE POLICY "Client read own payments"
  ON public.payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.bookings b
      JOIN public.profiles p ON p.phone = b.phone
      WHERE b.id = payments.booking_id AND p.id = auth.uid()
    )
  );

-- ----------------------------------------------------------------------------
-- 8. Capacity Rules, Overrides and Blocked Dates Policies
-- ----------------------------------------------------------------------------
-- Public: read availability only through server function get_availability()
-- Staff: read capacity rules
CREATE POLICY "Staff read capacity rules"
  ON public.capacity_rules FOR SELECT
  USING (public.is_staff_or_above());

-- Owner: can update capacity rules, add overrides and block dates
CREATE POLICY "Owner manage capacity rules"
  ON public.capacity_rules FOR ALL
  USING (public.is_owner());

CREATE POLICY "Owner manage capacity overrides"
  ON public.capacity_overrides FOR ALL
  USING (public.is_owner());

CREATE POLICY "Owner manage blocked dates"
  ON public.blocked_dates FOR ALL
  USING (public.is_owner());

-- Receptionist: read overrides and blocked dates
CREATE POLICY "Receptionist read capacity overrides"
  ON public.capacity_overrides FOR SELECT
  USING (public.is_receptionist_or_owner());

CREATE POLICY "Receptionist read blocked dates"
  ON public.blocked_dates FOR SELECT
  USING (public.is_receptionist_or_owner());

-- ----------------------------------------------------------------------------
-- 9. Waitlist Policies
-- ----------------------------------------------------------------------------
-- Owner & Receptionist: view and manage waitlist
CREATE POLICY "Owner and Receptionist manage waitlist"
  ON public.waitlist FOR ALL
  USING (public.is_receptionist_or_owner());

-- ----------------------------------------------------------------------------
-- 10. Reviews Policies
-- ----------------------------------------------------------------------------
-- Public: read approved reviews
CREATE POLICY "Public read approved reviews"
  ON public.reviews FOR SELECT
  USING (status = 'approved');

-- Owner & Receptionist: manage reviews (approve, hide, delete)
CREATE POLICY "Owner and Receptionist manage reviews"
  ON public.reviews FOR ALL
  USING (public.is_receptionist_or_owner());

-- ----------------------------------------------------------------------------
-- 11. Site Settings Policies
-- ----------------------------------------------------------------------------
-- Public: read settings
CREATE POLICY "Public read site settings"
  ON public.site_settings FOR SELECT
  USING (true);

-- Owner: edit settings
CREATE POLICY "Owner manage site settings"
  ON public.site_settings FOR ALL
  USING (public.is_owner());

-- ----------------------------------------------------------------------------
-- 12. Activity Log Policies (Strictly Insert-Only, No Edit, No Delete)
-- ----------------------------------------------------------------------------
-- Read: Owner and Receptionist can view
CREATE POLICY "Owner and Receptionist view activity log"
  ON public.activity_log FOR SELECT
  USING (public.is_receptionist_or_owner());

-- Insert: Staff and above or server functions
CREATE POLICY "Staff can insert activity log"
  ON public.activity_log FOR INSERT
  WITH CHECK (true);

-- Disallow UPDATE and DELETE on activity_log for EVERYONE
CREATE OR REPLACE FUNCTION prevent_activity_log_modification()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'activity_log is immutable. Updates and deletions are strictly forbidden.';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_activity_log_immutable ON public.activity_log;
CREATE TRIGGER trg_activity_log_immutable
  BEFORE UPDATE OR DELETE ON public.activity_log
  FOR EACH ROW EXECUTE FUNCTION prevent_activity_log_modification();
