import crypto from 'node:crypto';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { createDailyRoom, deleteDailyRoom } from '@/lib/daily';

type CalWebhookEvent = {
  triggerEvent?: string;
  payload?: Record<string, unknown>;
  [key: string]: unknown;
};

type BookingPayload = {
  bookingId?: string | number;
  bookingUid?: string;
  uid?: string;
  startTime?: string;
  endTime?: string;
  attendees?: Array<{ email?: string; name?: string }>;
  metadata?: Record<string, unknown> | string;
};

export async function POST(request: Request) {
  try {
    const body = await request.text();
    await verifyWebhookSignature(body);

    const event = parseWebhookEvent(body);
    const triggerEvent = event.triggerEvent;
    const payload = getEventPayload(event);

    console.log('Cal.com webhook received:', triggerEvent);

    switch (triggerEvent) {
      case 'BOOKING_CREATED':
        await handleBookingCreated(payload);
        break;
      case 'BOOKING_CANCELLED':
        await handleBookingCancelled(payload);
        break;
      case 'BOOKING_RESCHEDULED':
        await handleBookingRescheduled(payload);
        break;
      default:
        console.log('Unhandled webhook event:', triggerEvent);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Cal.com webhook error:', error);
    const message = error instanceof Error ? error.message : 'Webhook processing failed';
    const status = message.toLowerCase().includes('invalid') ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

async function handleBookingCreated(payload: BookingPayload) {
  const calBookingId = getBookingId(payload);
  const accessCode = extractAccessCode(payload.metadata);
  let accessCodeId: string | null = null;

  if (accessCode) {
    const { data: codeData, error: codeError } = await supabaseAdmin
      .from('access_codes')
      .select('id')
      .eq('code', accessCode.toUpperCase())
      .maybeSingle();

    if (codeError) {
      throw new Error(`Failed to look up access code: ${codeError.message}`);
    }

    accessCodeId = codeData?.id || null;
  }

  const { data: existingBooking, error: existingError } = await supabaseAdmin
    .from('bookings')
    .select('daily_room_name, daily_room_url')
    .eq('cal_booking_id', calBookingId)
    .maybeSingle();

  if (existingError) {
    throw new Error(`Failed to look up existing booking: ${existingError.message}`);
  }

  let dailyRoomName = existingBooking?.daily_room_name ?? null;
  let dailyRoomUrl = existingBooking?.daily_room_url ?? null;

  if (!dailyRoomName || !dailyRoomUrl) {
    const roomName = getDailyRoomName(calBookingId);

    try {
      const dailyRoom = await createDailyRoom({
        name: roomName,
        expiryMinutes: getRoomExpiryMinutes(payload.startTime, payload.endTime),
        maxParticipants: 4,
      });
      dailyRoomName = dailyRoom.name;
      dailyRoomUrl = dailyRoom.url;
      console.log('Daily.co room created:', dailyRoom.url);
    } catch (dailyError) {
      console.error('Failed to create Daily.co room:', dailyError);
    }
  }

  const { error } = await supabaseAdmin.from('bookings').upsert(
    {
      access_code_id: accessCodeId,
      cal_booking_id: calBookingId,
      scheduled_at: payload.startTime || new Date().toISOString(),
      attendee_email: payload.attendees?.[0]?.email || 'unknown',
      status: 'scheduled',
      daily_room_name: dailyRoomName,
      daily_room_url: dailyRoomUrl,
    },
    { onConflict: 'cal_booking_id' }
  );

  if (error) {
    throw new Error(`Failed to create booking record: ${error.message}`);
  }
}

async function handleBookingCancelled(payload: BookingPayload) {
  const bookingId = getBookingId(payload);

  const { data: booking, error: bookingError } = await supabaseAdmin
    .from('bookings')
    .select('daily_room_name')
    .eq('cal_booking_id', bookingId)
    .maybeSingle();

  if (bookingError) {
    throw new Error(`Failed to look up cancelled booking: ${bookingError.message}`);
  }

  if (booking?.daily_room_name) {
    try {
      await deleteDailyRoom(booking.daily_room_name);
      console.log('Daily.co room deleted:', booking.daily_room_name);
    } catch (dailyError) {
      console.error('Failed to delete Daily.co room:', dailyError);
    }
  }

  const { error } = await supabaseAdmin
    .from('bookings')
    .update({ status: 'cancelled', daily_room_url: null, daily_room_name: null })
    .eq('cal_booking_id', bookingId);

  if (error) {
    throw new Error(`Failed to update booking status: ${error.message}`);
  }
}

async function handleBookingRescheduled(payload: BookingPayload) {
  const bookingId = getBookingId(payload);

  const { data: booking, error: bookingError } = await supabaseAdmin
    .from('bookings')
    .select('daily_room_name')
    .eq('cal_booking_id', bookingId)
    .maybeSingle();

  if (bookingError) {
    throw new Error(`Failed to look up rescheduled booking: ${bookingError.message}`);
  }

  if (booking?.daily_room_name) {
    try {
      await deleteDailyRoom(booking.daily_room_name);
    } catch (dailyError) {
      console.error('Failed to delete old Daily.co room:', dailyError);
    }
  }

  const roomName = getDailyRoomName(bookingId);
  let dailyRoomName: string | null = null;
  let dailyRoomUrl: string | null = null;

  try {
    const dailyRoom = await createDailyRoom({
      name: roomName,
      expiryMinutes: getRoomExpiryMinutes(payload.startTime, payload.endTime),
      maxParticipants: 4,
    });
    dailyRoomName = dailyRoom.name;
    dailyRoomUrl = dailyRoom.url;
    console.log('New Daily.co room created for rescheduled booking:', dailyRoom.url);
  } catch (dailyError) {
    console.error('Failed to create Daily.co room:', dailyError);
  }

  const { error } = await supabaseAdmin
    .from('bookings')
    .update({
      scheduled_at: payload.startTime,
      daily_room_name: dailyRoomName,
      daily_room_url: dailyRoomUrl,
    })
    .eq('cal_booking_id', bookingId);

  if (error) {
    throw new Error(`Failed to update booking time: ${error.message}`);
  }
}

function parseWebhookEvent(body: string): CalWebhookEvent {
  let event: unknown;

  try {
    event = JSON.parse(body);
  } catch {
    throw new Error('Invalid webhook JSON');
  }

  if (!event || typeof event !== 'object') {
    throw new Error('Invalid webhook payload');
  }

  return event as CalWebhookEvent;
}

function getEventPayload(event: CalWebhookEvent): BookingPayload {
  const payload = event.payload && typeof event.payload === 'object' ? event.payload : event;
  return payload as BookingPayload;
}

async function verifyWebhookSignature(body: string) {
  const secret = process.env.CAL_WEBHOOK_SECRET?.trim();
  if (!secret || secret === 'xxx') {
    return;
  }

  const signature = (await headers()).get('x-cal-signature-256');
  if (!signature) {
    throw new Error('Invalid webhook signature');
  }

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');

  if (signature !== expectedSignature) {
    throw new Error('Invalid webhook signature');
  }
}

function getBookingId(payload: BookingPayload): string {
  const bookingId = payload.uid || payload.bookingUid || payload.bookingId;
  if (!bookingId) {
    throw new Error('Invalid booking payload: missing booking ID');
  }

  return String(bookingId);
}

function extractAccessCode(metadata: BookingPayload['metadata']): string | undefined {
  if (!metadata) {
    return undefined;
  }

  if (typeof metadata === 'string') {
    try {
      const parsed = JSON.parse(metadata) as Record<string, unknown>;
      return typeof parsed.accessCode === 'string' ? parsed.accessCode : undefined;
    } catch {
      return undefined;
    }
  }

  return typeof metadata.accessCode === 'string' ? metadata.accessCode : undefined;
}

function getRoomExpiryMinutes(startTime?: string, endTime?: string): number {
  if (startTime && endTime) {
    const end = new Date(endTime);
    const msUntilEnd = end.getTime() - Date.now() + 30 * 60 * 1000;
    return Math.max(60, Math.ceil(msUntilEnd / (1000 * 60)));
  }

  if (startTime) {
    const start = new Date(startTime);
    const msUntilEnd = start.getTime() + 90 * 60 * 1000 - Date.now();
    return Math.max(60, Math.ceil(msUntilEnd / (1000 * 60)));
  }

  return 180;
}

function getDailyRoomName(bookingId: string): string {
  const suffix = crypto.createHash('sha1').update(bookingId).digest('hex').slice(0, 16);
  return `booking-${suffix}`;
}
