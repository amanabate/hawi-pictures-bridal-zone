import { NextRequest, NextResponse } from 'next/server';
import { memDb } from '@/lib/supabase/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '100', 10);
    const logs = memDb.activityLogs.slice(0, limit);

    return NextResponse.json({
      success: true,
      data: logs
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', messageKey: 'errors.server_error', message: 'Failed to load activity logs.' } },
      { status: 500 }
    );
  }
}
