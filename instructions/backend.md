# Backend Team Instructions

> Mama & Papa Prayer Platform — Backend Development Guide

---

## Overview

You are building the server-side logic for a referral-based prayer platform. The backend handles intake form submissions, access code generation, email delivery, Cal.com webhook processing, and admin data access.

**Core responsibilities:**
1. Receive and store intake submissions
2. Generate and validate access codes
3. Send transactional emails
4. Sync booking data from Cal.com
5. Provide protected admin API routes

---

## Tech Stack

| Tool | Purpose |
|------|---------|
| **Next.js API Routes** | Server endpoints |
| **Supabase** | PostgreSQL database |
| **Resend** | Transactional email |
| **Cal.com Webhooks** | Booking event sync |
| **Zod** | Request validation |

---

## Database Schema

### Tables

```sql
-- requests: Intake form submissions
CREATE TABLE requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  referrer_name TEXT NOT NULL,
  referrer_email TEXT NOT NULL,
  referrer_relationship TEXT NOT NULL,
  person_first_name TEXT NOT NULL,
  person_email TEXT,
  person_phone TEXT,
  situation TEXT NOT NULL,
  prayer_requests TEXT NOT NULL,
  notes_for_ministers TEXT,
  how_heard TEXT
);

-- access_codes: Generated codes for booking access
CREATE TABLE access_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'revoked'))
);

-- bookings: Synced from Cal.com webhooks
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  access_code_id UUID REFERENCES access_codes(id),
  cal_booking_id TEXT UNIQUE NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  attendee_email TEXT NOT NULL,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- admins: Simple admin auth
CREATE TABLE admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_access_codes_code ON access_codes(code);
CREATE INDEX idx_access_codes_status ON access_codes(status);
CREATE INDEX idx_access_codes_expires ON access_codes(expires_at);
CREATE INDEX idx_bookings_scheduled ON bookings(scheduled_at);
CREATE INDEX idx_bookings_status ON bookings(status);
```

### Row Level Security (Supabase)

```sql
-- Enable RLS on all tables
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Public can insert requests (intake form)
CREATE POLICY "Allow public insert" ON requests
  FOR INSERT WITH CHECK (true);

-- Only service role can read/modify requests
CREATE POLICY "Service role full access" ON requests
  USING (auth.role() = 'service_role');

-- Similar policies for other tables...
```

---

## API Routes

### POST `/api/intake`

**Purpose:** Receive intake form submission, create request + access code, send emails.

**Request Body:**
```typescript
interface IntakeRequest {
  referrerName: string;
  referrerEmail: string;
  referrerRelationship: string;
  personFirstName: string;
  personEmail?: string;
  personPhone?: string;
  situation: string;
  prayerRequests: string;
  notesForMinisters?: string;
  howHeard?: string;
}
```

**Response:**
```typescript
// Success (201)
{ success: true, message: "Request submitted successfully" }

// Error (400/500)
{ error: true, message: string }
```

**Implementation:**

```typescript
// app/api/intake/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { generateAccessCode } from '@/lib/codes';
import { intakeSchema } from '@/lib/validations';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate input
    const validated = intakeSchema.parse(body);

    // 1. Create request record
    const { data: requestData, error: requestError } = await supabase
      .from('requests')
      .insert({
        referrer_name: validated.referrerName,
        referrer_email: validated.referrerEmail,
        referrer_relationship: validated.referrerRelationship,
        person_first_name: validated.personFirstName,
        person_email: validated.personEmail,
        person_phone: validated.personPhone,
        situation: validated.situation,
        prayer_requests: validated.prayerRequests,
        notes_for_ministers: validated.notesForMinisters,
        how_heard: validated.howHeard,
      })
      .select()
      .single();

    if (requestError) throw requestError;

    // 2. Generate access code (60-day expiry)
    const code = generateAccessCode();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 60);

    const { error: codeError } = await supabase
      .from('access_codes')
      .insert({
        request_id: requestData.id,
        code,
        expires_at: expiresAt.toISOString(),
        status: 'active',
      });

    if (codeError) throw codeError;

    // 3. Send emails (in parallel)
    const bookingUrl = `${process.env.NEXT_PUBLIC_URL}/book`;

    await Promise.all([
      // Email to Mama & Papa
      resend.emails.send({
        from: process.env.EMAIL_FROM!,
        to: process.env.MINISTERS_EMAIL!,
        subject: `Someone to pray for — ${validated.personFirstName}`,
        html: ministerEmailTemplate({
          referrerName: validated.referrerName,
          personName: validated.personFirstName,
          situation: validated.situation,
          prayerRequests: validated.prayerRequests,
          notes: validated.notesForMinisters,
        }),
      }),

      // Email to Referrer
      resend.emails.send({
        from: process.env.EMAIL_FROM!,
        to: validated.referrerEmail,
        subject: `Here's the link for ${validated.personFirstName}`,
        html: referrerEmailTemplate({
          personName: validated.personFirstName,
          code,
          bookingUrl,
        }),
      }),

      // Email to Admin (quiet notification)
      resend.emails.send({
        from: process.env.EMAIL_FROM!,
        to: process.env.ADMIN_EMAIL!,
        subject: `New request: ${validated.personFirstName}`,
        html: adminEmailTemplate({
          referrerName: validated.referrerName,
          personName: validated.personFirstName,
          adminUrl: `${process.env.NEXT_PUBLIC_URL}/admin`,
        }),
      }),
    ]);

    return NextResponse.json(
      { success: true, message: 'Request submitted successfully' },
      { status: 201 }
    );

  } catch (error) {
    console.error('Intake error:', error);
    return NextResponse.json(
      { error: true, message: 'Failed to submit request' },
      { status: 500 }
    );
  }
}
```

---

### POST `/api/verify-code`

**Purpose:** Validate access code for booking page.

**Request Body:**
```typescript
{ code: string }
```

**Response:**
```typescript
// Valid (200)
{ valid: true, personName: string }

