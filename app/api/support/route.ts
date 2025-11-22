import { NextResponse } from 'next/server';
import { siteConfig } from '@/config/site';

type SupportPayload = {
  name: string;
  email: string;
  company?: string;
  subject: string;
  message: string;
};

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

const sanitize = (value?: string) => value?.toString().trim();
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const buildTelegramMessage = (payload: Required<Omit<SupportPayload, 'company'>> & { company?: string }) => {
  const timestamp = new Date().toLocaleString('en-US', {
    timeZone: process.env.TIMEZONE || 'Asia/Dhaka',
  });

  const lines = [
    '📨 New Maintainer Support Request',
    `Site: ${siteConfig.name} (${siteConfig.url})`,
    `Name: ${payload.name}`,
    `Email: ${payload.email}`,
    `Company/Project: ${payload.company || 'Not provided'}`,
    `Subject: ${payload.subject}`,
    `Timestamp: ${timestamp}`,
    '',
    'Message:',
    payload.message,
  ];

  return lines.join('\n');
};

export async function POST(request: Request) {
  let payload: SupportPayload;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid request body. Please send valid JSON.' },
      { status: 400 }
    );
  }

  const name = sanitize(payload?.name);
  const email = sanitize(payload?.email);
  const subject = sanitize(payload?.subject);
  const message = sanitize(payload?.message);
  const company = sanitize(payload?.company);

  if (!name || !email || !subject || !message) {
    return NextResponse.json(
      { success: false, error: 'Name, email, subject, and message are required.' },
      { status: 400 }
    );
  }

  if (!emailPattern.test(email)) {
    return NextResponse.json(
      { success: false, error: 'Please provide a valid email address.' },
      { status: 400 }
    );
  }

  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.error('Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID environment variables');
    return NextResponse.json(
      { success: false, error: 'Support channel is not configured. Please try again later.' },
      { status: 500 }
    );
  }

  try {
    const text = buildTelegramMessage({
      name,
      email,
      subject,
      message,
      company,
    });

    const telegramResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text,
        disable_web_page_preview: true,
      }),
    });

    if (!telegramResponse.ok) {
      const errorBody = await telegramResponse.text();
      throw new Error(`Telegram API responded with ${telegramResponse.status}: ${errorBody}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Message delivered. I will get back to you shortly.',
    });
  } catch (error) {
    console.error('Failed to forward support message to Telegram', error);
    return NextResponse.json(
      { success: false, error: 'Unable to deliver your message right now. Please try again later.' },
      { status: 502 }
    );
  }
}

