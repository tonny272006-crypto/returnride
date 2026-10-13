# ReturnRide (Return Ride Token)

A production-quality, responsive landing page for **Return Ride Token** built with the clean, confident, minimal visual language inspired by modern mobility design systems.

---

## 🚀 Running Locally

Because this project is built as a pure, zero-dependency static site with semantic HTML5, CSS custom properties, and vanilla JavaScript, you can run it immediately using any local web server:

### Option 1: Python HTTP server
```bash
python3 -m http.server 8000
```
Then open `http://localhost:8000` in your web browser.

### Option 2: Node.js (npx serve)
```bash
npx serve .
```

### Option 3: Direct File Opening
You can double-click `index.html` to open it directly in modern browsers (Chrome, Safari, Firefox, Edge).

---

## ⚙️ Configuration & Customization (`config.js`)

All critical business variables, endpoints, and placeholders are consolidated into **`config.js`** as the single source of truth:

```javascript
const CONFIG = {
  brandName: "ReturnRide",              // Working brand name (updates navigation, cards, footer)
  legalName: "Return Ride Token",        // Product full name
  tagline: "Don't wait for a shared ride. Start one.",
  pitch: "A token-based return-ride system where students join pre-created rides and the ride activates automatically when enough passengers sign up.",
  contactEmail: "hello@returnride.app",  // Contact address in footer and links
  formEndpoint: "/api/pilot-signup",     // Backend intake endpoint (mocked locally)
  pilotCampus: "Select initial campus (Pilot Launch)",
  year: 2026,
  analyticsEnabled: false,               // Privacy-friendly analytics flag
  analyticsId: "PLAUSIBLE_OR_FATHOM_ID_PLACEHOLDER"
};
```

### How to rename the brand
Edit `brandName` in `config.js`. The script will update all marked instances (`.js-brand-name`) across the entire page automatically upon DOM load.

### How to change the form submission endpoint
Update `formEndpoint` in `config.js` with your production API route (e.g. AWS Lambda, Cloudflare Worker, Supabase, or Formspree). If running offline or on a static server, the local mock fallback will handle the UI gracefully.

---

## 📋 Launch Checklist (Placeholders to Replace Before Launch)

Before taking this site to production with real student users, verify the following:

1. **`formEndpoint` in `config.js`**: Point to an authenticated backend route or mailing list provider.
2. **`contactEmail` in `config.js`**: Replace `hello@returnride.app` with your team's monitored inbox.
3. **`og-preview.png`**: Add a 1200x630px social graph preview image in the root directory for rich link previews on iMessage, Slack, and WhatsApp.
4. **`canonical link` & `og:url` in `index.html`**: Replace `https://returnride.app/` with your final registered production domain.
5. **Analytics**: If using privacy-first analytics (like Plausible or Fathom), flip `analyticsEnabled: true` in `config.js` and provide your site domain or tracking script in `index.html`.

---

## 🎨 Design System Specifications

- **Color tokens**:
  - `--ink`: `#000000` (text, primary buttons, footer)
  - `--paper`: `#FFFFFF` (page surface)
  - `--panel`: `#F3F3F3` (alternate cards and sections)
  - `--line`: `#E2E2E2` (borders)
  - `--muted`: `#545454` (secondary body text)
  - `--brand`: `#0F766E` (teal, reserved strictly for seat progress, hover links, and status highlights)
  - `--signal`: `#FFC933` (yellow, reserved for the pilot call-out badge)
- **Typography**: Inter (Google Fonts) with native system fallbacks; sentence case throughout; line length limited to `< 70ch`.
- **Breakpoints**: 360px, 768px, 900px, 1024px, 1440px.
- **Accessibility**: WCAG AA color contrast, visible focus rings, ARIA labels for accordion and mobile navigation, skip navigation link, and `prefers-reduced-motion` compliance.
