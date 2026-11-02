import { NextRequest, NextResponse } from 'next/server';
import { memDb } from '@/lib/supabase/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, desiredDate } = body;

    if (!name || !phone || !desiredDate) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_FIELDS',
            messageKey: 'validation.missing_fields',
            message: 'Name, Ethiopian phone number, and desired date are required for the waitlist.'
          }
        },
        { status: 400 }
      );
    }

    const cleanPhone = String(phone).replace(/[\s-]/g, '');
    let normPhone = cleanPhone;
    if (normPhone.startsWith('+2519')) normPhone = '09' + normPhone.slice(5);
    else if (normPhone.startsWith('2519')) normPhone = '09' + normPhone.slice(4);

    if (!/^09\d{8}$/.test(normPhone)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_PHONE',
            messageKey: 'validation.phone_invalid',
            message: 'Please provide a valid Ethiopian mobile phone (09xxxxxxxx).'
          }
        },
        { status: 400 }
      );
    }

    const waitlistEntry = {
      id: 'wl_' + Math.random().toString(36).substring(2, 11),
      name: String(name).trim(),
      phone: normPhone,
      desired_date: String(desiredDate).trim(),
      notified: false,
      created_at: new Date().toISOString()
    };

    memDb.waitlist.unshift(waitlistEntry);

    // Audit log
    memDb.activityLogs.unshift({
      id: 'log_' + Math.random().toString(36).substring(2, 11),
      actor_id: null,
      actor_name: 'Customer',
      action: 'ADD_WAITLIST',
      entity: 'waitlist',
      entity_id: waitlistEntry.id,
      before: null,
      after: { name: waitlistEntry.name, desired_date: waitlistEntry.desired_date },
      created_at: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      data: {
        message: 'You have been added to the waitlist. We will notify you if a slot opens up!'
      }
    });
  } catch (err) {
    console.error('[Waitlist POST Error]', err);
    return NextResponse.json(
      {
        success: false,
        error: { code: 'SERVER_ERROR', messageKey: 'errors.server_error', message: 'Unable to join waitlist.' }
      },
      { status: 500 }
    );
  }
}
