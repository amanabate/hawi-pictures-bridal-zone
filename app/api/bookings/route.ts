import { NextRequest, NextResponse } from 'next/server';
import { createBookingAtomic } from '@/lib/supabase/db';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { BookingPeriod, PaymentMethod } from '@/lib/supabase/types';

// Rate limiting in-memory map (per IP and per Phone)
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const MAX_REQUESTS_PER_MINUTE = 5;

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(key);
  if (!record || now - record.lastReset > 60000) {
    rateLimitMap.set(key, { count: 1, lastReset: now });
    return true;
  }
  if (record.count >= MAX_REQUESTS_PER_MINUTE) {
    return false;
  }
  record.count += 1;
  return true;
}

// Magic bytes validation for JPG, PNG, WEBP
function validateImageBuffer(buffer: Buffer): { valid: boolean; ext?: string; mime?: string } {
  if (buffer.length < 12) return { valid: false };

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { valid: true, ext: 'jpg', mime: 'image/jpeg' };
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return { valid: true, ext: 'png', mime: 'image/png' };
  }

  // WEBP: RIFF .... WEBP
  const riff = buffer.toString('ascii', 0, 4);
  const webp = buffer.toString('ascii', 8, 12);
  if (riff === 'RIFF' && webp === 'WEBP') {
    return { valid: true, ext: 'webp', mime: 'image/webp' };
  }

  return { valid: false };
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';

    // Rate limit by IP
    if (!checkRateLimit(`ip_${ip}`)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            messageKey: 'errors.rate_limit',
            message: 'Too many booking attempts. Please wait a moment and try again.'
          }
        },
        { status: 429 }
      );
    }

    const contentType = req.headers.get('content-type') || '';
    let customerName = '';
    let phone = '';
    let telegramUsername: string | null = null;
    let phoneOnly = false;
    let packageId = '';
    let eventDate = '';
    let period: BookingPeriod = 'full_day';
    let venue = '';
    let city = 'Addis Ababa';
    let notes = '';
    let language = 'om';
    let paymentMethod: PaymentMethod = 'telebirr';
    let referenceNumber = '';
    let screenshotPath = '';
    let honeypot = '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();

      // Honeypot spam field
      honeypot = (formData.get('website') as string) || (formData.get('hp_field') as string) || '';
      if (honeypot) {
        // Silent rejection for bots
        return NextResponse.json({ success: true, booking_code: 'HAWI-0000' });
      }

      customerName = (formData.get('customerName') as string) || '';
      phone = (formData.get('phone') as string) || '';
      telegramUsername = (formData.get('telegramUsername') as string) || null;
      phoneOnly = formData.get('phoneOnly') === 'true';
      packageId = (formData.get('packageId') as string) || '';
      eventDate = (formData.get('eventDate') as string) || '';
      period = ((formData.get('period') as string) || 'full_day') as BookingPeriod;
      venue = (formData.get('venue') as string) || '';
      city = (formData.get('city') as string) || 'Addis Ababa';
      notes = (formData.get('notes') as string) || '';
      language = (formData.get('language') as string) || 'om';
      paymentMethod = ((formData.get('paymentMethod') as string) || 'telebirr') as PaymentMethod;
      referenceNumber = (formData.get('referenceNumber') as string) || '';

      // Handle Screenshot File
      const screenshotFile = formData.get('screenshot') as File | null;
      if (screenshotFile && screenshotFile.size > 0) {
        // Check size: Max 10MB
        if (screenshotFile.size > 10 * 1024 * 1024) {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: 'FILE_TOO_LARGE',
                messageKey: 'validation.file_too_large',
                message: 'Payment screenshot file exceeds maximum size of 10MB.'
              }
            },
            { status: 400 }
          );
        }

        const arrayBuffer = await screenshotFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const { valid, ext, mime } = validateImageBuffer(buffer);

        if (!valid) {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: 'INVALID_FILE_TYPE',
                messageKey: 'validation.invalid_file_type',
                message: 'Screenshot must be a valid JPG, PNG, or WEBP image file.'
              }
            },
            { status: 400 }
          );
        }

        // Upload to Supabase Storage if configured
        const supabase = getSupabaseServerClient();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
        const filePath = `receipts/${fileName}`;

        if (supabase) {
          const { error: uploadError } = await supabase.storage
            .from('payment-screenshots')
            .upload(filePath, buffer, { contentType: mime, upsert: false });

          if (uploadError) {
            console.warn('[Supabase Storage Upload Warning]', uploadError);
            screenshotPath = filePath;
          } else {
            screenshotPath = filePath;
          }
        } else {
          // Dev storage path
          screenshotPath = `/uploads/${fileName}`;
        }
      }
    } else {
      // JSON payload
      const body = await req.json();
      if (body.website || body.hp_field) {
        return NextResponse.json({ success: true, booking_code: 'HAWI-0000' });
      }

      customerName = body.customerName || '';
      phone = body.phone || '';
      telegramUsername = body.telegramUsername || null;
      phoneOnly = Boolean(body.phoneOnly);
      packageId = body.packageId || '';
      eventDate = body.eventDate || '';
      period = (body.period || 'full_day') as BookingPeriod;
      venue = body.venue || '';
      city = body.city || 'Addis Ababa';
      notes = body.notes || '';
      language = body.language || 'om';
      paymentMethod = (body.paymentMethod || 'telebirr') as PaymentMethod;
      referenceNumber = body.referenceNumber || '';
      screenshotPath = body.screenshotPath || '';
    }

    // Rate limit by Phone
    if (phone && !checkRateLimit(`phone_${phone.replace(/\D/g, '')}`)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            messageKey: 'errors.rate_limit',
            message: 'Too many booking attempts for this phone number. Please wait a moment.'
          }
        },
        { status: 429 }
      );
    }

    // Call atomic booking creator
    const result = await createBookingAtomic({
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
      screenshotPath
    });

    return NextResponse.json({
      success: true,
      data: {
        booking_code: result.booking.booking_code,
        customer_name: result.booking.customer_name,
        package_name: result.booking.package_name_snapshot,
        event_date: result.booking.event_date,
        period: result.booking.period,
        venue: result.booking.venue,
        status: result.booking.status,
        payment_status: result.booking.payment_status,
        hold_expires_at: result.booking.hold_expires_at,
        is_duplicate_ref: result.isDuplicateRef
      }
    });
  } catch (err: unknown) {
    const errorObj = err as { code?: string; messageKey?: string; message?: string };
    const code = errorObj?.code || 'SERVER_ERROR';
    const messageKey = errorObj?.messageKey || 'errors.server_error';
    const message = errorObj?.message || 'An unexpected error occurred while creating your booking.';

    return NextResponse.json(
      {
        success: false,
        error: { code, messageKey, message }
      },
      { status: code === 'DATE_UNAVAILABLE' ? 409 : 400 }
    );
  }
}
