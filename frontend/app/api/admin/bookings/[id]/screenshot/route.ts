import { NextRequest, NextResponse } from 'next/server';
import { memDb } from '@/lib/supabase/db';
import { createSignedScreenshotUrl } from '@/lib/supabase/server';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const payment = memDb.payments.find((p) => p.booking_id === id && p.screenshot_path);

    if (!payment || !payment.screenshot_path) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NO_SCREENSHOT',
            messageKey: 'errors.screenshot_not_found',
            message: 'No payment screenshot is attached to this booking.'
          }
        },
        { status: 404 }
      );
    }

    // Generate short-lived signed URL (15 minutes)
    const signedUrl = await createSignedScreenshotUrl(payment.screenshot_path, 900);

    return NextResponse.json({
      success: true,
      data: {
        screenshot_url: signedUrl || payment.screenshot_path,
        expires_in_seconds: 900
      }
    });
  } catch (err) {
    console.error('[Signed Screenshot URL Error]', err);
    return NextResponse.json(
      {
        success: false,
        error: { code: 'SERVER_ERROR', messageKey: 'errors.server_error', message: 'Unable to retrieve screenshot.' }
      },
      { status: 500 }
    );
  }
}
