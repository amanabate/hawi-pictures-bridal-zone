import { NextRequest, NextResponse } from 'next/server';
import { memDb } from '@/lib/supabase/db';

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: {
        rules: memDb.capacityRules,
        overrides: memDb.capacityOverrides,
        blockedDates: memDb.blockedDates
      }
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', messageKey: 'errors.server_error', message: 'Failed to load capacity settings.' } },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    switch (action) {
      case 'update_rules': {
        const { defaultPerDay, defaultPerPeriod, perWeekday } = body;
        if (defaultPerDay !== undefined) memDb.capacityRules.default_per_day = Number(defaultPerDay);
        if (defaultPerPeriod !== undefined) memDb.capacityRules.default_per_period = Number(defaultPerPeriod);
        if (perWeekday) memDb.capacityRules.per_weekday = perWeekday;
        memDb.capacityRules.updated_at = new Date().toISOString();

        memDb.activityLogs.unshift({
          id: 'log_' + Math.random().toString(36).substring(2, 11),
          actor_id: null,
          actor_name: 'Owner',
          action: 'UPDATE_CAPACITY_RULES',
          entity: 'capacity_rules',
          entity_id: 'default',
          before: null,
          after: memDb.capacityRules,
          created_at: new Date().toISOString()
        });

        return NextResponse.json({ success: true, data: memDb.capacityRules });
      }

      case 'set_override': {
        const { date, maxPerDay, maxPerPeriod, note } = body;
        if (!date || maxPerDay === undefined) {
          return NextResponse.json(
            { success: false, error: { code: 'MISSING_FIELDS', messageKey: 'validation.missing_fields', message: 'Date and max capacity are required.' } },
            { status: 400 }
          );
        }

        const existingIdx = memDb.capacityOverrides.findIndex((o) => o.date === date);
        const overrideItem = {
          id: existingIdx >= 0 ? memDb.capacityOverrides[existingIdx].id : 'ovr_' + Math.random().toString(36).substring(2, 9),
          date,
          max_per_day: Number(maxPerDay),
          max_per_period: Number(maxPerPeriod ?? 2),
          note: note || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        if (existingIdx >= 0) {
          memDb.capacityOverrides[existingIdx] = overrideItem;
        } else {
          memDb.capacityOverrides.push(overrideItem);
        }

        memDb.activityLogs.unshift({
          id: 'log_' + Math.random().toString(36).substring(2, 11),
          actor_id: null,
          actor_name: 'Owner',
          action: 'SET_CAPACITY_OVERRIDE',
          entity: 'capacity_overrides',
          entity_id: overrideItem.id,
          before: null,
          after: overrideItem,
          created_at: new Date().toISOString()
        });

        return NextResponse.json({ success: true, data: overrideItem });
      }

      case 'delete_override': {
        const { date } = body;
        memDb.capacityOverrides = memDb.capacityOverrides.filter((o) => o.date !== date);
        return NextResponse.json({ success: true, data: { message: 'Override removed' } });
      }

      case 'block_date': {
        const { date, reason } = body;
        if (!date || !reason) {
          return NextResponse.json(
            { success: false, error: { code: 'MISSING_FIELDS', messageKey: 'validation.missing_fields', message: 'Date and reason are required to block a date.' } },
            { status: 400 }
          );
        }

        memDb.blockedDates = memDb.blockedDates.filter((b) => b.date !== date);
        const blockedItem = {
          id: 'blk_' + Math.random().toString(36).substring(2, 9),
          date,
          reason,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        memDb.blockedDates.push(blockedItem);

        memDb.activityLogs.unshift({
          id: 'log_' + Math.random().toString(36).substring(2, 11),
          actor_id: null,
          actor_name: 'Owner',
          action: 'BLOCK_DATE',
          entity: 'blocked_dates',
          entity_id: blockedItem.id,
          before: null,
          after: blockedItem,
          created_at: new Date().toISOString()
        });

        return NextResponse.json({ success: true, data: blockedItem });
      }

      case 'unblock_date': {
        const { date } = body;
        memDb.blockedDates = memDb.blockedDates.filter((b) => b.date !== date);
        return NextResponse.json({ success: true, data: { message: 'Date unblocked' } });
      }

      default:
        return NextResponse.json(
          { success: false, error: { code: 'INVALID_ACTION', messageKey: 'errors.invalid_action', message: 'Unknown capacity action.' } },
          { status: 400 }
        );
    }
  } catch (err) {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', messageKey: 'errors.server_error', message: 'Failed to update capacity.' } },
      { status: 500 }
    );
  }
}
