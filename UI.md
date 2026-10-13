# ReturnRide UI Input & Design Specification Guide (`UI.md`)

This document is the engineering and product design reference for **ReturnRide** (*Return Ride Token*). It details all configurable inputs, design tokens, interactive component states, form validation schemas, and guidelines for adapting the landing page.

---

## 1. Quick Config Reference (`config.js`)

All primary text, currency, demo values, and backend connections are configured in `config.js`. You do not need to touch HTML or CSS to change these inputs.

| Parameter | Type | Default Value | Description |
| :--- | :--- | :--- | :--- |
| `brandName` | `string` | `"ReturnRide"` | Working brand name displayed in the navbar, demo app bar, and footer. |
| `productName` | `string` | `"Return Ride Token"` | Official product name used in comparison cards and copy. |
| `siteUrl` | `string` | `"https://returnride.app/"` | Production URL used for canonical link and Open Graph metadata. |
| `contactEmail` | `string` | `"hello@returnride.app"` | Contact email updated across all `mailto:` links in footer and dialogs. |
| `copyrightYear` | `number` | `2026` | Copyright year rendered in footer meta. |
| `currency.code` | `string` | `"INR"` | ISO 4217 currency code (e.g., `"INR"`, `"USD"`, `"EUR"`, `"GBP"`). |
| `currency.locale`| `string` | `"en-IN"` | BCP 47 locale format (e.g., `"en-IN"`, `"en-US"`, `"en-GB"`). |
| `calculator.defaultFare` | `number` | `600` | Initial numeric fare shown in the interactive calculator. |
| `calculator.defaultSeats`| `number` | `4` | Initial seat count on the calculator range slider. |
| `calculator.minSeats` | `number` | `2` | Minimum passengers allowed for a ride token. |
| `calculator.maxSeats` | `number` | `5` | Maximum passengers allowed for a ride token. |
| `demo.destination` | `string` | `"Central railway station"` | Destination shown inside the hero phone mockup. |
| `demo.departure` | `string` | `"Sun, 5:30 pm"` | Scheduled departure time displayed in the demo. |
| `demo.totalFare` | `number` | `600` | Total trip cost used for the hero demo fare split. |
| `demo.seatsNeeded` | `number` | `4` | Total seats required to trigger automatic activation. |
| `demo.alreadyJoined` | `number` | `2` | Initial seat fill count before user taps "Join My Ride". |
| `demo.resetSeconds` | `number` | `4` | Countdown in seconds before the demo resets to initial state. |
| `formEndpoint` | `string` | `"/api/pilot-signup"` | API endpoint for lead capture submissions. |
| `useMockSubmit` | `boolean` | `true` | `true` simulates 200 OK locally. Set to `false` for real API calls. |
| `analytics.enabled` | `boolean` | `false` | Enables privacy-friendly tracking when set to `true`. |
| `analytics.provider`| `string` | `"plausible"` | Supported providers: `"plausible"` or `"fathom"`. |
| `analytics.siteId` | `string` | `""` | Tracking domain or site ID. |

---

## 2. Design System Tokens (`styles.css`)

The visual language follows the clean, confident, minimal style of Uber’s website: 90% monochrome balance, with teal and yellow used strictly for semantic emphasis.

### Color Tokens

```css
:root {
  /* Light Mode */
  --ink: #000000;         /* Primary headings, primary buttons, footer surface */
  --paper: #FFFFFF;       /* Background canvas */
  --panel: #F3F3F3;       /* Secondary section background, cards, inputs */
  --line: #E2E2E2;        /* Borders and dividers */
  --muted: #545454;       /* Secondary text, subheadings, labels */
  --brand: #0F766E;       /* Deep teal: seat progress, link underlines, focus rings */
  --on-brand: #FFFFFF;    /* Text on brand teal buttons */
  --signal: #FFC933;      /* Yellow: pilot status badge and final CTA accent */
  --on-signal: #000000;   /* Text on yellow badge */
  --danger: #B42318;      /* Validation error messages and input outlines */
  --success-bg: #ECFDF3;  /* Form submission confirmation background */
  --success-ink: #05603A; /* Form submission confirmation text */
}

@media (prefers-color-scheme: dark) {
  :root {
    /* Dark Mode (High-contrast inversion) */
    --ink: #FFFFFF;
    --paper: #0D0D0D;
    --panel: #181818;
    --line: #2E2E2E;
    --muted: #B0B0B0;
    --brand: #2DD4BF;     /* Brighter teal for WCAG AA readability on dark canvas */
    --on-brand: #00201C;
    --danger: #FF8A80;
    --success-bg: #0F2A1E;
    --success-ink: #8EE6B4;
    --invert-bg: #FFFFFF; /* Ensures emphasized compare card stays high contrast */
    --invert-ink: #000000;
  }
}
```

