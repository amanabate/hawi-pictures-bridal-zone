import { NextRequest, NextResponse } from 'next/server';
import { memDb } from '@/lib/supabase/db';
import { BookingStatus, PaymentMethod } from '@/lib/supabase/types';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const booking = memDb.bookings.find((b) => b.id === id);

    if (!booking) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'NOT_FOUND', messageKey: 'errors.booking_not_found', message: 'Booking not found.' }
        },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { action } = body;
    const beforeState = { ...booking };

    switch (action) {
      case 'confirm': {
        booking.status = 'confirmed';
        booking.payment_status = 'deposit_paid';
        booking.updated_at = new Date().toISOString();

        // Verify deposit payment record
        const depositPayment = memDb.payments.find((p) => p.booking_id === id && p.kind === 'deposit');
        if (depositPayment) {
          depositPayment.status = 'verified';
        }

        break;
      }

      case 'reject': {
        const { reason, reasonNotes } = body;
        if (!reason && !reasonNotes) {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: 'REASON_REQUIRED',
                messageKey: 'validation.reason_required',
                message: 'A rejection reason is required.'
              }
            },
            { status: 400 }
          );
        }
        booking.status = 'rejected';
        booking.status_reason = [reason, reasonNotes].filter(Boolean).join(' - ');
        booking.updated_at = new Date().toISOString();

        const depositPayment = memDb.payments.find((p) => p.booking_id === id && p.kind === 'deposit');
        if (depositPayment) {
          depositPayment.status = 'rejected';
        }
        break;
      }

      case 'cancel': {
        const { reason, reasonNotes, refundStatus } = body;
        if (!reason && !reasonNotes) {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: 'REASON_REQUIRED',
                messageKey: 'validation.reason_required',
                message: 'A cancellation reason is required.'
              }
            },
            { status: 400 }
          );
        }
        booking.status = 'cancelled';
        booking.status_reason = [reason, reasonNotes].filter(Boolean).join(' - ');
        if (refundStatus) {
          booking.payment_status = refundStatus;
        }
        booking.updated_at = new Date().toISOString();
        break;
      }

      case 'reschedule': {
        const { newDate, newPeriod } = body;
        if (!newDate) {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: 'MISSING_DATE',
                messageKey: 'validation.new_date_required',
                message: 'New event date is required.'
              }
            },
            { status: 400 }
          );
        }

        // Capacity check for new date
        const dayOfWeek = String(new Date(newDate).getDay());
        const override = memDb.capacityOverrides.find((o) => o.date === newDate);
        let maxDay = memDb.capacityRules.default_per_day;
        if (override) maxDay = override.max_per_day;
        else if (memDb.capacityRules.per_weekday[dayOfWeek] !== undefined) {
          maxDay = memDb.capacityRules.per_weekday[dayOfWeek];
        }

        const activeOnNewDate = memDb.bookings.filter(
          (b) => b.id !== id && b.event_date === newDate && (b.status === 'pending' || b.status === 'confirmed')
        );

        if (activeOnNewDate.length >= maxDay) {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: 'DATE_UNAVAILABLE',
                messageKey: 'errors.reschedule_date_unavailable',
                message: 'The selected date is already at full capacity.'
              }
            },
            { status: 409 }
          );
        }

        booking.event_date = newDate;
        if (newPeriod) booking.period = newPeriod;
        booking.status = 'pending'; // Requires confirmation on new date
        booking.updated_at = new Date().toISOString();
        break;
      }

      case 'record_balance': {
        const { amount, method, referenceNumber } = body;
        const numAmount = Number(amount);
        if (isNaN(numAmount) || numAmount <= 0) {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: 'INVALID_AMOUNT',
                messageKey: 'validation.invalid_amount',
                message: 'Payment amount must be greater than zero.'
              }
            },
            { status: 400 }
          );
        }

        const balancePayment = {
          id: 'pay_' + Math.random().toString(36).substring(2, 11),
          booking_id: id,
          kind: 'balance' as const,
          amount: numAmount,
          method: (method || 'telebirr') as PaymentMethod,
          reference_number: referenceNumber || `BAL-${Date.now()}`,
          screenshot_path: null,
          status: 'verified' as const,
          is_duplicate_ref: false,
          recorded_by: null,
          created_at: new Date().toISOString()
        };
        memDb.payments.push(balancePayment);

        // Calculate total payments
        const allPayments = memDb.payments.filter(
          (p) => p.booking_id === id && (p.status === 'verified' || p.status === 'submitted')
        );
        const totalPaid = allPayments.reduce((sum, p) => sum + p.amount, 0);

        if (totalPaid >= booking.package_price_snapshot) {
          booking.payment_status = 'fully_paid';
        } else {
          booking.payment_status = 'deposit_paid';
        }
        booking.updated_at = new Date().toISOString();
        break;
      }

      case 'assign_staff': {
        const { staffId, staffNames } = body;
        booking.assigned_staff_id = staffId || null;
        if (staffNames) {
          booking.assigned_staff_names = staffNames;
        }

        // Double-booking warning check:
        let warning: string | null = null;
        if (staffId || staffNames?.length) {
          const conflicting = memDb.bookings.filter(
            (b) =>
              b.id !== id &&
              b.event_date === booking.event_date &&
              b.period === booking.period &&
              (b.status === 'pending' || b.status === 'confirmed') &&
              (b.assigned_staff_id === staffId ||
                (staffNames && b.assigned_staff_names?.some((s) => staffNames.includes(s))))
          );

          if (conflicting.length > 0) {
            warning = `Staff member is already assigned to booking ${conflicting[0].booking_code} during the same period (${booking.period}).`;
          }
        }

        booking.updated_at = new Date().toISOString();

        // Write activity log
        memDb.activityLogs.unshift({
          id: 'log_' + Math.random().toString(36).substring(2, 11),
          actor_id: null,
          actor_name: 'Admin',
          action: 'ASSIGN_STAFF',
          entity: 'bookings',
          entity_id: id,
          before: { staff: beforeState.assigned_staff_names },
          after: { staff: booking.assigned_staff_names, warning },
          created_at: new Date().toISOString()
        });

        return NextResponse.json({
          success: true,
          data: booking,
          warning
        });
      }

      case 'mark_notified': {
        const { notifiedBy } = body;
        booking.notified_at = new Date().toISOString();
        booking.notified_by = notifiedBy || 'Owner';
        booking.updated_at = new Date().toISOString();
        break;
      }

      case 'admin_notes': {
        const { notes } = body;
        booking.admin_private_notes = notes || null;
        booking.updated_at = new Date().toISOString();
        break;
      }

      case 'mark_completed': {
        booking.status = 'completed';
        booking.updated_at = new Date().toISOString();
        break;
      }

      default:
        return NextResponse.json(
          {
            success: false,
            error: { code: 'INVALID_ACTION', messageKey: 'errors.invalid_action', message: 'Unknown action specified.' }
          },
          { status: 400 }
        );
    }

    // Write activity log for any action
    memDb.activityLogs.unshift({
      id: 'log_' + Math.random().toString(36).substring(2, 11),
      actor_id: null,
      actor_name: 'Admin',
      action: `BOOKING_${action.toUpperCase()}`,
      entity: 'bookings',
      entity_id: id,
      before: beforeState,
      after: booking,
      created_at: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      data: booking
    });
  } catch (err) {
    console.error('[Admin Booking PATCH Error]', err);
    return NextResponse.json(
      {
        success: false,
        error: { code: 'SERVER_ERROR', messageKey: 'errors.server_error', message: 'Failed to update booking.' }
      },
      { status: 500 }
    );
  }
}
