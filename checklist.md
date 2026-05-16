# Project Completion Checklist

> Mama & Papa Prayer Platform — v1 Build Checklist

---

## Phase 1: Project Foundation

### 1.1 Environment Setup
- [ ] Initialize Next.js project with App Router
- [ ] Configure TypeScript
- [ ] Set up Tailwind CSS
- [ ] Configure ESLint and Prettier
- [ ] Create `.env.example` with required variables
- [ ] Set up Git repository with `.gitignore`

### 1.2 Infrastructure Accounts
- [ ] Create Vercel account and link repository
- [ ] Set up Supabase project (or Vercel Postgres)
- [ ] Create Resend account and verify domain
- [ ] Set up Cal.com account with Zoom integration
- [ ] Configure environment variables in Vercel

### 1.3 Database Schema
- [ ] Create `requests` table with all fields
- [ ] Create `access_codes` table with foreign key to requests
- [ ] Create `bookings` table with foreign key to access_codes
- [ ] Create `admins` table
- [ ] Set up Row Level Security policies
- [ ] Create database indexes for performance
- [ ] Seed initial admin user

**Verification:** Run `SELECT * FROM information_schema.tables` and confirm all four tables exist with correct columns.

---

## Phase 2: Core Backend

### 2.1 API Routes
- [ ] `POST /api/intake` — Submit referral request
- [ ] `POST /api/verify-code` — Validate access code
- [ ] `GET /api/admin/requests` — List all requests (protected)
- [ ] `GET /api/admin/codes` — List all access codes (protected)
- [ ] `GET /api/admin/bookings` — List all bookings (protected)
- [ ] `POST /api/webhooks/calcom` — Receive Cal.com booking events

### 2.2 Access Code System
- [ ] Generate unique 8-character URL-safe codes
- [ ] Set 60-day expiration on creation
- [ ] Validate code existence and expiration
- [ ] Track code status (active/expired/revoked)

### 2.3 Email Integration
- [ ] Configure Resend client
- [ ] Create email template: Mama & Papa notification
- [ ] Create email template: Referrer confirmation with code
- [ ] Create email template: Admin notification
- [ ] Send all three emails on intake submission
- [ ] Handle email delivery errors gracefully

### 2.4 Admin Authentication
- [ ] Implement email-based admin auth (magic link or simple password)
- [ ] Protect admin routes with middleware
- [ ] Session management

**Verification:** Submit a test intake form and confirm: (1) database records created, (2) three emails sent, (3) access code validates correctly.

---

## Phase 3: Frontend — Public Pages

### 3.1 Homepage
- [ ] Hero section with warm introduction
- [ ] "Who this is for" section
- [ ] "How it works" explanation (3 steps)
- [ ] "About Mama and Papa" section (with or without photo)
- [ ] Call-to-action to intake form
- [ ] Footer with safeguarding language

### 3.2 Intake Form (`/request`)
- [ ] Referrer information fields (name, email, relationship)
- [ ] Person being referred fields (first name, email optional, phone optional)
- [ ] Situation textarea
- [ ] Prayer requests textarea
- [ ] Notes for ministers (optional)
- [ ] How did you hear about us (optional)
- [ ] Form validation with clear error messages
- [ ] Submit button with loading state
- [ ] Success page/modal with next steps

### 3.3 Booking Page (`/book`)
- [ ] Access code input field
- [ ] Code validation on submit
- [ ] Error states (invalid code, expired code)
- [ ] Cal.com embed (shown only after valid code)
- [ ] Brief context for the hurting person
- [ ] Graceful loading state for Cal.com embed

### 3.4 Confirmation Page
- [ ] Confirmation message after booking
- [ ] What to expect next
- [ ] Link to book another session (code remains valid)

**Verification:** Complete full user journey: homepage → intake form → receive email → enter code → see Cal.com booking widget.

---

## Phase 4: Frontend — Admin

### 4.1 Admin Login (`/admin/login`)
- [ ] Email/password form or magic link input
- [ ] Error handling for invalid credentials
- [ ] Redirect to dashboard on success

### 4.2 Admin Dashboard (`/admin`)
- [ ] Summary stats (total requests, active codes, upcoming sessions)
- [ ] Recent requests list with key details
- [ ] Navigation to detailed views

