-- ============================================================================
-- 004_functions_and_triggers.sql
-- Hawi Pictures & Bridal Zone - Database Functions & Atomic Handlers
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Function: get_availability(target_month)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_availability(p_month date)
RETURNS TABLE (
  booking_date date,
  status text, -- 'available', 'limited', 'full', 'blocked'
  is_blocked boolean,
  blocked_reason text,
  booked_count integer,
  max_capacity integer,
  full_periods text[],
  period_counts jsonb
) AS $$
DECLARE
  v_start_date date := date_trunc('month', p_month)::date;
  v_end_date date := (date_trunc('month', p_month) + interval '1 month - 1 day')::date;
  v_rules record;
  v_curr_date date;
  v_day_of_week text;
  v_max_day integer;
  v_max_period integer;
  v_booked_day integer;
  v_blocked_reason text;
  v_override record;
  v_full_periods text[];
  v_period_counts jsonb;
  v_m_count integer;
  v_a_count integer;
  v_e_count integer;
  v_f_count integer;
  v_stat text;
BEGIN
  -- Retrieve base rules
  SELECT * INTO v_rules FROM public.capacity_rules WHERE id = 'default';
  IF NOT FOUND THEN
    v_rules.default_per_day := 4;
    v_rules.default_per_period := 2;
    v_rules.per_weekday := '{"0":2,"1":2,"2":2,"3":2,"4":3,"5":5,"6":6}'::jsonb;
  END IF;

  v_curr_date := v_start_date;
  WHILE v_curr_date <= v_end_date LOOP
    v_day_of_week := EXTRACT(DOW FROM v_curr_date)::text;
    v_blocked_reason := NULL;
    v_full_periods := ARRAY[]::text[];

    -- 1. Check if date is blocked
    SELECT reason INTO v_blocked_reason FROM public.blocked_dates WHERE date = v_curr_date;
    IF v_blocked_reason IS NOT NULL THEN
      booking_date := v_curr_date;
      status := 'blocked';
      is_blocked := true;
      blocked_reason := v_blocked_reason;
      booked_count := 0;
      max_capacity := 0;
      full_periods := ARRAY['morning', 'afternoon', 'evening', 'full_day'];
      period_counts := '{"morning":0,"afternoon":0,"evening":0,"full_day":0}'::jsonb;
      RETURN NEXT;
      v_curr_date := v_curr_date + 1;
      CONTINUE;
    END IF;

    -- 2. Determine max capacity (Override -> Weekday -> Default)
    SELECT * INTO v_override FROM public.capacity_overrides WHERE date = v_curr_date;
    IF FOUND THEN
      v_max_day := v_override.max_per_day;
      v_max_period := v_override.max_per_period;
    ELSE
      -- Check weekday
      IF v_rules.per_weekday ? v_day_of_week THEN
        v_max_day := (v_rules.per_weekday->>v_day_of_week)::integer;
      ELSE
        v_max_day := v_rules.default_per_day;
      END IF;
      v_max_period := v_rules.default_per_period;
    END IF;

    -- 3. Count active bookings (pending and confirmed count; rejected, cancelled, expired do NOT)
    SELECT COUNT(*) INTO v_booked_day
    FROM public.bookings
    WHERE event_date = v_curr_date AND status IN ('pending', 'confirmed');

    SELECT COUNT(*) INTO v_m_count FROM public.bookings
    WHERE event_date = v_curr_date AND status IN ('pending', 'confirmed') AND period = 'morning';

    SELECT COUNT(*) INTO v_a_count FROM public.bookings
    WHERE event_date = v_curr_date AND status IN ('pending', 'confirmed') AND period = 'afternoon';

    SELECT COUNT(*) INTO v_e_count FROM public.bookings
    WHERE event_date = v_curr_date AND status IN ('pending', 'confirmed') AND period = 'evening';

    SELECT COUNT(*) INTO v_f_count FROM public.bookings
    WHERE event_date = v_curr_date AND status IN ('pending', 'confirmed') AND period = 'full_day';

    -- Periods full check
    IF (v_m_count + v_f_count) >= v_max_period THEN
      v_full_periods := array_append(v_full_periods, 'morning');
    END IF;
    IF (v_a_count + v_f_count) >= v_max_period THEN
      v_full_periods := array_append(v_full_periods, 'afternoon');
    END IF;
    IF (v_e_count + v_f_count) >= v_max_period THEN
      v_full_periods := array_append(v_full_periods, 'evening');
    END IF;
    IF v_booked_day >= v_max_day THEN
      v_full_periods := array_append(v_full_periods, 'full_day');
      v_stat := 'full';
    ELSIF v_booked_day >= CEIL(v_max_day::numeric / 2.0) THEN
      v_stat := 'limited';
    ELSE
      v_stat := 'available';
    END IF;

    booking_date := v_curr_date;
    status := v_stat;
    is_blocked := false;
    blocked_reason := NULL;
    booked_count := v_booked_day;
    max_capacity := v_max_day;
    full_periods := v_full_periods;
    period_counts := jsonb_build_object(
      'morning', v_m_count,
      'afternoon', v_a_count,
      'evening', v_e_count,
      'full_day', v_f_count
    );
    RETURN NEXT;

    v_curr_date := v_curr_date + 1;
  END LOOP;
