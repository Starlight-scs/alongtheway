# Frontend Team Instructions

> Mama & Papa Prayer Platform — Frontend Development Guide

---

## Overview

You are building the public-facing web application for a referral-based prayer and encouragement platform. The application connects hurting people with two ministers ("Mama and Papa") for Zoom sessions of listening, encouragement, and prayer.

**Core principle:** This should feel like being invited into a living room, not booking a telehealth appointment. Warm, sacred, safe — not SaaS.

---

## Tech Stack

| Tool | Purpose |
|------|---------|
| **Next.js 14+** | Framework (App Router) |
| **TypeScript** | Type safety |
| **Tailwind CSS** | Styling |
| **React Hook Form** | Form handling |
| **Zod** | Validation schemas |
| **Cal.com Embed** | Scheduling widget |

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Homepage
│   ├── request/
│   │   └── page.tsx            # Intake form
│   ├── book/
│   │   └── page.tsx            # Code-gated booking
│   ├── confirmation/
│   │   └── page.tsx            # Post-booking confirmation
│   ├── admin/
│   │   ├── layout.tsx          # Admin layout with auth check
│   │   ├── login/
│   │   │   └── page.tsx        # Admin login
│   │   ├── page.tsx            # Dashboard
│   │   ├── requests/
│   │   │   └── page.tsx        # Requests list
│   │   ├── codes/
│   │   │   └── page.tsx        # Access codes list
│   │   └── bookings/
│   │       └── page.tsx        # Bookings list
│   └── api/                    # API routes (see backend.md)
├── components/
│   ├── ui/                     # Base UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Textarea.tsx
│   │   ├── Card.tsx
│   │   └── ...
│   ├── forms/
│   │   ├── IntakeForm.tsx
│   │   └── CodeVerifyForm.tsx
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── Container.tsx
│   └── CalEmbed.tsx            # Cal.com embed wrapper
├── lib/
│   ├── validations.ts          # Zod schemas
│   └── utils.ts                # Helper functions
└── styles/
    └── globals.css             # Tailwind imports + custom CSS
```

---

## Page Specifications

### Homepage (`/`)

**Purpose:** Welcome referrers, explain what this is, invite them to submit a request.

**Sections:**
1. **Hero** — Warm headline, 1-2 sentence description, primary CTA button
2. **Who This Is For** — Brief description of target audience
3. **How It Works** — 3 simple steps (submit request → share code → book session)
4. **About Mama and Papa** — Short bio, optional photo
5. **Footer** — Safeguarding note, simple links

**Components needed:**
- `HeroSection`
- `HowItWorks` (with numbered steps)
- `AboutSection`
- `Footer`

**No-gos:**
- No "Get Started Now!" urgency
- No testimonials or social proof badges
- No marketing-speak

---

### Intake Form (`/request`)

**Purpose:** Referrer submits information about the person they're referring.

**Form Fields:**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Referrer Name | text | Yes | |
| Referrer Email | email | Yes | |
| Relationship | select | Yes | Options: Friend, Family, Pastor, Coworker, Other |
| Person's First Name | text | Yes | |
| Person's Email | email | No | "Optional — you can share the code yourself" |
| Person's Phone | tel | No | |
| Situation | textarea | Yes | "What are they walking through?" |
| Prayer Requests | textarea | Yes | |
| Notes for Ministers | textarea | No | "Anything Mama and Papa should know?" |
| How Did You Hear | text | No | |

**Behavior:**
- Validate on blur and on submit
- Show inline errors
- Submit button shows loading state during API call
- On success: redirect to `/request/success` or show success modal
- On error: show toast/alert with retry option

**Success State:**
Display confirmation message:
> "Thank you. Mama and Papa have received your request and are already praying. Check your email for the access code to share with [Person's First Name]."

---

### Booking Page (`/book`)

**Purpose:** Hurting person enters access code and books a session.

**Two states:**

**State 1: Code Entry**
- Headline: "Ready to book your session?"
- Subtext: Brief, warm explanation
- Input field for access code
- Submit button: "Continue"
- Error states:
  - Invalid code: "We couldn't find that code. Please check and try again."
  - Expired code: "This code has expired. Please ask [referrer] to request a new one."

**State 2: Booking (after valid code)**
- Brief welcome message
- Cal.com embed (full width, generous height)
- Note: "You can book as many sessions as you need."

**Cal.com Embed Integration:**

```tsx
// components/CalEmbed.tsx
'use client';

import Cal, { getCalApi } from "@calcom/embed-react";
import { useEffect } from "react";

