# build.md

> Reference document for the prayer & encouragement platform connecting hurting people with "Mama and Papa" for Zoom sessions of listening, encouragement, and prayer.

---

## The Heart of It

This platform exists to connect people walking through hard times — single parents, the lonely, the disillusioned, those carrying weight in silence — with two ministers ("Mama" and "Papa") who have spent over 40 years pastoring, encouraging, and praying for people.

The sessions are free to those served. They are not therapy. They are not prosperity-gospel encouragement. They are the kind of conversation where someone listens to you, hears what you're carrying, encourages you in the Lord ("close to the broken-hearted"), and prays with you.

The model is **referral-based**, not open signup. Someone who knows a hurting person is the one who requests the session on their behalf — an act of love that says, *"I see you, and I want to walk with you in this."*

Whatever we build should feel like being invited into a living room, not booking a telehealth appointment. Warm, sacred, safe — not SaaS.

---

## The User Journey (v1)

1. **Referrer lands on the homepage.** Reads a short, warm explanation of what this is and who it's for.
2. **Referrer submits an intake request** on behalf of the hurting person. Form captures who they are, who the person is, what they're walking through, and prayer requests.
3. **On submit, three things happen automatically:**
   - **Mama and Papa receive an email** with the intake info. *This is when the prayer begins — before anything is scheduled.*
   - **The referrer receives an email** with a unique access code and the booking link.
   - **The admin (the son) receives a quiet notification** for visibility.
4. **The referrer personally forwards** the code and link to the hurting person via text or email. ("I set this up for you — here's how to get in.")
5. **The hurting person visits the platform**, enters the access code, and unlocks the booking page (Cal.com embed).
6. **They pick a time** that works for them. Cal.com auto-creates a Zoom meeting and sends calendar invites.
7. **The session happens.** Mama and Papa listen, encourage, and pray.
8. **The access code remains valid for 60 days** and can be used for unlimited bookings within that window. After 60 days, the referrer can request a new one.

---

## Decisions Locked In

### Audience & Model
- **Target audience:** People in seasons of loneliness, disillusionment, or hard times — single parents and others carrying weight quietly.
- **Access model:** Referral-only. The referrer initiates, the hurting person books.
- **Cost to the person served:** Free.

### Approval & Access
- **Approval:** Auto-approve all submissions. Trust the referrer mechanism to keep the platform private.
- **Access codes:** Unique per request. Valid for **60 days**. Allow **unlimited bookings** within that window.
- **Renewal:** After expiry, the referrer can submit a new request for the same person.

