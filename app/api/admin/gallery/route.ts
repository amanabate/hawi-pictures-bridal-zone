import { NextRequest, NextResponse } from 'next/server';
import { memDb } from '@/lib/supabase/db';
import { GalleryItemRow } from '@/lib/supabase/types';

export async function GET() {
  try {
    const list = [...memDb.gallery].sort((a, b) => a.sort_order - b.sort_order);
    return NextResponse.json({
      success: true,
      data: list
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', messageKey: 'errors.server_error', message: 'Failed to load gallery.' } },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { category, type, url, caption, alt_text, album_name, is_featured, is_visible } = body;

    if (!url || !category) {
      return NextResponse.json(
        { success: false, error: { code: 'MISSING_FIELDS', messageKey: 'validation.missing_fields', message: 'URL and category are required.' } },
        { status: 400 }
      );
    }

    const newId = 'gal_' + Math.random().toString(36).substring(2, 9);
    const newItem: GalleryItemRow = {
      id: newId,
      category,
      type: type || 'image',
      url,
      caption: caption || { en: 'Wedding Moment', om: 'Yeroo Cidhaa', am: 'የሰርግ ወቅት' },
      alt_text: alt_text || 'Hawi Pictures Wedding Photography',
      album_name: album_name || null,
      is_featured: Boolean(is_featured),
      is_visible: is_visible !== undefined ? Boolean(is_visible) : true,
      sort_order: memDb.gallery.length + 1,
      deleted_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    memDb.gallery.push(newItem);

    memDb.activityLogs.unshift({
      id: 'log_' + Math.random().toString(36).substring(2, 11),
      actor_id: null,
      actor_name: 'Admin',
      action: 'ADD_GALLERY_ITEM',
      entity: 'gallery',
      entity_id: newId,
      before: null,
      after: newItem,
      created_at: new Date().toISOString()
    });

    return NextResponse.json({ success: true, data: newItem });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', messageKey: 'errors.server_error', message: 'Failed to add gallery item.' } },
      { status: 500 }
    );
  }
}

// Bulk operations: bulk hide, bulk delete, bulk move category, reorder
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, ids, targetCategory, orderedIds } = body;

    if (action === 'reorder' && Array.isArray(orderedIds)) {
      orderedIds.forEach((id: string, index: number) => {
        const item = memDb.gallery.find((g) => g.id === id);
        if (item) item.sort_order = index + 1;
      });
      return NextResponse.json({ success: true, data: { message: 'Reordered successfully' } });
    }

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, error: { code: 'NO_ITEMS_SELECTED', messageKey: 'validation.select_items', message: 'No items selected.' } },
        { status: 400 }
      );
    }

    if (action === 'bulk_hide') {
      ids.forEach((id) => {
        const item = memDb.gallery.find((g) => g.id === id);
        if (item) item.is_visible = false;
      });
    } else if (action === 'bulk_show') {
      ids.forEach((id) => {
        const item = memDb.gallery.find((g) => g.id === id);
        if (item) item.is_visible = true;
      });
    } else if (action === 'bulk_delete') {
      ids.forEach((id) => {
        const item = memDb.gallery.find((g) => g.id === id);
        if (item) item.deleted_at = new Date().toISOString();
      });
    } else if (action === 'bulk_move' && targetCategory) {
      ids.forEach((id) => {
        const item = memDb.gallery.find((g) => g.id === id);
        if (item) item.category = targetCategory;
      });
    }

    return NextResponse.json({ success: true, data: { message: 'Bulk action applied successfully.' } });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', messageKey: 'errors.server_error', message: 'Failed bulk action.' } },
      { status: 500 }
    );
  }
}
