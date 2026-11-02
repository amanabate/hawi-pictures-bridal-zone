import { NextRequest, NextResponse } from 'next/server';
import { memDb } from '@/lib/supabase/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');

    let items = memDb.gallery.filter((g) => g.is_visible && !g.deleted_at);

    if (category && category !== 'all') {
      items = items.filter((g) => g.category === category);
    }

    items.sort((a, b) => a.sort_order - b.sort_order);

    return NextResponse.json({
      success: true,
      data: items
    });
  } catch (err) {
    console.error('[Public Gallery API Error]', err);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          messageKey: 'errors.server_error',
          message: 'Unable to load gallery.'
        }
      },
      { status: 500 }
    );
  }
}
