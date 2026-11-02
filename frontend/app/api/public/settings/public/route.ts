import { NextResponse } from 'next/server';
import { memDb } from '@/lib/supabase/db';

export async function GET() {
  try {
    const s = memDb.siteSettings;

    // Return only public elements (do not expose private hold/expiry internals)
    return NextResponse.json({
      success: true,
      data: {
        phones: s.phones,
        social_links: s.social_links,
        address: s.address,
        opening_hours: s.opening_hours,
        payment_accounts: s.payment_accounts,
        cancellation_policy: s.cancellation_policy,
        notice_text: s.notice_text
      }
    });
  } catch (err) {
    console.error('[Public Settings Error]', err);
    return NextResponse.json(
      {
        success: false,
        error: { code: 'SERVER_ERROR', messageKey: 'errors.server_error', message: 'Unable to load settings.' }
      },
      { status: 500 }
    );
  }
}