### The Session
- **Platform:** Zoom, auto-created by Cal.com on booking.
- **Sent to:** Both the hurting person (primary) and the referrer (cc'd as the "bridge").
- **Length & cadence:** TBD — set in Cal.com by Mama and Papa's availability.

### Who Sees What
- **Mama and Papa:** Receive intake info by email when a request comes in — for prayer beforehand. They do not interact with a dashboard.
- **The admin (son):** Manages everything remotely. Has an admin view to see requests, codes, and bookings.
- **The referrer:** Receives the access code and booking link via email.
- **The hurting person:** Receives the booking link/code from the referrer; gets the Zoom invite from Cal.com after booking.

### What's Explicitly NOT in v1
- User accounts for the people being served
- Follow-up notifications, daily encouragement, "Mama and Papa in your pocket" features
- Other moms and papas joining the platform
- Capacity / boundaries dashboard
- Multi-language support
- Approval workflow (auto-approve for now)
- Analytics or reporting beyond admin visibility

---

## v2 Roadmap (Deferred)

These are good ideas — just not now.

- **Hurting-person accounts** with logins and a small home for their journey
- **Push notifications / daily encouragement** — verses, prayers, brief notes from Mama and Papa
- **Other moms and papas** join the platform to expand capacity
- **Boundaries & capacity management** — limit sessions per week, vacation modes, health-aware scheduling
- **Approval workflow** — if auto-approve gets abused, layer in parent-driven approval via email reply
- **Languages** beyond English
- **Light analytics** — sessions completed, referrer patterns, etc.

---

## Architecture

### Build vs. Buy

| Piece | Decision | Why |
|---|---|---|
| Homepage + intake form | **Build** | This is the soul of the brand — needs to feel warm, not generic |
| Access code system | **Build** | Custom logic; small surface area |
| Code-gated booking page | **Build** (embeds Cal.com) | Cal.com handles scheduling; we handle the gate |
| Admin view | **Build** (minimal) | Just a list of requests/codes for the son |
| Scheduling | **Buy** — Cal.com | Best-in-class, free tier, Zoom integration built-in |
| Video calls | **Buy** — Zoom | Familiar to parents, auto-created by Cal.com |
| Email delivery | **Buy** — Resend | Generous free tier, simple API |
| Hosting | **Buy** — Vercel | Free tier, zero-config Next.js deploys |
| Database | **Buy** — Supabase or Vercel Postgres | Free tier covers v1 easily |

### Stack

- **Frontend + Backend:** Next.js on Vercel (App Router, server actions for form submission)
- **Database:** Supabase or Vercel Postgres
- **Email:** Resend
- **Scheduling:** Cal.com (with Zoom integration)
- **Domain:** TBD (~$12/year)

### Monthly Cost Estimate

- Hosting: $0 (Vercel free)
- Database: $0 (Supabase free or Vercel Postgres free)
- Email: $0 (Resend free — 3,000 emails/month)
- Cal.com: $0 (free for one host) or ~$15/mo (Pro, for branding/custom URL)
- Domain: ~$1/mo amortized

**Total: $0–16/month**

---

## Data Model

Minimal schema for v1.

### `requests`
The intake form submissions.

- `id` (uuid, pk)
- `created_at` (timestamp)
- `referrer_name` (text)
- `referrer_email` (text)
- `referrer_relationship` (text) — e.g., "friend", "pastor", "family"
- `person_first_name` (text)
- `person_email` (text, nullable) — optional; referrer may pass code along privately
- `person_phone` (text, nullable)
- `situation` (text) — what they're walking through
- `prayer_requests` (text)
- `notes_for_ministers` (text, nullable) — sensitivities, things to know
- `how_heard` (text, nullable)

### `access_codes`
Codes generated on request submission.

- `id` (uuid, pk)
- `request_id` (uuid, fk → requests)
- `code` (text, unique) — short, memorable, URL-safe (e.g., 8 chars)
- `created_at` (timestamp)
- `expires_at` (timestamp) — created_at + 60 days
- `status` (enum: `active`, `expired`, `revoked`)

### `bookings`
Tracking when codes are used to book (synced from Cal.com webhook).

- `id` (uuid, pk)
- `access_code_id` (uuid, fk → access_codes)
- `cal_booking_id` (text) — from Cal.com
- `scheduled_at` (timestamp)
- `attendee_email` (text)
- `status` (enum: `scheduled`, `completed`, `cancelled`, `no_show`)
- `created_at` (timestamp)

### `admins`
Simple admin auth for the son.

- `id` (uuid, pk)
- `email` (text, unique)
- `created_at` (timestamp)

---

## Email Templates (Drafts)

These need real copy, but here's the structure.

### Email 1 — To Mama and Papa (on submission)
**Subject:** Someone to pray for — [Person's first name]

> A new request has come in. Please take a moment to pray for them before they book a time.
>
> **Referred by:** [Referrer name]
> **For:** [Person's first name]
> **What they're walking through:**
> [Situation]
>
> **Prayer requests:**
> [Prayer requests]
>
> **Notes:**
> [Notes for ministers]
>
> They'll book a time soon. We'll send you the calendar invite when they do.

### Email 2 — To Referrer (on submission)
**Subject:** Here's the link for [Person's first name]

> Thank you for caring for [Person's first name]. Mama and Papa have received your request and are already praying.
>
> **Please pass this along to them personally:**
>
> Booking link: [URL]
> Access code: **[CODE]**
>
> This code is good for 60 days and they can book as many sessions as they need in that window. If they'd like to come back after that, just submit another request and we'll send a new code.

### Email 3 — To Admin (on submission)
Quiet notification for visibility. Plain text. Link to the admin view.

### Cal.com handles the booking confirmations and calendar invites natively.

---

## Open Questions

To resolve before or during the build.

- **Name & domain.** What is this called? The name shapes the homepage copy, the email tone, and the URL.
- **Who is the developer?** Self-build, partial-build with help, or full-build delivered.
- **Zoom account.** Do Mama and Papa already have a Zoom account to connect, or do we need to set one up?
- **Session length & weekly availability.** What does the calendar look like? Mama and Papa need to set their hours in Cal.com.
- **Safeguarding language.** Brief note in the intake form: this isn't a substitute for professional help; if there's immediate danger, please call a crisis line. Doesn't have to be heavy — but it should be there.
- **Languages.** v1 is English. But Mama and Papa may minister in other languages — does the intake form need a "preferred language" field for v2?
- **Photos / faces on the homepage?** A photo of Mama and Papa would be enormously warming — but is that something they're comfortable with? Trade-off between warmth and privacy.

---

## Principles to Build By

1. **The form is the first act of ministry.** Treat the intake submission as sacred. Mama and Papa start praying the moment it arrives — the system should make that easy.
2. **Make it feel like a living room, not a SaaS app.** Warm copy. Generous whitespace. No "Get Started Now!" CTAs. No urgency. No badges or testimonials.
3. **Mama and Papa never touch a dashboard.** Everything that reaches them is email, paper, or a phone call from their son. The tech is invisible to them.
4. **Free for those served — always.** This is non-negotiable. If a monetization path ever emerges, it serves the ministers (donations, support), not gates the people served.
5. **Build the smallest thing that works, then learn.** Two real people connecting with Mama and Papa beats a beautiful platform with no users. Ship, watch, iterate.
6. **The referrer is part of the ministry.** "Let's go at this together." The system honors that the referrer is doing something loving — make their part feel meaningful, not transactional.

---

*Last updated: May 14, 2026*
