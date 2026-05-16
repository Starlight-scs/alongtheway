# Design Team Instructions

> Mama & Papa Prayer Platform — Visual Design Guide

---

## Overview

You are designing the visual identity for a referral-based prayer and encouragement platform. This is not a SaaS product, a telehealth app, or a church website. It's a digital living room — warm, sacred, and safe.

**The feeling we're designing for:** A loved one wrapping you in a hug and saying, "I see you. Let me help."

---

## Design Principles

### 1. Living Room, Not SaaS
This should feel like stepping into a cozy, welcoming home — not signing up for a service. No hard edges, no corporate blues, no "Get Started Now!" energy.

### 2. Sacred Simplicity
Less is more. Every element should have breathing room. The design should feel reverent without being churchy or dated.

### 3. Warmth Without Sentimentality
Comforting but not saccharine. No stock photos of people hugging. No sunsets. No clip-art doves. Sincerity without cliché.

### 4. Invisible Technology
The tech should recede. People should feel like they're connecting with humans, not using a platform.

### 5. Trust Through Restraint
No urgency tactics. No testimonials. No social proof badges. The design earns trust by being calm and unhurried.

---

## Color Palette

### Primary Colors

| Name | Hex | Usage |
|------|-----|-------|
| **Warm Cream** | `#FAF8F5` | Page backgrounds |
| **Soft Linen** | `#F5F0EB` | Card backgrounds, section dividers |
| **Deep Charcoal** | `#2D2A26` | Primary text |
| **Warm Gray** | `#6B6560` | Secondary text, labels |

### Accent Colors

| Name | Hex | Usage |
|------|-----|-------|
| **Gentle Sage** | `#8B9E8B` | Primary buttons, links, success states |
| **Dusty Rose** | `#C4A5A5` | Highlights, hover states |
| **Soft Terracotta** | `#C9A88A` | Optional accent, warmth |

### Functional Colors

| Name | Hex | Usage |
|------|-----|-------|
| **Error** | `#B85C5C` | Form errors, alerts |
| **Success** | `#7A9A7A` | Success messages |
| **Focus** | `#8B9E8B` + 50% opacity | Focus rings |

### Color Usage Rules
- Never use pure black (`#000`) — always Deep Charcoal
- Never use pure white (`#FFF`) — always Warm Cream or white with slight warmth
- Accent colors are supporting characters, not leads
- Error states should be noticeable but not alarming

---

## Typography

### Font Stack

**Primary (Headings + Body):**
```css
font-family: 'Lora', Georgia, serif;
```
Lora is warm, readable, and has a touch of personality without being fussy.

**Fallback:** Georgia (system serif)

**Monospace (Access Codes):**
```css
font-family: 'JetBrains Mono', 'SF Mono', monospace;
```

### Type Scale

| Name | Size | Weight | Line Height | Usage |
|------|------|--------|-------------|-------|
| `h1` | 40px / 2.5rem | 600 | 1.2 | Page titles |
| `h2` | 32px / 2rem | 600 | 1.25 | Section headings |
| `h3` | 24px / 1.5rem | 600 | 1.3 | Subsection headings |
| `body` | 18px / 1.125rem | 400 | 1.6 | Body text |
| `small` | 16px / 1rem | 400 | 1.5 | Labels, helper text |
| `caption` | 14px / 0.875rem | 400 | 1.4 | Fine print, timestamps |

### Type Rules
- Body text should always be at least 18px for readability
- Line lengths should not exceed 65-70 characters
- Use generous line height (1.5-1.7) for body text
- Headings can use tighter line height (1.2-1.3)
- No ALL CAPS except for access codes

---

## Spacing System

Use a consistent 4px/8px grid.

| Token | Value | Usage |
|-------|-------|-------|
| `space-1` | 4px | Tight spacing within components |
| `space-2` | 8px | Component internal padding |
| `space-3` | 12px | Related element gaps |
| `space-4` | 16px | Standard component padding |
| `space-6` | 24px | Section padding, form gaps |
| `space-8` | 32px | Section margins |
| `space-12` | 48px | Large section dividers |
| `space-16` | 64px | Page section spacing |
| `space-24` | 96px | Hero/major section spacing |

**General rule:** When in doubt, add more space. Breathing room communicates calm.

---

## Components

### Buttons

**Primary Button**
```css
background: #8B9E8B;
color: #FAF8F5;
padding: 16px 32px;
border-radius: 8px;
font-size: 18px;
font-weight: 500;
border: none;
cursor: pointer;
transition: background 0.2s ease;

/* Hover */
background: #7A8E7A;

/* Focus */
outline: 2px solid #8B9E8B;
outline-offset: 2px;

/* Disabled */
opacity: 0.5;
cursor: not-allowed;
```

**Secondary Button**
```css
background: transparent;
color: #8B9E8B;
border: 1px solid #8B9E8B;
/* Rest same as primary */
```

**Text Button/Link**
```css
color: #8B9E8B;
text-decoration: underline;
text-underline-offset: 3px;
/* Hover: darker shade */
```

### Form Inputs

**Text Input**
```css
background: #FFFFFF;
border: 1px solid #D4D0CB;
border-radius: 6px;
padding: 14px 16px;
font-size: 18px;
font-family: inherit;
color: #2D2A26;
width: 100%;

/* Focus */
border-color: #8B9E8B;
outline: none;
box-shadow: 0 0 0 3px rgba(139, 158, 139, 0.2);

/* Error */
border-color: #B85C5C;
box-shadow: 0 0 0 3px rgba(184, 92, 92, 0.1);
```

