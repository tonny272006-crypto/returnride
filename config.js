/**
 * ReturnRide site configuration.
 * Everything that may change before launch lives here.
 * Items marked PLACEHOLDER must be replaced before going live (see README).
 */
const CONFIG = {
  // Brand
  brandName: "ReturnRide",            // Working brand name. Renames nav, footer, demo, title and meta.
  productName: "Return Ride Token",   // Product name used in body copy.
  siteUrl: "https://returnride.app/", // PLACEHOLDER: final production URL (canonical + Open Graph).
  contactEmail: "hello@returnride.app", // PLACEHOLDER: a monitored inbox.
  copyrightYear: 2026,

  // Forms
  formEndpoint: "/api/pilot-signup",  // PLACEHOLDER: real endpoint that accepts JSON POST.
  useMockSubmit: true,                // true = fake success locally, no network call. Set false at launch.
  mockSubmitDelayMs: 900,
  requestTimeoutMs: 10000,

  // Money. Change currency to match your campus.
  currency: { code: "INR", locale: "en-IN" },

  // Fare calculator defaults
  calculator: { defaultFare: 600, defaultSeats: 4, minSeats: 2, maxSeats: 5 },

  // Hero phone demo (illustrative example, not real data)
  demo: {
    destination: "Central railway station",
    departure: "Sun, 5:30 pm",
    totalFare: 600,
    seatsNeeded: 4,
    alreadyJoined: 2,
    resetSeconds: 4
  },

  // Privacy-friendly analytics. Off by default. No tracking code loads unless enabled.
  analytics: {
    enabled: false,
    provider: "plausible",           // PLACEHOLDER: "plausible" or "fathom"
    siteId: ""                       // PLACEHOLDER: Plausible domain or Fathom site ID
  }
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = CONFIG;
}
