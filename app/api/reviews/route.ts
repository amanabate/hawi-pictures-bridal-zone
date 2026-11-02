import { NextRequest, NextResponse } from 'next/server';
import { memDb } from '@/lib/supabase/db';

export async function GET() {
  try {
    const approvedReviews = memDb.reviews
      .filter((r) => r.status === 'approved')
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return NextResponse.json({
      success: true,
      data: approvedReviews
    });
  } catch (err) {
    console.error('[Reviews GET Error]', err);
    return NextResponse.json(
      {
        success: false,
        error: { code: 'SERVER_ERROR', messageKey: 'errors.server_error', message: 'Unable to load reviews.' }
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customerName, rating, text, bookingCode } = body;

    if (!customerName || !rating || !text) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_FIELDS',
            messageKey: 'validation.missing_fields',
            message: 'Customer name, rating (1-5), and review text are required.'
          }
        },
        { status: 400 }
      );
    }

    const numRating = Number(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_RATING',
            messageKey: 'validation.invalid_rating',
            message: 'Rating must be an integer between 1 and 5.'
          }
        },
        { status: 400 }
      );
    }

    let bookingId: string | null = null;
    if (bookingCode) {
      const b = memDb.bookings.find((item) => item.booking_code.toUpperCase() === String(bookingCode).trim().toUpperCase());
      if (b) bookingId = b.id;
    }

    const newReview = {
      id: 'rev_' + Math.random().toString(36).substring(2, 11),
      booking_id: bookingId,
      customer_name: String(customerName).trim(),
      rating: Math.round(numRating),
      text: String(text).trim(),
      status: 'pending' as const, // Must be approved by owner/receptionist before appearing publicly
      created_at: new Date().toISOString()
    };

    memDb.reviews.unshift(newReview);

    return NextResponse.json({
      success: true,
      data: {
        message: 'Thank you! Your review has been submitted and will be published once reviewed.'
      }
    });
  } catch (err) {
    console.error('[Reviews POST Error]', err);
    return NextResponse.json(
      {
        success: false,
        error: { code: 'SERVER_ERROR', messageKey: 'errors.server_error', message: 'Unable to submit review.' }
      },
      { status: 500 }
    );
  }
}
