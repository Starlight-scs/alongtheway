import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const headersList = await headers();
    const signature = headersList.get('x-cal-signature');
    const body = await request.text();

    // Verify webhook signature (if secret is configured)
    if (process.env.CAL_WEBHOOK_SECRET) {
      const expectedSignature = crypto
        .createHmac('sha256', process.env.CAL_WEBHOOK_SECRET)
        .update(body)
        .digest('hex');

      if (signature !== expectedSignature) {
        console.error('Invalid Cal.com webhook signature');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

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

    // Create booking record
    const { error } = await supabaseAdmin.from('bookings').insert({
      access_code_id: accessCodeId,
      cal_booking_id: payload.bookingId || payload.uid || '',
      scheduled_at: payload.startTime || new Date().toISOString(),
      attendee_email: payload.attendees?.[0]?.email || 'unknown',
      status: 'scheduled',
    });

    if (error) {
      console.error('Failed to create booking record:', error);
    } else {
      console.log('Booking record created successfully');
    }
  } catch (error) {
    console.error('Error handling BOOKING_CREATED:', error);
  }
}

async function handleBookingCancelled(payload: { bookingId?: string; uid?: string }) {
  try {
    const bookingId = payload.bookingId || payload.uid;

    const { error } = await supabaseAdmin
      .from('bookings')
      .update({ status: 'cancelled' })
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
}) {
  try {
    const bookingId = payload.bookingId || payload.uid;

    const { error } = await supabaseAdmin
      .from('bookings')
      .update({ scheduled_at: payload.startTime })
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
