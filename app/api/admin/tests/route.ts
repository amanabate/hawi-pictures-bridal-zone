import { NextResponse } from 'next/server';
import { runAllBackendTests } from '@/tests/backend.test';

export async function GET() {
  try {
    const summary = await runAllBackendTests();
    return NextResponse.json({
      success: summary.failed === 0,
      data: summary
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: { code: 'TEST_RUNNER_ERROR', message: String(err) } },
      { status: 500 }
    );
  }
}
