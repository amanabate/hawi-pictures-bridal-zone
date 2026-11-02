import { NextResponse } from 'next/server';
import { memDb } from '@/lib/supabase/db';

export async function GET() {
  try {
    const services = memDb.services
      .filter((s) => s.is_visible)
      .sort((a, b) => a.sort_order - b.sort_order);

    return NextResponse.json({
      success: true,
      data: services
    });
  } catch (err) {
    console.error('[Public Services API Error]', err);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          messageKey: 'errors.server_error',
          message: 'Unable to load services.'
        }
      },
      { status: 500 }
    );
  }
}