END;
$$ LANGUAGE plpgsql STABLE;

-- ----------------------------------------------------------------------------
-- 2. Function: create_booking_atomic
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.create_booking_atomic(
  p_customer_name text,
  p_phone text,
  p_telegram_username text,
  p_phone_only boolean,
  p_package_id text,
  p_event_date date,
  p_period booking_period,
  p_venue text,
  p_city text,
  p_notes text,
  p_language text,
  p_payment_method payment_method,
  p_reference_number text,
  p_screenshot_path text,
  p_is_owner_override boolean DEFAULT false,
  p_override_reason text DEFAULT NULL
)
RETURNS jsonb AS $$
DECLARE
  v_pkg record;
  v_booked_day integer;
  v_period_count integer;
  v_max_day integer;
  v_max_period integer;
  v_rules record;
  v_override record;
  v_day_of_week text;
  v_blocked_reason text;
  v_booking_id uuid;
  v_booking_code text;
  v_hold_expires timestamptz;
  v_is_dup_ref boolean := false;
  v_deposit_amount numeric(12, 2);
BEGIN
  -- Verify package exists and is active
  SELECT * INTO v_pkg FROM public.packages WHERE id = p_package_id AND deleted_at IS NULL;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'PACKAGE_NOT_FOUND: Selected package does not exist or has been removed.';
  END IF;

  -- Verify event date is in the future
  IF p_event_date <= CURRENT_DATE THEN
    RAISE EXCEPTION 'DATE_IN_PAST: Event date must be in the future.';
  END IF;

  -- Acquire advisory lock based on date to serialize concurrent bookings on the same date
  PERFORM pg_advisory_xact_lock(hashtext('booking_date_' || p_event_date::text));

  -- Check if date is blocked
  SELECT reason INTO v_blocked_reason FROM public.blocked_dates WHERE date = p_event_date;
  IF v_blocked_reason IS NOT NULL AND NOT p_is_owner_override THEN
    RAISE EXCEPTION 'DATE_BLOCKED: This date is blocked for bookings: %', v_blocked_reason;
  END IF;

  -- Calculate capacity
  IF NOT p_is_owner_override THEN
    SELECT * INTO v_rules FROM public.capacity_rules WHERE id = 'default';
    SELECT * INTO v_override FROM public.capacity_overrides WHERE date = p_event_date;
    
    IF FOUND THEN
      v_max_day := v_override.max_per_day;
      v_max_period := v_override.max_per_period;
    ELSE
      v_day_of_week := EXTRACT(DOW FROM p_event_date)::text;
      IF v_rules.per_weekday ? v_day_of_week THEN
        v_max_day := (v_rules.per_weekday->>v_day_of_week)::integer;
      ELSE
        v_max_day := v_rules.default_per_day;
      END IF;
      v_max_period := v_rules.default_per_period;
    END IF;

    -- Count active bookings
    SELECT COUNT(*) INTO v_booked_day
    FROM public.bookings
    WHERE event_date = p_event_date AND status IN ('pending', 'confirmed');

    IF v_booked_day >= v_max_day THEN
      RAISE EXCEPTION 'DATE_UNAVAILABLE: This date just became unavailable, please choose another.';
    END IF;

    -- Count period bookings
    IF p_period != 'full_day' THEN
      SELECT COUNT(*) INTO v_period_count
      FROM public.bookings
      WHERE event_date = p_event_date AND status IN ('pending', 'confirmed')
        AND (period = p_period OR period = 'full_day');

      IF v_period_count >= v_max_period THEN
        RAISE EXCEPTION 'DATE_UNAVAILABLE: The requested time period on this date is already fully booked.';
      END IF;
    END IF;
  END IF;

  -- Check duplicate reference number
  IF EXISTS (
    SELECT 1 FROM public.payments
    WHERE LOWER(TRIM(reference_number)) = LOWER(TRIM(p_reference_number))
  ) THEN
    v_is_dup_ref := true;
  END IF;

  -- Calculate deposit snapshot
  IF v_pkg.deposit_type = 'percent' AND v_pkg.deposit_value IS NOT NULL THEN
    v_deposit_amount := (v_pkg.price_birr * v_pkg.deposit_value) / 100.0;
  ELSIF v_pkg.deposit_value IS NOT NULL AND v_pkg.deposit_value > 0 THEN
    v_deposit_amount := v_pkg.deposit_value;
  ELSE
    -- Default deposit: 30% of total package
    v_deposit_amount := ROUND((v_pkg.price_birr * 0.3)::numeric, 0);
  END IF;

  -- Hold expires in 48 hours
  v_hold_expires := now() + interval '48 hours';
  v_booking_code := public.generate_booking_code();

  -- Insert Booking
  INSERT INTO public.bookings (
    booking_code,
    customer_name,
    phone,
    telegram_username,
    phone_only,
    package_id,
    package_name_snapshot,
    package_price_snapshot,
    deposit_amount_snapshot,
    event_date,
    period,
    venue,
    city,
    notes,
    language,
    status,
    payment_status,
    hold_expires_at,
    is_overridden_by_owner,
    override_reason
  ) VALUES (
    v_booking_code,
    p_customer_name,
    p_phone,
    p_telegram_username,
    p_phone_only,
    p_package_id,
    v_pkg.name->>'om',
    v_pkg.price_birr,
    v_deposit_amount,
    p_event_date,
    p_period,
    p_venue,
    COALESCE(p_city, 'Addis Ababa'),
    p_notes,
    p_language,
    'pending',
    'deposit_submitted',
    v_hold_expires,
    p_is_owner_override,
    p_override_reason
  ) RETURNING id INTO v_booking_id;

  -- Insert Payment record
  INSERT INTO public.payments (
    booking_id,
    kind,
    amount,
    method,
    reference_number,
    screenshot_path,
    status,
    is_duplicate_ref
  ) VALUES (
    v_booking_id,
    'deposit',
    v_deposit_amount,
    p_payment_method,
    p_reference_number,
    p_screenshot_path,
    'submitted',
    v_is_dup_ref
  );

  -- Log Activity
  INSERT INTO public.activity_log (
    actor_name,
    action,
    entity,
    entity_id,
    after
  ) VALUES (
    CASE WHEN p_is_owner_override THEN 'Owner (Override)' ELSE 'Customer' END,
    'CREATE_BOOKING',
    'bookings',
    v_booking_id::text,
    jsonb_build_object(
      'booking_code', v_booking_code,
      'customer_name', p_customer_name,
      'event_date', p_event_date,
      'package_id', p_package_id,
      'is_duplicate_ref', v_is_dup_ref,
      'is_owner_override', p_is_owner_override
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'booking_id', v_booking_id,
    'booking_code', v_booking_code,
    'customer_name', p_customer_name,
    'event_date', p_event_date,
    'hold_expires_at', v_hold_expires,
    'is_duplicate_ref', v_is_dup_ref
  );
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- 3. Function: check_and_expire_bookings() for 15-minute cron
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.check_and_expire_bookings()
RETURNS jsonb AS $$
DECLARE
  v_expired_count integer := 0;
  v_reminder_count integer := 0;
  r record;
BEGIN
  -- 1. Count pending bookings > 24 hours needing reminder
  SELECT COUNT(*) INTO v_reminder_count
  FROM public.bookings
  WHERE status = 'pending'
    AND created_at <= (now() - interval '24 hours')
    AND created_at > (now() - interval '48 hours');

  -- 2. Expire pending bookings older than 48 hours
  FOR r IN
    SELECT id, booking_code, customer_name, event_date
    FROM public.bookings
    WHERE status = 'pending' AND hold_expires_at <= now()
  LOOP
    UPDATE public.bookings
    SET status = 'expired',
        status_reason = 'Payment deposit hold expired after 48 hours without verification.',
        notified_at = NULL -- Reset to show as "not notified"
    WHERE id = r.id;

    v_expired_count := v_expired_count + 1;

    INSERT INTO public.activity_log (
      actor_name,
      action,
      entity,
      entity_id,
      after
    ) VALUES (
      'System Cron',
      'EXPIRE_BOOKING',
      'bookings',
      r.id::text,
      jsonb_build_object('booking_code', r.booking_code, 'reason', 'Hold expired (48h)')
    );
  END LOOP;

  RETURN jsonb_build_object(
    'expired_count', v_expired_count,
    'reminders_due_count', v_reminder_count,
    'timestamp', now()
  );
END;
$$ LANGUAGE plpgsql;
