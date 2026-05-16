# UX Team Instructions

> Mama & Papa Prayer Platform — User Experience Guide

---

## Overview

You are defining the user experience for a referral-based prayer and encouragement platform. Three distinct users interact with this system, each with different emotional states and needs.

**Core UX principle:** The form is the first act of ministry. Every interaction should feel like care, not bureaucracy.

---

## User Personas

### 1. The Referrer
**Who they are:** A friend, family member, pastor, or colleague who knows someone going through a hard time.

**Emotional state:** Compassionate but possibly uncertain. They want to help but don't know how. Finding this platform feels like a gift — "Finally, something I can do."

**Goal:** Submit a request on behalf of someone they care about.

**Needs:**
- Understand quickly what this is and isn't
- Feel confident this is safe and legitimate
- Complete the form without friction
- Know what happens next

### 2. The Hurting Person
**Who they are:** Someone walking through a difficult season — grief, loneliness, disillusionment, exhaustion.

**Emotional state:** Vulnerable, possibly skeptical, low energy. They didn't seek this out; someone who loves them did.

**Goal:** Book a session with Mama and Papa.

**Needs:**
- Minimal friction (they have no spare capacity)
- Feel welcomed, not processed
- Understand this is a gift, not an obligation
- Control over when and if they engage

### 3. The Admin (Son)
**Who they are:** The son of Mama and Papa, managing the platform remotely.

**Emotional state:** Practical, caring. Wants visibility without micromanaging.

**Goal:** Monitor requests and ensure the system is working.

**Needs:**
- Quick overview of activity
- Ability to intervene if needed (revoke codes)
- No unnecessary alerts or tasks

---

## User Flows

### Flow 1: Referrer Submits Request

```
┌──────────────┐
│   Homepage   │
│   (learns    │──────►┌──────────────┐
│  what this   │       │ Intake Form  │
│     is)      │       │   /request   │
└──────────────┘       └──────┬───────┘
                              │
                              ▼
                       ┌──────────────┐
                       │   Success    │
                       │    State     │
                       │ "Check your  │
                       │   email"     │
                       └──────┬───────┘
                              │
                              ▼
                       ┌──────────────┐
                       │Email arrives │
                       │ with code +  │
                       │    link      │
                       └──────┬───────┘
                              │
                              ▼
                       ┌──────────────┐
                       │  Referrer    │
                       │   shares     │
                       │ personally   │
                       └──────────────┘
```

**Key Moments:**

1. **Landing on homepage**
   - Immediately clear this is about prayer/encouragement (not therapy)
   - Immediately clear the referrer's role (request on behalf of someone)
   - Warm, not salesy

2. **Starting the form**
   - Clear progress indication (how long will this take?)
   - Reassuring: "This takes about 3 minutes"
   - No account creation

3. **Filling out the form**
   - Questions feel thoughtful, not clinical
   - Optional fields are clearly optional
   - Textarea prompts invite story, not data entry
   - "What are they walking through?" not "Describe the situation"

4. **After submission**
   - Immediate confirmation on screen
   - Clear next step: "Check your email"
   - Warm acknowledgment: "Mama and Papa are already praying"

5. **Receiving the email**
   - Personal tone (not transactional)
   - Clear instructions for what to forward
   - Code is prominent and easy to copy

---

### Flow 2: Hurting Person Books Session

```
┌──────────────┐
│  Receives    │
│ code + link  │──────►┌──────────────┐
│from referrer │       │ Booking Page │
└──────────────┘       │    /book     │
                       └──────┬───────┘
                              │
                       Enter access code
                              │
                              ▼
                       ┌──────────────┐
                       │  Code valid  │
                       │  Cal.com     │
                       │   appears    │
                       └──────┬───────┘
                              │
                       Select time
                              │
                              ▼
                       ┌──────────────┐
                       │ Confirmation │
                       │  "You're     │
                       │   booked"    │
                       └──────┬───────┘
                              │
                              ▼
                       ┌──────────────┐
                       │Calendar invite│
                       │arrives (Zoom │
                       │    link)     │
                       └──────────────┘
```

**Key Moments:**

1. **Receiving the code**
   - Comes from someone they trust, not the platform
   - Personal handoff ("I set this up for you")

2. **Landing on booking page**
   - Brief, warm welcome (not overwhelming)
   - Single input field for code
   - No explanation overload — they already know why they're here

