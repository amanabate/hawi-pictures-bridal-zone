import { NextResponse } from 'next/server';
import { memDb } from '@/lib/supabase/db';

export async function GET() {
  try {
    // Only return active, non-deleted packages for public display, sorted by sort_order
    const activePackages = memDb.packages
      .filter((p) => p.status === 'active' && !p.deleted_at)
      .sort((a, b) => a.sort_order - b.sort_order);

    return NextResponse.json({
      success: true,
      data: activePackages
    });
  } catch (err) {
    console.error('[Public Packages API Error]', err);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          messageKey: 'errors.server_error',
          message: 'Unable to load packages.'
        }
      },
      { status: 500 }
    );
  }
}
