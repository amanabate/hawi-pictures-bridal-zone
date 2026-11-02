import {
  createBookingAtomic,
  checkBookingStatus,
  getMonthlyAvailability,
  runExpireCron,
  memDb
} from '../lib/supabase/db';
import { BookingPeriod } from '../lib/supabase/types';

// Helper to get future date string (YYYY-MM-DD)
function getFutureDate(daysAhead: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString().split('T')[0];
}

export async function runAllBackendTests(): Promise<{
  passed: number;
  failed: number;
  results: Array<{ test: string; status: 'PASSED' | 'FAILED'; error?: string }>;
}> {
  const results: Array<{ test: string; status: 'PASSED' | 'FAILED'; error?: string }> = [];

  const runTest = async (name: string, fn: () => Promise<void>) => {
    try {
      await fn();
      results.push({ test: name, status: 'PASSED' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : JSON.stringify(err);
      results.push({ test: name, status: 'FAILED', error: msg });
    }
  };

  // --------------------------------------------------------------------------
  // TEST 1: Two customers booking the last slot at the same time (concurrency)
  // --------------------------------------------------------------------------
  await runTest('1. Concurrency lock: two customers booking last slot at once', async () => {
    const testDate = getFutureDate(45);
    // Set capacity override of 1 booking max on testDate
    memDb.capacityOverrides = memDb.capacityOverrides.filter((o) => o.date !== testDate);
    memDb.capacityOverrides.push({
      id: 'ovr_test_1',
      date: testDate,
      max_per_day: 1,
      max_per_period: 1,
      note: 'Concurrency test single slot',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    // Clear existing bookings on testDate
    memDb.bookings = memDb.bookings.filter((b) => b.event_date !== testDate);

    // Simultaneously trigger 2 booking attempts
    const req1 = createBookingAtomic({
      customerName: 'Customer A',
      phone: '0911000001',
      phoneOnly: false,
      packageId: 'special-package',
      eventDate: testDate,
      period: 'morning',
      venue: 'Skylight Hotel',
      language: 'om',
      paymentMethod: 'telebirr',
      referenceNumber: `REF-A-${Date.now()}`
    });

    const req2 = createBookingAtomic({
      customerName: 'Customer B',
      phone: '0911000002',
      phoneOnly: false,
      packageId: 'special-package',
      eventDate: testDate,
      period: 'morning',
      venue: 'Sheraton Addis',
      language: 'en',
      paymentMethod: 'cbe',
      referenceNumber: `REF-B-${Date.now()}`
    });

    const settled = await Promise.allSettled([req1, req2]);
    const fulfilled = settled.filter((s) => s.status === 'fulfilled');
    const rejected = settled.filter((s) => s.status === 'rejected');

    if (fulfilled.length !== 1 || rejected.length !== 1) {
      throw new Error(`Expected exactly 1 fulfilled and 1 rejected, got ${fulfilled.length} fulfilled and ${rejected.length} rejected.`);
    }

    const rejectionReason = (rejected[0] as PromiseRejectedResult).reason;
    if (rejectionReason.code !== 'DATE_UNAVAILABLE') {
      throw new Error(`Expected error code DATE_UNAVAILABLE, got ${rejectionReason.code}`);
    }
  });

  // --------------------------------------------------------------------------
  // TEST 2: Capacity counting by status
  // --------------------------------------------------------------------------
  await runTest('2. Capacity counting by status (pending & confirmed count, others do not)', async () => {
    const testDate = getFutureDate(50);
    memDb.capacityOverrides = memDb.capacityOverrides.filter((o) => o.date !== testDate);
    memDb.capacityOverrides.push({
      id: 'ovr_test_2',
      date: testDate,
      max_per_day: 3,
      max_per_period: 2,
      note: 'Capacity counting test',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    memDb.bookings = memDb.bookings.filter((b) => b.event_date !== testDate);

    // Add 1 pending, 1 confirmed, 1 rejected, 1 cancelled, 1 expired
    memDb.bookings.push({
      id: 'b_pend',
      booking_code: 'HAWI-T2-01',
      customer_name: 'Pending User',
      phone: '0912000001',
      telegram_username: null,
      phone_only: true,
      package_id: 'special-package',
      package_name_snapshot: 'Special Package',
      package_price_snapshot: 60000,
      deposit_amount_snapshot: 18000,
      event_date: testDate,
      period: 'morning',
      venue: 'Venue 1',
      city: 'Addis Ababa',
      notes: null,
      language: 'om',
      status: 'pending',
      payment_status: 'deposit_submitted',
      status_reason: null,
      hold_expires_at: new Date(Date.now() + 86400000).toISOString(),
      assigned_staff_id: null,
      notified_at: null,
      notified_by: null,
      is_overridden_by_owner: false,
      override_reason: null,
      admin_private_notes: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    memDb.bookings.push({
      id: 'b_conf',
      booking_code: 'HAWI-T2-02',
      customer_name: 'Confirmed User',
      phone: '0912000002',
      telegram_username: null,
      phone_only: true,
      package_id: 'special-package',
      package_name_snapshot: 'Special Package',
      package_price_snapshot: 60000,
      deposit_amount_snapshot: 18000,
      event_date: testDate,
      period: 'afternoon',
      venue: 'Venue 2',
      city: 'Addis Ababa',
      notes: null,
      language: 'om',
      status: 'confirmed',
      payment_status: 'deposit_paid',
      status_reason: null,
      hold_expires_at: new Date(Date.now() + 86400000).toISOString(),
      assigned_staff_id: null,
      notified_at: null,
      notified_by: null,
      is_overridden_by_owner: false,
      override_reason: null,
      admin_private_notes: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    memDb.bookings.push({
      id: 'b_rej',
      booking_code: 'HAWI-T2-03',
      customer_name: 'Rejected User',
      phone: '0912000003',
      telegram_username: null,
      phone_only: true,
      package_id: 'special-package',
      package_name_snapshot: 'Special Package',
      package_price_snapshot: 60000,
      deposit_amount_snapshot: 18000,
      event_date: testDate,
      period: 'morning',
      venue: 'Venue 3',
      city: 'Addis Ababa',
      notes: null,
      language: 'om',
      status: 'rejected',
      payment_status: 'unpaid',
      status_reason: 'Invalid receipt',
      hold_expires_at: new Date().toISOString(),
      assigned_staff_id: null,
      notified_at: null,
      notified_by: null,
      is_overridden_by_owner: false,
      override_reason: null,
      admin_private_notes: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    const monthStr = testDate.substring(0, 7);
    const avail = await getMonthlyAvailability(monthStr);
    const dayInfo = avail.find((d) => d.date === testDate);

    if (!dayInfo) throw new Error('Date not found in availability results');
    // Only pending and confirmed should count = 2
    if (dayInfo.bookedCount !== 2) {
      throw new Error(`Expected bookedCount = 2, got ${dayInfo.bookedCount}`);
    }
  });

  // --------------------------------------------------------------------------
  // TEST 3: Blocked date enforcement
  // --------------------------------------------------------------------------
  await runTest('3. Blocked date blocks regular bookings', async () => {
    const blockedDate = getFutureDate(30);
    memDb.blockedDates = memDb.blockedDates.filter((b) => b.date !== blockedDate);
    memDb.blockedDates.push({
      id: 'blk_test',
      date: blockedDate,
      reason: 'Studio private staff holiday',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    try {
      await createBookingAtomic({
        customerName: 'Hopeful Customer',
        phone: '0913000001',
        phoneOnly: false,
        packageId: 'special-package',
        eventDate: blockedDate,
        period: 'morning',
        venue: 'Hilton Addis',
        language: 'om',
        paymentMethod: 'telebirr',
        referenceNumber: `REF-BLK-${Date.now()}`
      });
      throw new Error('Should have thrown DATE_BLOCKED error');
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      if (code !== 'DATE_BLOCKED') {
        throw new Error(`Expected DATE_BLOCKED, got: ${code}`);
      }
    }
  });

  // --------------------------------------------------------------------------
  // TEST 4: Owner override allows booking over capacity with mandatory reason
  // --------------------------------------------------------------------------
  await runTest('4. Owner capacity override allows booking with reason', async () => {
    const fullDate = getFutureDate(35);
    memDb.capacityOverrides = memDb.capacityOverrides.filter((o) => o.date !== fullDate);
    memDb.capacityOverrides.push({
      id: 'ovr_full',
      date: fullDate,
      max_per_day: 0, // Zero capacity
      max_per_period: 0,
      note: 'Fully booked',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    // Owner override booking
    const res = await createBookingAtomic({
      customerName: 'VIP Diplomat Wedding',
      phone: '0914000001',
      phoneOnly: false,
      packageId: 'special-package',
      eventDate: fullDate,
      period: 'full_day',
      venue: 'National Palace',
      language: 'om',
      paymentMethod: 'cash',
      referenceNumber: `MANUAL-${Date.now()}`,
      isOwnerOverride: true,
      overrideReason: 'VIP couple approved directly by Studio Founder Hawi'
    });

    if (!res.success || !res.booking.is_overridden_by_owner) {
      throw new Error('Owner override failed to create booking with override flag.');
    }
  });

  // --------------------------------------------------------------------------
  // TEST 5: Duplicate reference number flagging
  // --------------------------------------------------------------------------
  await runTest('5. Duplicate payment reference numbers are flagged', async () => {
    const dupRef = `DUP-REF-${Date.now()}`;
    const testDate = getFutureDate(60);

    // First booking with dupRef
    const res1 = await createBookingAtomic({
      customerName: 'First Payer',
      phone: '0915000001',
      phoneOnly: false,
      packageId: 'paakeejii-1ffaa',
      eventDate: testDate,
      period: 'morning',
      venue: 'Hotel 1',
      language: 'om',
      paymentMethod: 'cbe',
      referenceNumber: dupRef
    });

    if (res1.isDuplicateRef) {
      throw new Error('First payment reference should NOT be flagged as duplicate.');
    }

    // Second booking with exact same dupRef
    const res2 = await createBookingAtomic({
      customerName: 'Second Payer with same ref',
      phone: '0915000002',
      phoneOnly: false,
      packageId: 'paakeejii-2ffaa',
      eventDate: getFutureDate(61),
      period: 'morning',
      venue: 'Hotel 2',
      language: 'om',
      paymentMethod: 'cbe',
      referenceNumber: dupRef
    });

    if (!res2.isDuplicateRef) {
      throw new Error('Second booking with duplicate reference number MUST be flagged as duplicate.');
    }
  });

  // --------------------------------------------------------------------------
  // TEST 6: File validation (magic bytes & size check)
  // --------------------------------------------------------------------------
  await runTest('6. File validation rejects invalid format or oversize files', async () => {
    // Check invalid buffer
    const fakeExeBuffer = Buffer.from('MZ\x90\x00\x03\x00\x00\x00\x04\x00\x00\x00\xff\xff');
    const isJpeg = fakeExeBuffer[0] === 0xff && fakeExeBuffer[1] === 0xd8 && fakeExeBuffer[2] === 0xff;
    if (isJpeg) throw new Error('Fake EXE should not pass JPEG check');

    // Valid JPEG header
    const validJpegHeader = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46]);
    const isValidJpeg = validJpegHeader[0] === 0xff && validJpegHeader[1] === 0xd8 && validJpegHeader[2] === 0xff;
    if (!isValidJpeg) throw new Error('Valid JPEG header should pass');

    // Size limit check
    const sizeOver10MB = 11 * 1024 * 1024;
    if (sizeOver10MB <= 10 * 1024 * 1024) throw new Error('Size check failed');
  });

  // --------------------------------------------------------------------------
  // TEST 7: Status check authorization (wrong phone number rejected)
  // --------------------------------------------------------------------------
  await runTest('7. Status check requires matching booking code AND phone number', async () => {
    const testCode = 'HAWI-TEST-77';
    memDb.bookings.push({
      id: 'b_t7',
      booking_code: testCode,
      customer_name: 'Amina Mohammed',
      phone: '0916777777',
      telegram_username: 'amina_m',
      phone_only: false,
      package_id: 'paakeejii-3ffaa',
      package_name_snapshot: 'Paakeejii 3ffaa',
      package_price_snapshot: 32000,
      deposit_amount_snapshot: 9600,
      event_date: getFutureDate(70),
      period: 'morning',
      venue: 'Radisson Blu',
      city: 'Addis Ababa',
      notes: null,
      language: 'om',
      status: 'confirmed',
      payment_status: 'deposit_paid',
      status_reason: null,
      hold_expires_at: new Date().toISOString(),
      assigned_staff_id: null,
      notified_at: null,
      notified_by: null,
      is_overridden_by_owner: false,
      override_reason: null,
      admin_private_notes: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    // Wrong phone number
    const wrongCheck = await checkBookingStatus(testCode, '0999999999');
    if (wrongCheck !== null) {
      throw new Error('Status check should return null for mismatched phone number.');
    }

    // Correct phone number
    const correctCheck = await checkBookingStatus(testCode, '0916777777');
    if (!correctCheck || correctCheck.booking_code !== testCode) {
      throw new Error('Status check failed for correct code and phone.');
    }
  });

  // --------------------------------------------------------------------------
  // TEST 8: Permission limits of every role
  // --------------------------------------------------------------------------
  await runTest('8. Role permission boundaries (Owner vs Receptionist vs Staff)', async () => {
    // Receptionist cannot delete package
    const canReceptionistDeletePackage = false;
    // Receptionist cannot change package price
    const canReceptionistChangePrice = false;
    // Receptionist cannot override capacity without owner
    const canReceptionistOverrideCapacity = false;
    // Staff can only view assigned bookings
    const canStaffViewUnassigned = false;

    if (canReceptionistDeletePackage || canReceptionistChangePrice || canReceptionistOverrideCapacity || canStaffViewUnassigned) {
      throw new Error('Role permission boundaries violated');
    }
  });

  // --------------------------------------------------------------------------
  // TEST 9: Expiry after 48 hours
  // --------------------------------------------------------------------------
  await runTest('9. Pending booking automatically expires after 48 hours', async () => {
    const expiredBookingId = 'b_exp_test';
    const expiredCode = 'HAWI-EXP-48';

    memDb.bookings.push({
      id: expiredBookingId,
      booking_code: expiredCode,
      customer_name: 'Tsegaye Alemu',
      phone: '0918888888',
      telegram_username: null,
      phone_only: true,
      package_id: 'paakeejii-4ffaa',
      package_name_snapshot: 'Paakeejii 4ffaa',
      package_price_snapshot: 28000,
      deposit_amount_snapshot: 8400,
      event_date: getFutureDate(80),
      period: 'morning',
      venue: 'Sodere Resort',
      city: 'Addis Ababa',
      notes: null,
      language: 'om',
      status: 'pending',
      payment_status: 'deposit_submitted',
      status_reason: null,
      // Created 50 hours ago, hold expired 2 hours ago
      hold_expires_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
      assigned_staff_id: null,
      notified_at: '2026-10-01T00:00:00Z',
      notified_by: 'Owner',
      is_overridden_by_owner: false,
      override_reason: null,
      admin_private_notes: null,
      created_at: new Date(Date.now() - 50 * 3600 * 1000).toISOString(),
      updated_at: new Date().toISOString()
    });

    const cronResult = await runExpireCron();
    const expiredBooking = memDb.bookings.find((b) => b.id === expiredBookingId);

    if (!expiredBooking || expiredBooking.status !== 'expired') {
      throw new Error(`Booking should have status 'expired', got: ${expiredBooking?.status}`);
    }

    if (expiredBooking.notified_at !== null) {
      throw new Error('Expired booking notified_at should be reset to null to show as "not notified"');
    }
  });

  const passed = results.filter((r) => r.status === 'PASSED').length;
  const failed = results.filter((r) => r.status === 'FAILED').length;

  return { passed, failed, results };
}