**Textarea**
```css
/* Same as text input, plus: */
min-height: 120px;
resize: vertical;
```

**Labels**
```css
display: block;
margin-bottom: 8px;
font-size: 16px;
font-weight: 500;
color: #2D2A26;
```

**Helper Text**
```css
margin-top: 6px;
font-size: 14px;
color: #6B6560;
```

**Error Message**
```css
margin-top: 6px;
font-size: 14px;
color: #B85C5C;
```

### Cards

```css
background: #F5F0EB;
border-radius: 12px;
padding: 32px;
/* No hard shadows — use subtle elevation or none */
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
```

### Access Code Display

```css
font-family: 'JetBrains Mono', monospace;
font-size: 28px;
font-weight: 600;
letter-spacing: 0.15em;
color: #2D2A26;
background: #F5F0EB;
padding: 20px 28px;
border-radius: 8px;
text-align: center;
```

---

## Layout

### Container
- Max width: `720px` for content pages
- Max width: `960px` for admin pages
- Padding: `24px` on mobile, `48px` on desktop
- Centered with `margin: 0 auto`

### Page Structure
```
┌─────────────────────────────────────────┐
│              Header (minimal)            │
├─────────────────────────────────────────┤
│                                         │
│              Hero Section               │
│           (generous padding)            │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│              Content Area               │
│                                         │
├─────────────────────────────────────────┤
│              Footer (simple)            │
└─────────────────────────────────────────┘
```

### Responsive Breakpoints

| Breakpoint | Width | Notes |
|------------|-------|-------|
| Mobile | < 640px | Single column, reduced padding |
| Tablet | 640px - 1024px | Comfortable single column |
| Desktop | > 1024px | Centered content with generous margins |

---

## Iconography

**Style:** Line icons, 1.5-2px stroke weight, rounded caps
**Size:** 24px default, 20px for inline with text
**Color:** Inherit from text color

**Icons needed (minimal set):**
- Arrow (for links/navigation)
- Check (success states)
- Alert (errors)
- Calendar (booking)
- Mail (email references)
- Lock (access code)

**Recommendation:** Use Lucide Icons or Heroicons (outline style)

---

## Imagery

### Photography Guidelines
If photos are used (e.g., Mama and Papa):
- Natural light, warm tones
- Genuine expressions, not posed
- Environmental/contextual (in their home, at their table)
- No stock photography aesthetic

### Illustrations (If Used)
- Simple, hand-drawn quality
- Warm color palette
- Abstract or symbolic (not literal depictions)
- Sparse — one or two per page maximum

### No-Gos
- Stock photos of diverse hands in a circle
- Sunset/sunrise backgrounds
- Religious iconography (crosses, doves, etc.)
- Abstract geometric patterns
- Gradients

---

## Animation

**Principle:** Subtle and purposeful. Animation should feel like a gentle breath, not a performance.

### Transitions
```css
/* Default transition */
transition: all 0.2s ease;

/* Longer for larger movements */
transition: all 0.3s ease-out;
```

### Loading States
- Simple fade or subtle pulse
- No spinners with religious symbols
- Consider skeleton screens for content loading

### Micro-interactions
- Button hover: slight color shift (not scale)
- Focus: smooth outline appearance
- Success: gentle fade-in of confirmation

---

## Admin Design

The admin area can be more utilitarian:
- Standard sans-serif font acceptable
- Tighter spacing
- Tables for data
- Functional rather than warm
- But still: no dark mode, keep it clean

---

## Assets Needed

### Before Launch
- [ ] Logo/wordmark (if applicable)
- [ ] Favicon (simple, works small)
- [ ] Open Graph image (1200x630px)
- [ ] Photo of Mama and Papa (optional, pending approval)

### Fonts
- [ ] Lora (Google Fonts) — weights 400, 500, 600
- [ ] JetBrains Mono (Google Fonts) — weight 600

---

## Accessibility Requirements

- Color contrast: minimum 4.5:1 for body text
- Color contrast: minimum 3:1 for large text and UI components
- Touch targets: minimum 44x44px
- Focus states visible on all interactive elements
- Don't rely on color alone to communicate state

---

## Design Deliverables

1. **Figma/Design File** with:
   - Color and typography tokens
   - Component library (buttons, inputs, cards)
   - Page layouts for: Homepage, Intake Form, Booking Page, Success Page
   - Admin page layouts (Dashboard, Tables)

2. **Assets Export:**
   - Favicon (16, 32, 180, 192, 512px)
   - OG image
   - Any illustrations/icons in SVG

3. **Documentation:**
   - This file serves as the living style guide
   - Update as decisions are made

---

## Sample Copy Tone (For Designer Context)

The copy style affects design choices. Here's the tone:

**Not this:** "Get started in 3 easy steps!"

**This:** "Here's how it works."

**Not this:** "Our certified prayer counselors are standing by."

**This:** "Mama and Papa have spent 40 years listening, encouraging, and praying with people. They'd love to meet you."

**Not this:** "Book your FREE session now!"

**This:** "When you're ready, pick a time that works for you."

---

*Questions? See ux.md for user flows or build.md for full product context.*