### Typography Scale

- **Typeface:** Inter (Google Fonts) with system fallbacks (`-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `Roboto`, `sans-serif`).
- **Hero Title:** `clamp(40px, 6vw, 80px)`, weight `700`, line-height `1.05`, tracking `-0.03em`.
- **Section Titles:** `clamp(32px, 4vw, 48px)`, weight `700`, line-height `1.1`.
- **Problem Statement:** `clamp(32px, 4.6vw, 60px)`, weight `700`.
- **Body Text:** `18px`, line-height `1.55`, maximum line length `< 65ch`.
- **Case Rule:** Strict sentence case across all headings, buttons, and badges.

### Component Geometries

- **Buttons:** Fully rounded pills (`border-radius: 999px`), height `48px` (desktop) / `40px` (nav pill) / `52px` (hero submit).
- **Cards:** `16px` border-radius, `1px solid var(--line)`, no drop-shadows.
- **Inputs:** `12px` border-radius, `1.5px solid var(--line)`, height `48px`.
- **Focus Rings:** `3px solid var(--brand)` with `3px` offset.

---

## 3. Form Input Specifications & Payloads

The landing page features two lead capture forms:
1. **Hero Form:** Quick college email capture for immediate conversion.
2. **Final CTA Form:** Complete qualification capture (email, college name, student role).

### Field Validations

| Input Name | HTML Type | Required | Client Validation Rule | Error Message |
| :--- | :--- | :--- | :--- | :--- |
| `email` | `email` | Yes | Must match `^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$` | *"That email address looks incomplete. Check for a missing @ or domain."* |
| `college` | `text` | Yes (Final Form) | Non-empty string after `.trim()` | *"Enter your college name so we know which campus to open first."* |
| `intent` | `select` | Yes (Final Form) | Options: `ride`, `offer`, `both` | N/A (defaults to `"ride"`) |
| `website` | `text` | No (Honeypot) | Must remain blank. If filled, submission is silently suppressed. | N/A |

### JSON Submission Payload

When submitted, forms send a standard `POST` request to `CONFIG.formEndpoint`:

```json
{
  "email": "student@college.edu",
  "college": "State Technical University",
  "intent": "ride",
  "source": "final",
  "submittedAt": "2026-10-14T00:15:00.000Z"
}
```

### Form States & Feedback

- **Default:** Clean input with visible label above.
- **Dirty & Invalid:** Red border (`--danger`) and live text rendered into `aria-describedby` target.
- **Submitting:** Button disabled, text switches to `"Sending…"`.
- **Success:** Form is replaced with an accessible `<div role="status" tabindex="-1">` banner:
  > *"You're on the list. We'll email you when the pilot opens at your campus."*
- **Network Failure:** Button re-enables, inline error alert appears informing user of the issue and providing fallback contact email.

---

## 4. Section Structure & Visual Hierarchy

1. **Navigation (`.site-header`):**
   - Sticky bar with frosted blur on scroll (`.is-scrolled`).
   - Brand wordmark left, links center (`#how-it-works`, `#safety`, `#faq`), Dark/Light mode theme toggle pill, and `"Join the pilot"` pill right.
   - Collapses to accessible hamburger toggle (`aria-expanded`) below `900px`.
2. **Hero (`.hero`):**
   - Split layout: headline, subhead, CTA buttons, authentic 3-pillar trust strip (`Verified campus email`, `Auto-activation`, `Zero coordination`), email field, and student trust line.
   - Right: Interactive CSS phone mockup with iOS status bar (`9:41`), route switcher tabs (`Station Express` / `Airport Split`), stylized vector route map with pulsing beacon, real-time seat claiming, and automatic confirmation.
3. **Problem Statement (`.problem`):**
   - High-impact editorial headline: *"You know when you're going back. You just can't find enough people to go with you."*
   - Three bold pain points with black hairline rule tops.
4. **How It Works (`.section-alt` / `#how-it-works`):**
   - Six sequential steps with high-fidelity, Uber-grade app UI previews:
     - **Step 1 (Create token):** Native trip creation screen with vertical pickup/dropoff track (Campus Gate 2 → Central Station), departure chip, seat capacity counter, and transparent fare per seat preview.
     - **Step 2 (Share token):** Campus live feed view with radar pulse beacon dot, active token card showing 1/4 seat progress, host avatar, open `+` slots, and nearby routes.
     - **Step 3 (Tap Join):** Interactive passenger roster with verified student roll numbers, host badge, instant teal seat reservation (`You (Seat 3)`), and one-tap reservation pill.
     - **Step 4 (Auto-activate):** Confirmed ride state with green celebration badge, 4-digit driver PIN matching code (`8492`), and full passenger cluster.
     - **Step 5 (Fare split):** Uber-style digital receipt card detailing total cab fare, student divisor count, large automatic share (`₹150`), and automated split confirmation.
     - **Step 6 (Cancel if needed):** Transparent token status card with "Not activated yet" status badge, zero-penalty cancellation guarantee note, and safe cancel button.
   - Desktop: Sticky phone mockup synchronizes to each step on scroll via `IntersectionObserver` or direct click on any step card.
   - Mobile: Step cards display inline phone frames for zero-friction stacked reading.
5. **Why It's Different (`.compare`):**
   - Two cards side by side with pill eyebrow tags: *"The old way"* (light card) vs *"Return Ride Token"* (high-contrast inverted card).
6. **Features Grid (`.grid-4`):**
   - Numbered index headers (`01`, `02`, `03`, `04`): Passenger-led, Auto activation, Fair fares, Less waiting with 24px inline SVG outline icons.
7. **Fare Split Calculator (`.calc`):**
   - One-click route preset pills (`Station ₹600`, `Bus Stand ₹350`, `Airport ₹1,200`).
   - Total fare input + passenger range slider (2–5 seats).
   - Dynamic visual seat avatars (`Host` + `Riders`) updating live with divided shares.
   - Real-time live division with `Math.ceil` ceiling rounding to guarantee full fare coverage.
8. **Safety & Trust (`#safety`):**
   - Four clear safety protocols with honest `"Planned for pilot"` badges.
9. **Who It's For (`.grid-2`):**
   - Tailored cards for riders heading home and drivers/cab-bookers with spare seats.
10. **Pitch Deck Presentation (`#pitch-deck`):**
    - Complete 10-slide deck integration directly on the main page, styled with the Uber minimal monochrome design language.
    - **Navigation:** Header navbar pill (`Pitch deck`), footer link, and 10 horizontal slide tabs (`Cover`, `01 Opportunity`, `02 Who It Serves`, `03 Solution`, `04 Experience`, `05 Why This Approach`, `06 Prove The Need`, `07 Sustainable Growth`, `08 Execution Plan`, `09 The Vision`).
    - **Display Modes:** Single-slide presentation canvas with progress bar and prev/next controls (supports left/right arrow keys) + one-click toggle to an **Executive All-10-Slides Grid View**.
    - Covers problem statements, 4 coordination gaps, target student segments, digital token creation flow, head-to-head comparison, pilot metrics, business model, and 4-phase roadmap.
11. **FAQ Accordion (`#faq`):**
    - Keyboard-accessible (`Enter`, `Space`, `ArrowUp`, `ArrowDown`, `Home`, `End`).
    - Standard WAI-ARIA pattern (`aria-expanded`, `aria-controls`, `role="region"`).
11. **Final Call to Action (`#join`):**
    - Large panel with yellow brand accent bar. Multi-field early access application form with one-click WhatsApp viral referral share on completion.
12. **Footer (`.footer`):**
    - Black background, white text. Categorized links (`Product`, `Company`, `Legal`), student copyright, and contact email.
    - Native `<dialog>` modal for Privacy and Terms.

---

## 5. Testing & Verification

Run the test suite at any time:

```bash
npm test
```

This verifies:
- Mathematical accuracy of `calculateFareSplit` (including fractional cent rounding).
- Rejection of invalid fares (zero, negative, non-numeric).
- RFC 5322 email regex validation.
- International currency formatting across multiple locales (`en-IN`, `en-US`, `en-GB`).