3. **Entering the code**
   - Forgiving input (case insensitive, trim whitespace)
   - Clear error states (but gentle language)
   - Invalid: "We couldn't find that code. Double-check and try again."
   - Expired: "This code has expired. [Name] can request a new one for you."

4. **Seeing the calendar**
   - Moment of "Oh, this is real"
   - Cal.com should feel integrated, not jarring
   - Brief note: "Pick a time that works for you. This is yours."

5. **Booking confirmation**
   - Reassurance: "You're all set."
   - What to expect: "You'll receive a calendar invite with the Zoom link."
   - Reminder: "You can book more sessions anytime. Your code is good for 60 days."

6. **Before the session**
   - Standard Cal.com/Zoom reminders
   - No additional emails from our platform (keep it simple)

---

### Flow 3: Admin Monitors Activity

```
┌──────────────┐
│   Receives   │
│    email     │──────►┌──────────────┐
│notification  │       │ Admin Login  │
└──────────────┘       │/admin/login  │
                       └──────┬───────┘
                              │
                              ▼
                       ┌──────────────┐
                       │  Dashboard   │
                       │    /admin    │
                       └──────┬───────┘
                              │
                    ┌─────────┼─────────┐
                    ▼         ▼         ▼
              ┌─────────┐ ┌─────────┐ ┌─────────┐
              │Requests │ │ Codes   │ │Bookings │
              └─────────┘ └─────────┘ └─────────┘
```

**Key Moments:**

1. **Email notification**
   - Brief, just enough context
   - Link directly to admin area

2. **Dashboard**
   - At-a-glance summary (total requests, active codes, upcoming sessions)
   - Recent activity feed
   - No action required unless something's wrong

3. **Drilling into details**
   - Click on request to see full intake info
   - Click on code to see usage, ability to revoke
   - Click on booking to see details

4. **Taking action (rare)**
   - Revoke a code if needed (confirmation required)
   - That's it — no other actions needed for v1

---

## Interaction Patterns

### Form Validation

**When to validate:**
- On blur (field loses focus) for immediate feedback
- On submit for final check

**Error display:**
- Inline, directly below the field
- Red text but not alarming (soft red, not fire-engine)
- Helpful language: "Please enter a valid email" not "Invalid email format"

**Required vs Optional:**
- Mark optional fields with "(optional)" after label
- Don't mark required fields — they're the default

### Loading States

**Form submission:**
- Button changes to "Submitting..." with subtle animation
- Button is disabled to prevent double-submit
- On success: smooth transition to confirmation

**Code verification:**
- Brief loading indicator while checking
- Fast response expected (<1 second)

**Page loads:**
- Skeleton screens for content that loads dynamically
- No blank flashes

### Success States

**After form submission:**
- Confirmation message appears in place of form (or modal)
- Green check icon (subtle)
- Clear next step prominent

**After booking:**
- Confirmation from Cal.com (their standard flow)
- Our page shows confirmation message

### Error States

**Network errors:**
- "Something went wrong. Please try again."
- Retry button visible
- Don't lose form data on error

**Validation errors:**
- Specific, actionable feedback
- Focus moves to first error

**Code errors:**
- Invalid: "We couldn't find that code. Please check and try again."
- Expired: "This code has expired. If you still need a session, ask [referrer name] to request a new code."

---

## Accessibility Requirements

### Keyboard Navigation
- All interactive elements reachable via Tab
- Logical tab order (top to bottom, left to right)
- Enter/Space activates buttons
- Escape closes modals

### Screen Readers
- Proper heading hierarchy (h1 → h2 → h3)
- Form labels associated with inputs
- Error messages announced via `aria-live`
- Meaningful link text (not "click here")

### Visual
- Minimum 4.5:1 contrast for text
- Focus indicators visible on all interactive elements
- Don't rely on color alone (add icons or text)
- Text resizable to 200% without breaking layout

### Motor
- Touch targets minimum 44x44px
- Generous click/tap areas
- No time-limited interactions

### Cognitive
- Simple, clear language
- Short paragraphs
- One action per screen when possible
- Progress indicators for multi-step flows

---

## Edge Cases

### Access Code Issues

| Scenario | Response |
|----------|----------|
| Code doesn't exist | "We couldn't find that code. Please check and try again." |
| Code is expired | "This code has expired. If you'd like to book a session, ask [referrer] to request a new code for you." |
| Code is revoked | Same as "doesn't exist" (no need to alarm) |
| Code is valid but person already booked | Allow booking (unlimited sessions per code) |
| Code entered with wrong case | Accept (case-insensitive matching) |
| Code has spaces | Trim and accept |

