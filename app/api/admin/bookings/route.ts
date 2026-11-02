import { NextRequest, NextResponse } from 'next/server';
import { memDb, createBookingAtomic } from '@/lib/supabase/db';
import { BookingPeriod, PaymentMethod } from '@/lib/supabase/types';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.toLowerCase() || '';
    const status = searchParams.get('status') || '';
    const notNotifiedOnly = searchParams.get('notNotified') === 'true';
    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    let list = [...memDb.bookings];

    if (search) {
      list = list.filter(
        (b) =>
          b.customer_name.toLowerCase().includes(search) ||
          b.booking_code.toLowerCase().includes(search) ||
          b.phone.includes(search) ||
          (b.telegram_username && b.telegram_username.toLowerCase().includes(search)) ||
          b.venue.toLowerCase().includes(search)
      );
    }

    if (status && status !== 'all') {
      list = list.filter((b) => b.status.toLowerCase() === status.toLowerCase());
    }

    if (notNotifiedOnly) {
      list = list.filter((b) => b.notified_at === null);
    }

    if (startDate) {
      list = list.filter((b) => b.event_date >= startDate);
    }
    if (endDate) {
      list = list.filter((b) => b.event_date <= endDate);
    }

    // Sort by created_at desc
    list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const total = list.length;
    const startIndex = (page - 1) * limit;
    const paginated = list.slice(startIndex, startIndex + limit);

    // Attach payments to each booking
    const data = paginated.map((b) => {
      const payments = memDb.payments.filter((p) => p.booking_id === b.id);
      return {
        ...b,
        payments
      };
    });

    return NextResponse.json({
      success: true,
      data,
      meta: {
        page,
        limit,
        total,
        hasMore: startIndex + limit < total
      }
    });
  } catch (err) {
    console.error('[Admin Bookings GET Error]', err);
    return NextResponse.json(
      {
        success: false,
        error: { code: 'SERVER_ERROR', messageKey: 'errors.server_error', message: 'Unable to fetch bookings.' }
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      customerName,
      phone,
      telegramUsername,
      phoneOnly,
      packageId,
      eventDate,
      period,
      venue,
      city,
      notes,
      language,
      paymentMethod,
      referenceNumber,
      isOwnerOverride,
      overrideReason
    } = body;

    // Owner override requires a reason
    if (isOwnerOverride && !overrideReason) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'REASON_REQUIRED',
            messageKey: 'validation.override_reason_required',
            message: 'A mandatory reason is required to add a booking over the capacity limit.'
          }
        },
        { status: 400 }
      );
    }

    const result = await createBookingAtomic({
      customerName,
      phone,
      telegramUsername,
      phoneOnly: Boolean(phoneOnly),
      packageId,
      eventDate,
      period: (period || 'full_day') as BookingPeriod,
      venue,
      city,
      notes,
      language: language || 'om',
      paymentMethod: (paymentMethod || 'cash') as PaymentMethod,
      referenceNumber: referenceNumber || `MANUAL-${Date.now()}`,
      isOwnerOverride: Boolean(isOwnerOverride),
      overrideReason: overrideReason || undefined
    });

    return NextResponse.json({
      success: true,
      data: result.booking
    });
  } catch (err: unknown) {
    const errorObj = err as { code?: string; messageKey?: string; message?: string };
    return NextResponse.json(
      {
        success: false,
        error: {
          code: errorObj?.code || 'SERVER_ERROR',
          messageKey: errorObj?.messageKey || 'errors.server_error',
          message: errorObj?.message || 'Failed to create manual booking.'
        }
      },
      { status: 400 }
    );
  }
}
