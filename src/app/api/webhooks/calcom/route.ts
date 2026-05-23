import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { createDailyRoom, deleteDailyRoom } from '@/lib/daily';

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const event = JSON.parse(body);
    const { triggerEvent, payload } = event;

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
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

async function handleBookingCreated(payload: {
  bookingId?: string;
  uid?: string;
  startTime?: string;
  endTime?: string;
  attendees?: { email: string }[];
  metadata?: { accessCode?: string } | string;
}) {
  try {
    // Extract access code from metadata
    let accessCode: string | undefined;
    if (typeof payload.metadata === 'string') {
      try {
        const parsed = JSON.parse(payload.metadata);
        accessCode = parsed.accessCode;
      } catch {
        // metadata is not JSON
      }
    } else if (payload.metadata) {
      accessCode = payload.metadata.accessCode;
    }

    let accessCodeId: string | null = null;

    // Find the access code record if we have a code
    if (accessCode) {
      const { data: codeData } = await supabaseAdmin
        .from('access_codes')
        .select('id')
        .eq('code', accessCode.toUpperCase())
        .single();

      accessCodeId = codeData?.id || null;
    }

    // Create Daily.co room for this booking
    const calBookingId = payload.bookingId || payload.uid || '';
    const roomName = `booking-${calBookingId.slice(0, 8)}`;

    // Calculate room expiry based on meeting end time + 30 min buffer
    let expiryMinutes = 180; // Default 3 hours
    if (payload.startTime && payload.endTime) {
      const start = new Date(payload.startTime);
      const end = new Date(payload.endTime);
      const durationMs = end.getTime() - start.getTime();
      const durationMinutes = Math.ceil(durationMs / (1000 * 60));
      // Room available from now until end time + 30 min buffer
      const msUntilEnd = end.getTime() - Date.now() + 30 * 60 * 1000;
      expiryMinutes = Math.max(60, Math.ceil(msUntilEnd / (1000 * 60)));
    } else if (payload.startTime) {
      // No end time, assume 1 hour meeting + 30 min buffer
      const start = new Date(payload.startTime);
      const msUntilEnd = start.getTime() + 90 * 60 * 1000 - Date.now();
      expiryMinutes = Math.max(60, Math.ceil(msUntilEnd / (1000 * 60)));
    }

    let dailyRoomName: string | null = null;
    let dailyRoomUrl: string | null = null;

    try {
      const dailyRoom = await createDailyRoom({
        name: roomName,
        expiryMinutes,
        maxParticipants: 4,
      });
      dailyRoomName = dailyRoom.name;
      dailyRoomUrl = dailyRoom.url;
      console.log('Daily.co room created:', dailyRoom.url);
    } catch (dailyError) {
      console.error('Failed to create Daily.co room:', dailyError);
      // Continue without Daily room - booking will still be recorded
    }

    // Create booking record with Daily room info
    const { error } = await supabaseAdmin.from('bookings').insert({
      access_code_id: accessCodeId,
      cal_booking_id: calBookingId,
      scheduled_at: payload.startTime || new Date().toISOString(),
      attendee_email: payload.attendees?.[0]?.email || 'unknown',
      status: 'scheduled',
      daily_room_name: dailyRoomName,
      daily_room_url: dailyRoomUrl,
    });

    if (error) {
      console.error('Failed to create booking record:', error);
    } else {
      console.log('Booking record created successfully with Daily.co room');
    }
  } catch (error) {
    console.error('Error handling BOOKING_CREATED:', error);
  }
}

async function handleBookingCancelled(payload: { bookingId?: string; uid?: string }) {
  try {
    const bookingId = payload.bookingId || payload.uid;

    // Get the booking to find the Daily room name
    const { data: booking } = await supabaseAdmin
      .from('bookings')
      .select('daily_room_name')
      .eq('cal_booking_id', bookingId)
      .single();

    // Delete the Daily.co room if it exists
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
      console.error('Failed to update booking status:', error);
    } else {
      console.log('Booking marked as cancelled');
    }
  } catch (error) {
    console.error('Error handling BOOKING_CANCELLED:', error);
  }
}

async function handleBookingRescheduled(payload: {
  bookingId?: string;
  uid?: string;
  startTime?: string;
  endTime?: string;
}) {
  try {
    const bookingId = payload.bookingId || payload.uid;

    // Get the existing booking
    const { data: booking } = await supabaseAdmin
      .from('bookings')
      .select('daily_room_name')
      .eq('cal_booking_id', bookingId)
      .single();

    // Delete old Daily room and create a new one with updated expiry
    if (booking?.daily_room_name) {
      try {
        await deleteDailyRoom(booking.daily_room_name);
      } catch (dailyError) {
        console.error('Failed to delete old Daily.co room:', dailyError);
      }
    }

    // Create new Daily room with updated time
    const roomName = `booking-${(bookingId || '').slice(0, 8)}`;
    let expiryMinutes = 180;
    if (payload.startTime && payload.endTime) {
      const end = new Date(payload.endTime);
      const msUntilEnd = end.getTime() - Date.now() + 30 * 60 * 1000;
      expiryMinutes = Math.max(60, Math.ceil(msUntilEnd / (1000 * 60)));
    } else if (payload.startTime) {
      const start = new Date(payload.startTime);
      const msUntilEnd = start.getTime() + 90 * 60 * 1000 - Date.now();
      expiryMinutes = Math.max(60, Math.ceil(msUntilEnd / (1000 * 60)));
    }

    let dailyRoomName: string | null = null;
    let dailyRoomUrl: string | null = null;

    try {
      const dailyRoom = await createDailyRoom({
        name: roomName,
        expiryMinutes,
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
      console.error('Failed to update booking time:', error);
    } else {
      console.log('Booking rescheduled successfully');
    }
  } catch (error) {
    console.error('Error handling BOOKING_RESCHEDULED:', error);
  }
}