### Form Submission Issues

| Scenario | Response |
|----------|----------|
| Network failure during submit | "Something went wrong. Please try again." + Retry button |
| Email delivery fails | Log error, show success to user (don't burden them with our problems) |
| Duplicate submission (same referrer, same person) | Allow it — might be intentional refresh |
| Very long text in textareas | Accept up to 5000 characters, soft warning at 4000 |

### Booking Issues

| Scenario | Response |
|----------|----------|
| No availability in Cal.com | Cal.com shows "No times available" — we can't control this |
| Cal.com embed fails to load | Show fallback: "Having trouble? Email [address] to schedule directly." |
| Person tries to book but calendar is full | Cal.com handles this natively |

### Admin Issues

| Scenario | Response |
|----------|----------|
| Admin forgets password | Email-based password reset (or magic link) |
| Admin revokes code by mistake | Code is revoked permanently (admin can tell referrer to submit new request) |

---

## Content Guidelines

### Voice & Tone

**We are:**
- Warm but not saccharine
- Simple but not simplistic
- Reverent but not religious-coded
- Confident but not salesy

**We are not:**
- Clinical ("Your session has been scheduled")
- Churchy ("Be blessed!")
- Corporate ("Thank you for your submission")
- Urgent ("Don't miss out!")

### Example Rewrites

| Instead of | Write |
|------------|-------|
| "Submit request" | "Send this request" |
| "Invalid email format" | "Please enter a valid email address" |
| "Your submission has been received" | "Thank you. Mama and Papa have received your request." |
| "Book your session" | "Pick a time" |
| "Session successfully booked" | "You're all set." |

### Microcopy Checklist

- [ ] Button text uses verbs ("Send", "Continue", "Pick a time")
- [ ] Error messages are helpful and human
- [ ] Success messages are warm and clear
- [ ] Helper text is concise (one sentence max)
- [ ] No jargon or technical terms
- [ ] No ALL CAPS except access codes

---

## Page-Specific UX Notes

### Homepage

**Above the fold:**
- Clear headline: What this is
- Clear subhead: Who it's for
- Primary CTA: Go to intake form

**Scrolling:**
- How it works (3 simple steps)
- About Mama and Papa (builds trust)
- Footer with safeguarding note

**Safeguarding Note:**
Small, not alarming, but present:
> "This is not a substitute for professional help. If you or someone you know is in immediate danger, please contact emergency services or a crisis helpline."

### Intake Form

**Before form:**
Brief context setting:
> "Tell us about the person you're referring. Mama and Papa will begin praying for them as soon as this arrives."

**Form sections:**
1. About you (referrer info)
2. About them (person being referred)
3. Their story (situation, prayer requests, notes)
4. Optional (how heard)

**After submit:**
> "Thank you. Mama and Papa have your request and are already praying for [Person's name]. Check your email for the access code to share with them."

### Booking Page

**Before code entry:**
> "Welcome. Enter the access code you received to book your session with Mama and Papa."

**After valid code:**
> "Hi, [Person's name]. Pick a time that works for you. Mama and Papa are looking forward to meeting you."

**After booking:**
> "You're all set. You'll receive a calendar invite with your Zoom link. See you soon."

---

## Mobile Considerations

- Single column layout on mobile
- Large touch targets (especially form submit)
- Cal.com embed should be usable on mobile (they handle this)
- No horizontal scrolling ever
- Thumb-friendly button placement

---

## Testing Protocol

### Before Launch

1. **Walkthrough Testing**
   - Complete referrer flow end-to-end
   - Complete hurting person flow end-to-end
   - Complete admin flow
   - Test on mobile device (real device, not simulator)

2. **Accessibility Testing**
   - Keyboard-only navigation (full journey)
   - Screen reader testing (VoiceOver or NVDA)
   - Color contrast check (use browser dev tools)

3. **Error State Testing**
   - Submit form with validation errors
   - Enter invalid access code
   - Enter expired access code
   - Test with network throttling

4. **Edge Case Testing**
   - Very long text inputs
   - Special characters in names
   - Unusual email formats

### User Testing (If Possible)

- Have 2-3 real people complete the referrer flow
- Have 2-3 real people complete the booking flow
- Watch without helping — note where they pause or hesitate
- Ask: "What did you expect to happen?" when confused

---

*Questions? See design.md for visual specifications or backend.md for API behavior.*
