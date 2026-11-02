import { NextRequest, NextResponse } from 'next/server';
import { memDb } from '@/lib/supabase/db';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const pkg = memDb.packages.find((p) => p.id === id);

    if (!pkg) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', messageKey: 'errors.package_not_found', message: 'Package not found.' } },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { action, ...updates } = body;
    const beforeState = { ...pkg };

    if (action === 'duplicate') {
      const dupId = 'pkg_' + Math.random().toString(36).substring(2, 9);
      const dupPackage = {
        ...pkg,
        id: dupId,
        code: `${pkg.code}-COPY`,
        name: {
          en: `${pkg.name.en} (Copy)`,
          om: `${pkg.name.om} (Koppii)`,
          am: `${pkg.name.am} (ኮፒ)`
        },
        status: 'draft' as const,
        sort_order: memDb.packages.length + 1,
        deleted_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      memDb.packages.push(dupPackage);

      return NextResponse.json({ success: true, data: dupPackage });
    }

    if (action === 'restore') {
      pkg.deleted_at = null;
      pkg.status = 'active';
      pkg.updated_at = new Date().toISOString();

      return NextResponse.json({ success: true, data: pkg });
    }

    // Standard updates
    if (updates.name) pkg.name = updates.name;
    if (updates.description) pkg.description = updates.description;
    if (updates.price_birr !== undefined) pkg.price_birr = Number(updates.price_birr);
    if (updates.deposit_type) pkg.deposit_type = updates.deposit_type;
    if (updates.deposit_value !== undefined) pkg.deposit_value = updates.deposit_value;
    if (updates.included_items) pkg.included_items = updates.included_items;
    if (updates.badge) pkg.badge = updates.badge;
    if (updates.status) pkg.status = updates.status;
    if (updates.sort_order !== undefined) pkg.sort_order = updates.sort_order;
    if (updates.old_price !== undefined) pkg.old_price = updates.old_price;

    pkg.updated_at = new Date().toISOString();

    memDb.activityLogs.unshift({
      id: 'log_' + Math.random().toString(36).substring(2, 11),
      actor_id: null,
      actor_name: 'Admin',
      action: 'UPDATE_PACKAGE',
      entity: 'packages',
      entity_id: id,
      before: beforeState,
      after: pkg,
      created_at: new Date().toISOString()
    });

    return NextResponse.json({ success: true, data: pkg });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', messageKey: 'errors.server_error', message: 'Failed to update package.' } },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const pkg = memDb.packages.find((p) => p.id === id);

    if (!pkg) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', messageKey: 'errors.package_not_found', message: 'Package not found.' } },
        { status: 404 }
      );
    }

    // REQUIREMENT: "If a package has bookings, block deletion and offer hide or archive."
    const hasBookings = memDb.bookings.some((b) => b.package_id === id);
    if (hasBookings) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'PACKAGE_HAS_BOOKINGS',
            messageKey: 'errors.package_has_bookings',
            message: 'This package has active or historic bookings and cannot be deleted. Please hide or archive it instead to preserve client records.'
          }
        },
        { status: 409 }
      );
    }

    // Soft delete with 30-day restore capability
    pkg.deleted_at = new Date().toISOString();
    pkg.status = 'archived';
    pkg.updated_at = new Date().toISOString();

    memDb.activityLogs.unshift({
      id: 'log_' + Math.random().toString(36).substring(2, 11),
      actor_id: null,
      actor_name: 'Admin',
      action: 'SOFT_DELETE_PACKAGE',
      entity: 'packages',
      entity_id: id,
      before: { status: 'active', deleted_at: null },
      after: { status: 'archived', deleted_at: pkg.deleted_at },
      created_at: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      data: { message: 'Package moved to trash. It can be restored within 30 days.' }
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', messageKey: 'errors.server_error', message: 'Failed to delete package.' } },
      { status: 500 }
    );
  }
}