interface CalEmbedProps {
  calLink: string;  // e.g., "mama-papa/session"
  accessCode: string;
}

export function CalEmbed({ calLink, accessCode }: CalEmbedProps) {
  useEffect(() => {
    (async function () {
      const cal = await getCalApi();
      cal("ui", {
        theme: "light",
        hideEventTypeDetails: false,
      });
    })();
  }, []);

  return (
    <Cal
      calLink={calLink}
      style={{ width: "100%", height: "600px", overflow: "scroll" }}
      config={{
        // Pass access code as metadata for webhook
        metadata: { accessCode }
      }}
    />
  );
}
```

---

### Confirmation Page (`/confirmation`)

**Purpose:** Reassurance after booking.

**Content:**
- Confirmation message: "Your session is booked!"
- What to expect: "You'll receive a calendar invite with the Zoom link."
- Option to book another: "Need another session? [Book again]"

---

### Admin Pages

**Auth Pattern:**
- Use Next.js middleware to protect `/admin/*` routes
- Check for valid session/token
- Redirect to `/admin/login` if unauthorized

**Admin Layout:**
- Simple sidebar with navigation: Dashboard, Requests, Codes, Bookings
- Header with logout button
- Clean, functional design (doesn't need to be "warm" — this is for the son)

**Dashboard (`/admin`)**
- Summary cards: Total Requests, Active Codes, Upcoming Sessions
- Recent activity list

**Requests Table (`/admin/requests`)**
- Columns: Date, Referrer, Person, Situation (truncated), Status
- Click row to expand full details
- Sort by date (newest first default)

**Codes Table (`/admin/codes`)**
- Columns: Code, Request (linked), Created, Expires, Status
- Filter dropdown: All, Active, Expired, Revoked
- Action button: Revoke (with confirmation)

**Bookings Table (`/admin/bookings`)**
- Columns: Date/Time, Person, Code Used, Status
- Filter by: Upcoming, Past, Cancelled

---

## State Management

**Keep it simple for v1:**
- Server components for data fetching where possible
- Client components only where interactivity needed
- React Hook Form for form state
- URL search params for filters/pagination
- No global state library needed

---

## API Integration

**Intake Form Submission:**
```tsx
// In IntakeForm.tsx
const onSubmit = async (data: IntakeFormData) => {
  const response = await fetch('/api/intake', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return response.json();
};
```

**Code Verification:**
```tsx
// In CodeVerifyForm.tsx
const verifyCode = async (code: string) => {
  const response = await fetch('/api/verify-code', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  });

  if (!response.ok) {
    const error = await response.json();
    // error.type will be 'invalid' or 'expired'
    throw new Error(error.message);
  }

  return response.json(); // { valid: true, personName: string }
};
```

**Admin Data Fetching:**
```tsx
// In admin pages (server components)
async function getRequests() {
  const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/admin/requests`, {
    headers: { Cookie: cookies().toString() },
    cache: 'no-store',
  });
  return response.json();
}
```

---

## Environment Variables

```env
# .env.local
NEXT_PUBLIC_URL=http://localhost:3000
NEXT_PUBLIC_CAL_LINK=mama-papa/session
```

Frontend only needs `NEXT_PUBLIC_*` variables. All sensitive keys (database, email) stay server-side only.

---

## Build & Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run production build locally
npm start

# Type check
npm run type-check

# Lint
npm run lint
```

---

## Testing Checklist

Before marking frontend complete, verify:

- [ ] Homepage loads and all sections render
- [ ] Intake form validates all required fields
- [ ] Intake form submits successfully and shows confirmation
- [ ] Booking page accepts valid code and shows Cal.com embed
- [ ] Booking page shows correct error for invalid/expired codes
- [ ] Admin login works
- [ ] Admin can view requests, codes, and bookings
- [ ] Admin can revoke a code
- [ ] All pages are responsive (mobile, tablet, desktop)
- [ ] All pages pass Lighthouse accessibility audit (90+)
- [ ] Tab navigation works throughout
- [ ] Forms show clear error messages
- [ ] Loading states appear during async operations

---

## Dependencies

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "@calcom/embed-react": "latest",
    "react-hook-form": "^7.0.0",
    "@hookform/resolvers": "^3.0.0",
    "zod": "^3.0.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "tailwindcss": "^3.0.0",
    "@types/react": "^18.0.0",
    "@types/node": "^20.0.0",
    "eslint": "^8.0.0",
    "eslint-config-next": "^14.0.0"
  }
}
```

---

*Questions? Consult the design.md for visual specifications or ux.md for interaction patterns.*