// Invalid (400)
{ valid: false, type: 'invalid' | 'expired', message: string }
```

**Implementation:**

```typescript
// app/api/verify-code/route.ts
export async function POST(request: Request) {
  const { code } = await request.json();

  if (!code || typeof code !== 'string') {
    return NextResponse.json(
      { valid: false, type: 'invalid', message: 'Code is required' },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from('access_codes')
    .select(`
      *,
      requests (person_first_name)
    `)
    .eq('code', code.toUpperCase())
    .single();

  if (error || !data) {
    return NextResponse.json(
      { valid: false, type: 'invalid', message: 'Invalid access code' },
      { status: 400 }
    );
  }

  if (data.status === 'revoked') {
    return NextResponse.json(
      { valid: false, type: 'invalid', message: 'This code has been revoked' },
      { status: 400 }
    );
  }

  if (new Date(data.expires_at) < new Date() || data.status === 'expired') {
    return NextResponse.json(
      { valid: false, type: 'expired', message: 'This code has expired' },
      { status: 400 }
    );
  }

  return NextResponse.json({
    valid: true,
    personName: data.requests.person_first_name,
  });
}
```

---

### POST `/api/webhooks/calcom`

**Purpose:** Receive booking events from Cal.com to sync bookings table.

**Webhook Events:**
- `BOOKING_CREATED`
- `BOOKING_CANCELLED`
- `BOOKING_RESCHEDULED`

**Implementation:**

```typescript
// app/api/webhooks/calcom/route.ts
import { headers } from 'next/headers';
import crypto from 'crypto';

export async function POST(request: Request) {
  // Verify webhook signature
  const signature = headers().get('x-cal-signature');
  const body = await request.text();

  const expectedSignature = crypto
    .createHmac('sha256', process.env.CAL_WEBHOOK_SECRET!)
    .update(body)
    .digest('hex');

  if (signature !== expectedSignature) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const event = JSON.parse(body);

  switch (event.triggerEvent) {
    case 'BOOKING_CREATED':
      await handleBookingCreated(event.payload);
      break;
    case 'BOOKING_CANCELLED':
      await handleBookingCancelled(event.payload);
      break;
    case 'BOOKING_RESCHEDULED':
      await handleBookingRescheduled(event.payload);
      break;
  }

  return NextResponse.json({ received: true });
}

async function handleBookingCreated(payload: any) {
  const accessCode = payload.metadata?.accessCode;

  // Find the access code record
  const { data: codeData } = await supabase
    .from('access_codes')
    .select('id')
    .eq('code', accessCode)
    .single();

  // Create booking record
  await supabase.from('bookings').insert({
    access_code_id: codeData?.id,
    cal_booking_id: payload.bookingId,
    scheduled_at: payload.startTime,
    attendee_email: payload.attendees[0]?.email,
    status: 'scheduled',
  });
}

async function handleBookingCancelled(payload: any) {
  await supabase
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('cal_booking_id', payload.bookingId);
}

async function handleBookingRescheduled(payload: any) {
  await supabase
    .from('bookings')
    .update({ scheduled_at: payload.startTime })
    .eq('cal_booking_id', payload.bookingId);
}
```

---

### Admin Routes (Protected)

All admin routes should verify authentication before proceeding.

**GET `/api/admin/requests`**
```typescript
// Returns list of all requests with associated code info
// Supports: ?page=1&limit=20&sort=created_at&order=desc
```

**GET `/api/admin/codes`**
```typescript
// Returns list of all access codes with request info
// Supports: ?status=active|expired|revoked
```

**POST `/api/admin/codes/[id]/revoke`**
```typescript
// Revokes a specific access code
// Sets status to 'revoked'
```

**GET `/api/admin/bookings`**
```typescript
// Returns list of all bookings
// Supports: ?status=scheduled|completed|cancelled&from=date&to=date
```

---

## Access Code Generation

```typescript
// lib/codes.ts

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing chars: I, O, 0, 1

export function generateAccessCode(length = 8): string {
  const crypto = require('crypto');
  const bytes = crypto.randomBytes(length);
  let code = '';

  for (let i = 0; i < length; i++) {
    code += ALPHABET[bytes[i] % ALPHABET.length];
  }

  return code;
}
```

**Code characteristics:**
- 8 characters
- Uppercase alphanumeric
- No confusing characters (0/O, 1/I)
- URL-safe
- ~2.8 trillion possible combinations

---

## Email Templates

### Minister Email

```typescript
function ministerEmailTemplate(data: {
  referrerName: string;
  personName: string;
  situation: string;
  prayerRequests: string;
  notes?: string;
}): string {
  return `
    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto;">
      <p>A new request has come in. Please take a moment to pray for them before they book a time.</p>

      <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 24px 0;">

      <p><strong>Referred by:</strong> ${data.referrerName}</p>
      <p><strong>For:</strong> ${data.personName}</p>

      <p><strong>What they're walking through:</strong></p>
      <p style="background: #f9f9f9; padding: 16px; border-radius: 4px;">
        ${data.situation}
      </p>

      <p><strong>Prayer requests:</strong></p>
      <p style="background: #f9f9f9; padding: 16px; border-radius: 4px;">
        ${data.prayerRequests}
      </p>

      ${data.notes ? `
        <p><strong>Notes:</strong></p>
        <p style="background: #f9f9f9; padding: 16px; border-radius: 4px;">
          ${data.notes}
        </p>
      ` : ''}

      <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 24px 0;">

      <p style="color: #666;">
        They'll book a time soon. We'll send you the calendar invite when they do.
      </p>
    </div>
  `;
}
```

### Referrer Email

```typescript
function referrerEmailTemplate(data: {
  personName: string;
  code: string;
  bookingUrl: string;
}): string {
  return `
    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto;">
      <p>Thank you for caring for ${data.personName}. Mama and Papa have received your request and are already praying.</p>

      <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 24px 0;">

      <p><strong>Please pass this along to them personally:</strong></p>

      <div style="background: #f9f9f9; padding: 24px; border-radius: 8px; margin: 16px 0;">
        <p style="margin: 0 0 8px 0;">Booking link:</p>
        <p style="margin: 0 0 16px 0;">
          <a href="${data.bookingUrl}" style="color: #2563eb;">${data.bookingUrl}</a>
        </p>
        <p style="margin: 0 0 8px 0;">Access code:</p>
        <p style="font-size: 24px; font-weight: bold; font-family: monospace; margin: 0;">
          ${data.code}
        </p>
      </div>

      <p style="color: #666;">
        This code is good for 60 days and they can book as many sessions as they need in that window. If they'd like to come back after that, just submit another request and we'll send a new code.
      </p>
    </div>
  `;
}
```

---

## Environment Variables

```env
# Database
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=xxx
SUPABASE_ANON_KEY=xxx

# Email
RESEND_API_KEY=re_xxx
EMAIL_FROM=noreply@yourdomain.com
MINISTERS_EMAIL=mama.papa@email.com
ADMIN_EMAIL=admin@email.com

# Cal.com
CAL_WEBHOOK_SECRET=xxx

# App
NEXT_PUBLIC_URL=https://yourdomain.com
ADMIN_PASSWORD_HASH=xxx
```

---

## Security Checklist

- [ ] Validate all inputs with Zod before database operations
- [ ] Use parameterized queries (Supabase client handles this)
- [ ] Rate limit intake form submissions (10/hour per IP)
- [ ] Verify Cal.com webhook signatures
- [ ] Store admin password as bcrypt hash
- [ ] Use HTTP-only cookies for admin sessions
- [ ] Enable Supabase RLS policies
- [ ] Sanitize user input before email templates (prevent XSS)
- [ ] Don't expose internal error messages to clients

---

## Cron Jobs (Optional)

**Expire old codes:**
```sql
-- Run daily via Supabase cron or Vercel cron
UPDATE access_codes
SET status = 'expired'
WHERE expires_at < NOW()
  AND status = 'active';
```

---

## Testing

**Manual testing checklist:**
- [ ] Submit intake form → records created in both tables
- [ ] Submit intake form → three emails sent
- [ ] Verify valid code → returns person name
- [ ] Verify invalid code → returns error
- [ ] Verify expired code → returns expired error
- [ ] Cal.com webhook → creates booking record
- [ ] Cancel in Cal.com → updates booking status
- [ ] Admin login → returns session
- [ ] Admin routes → return data when authenticated
- [ ] Admin routes → return 401 when not authenticated

---

*Questions? Check build.md for business context or frontend.md for how the API is consumed.*
