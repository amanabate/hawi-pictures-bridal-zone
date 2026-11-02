import { NextRequest, NextResponse } from 'next/server';
import { memDb } from '@/lib/supabase/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const exportFormat = searchParams.get('export');

    if (exportFormat === 'excel' || exportFormat === 'csv') {
      const headers = [
        'Booking Code',
        'Customer Name',
        'Phone',
        'Telegram',
        'Package',
        'Price (ETB)',
        'Deposit (ETB)',
        'Event Date',
        'Period',
        'Venue',
        'Status',
        'Payment Status',
        'Created At'
      ];

      const rows = memDb.bookings.map((b) => [
        b.booking_code,
        `"${b.customer_name.replace(/"/g, '""')}"`,
        b.phone,
        b.telegram_username ? `@${b.telegram_username}` : '',
        `"${b.package_name_snapshot.replace(/"/g, '""')}"`,
        b.package_price_snapshot,
        b.deposit_amount_snapshot || 0,
        b.event_date,
        b.period,
        `"${b.venue.replace(/"/g, '""')}"`,
        b.status,
        b.payment_status,
        b.created_at
      ]);

      const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="hawi_bookings_report_${new Date().toISOString().substring(0, 10)}.csv"`
        }
      });
    }

    // JSON summary report
    const totalBookings = memDb.bookings.length;
    const confirmedBookings = memDb.bookings.filter((b) => b.status === 'confirmed');
    const pendingBookings = memDb.bookings.filter((b) => b.status === 'pending');
    const completedBookings = memDb.bookings.filter((b) => b.status === 'completed');

    const totalIncomeBirr = memDb.payments
      .filter((p) => p.status === 'verified')
      .reduce((sum, p) => sum + p.amount, 0);

    const pendingDepositBirr = memDb.payments
      .filter((p) => p.status === 'submitted')
      .reduce((sum, p) => sum + p.amount, 0);

    // Group bookings by package
    const packageCounts: Record<string, { count: number; name: string }> = {};
    memDb.bookings.forEach((b) => {
      if (!packageCounts[b.package_id]) {
        packageCounts[b.package_id] = { count: 0, name: b.package_name_snapshot };
      }
      packageCounts[b.package_id].count += 1;
    });

    const popularPackages = Object.entries(packageCounts)
      .map(([id, val]) => ({ id, name: val.name, count: val.count }))
      .sort((a, b) => b.count - a.count);

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalBookings,
          confirmedCount: confirmedBookings.length,
          pendingCount: pendingBookings.length,
          completedCount: completedBookings.length,
          totalIncomeBirr,
          pendingDepositBirr
        },
        popularPackages
      }
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', messageKey: 'errors.server_error', message: 'Failed to generate report.' } },
      { status: 500 }
    );
  }
}
