import { NextRequest, NextResponse } from 'next/server';
import { runExpireCron } from '@/lib/supabase/db';

export async function GET(req: NextRequest) {
  return handleCron();
}

export async function POST(req: NextRequest) {
  return handleCron();
}

async function handleCron() {
  try {
    const result = await runExpireCron();

    // If Telegram bot is configured, notify owner of pending reminders or expired bookings
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const ownerChatId = process.env.TELEGRAM_OWNER_CHAT_ID;

    if (botToken && ownerChatId && (result.expiredCount > 0 || result.remindersDue > 0)) {
      try {
        const text = `🔔 *Hawi Studio Booking Notice*\n\n` +
          `• Expired holds (48h): ${result.expiredCount}\n` +
          `• Pending reminders due (>24h): ${result.remindersDue}\n` +
          `• Timestamp: ${new Date().toLocaleString()}`;

        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: ownerChatId,
            text,
            parse_mode: 'Markdown'
          })
        });
      } catch (tgError) {
        console.warn('[Telegram Bot Alert Warning]', tgError);
      }
    }

    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (err) {
    console.error('[Expire Cron Error]', err);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', messageKey: 'errors.server_error', message: 'Cron execution failed.' } },
      { status: 500 }
    );
  }
}
