import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { role, passcode } = body;

    // Studio staff & admin roles
    // Default owner passcode for Hawi Studio administration
    const OWNER_PIN = process.env.ADMIN_OWNER_PIN || 'hawi2026';
    const RECEPTIONIST_PIN = process.env.ADMIN_RECEPTIONIST_PIN || 'reception123';
    const STAFF_PIN = process.env.ADMIN_STAFF_PIN || 'staff123';

    let verifiedRole: string | null = null;
    let fullName = '';

    if (passcode === OWNER_PIN && (!role || role === 'owner')) {
      verifiedRole = 'owner';
      fullName = 'Hawi Habtamu (Owner & Lead Photographer)';
    } else if (passcode === RECEPTIONIST_PIN && (!role || role === 'receptionist')) {
      verifiedRole = 'receptionist';
      fullName = 'Selamawit (Receptionist)';
    } else if (passcode === STAFF_PIN && (!role || role === 'staff')) {
      verifiedRole = 'staff';
      fullName = 'Abebe Kebede (Staff Photographer)';
    }

    if (!verifiedRole) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            messageKey: 'errors.invalid_credentials',
            message: 'Invalid administrative PIN or unauthorized role.'
          }
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        role: verifiedRole,
        fullName,
        token: `session_${verifiedRole}_${Date.now()}`
      }
    });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'SERVER_ERROR', messageKey: 'errors.server_error', message: 'Auth check failed.' }
      },
      { status: 500 }
    );
  }
}
