import { NextRequest, NextResponse } from 'next/server';
import { checkBookingStatus } from '@/lib/supabase/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code') || '';
    const phone = searchParams.get('phone') || '';

    if (!code || !phone) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_CREDENTIALS',
            messageKey: 'validation.code_and_phone_required',
            message: 'Both booking code and phone number are required to check booking status.'
          }
        },
        { status: 400 }
      );
    }

    const booking = await checkBookingStatus(code, phone);

    if (!booking) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'BOOKING_NOT_FOUND',
            messageKey: 'errors.booking_not_found',
            message: 'No booking was found matching the provided code and phone number.'
          }
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: booking
    });
  } catch (err) {
    console.error('[Check Booking Status Error]', err);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          messageKey: 'errors.server_error',
          message: 'Unable to check booking status at this time.'
        }
      },
      { status: 500 }
    );
  }
}