### 4.3 Requests View (`/admin/requests`)
- [ ] Table of all intake submissions
- [ ] Sortable by date
- [ ] Expandable row to see full details
- [ ] Link to associated access code

### 4.4 Access Codes View (`/admin/codes`)
- [ ] Table of all codes with status
- [ ] Filter by status (active/expired/revoked)
- [ ] Ability to manually revoke a code
- [ ] Link to associated request

### 4.5 Bookings View (`/admin/bookings`)
- [ ] Table of all bookings
- [ ] Status indicator (scheduled/completed/cancelled/no_show)
- [ ] Filter by status and date range

**Verification:** Log in as admin and view at least one record in each table. Revoke a code and confirm it no longer validates.

---

## Phase 5: Integrations

### 5.1 Cal.com Setup
- [ ] Create Cal.com account for Mama & Papa
- [ ] Connect Zoom integration
- [ ] Configure event type (session length, buffer time)
- [ ] Set availability hours
- [ ] Customize booking form fields
- [ ] Set up confirmation emails
- [ ] Generate embed code

### 5.2 Cal.com Webhook
- [ ] Register webhook endpoint in Cal.com
- [ ] Parse booking created events
- [ ] Parse booking cancelled events
- [ ] Update `bookings` table on events
- [ ] Validate webhook signature

### 5.3 Zoom
- [ ] Confirm Mama & Papa have Zoom account
- [ ] Test that Cal.com creates Zoom meetings automatically
- [ ] Verify Zoom link appears in confirmation emails

**Verification:** Book a test session via Cal.com embed, confirm Zoom meeting created, confirm webhook updates database.

---

## Phase 6: Polish & Production

### 6.1 Copy & Content
- [ ] Finalize homepage copy
- [ ] Write intake form helper text
- [ ] Write booking page welcome message
- [ ] Write all email templates with final copy
- [ ] Add safeguarding disclaimer
- [ ] Review all microcopy (buttons, errors, confirmations)

### 6.2 Visual Design
- [ ] Finalize color palette
- [ ] Set typography scale
- [ ] Design component library (buttons, inputs, cards)
- [ ] Add imagery/illustrations if desired
- [ ] Responsive design for mobile
- [ ] Test on multiple browsers

### 6.3 Accessibility
- [ ] Keyboard navigation throughout
- [ ] Screen reader testing
- [ ] Color contrast compliance (WCAG AA)
- [ ] Focus states visible
- [ ] Form labels and ARIA attributes
- [ ] Alt text for images

### 6.4 Performance
- [ ] Lighthouse audit (target: 90+ all categories)
- [ ] Image optimization
- [ ] Font loading strategy
- [ ] Minimize JavaScript bundle

### 6.5 Security
- [ ] Rate limiting on intake form
- [ ] Input sanitization
- [ ] HTTPS enforced
- [ ] Environment variables secured
- [ ] Admin routes protected
- [ ] Webhook signature validation

**Verification:** Run Lighthouse, test on mobile device, have someone unfamiliar navigate the site.

---

## Phase 7: Launch

### 7.1 Pre-Launch
- [ ] Choose domain name
- [ ] Purchase and configure domain
- [ ] Set up DNS with Vercel
- [ ] Configure production environment variables
- [ ] Test production build locally
- [ ] Deploy to production
- [ ] Smoke test all flows in production

### 7.2 Launch
- [ ] Final review with stakeholders
- [ ] Enable production emails
- [ ] Monitor first real submissions
- [ ] Document any immediate fixes needed

### 7.3 Post-Launch
- [ ] Monitor error logs (Vercel, Resend)
- [ ] Gather feedback from Mama & Papa
- [ ] Gather feedback from first referrers
- [ ] Create list of v1.1 improvements

**Verification:** Complete full flow in production: submit real request, receive real emails, book real session.

---

## Open Items (From build.md)

- [ ] **Name & domain** — Decide on platform name
- [ ] **Zoom account** — Confirm Mama & Papa's Zoom setup
- [ ] **Session length** — Define in Cal.com
- [ ] **Weekly availability** — Set in Cal.com
- [ ] **Photos** — Decide if Mama & Papa photos will be used
- [ ] **Preferred language field** — Decide if needed for v1

---

*Last updated: May 14, 2026*
