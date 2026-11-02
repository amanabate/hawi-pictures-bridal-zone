import { NextRequest, NextResponse } from 'next/server';
import { memDb } from '@/lib/supabase/db';
import { PackageRow } from '@/lib/supabase/types';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const includeDeleted = searchParams.get('includeDeleted') === 'true';

    let list = memDb.packages;
    if (!includeDeleted) {
      list = list.filter((p) => !p.deleted_at);
    }
    list.sort((a, b) => a.sort_order - b.sort_order);

    return NextResponse.json({
      success: true,
      data: list
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', messageKey: 'errors.server_error', message: 'Failed to load packages.' } },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description, price_birr, deposit_type, deposit_value, included_items, badge, status } = body;

    if (!name || price_birr === undefined) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'MISSING_FIELDS', messageKey: 'validation.missing_fields', message: 'Package name and price are required.' }
        },
        { status: 400 }
      );
    }

    const newId = 'pkg_' + Math.random().toString(36).substring(2, 9);
    const newPackage: PackageRow = {
      id: newId,
      code: `PKG-${Date.now().toString().slice(-4)}`,
      name: {
        en: name.en || name.om || 'New Package',
        om: name.om || name.en || 'Paakeejii Haaraa',
        am: name.am || name.en || 'አዲስ ፓኬጅ'
      },
      description: {
        en: description?.en || '',
        om: description?.om || '',
        am: description?.am || ''
      },
      price_birr: Number(price_birr),
      deposit_type: deposit_type || 'fixed',
      deposit_value: deposit_value !== undefined ? Number(deposit_value) : null,
      included_items: included_items || [],
      badge: badge || 'none',
      status: status || 'draft',
      sort_order: memDb.packages.length + 1,
      old_price: null,
      discount_ends_at: null,
      deleted_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    memDb.packages.push(newPackage);

    memDb.activityLogs.unshift({
      id: 'log_' + Math.random().toString(36).substring(2, 11),
      actor_id: null,
      actor_name: 'Admin',
      action: 'CREATE_PACKAGE',
      entity: 'packages',
      entity_id: newId,
      before: null,
      after: newPackage,
      created_at: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      data: newPackage
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', messageKey: 'errors.server_error', message: 'Failed to create package.' } },
      { status: 500 }
    );
  }
}
