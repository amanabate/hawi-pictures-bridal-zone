import { NextRequest, NextResponse } from 'next/server';
import { getMonthlyAvailability } from '@/lib/supabase/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const month = searchParams.get('month') || new Date().toISOString().substring(0, 7);

    // Validate YYYY-MM format
    if (!/^\d{4}-\d{2}$/.test(month)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_MONTH_FORMAT',
            messageKey: 'validation.invalid_month',
            message: 'Month must be in YYYY-MM format.'
          }
        },
        { status: 400 }
      );
    }

    const availability = await getMonthlyAvailability(month);

    return NextResponse.json({
      success: true,
      data: {
        month,
        days: availability
      }
    });
  } catch (err) {
    console.error('[Availability API Error]', err);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          messageKey: 'errors.server_error',
          message: 'Failed to retrieve date availability.'
        }
      },
      { status: 500 }
    );
  }
}
