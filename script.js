/**
 * ReturnRide page behaviour.
 * Pure helpers (calculateFareSplit, validateEmail, formatMoney) are exported for
 * Node tests. Everything below the DOM guard only runs in the browser.
 */
(function () {
  "use strict";

  /* ================= Pure helpers (unit tested) ================= */

  /**
   * Split a fare between passengers. Rounds each share UP to the nearest
   * hundredth so the shares always cover the full fare.
   * @param {number|string} totalFare
   * @param {number|string} seats
   * @returns {{ok: true, perPerson: number, total: number, seats: number} | {ok: false, error: "fare"|"seats"}}
   */
  function calculateFareSplit(totalFare, seats) {
    const fare = Number(totalFare);
    const n = Number(seats);
    if (totalFare === "" || !Number.isFinite(fare) || fare <= 0) return { ok: false, error: "fare" };
    if (!Number.isInteger(n) || n < 1) return { ok: false, error: "seats" };
    const cents = Math.round(fare * 100);
    const perPerson = Math.ceil(cents / n) / 100;
    return { ok: true, perPerson: perPerson, total: cents / 100, seats: n };
  }

  /** Practical email check: something@domain.tld, no spaces. */
  function validateEmail(value) {
    return /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/.test(String(value).trim());
  }

  /** Format money with Intl; drops decimals for whole amounts. */
  function formatMoney(amount, currency) {
    const cur = currency || { code: "INR", locale: "en-IN" };
    const whole = Math.abs(amount % 1) < 1e-9;
    return new Intl.NumberFormat(cur.locale, {
      style: "currency",
      currency: cur.code,
      minimumFractionDigits: whole ? 0 : 2,
      maximumFractionDigits: whole ? 0 : 2
    }).format(amount);
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = { calculateFareSplit: calculateFareSplit, validateEmail: validateEmail, formatMoney: formatMoney };
  }
  if (typeof document === "undefined") return;

  /* ================= Browser ================= */

  const C = typeof CONFIG !== "undefined" ? CONFIG : {};
  const money = (n) => formatMoney(n, C.currency);
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* ---------- Config -> page ---------- */
  function applyConfig() {
    const brand = C.brandName || "ReturnRide";
    $$(".js-brand").forEach((el) => { el.textContent = brand; });
    if (C.productName) $$(".js-product").forEach((el) => { el.textContent = C.productName; });
    if (C.contactEmail) {
      $$(".js-email-href").forEach((el) => el.setAttribute("href", "mailto:" + C.contactEmail));
      $$(".js-email-text").forEach((el) => { el.textContent = C.contactEmail; });
    }
    if (C.copyrightYear) $$(".js-year").forEach((el) => { el.textContent = C.copyrightYear; });

    // Currency symbol in calculator label
    try {
      const parts = new Intl.NumberFormat(C.currency.locale, { style: "currency", currency: C.currency.code }).formatToParts(0);
      const sym = parts.find((p) => p.type === "currency");
      if (sym) $$(".js-currency-symbol").forEach((el) => { el.textContent = sym.value; });
    } catch (e) { /* keep default symbol */ }

    // Head metadata (so a rename only needs config.js)
    document.title = document.title.replace(/ReturnRide/g, brand);
    $$('meta[property^="og:"], meta[name="twitter:title"]').forEach((m) => {
      const v = m.getAttribute("content");
      if (v) m.setAttribute("content", v.replace(/ReturnRide/g, brand));
    });
    if (C.siteUrl) {
      const canon = $('link[rel="canonical"]');
      if (canon) canon.href = C.siteUrl;
      const ogUrl = $('meta[property="og:url"]');
      if (ogUrl) ogUrl.content = C.siteUrl;
    }
    const schema = $("#orgSchema");
    if (schema) {
      try {
        const data = JSON.parse(schema.textContent);
        data.name = brand;
        if (C.siteUrl) data.url = C.siteUrl;
        if (C.contactEmail) data.email = C.contactEmail;
        schema.textContent = JSON.stringify(data);
      } catch (e) { /* leave static schema */ }
    }
  }

  /* ---------- Navigation ---------- */
  function initNav() {
    const header = $(".site-header");
    const toggle = $("#navToggle");
    const menu = $("#navMenu");
    const themeToggle = $("#themeToggle");

    // Theme switcher
    if (themeToggle) {
      const saved = localStorage.getItem("rr-theme");
      if (saved) document.documentElement.setAttribute("data-theme", saved);

      themeToggle.addEventListener("click", () => {
        const isDark = document.documentElement.getAttribute("data-theme") === "dark" ||
          (!document.documentElement.getAttribute("data-theme") && window.matchMedia("(prefers-color-scheme: dark)").matches);
        const next = isDark ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", next);
        localStorage.setItem("rr-theme", next);
      });
    }

    if (!toggle || !menu) return;

    const setOpen = (open) => {
      toggle.setAttribute("aria-expanded", String(open));
      menu.classList.toggle("is-open", open);
    };

    toggle.addEventListener("click", () => setOpen(toggle.getAttribute("aria-expanded") !== "true"));
    menu.addEventListener("click", (e) => { if (e.target.closest("a")) setOpen(false); });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && menu.classList.contains("is-open")) { setOpen(false); toggle.focus(); }
    });
    document.addEventListener("click", (e) => {
      if (menu.classList.contains("is-open") && !e.target.closest(".site-header")) setOpen(false);
    });
    window.matchMedia("(min-width: 901px)").addEventListener("change", (mq) => { if (mq.matches) setOpen(false); });

    const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    // Uber-style widget tabs
    const tabJoin = $("#widgetTabJoin");
    const tabOffer = $("#widgetTabOffer");
    if (tabJoin && tabOffer) {
      tabJoin.addEventListener("click", () => {
        tabJoin.classList.add("is-active");
        tabOffer.classList.remove("is-active");
        tabJoin.setAttribute("aria-selected", "true");
        tabOffer.setAttribute("aria-selected", "false");
      });
      tabOffer.addEventListener("click", () => {
        tabOffer.classList.add("is-active");
        tabJoin.classList.remove("is-active");
        tabOffer.setAttribute("aria-selected", "true");
        tabJoin.setAttribute("aria-selected", "false");
      });
    }
  }

  /* ---------- Hero demo ---------- */
  function initDemo() {
    let d = Object.assign({ destination: "Central railway station", departure: "Sun, 5:30 pm", totalFare: 600, seatsNeeded: 4, alreadyJoined: 2, resetSeconds: 4 }, C.demo);
    const el = {
      badge: $("#demoBadge"), card: $("#demoCard"), confirmed: $("#demoConfirmed"),
      count: $("#demoCount"), progress: $("#demoProgress"), fill: $("#demoFill"),
      seats: $("#demoSeats"), share: $("#demoShare"), join: $("#demoJoin"), hint: $("#demoHint"),
      split: $("#demoSplit"), splitNote: $("#demoSplitNote"), confirmedText: $("#demoConfirmedText"),
      timer: $("#demoTimer"), live: $("#demoLive"), dest: $("#demoDestination"), dep: $("#demoDeparture"),
      mapEta: $("#demoMapEta"),
      tabStation: $("#routeTabStation"), tabAirport: $("#routeTabAirport")
    };
    if (!el.join) return;

    let timers = [];
    let joined = d.alreadyJoined;
    let youJoined = false;

    const clearTimers = () => { timers.forEach(clearTimeout); timers = []; };
    const later = (fn, ms) => timers.push(setTimeout(fn, ms));
    const announce = (msg) => { if (el.live) el.live.textContent = msg; };

    function syncRouteData() {
      const split = calculateFareSplit(d.totalFare, d.seatsNeeded);
      const share = split.ok ? money(split.perPerson) : "";
      el.dest.textContent = d.destination;
      el.dep.textContent = d.departure;
      el.share.textContent = share;
      el.progress.setAttribute("aria-valuemax", d.seatsNeeded);
      return share;
    }

    function renderSeats() {
      const left = d.seatsNeeded - joined;
      el.count.textContent = joined + " of " + d.seatsNeeded;
      el.fill.style.width = (joined / d.seatsNeeded) * 100 + "%";
      el.progress.setAttribute("aria-valuenow", joined);
      el.badge.textContent = left > 0 ? left + (left === 1 ? " seat left" : " seats left") : "Confirmed";
      el.badge.classList.toggle("is-done", left <= 0);

      const chips = [];
      for (let i = 0; i < d.seatsNeeded; i++) {
        if (i === 0) chips.push('<li class="seat-chip is-filled">Host</li>');
        else if (youJoined && i === d.alreadyJoined) chips.push('<li class="seat-chip is-you">You</li>');
        else if (i < joined) chips.push('<li class="seat-chip is-filled">Student</li>');
        else chips.push('<li class="seat-chip">Open seat</li>');
      }
      el.seats.innerHTML = chips.join("");
    }

    function reset() {
      clearTimers();
      const hadFocus = el.confirmed.contains(document.activeElement) || document.activeElement === document.body;
      joined = d.alreadyJoined;
      youJoined = false;
      el.confirmed.hidden = true;
      el.card.hidden = false;
      el.join.disabled = false;
      el.join.textContent = "Join My Ride";
      el.hint.textContent = "Try it: tap Join My Ride.";
      syncRouteData();
      renderSeats();
      if (hadFocus && el.join.dataset.used) el.join.focus({ preventScroll: true });
    }

    function confirm() {
      el.card.hidden = true;
      el.confirmed.hidden = false;
      const split = calculateFareSplit(d.totalFare, d.seatsNeeded);
      const share = split.ok ? money(split.perPerson) : "";
      el.split.textContent = share;
      el.splitNote.textContent = money(d.totalFare) + " fare split between " + d.seatsNeeded + " passengers";
      el.confirmedText.textContent = "All " + d.seatsNeeded + " seats filled. Your ride is on.";
      announce("Ride confirmed. Your share is " + share + ".");
      let left = d.resetSeconds;
      el.timer.textContent = left;
      const tick = () => {
        left -= 1;
        el.timer.textContent = Math.max(left, 0);
        if (left <= 0) reset(); else later(tick, 1000);
      };
      later(tick, 1000);
    }

    // Route Switcher Tabs
    if (el.tabStation && el.tabAirport) {
      el.tabStation.addEventListener("click", () => {
        el.tabStation.classList.add("is-active");
        el.tabAirport.classList.remove("is-active");
        if (el.mapEta) el.mapEta.textContent = "Campus Gate 2 → Station (22 min)";
        d = Object.assign({}, C.demo, { destination: "Central railway station", departure: "Sun, 5:30 pm", totalFare: 600, seatsNeeded: 4, alreadyJoined: 2 });
        reset();
      });

      el.tabAirport.addEventListener("click", () => {
        el.tabAirport.classList.add("is-active");
        el.tabStation.classList.remove("is-active");
        if (el.mapEta) el.mapEta.textContent = "Hostel 7 → Airport (45 min)";
        d = Object.assign({}, C.demo, { destination: "Terminal 2 Airport", departure: "Fri, 2:00 pm", totalFare: 1200, seatsNeeded: 3, alreadyJoined: 1 });
        reset();
      });
    }

    el.join.addEventListener("click", () => {
      if (el.join.disabled) return;
      el.join.dataset.used = "1";
      el.join.disabled = true;
      el.join.textContent = "Joining…";
      later(() => {
        youJoined = true;
        joined += 1;
        renderSeats();
        el.join.textContent = "You're in";
        el.hint.textContent = joined < d.seatsNeeded ? "Waiting for the last seat…" : "";
        announce("You joined. " + joined + " of " + d.seatsNeeded + " seats filled.");
        const fillNext = () => {
          if (joined < d.seatsNeeded) {
            joined += 1;
            renderSeats();
            later(fillNext, 700);
          } else {
            later(confirm, 500);
          }
        };
        later(fillNext, 900);
      }, 450);
    });

    reset();
  }

  /* ---------- How it works ---------- */
  function stepScreens() {
    const fare = (C.demo && C.demo.totalFare) || 600;
    const n = (C.demo && C.demo.seatsNeeded) || 4;
    const dest = esc((C.demo && C.demo.destination) || "Central railway station");
    const dep = esc((C.demo && C.demo.departure) || "Sun, 5:30 pm");
    const s = calculateFareSplit(fare, n);
    const each = s.ok ? money(s.perPerson) : "";

    return {
      1: '<div class="screen step-screen-view">' +
         '<div class="screen-top-bar">' +
           '<span class="screen-badge">Create Ride Token</span>' +
           '<span class="screen-meta-time">Step 1 of 6</span>' +
         '</div>' +
         '<div class="route-box">' +
           '<div class="route-track-icon" aria-hidden="true">' +
             '<span class="route-point-start"></span>' +
             '<span class="route-line-v"></span>' +
             '<span class="route-point-end"></span>' +
           '</div>' +
           '<div class="route-inputs-display">' +
             '<div class="route-input-row">' +
               '<span class="input-tiny-label">Pickup location</span>' +
               '<strong class="input-val-text">Campus Gate 2</strong>' +
             '</div>' +
             '<div class="route-input-divider"></div>' +
             '<div class="route-input-row">' +
               '<span class="input-tiny-label">Destination</span>' +
               '<strong class="input-val-text">' + dest + '</strong>' +
             '</div>' +
           '</div>' +
         '</div>' +
         '<div class="screen-grid-2">' +
           '<div class="screen-chip-card">' +
             '<span class="screen-chip-label">Departure</span>' +
             '<strong class="screen-chip-val">' + dep + '</strong>' +
           '</div>' +
           '<div class="screen-chip-card">' +
             '<span class="screen-chip-label">Available seats</span>' +
             '<strong class="screen-chip-val">' + n + ' seats</strong>' +
           '</div>' +
         '</div>' +
         '<div class="screen-fare-preview">' +
           '<div class="fare-preview-left">' +
             '<span class="screen-chip-label">Agreed fare</span>' +
             '<span class="fare-preview-total">' + money(fare) + '</span>' +
           '</div>' +
           '<div class="fare-preview-right">' +
             '<span class="fare-per-tag">' + each + ' / seat</span>' +
           '</div>' +
         '</div>' +
         '<div class="screen-action-btn">Create token</div>' +
         '<p class="screen-action-note">Auto-activates when all ' + n + ' seats fill</p>' +
         '</div>',

      2: '<div class="screen step-screen-view">' +
         '<div class="screen-top-bar">' +
           '<div class="live-pulse-badge">' +
             '<span class="live-dot"></span>' +
             '<span>Campus Feed &bull; Live</span>' +
           '</div>' +
           '<span class="screen-meta-time">Gate 2</span>' +
         '</div>' +
         '<div class="feed-active-card highlight-card">' +
           '<div class="feed-card-header">' +
             '<span class="feed-tag signal">Active token</span>' +
             '<span class="feed-time">' + dep + '</span>' +
           '</div>' +
           '<strong class="feed-dest">' + dest + '</strong>' +
           '<div class="feed-seat-status">' +
             '<div class="feed-progress-wrap">' +
               '<div class="progress"><div class="progress-fill" style="width:' + (1 / n) * 100 + '%"></div></div>' +
             '</div>' +
             '<span class="feed-count-text"><strong>1 of ' + n + '</strong> joined</span>' +
           '</div>' +
           '<div class="feed-avatar-row">' +
             '<span class="mini-avatar is-host">Host</span>' +
             '<span class="mini-avatar is-empty">+</span>' +
             '<span class="mini-avatar is-empty">+</span>' +
             '<span class="mini-avatar is-empty">+</span>' +
           '</div>' +
           '<div class="screen-btn-sm brand">Join My Ride &bull; ' + each + '</div>' +
         '</div>' +
         '<div class="feed-compact-card">' +
           '<div class="feed-card-header">' +
             '<span class="feed-tag">Airport Express</span>' +
             '<span class="feed-time">Sun, 7:00 pm</span>' +
           '</div>' +
           '<div class="feed-seat-status">' +
             '<div class="progress"><div class="progress-fill" style="width:66%"></div></div>' +
             '<span class="feed-count-text">2 of 3 joined</span>' +
           '</div>' +
         '</div>' +
         '<p class="screen-action-note">Nearby verified students can view and join</p>' +
         '</div>',

      3: '<div class="screen step-screen-view">' +
         '<div class="screen-top-bar">' +
           '<span class="screen-badge">Token #RR-8492</span>' +
           '<span class="screen-meta-time">' + dep + '</span>' +
         '</div>' +
         '<div class="step-target-card">' +
           '<div class="target-title-row">' +
             '<div>' +
               '<span class="input-tiny-label">Destination</span>' +
               '<h4 class="target-dest-title">' + dest + '</h4>' +
             '</div>' +
             '<span class="seat-badge-pill teal">3 of ' + n + ' joined</span>' +
           '</div>' +
           '<div class="progress"><div class="progress-fill" style="width:' + (3 / n) * 100 + '%"></div></div>' +
           '<div class="roster-list">' +
             '<div class="roster-item">' +
               '<span class="mini-avatar is-host">AS</span>' +
               '<div class="roster-info">' +
                 '<span class="roster-name">Akash S. (Host)</span>' +
                 '<span class="roster-sub">Roll #21B &bull; Verified student</span>' +
               '</div>' +
               '<span class="roster-check">&#10003;</span>' +
             '</div>' +
             '<div class="roster-item">' +
               '<span class="mini-avatar">RM</span>' +
               '<div class="roster-info">' +
                 '<span class="roster-name">Riya M.</span>' +
                 '<span class="roster-sub">Roll #22E &bull; Verified student</span>' +
               '</div>' +
               '<span class="roster-check">&#10003;</span>' +
             '</div>' +
             '<div class="roster-item is-you-item">' +
               '<span class="mini-avatar is-you">You</span>' +
               '<div class="roster-info">' +
                 '<span class="roster-name">You (Seat 3)</span>' +
                 '<span class="roster-sub">Reserved with 1 tap</span>' +
               '</div>' +
               '<span class="roster-badge-you">Joined</span>' +
             '</div>' +
           '</div>' +
         '</div>' +
         '<div class="screen-btn-confirmed">' +
           '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>' +
           '<span>Seat reserved &bull; ' + each + '</span>' +
         '</div>' +
         '<p class="screen-action-note">1 seat needed &bull; No charge until confirmed</p>' +
         '</div>',

      4: '<div class="screen step-screen-view">' +
         '<div class="activate-celebrate-card">' +
           '<div class="activate-icon-circle">' +
             '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>' +
           '</div>' +
           '<h4 class="activate-title">Ride Confirmed!</h4>' +
           '<p class="activate-sub">Required count reached &bull; Activated automatically</p>' +
         '</div>' +
         '<div class="driver-match-box">' +
           '<div class="match-head">' +
             '<div class="match-pin-wrap">' +
               '<span class="match-pin-label">Ride Code</span>' +
               '<strong class="match-pin-val">8492</strong>' +
             '</div>' +
             '<span class="status-pill-ok">Cab Activated</span>' +
           '</div>' +
           '<div class="match-route-desc">' +
             '<span>Campus Gate 2 &rarr; ' + dest + '</span>' +
             '<span class="match-dep-time">' + dep + '</span>' +
           '</div>' +
         '</div>' +
         '<div class="confirmed-riders-row">' +
           '<span class="input-tiny-label">Confirmed Passengers</span>' +
           '<div class="avatars-cluster">' +
             '<span class="cluster-avatar is-host" title="Host">AS</span>' +
             '<span class="cluster-avatar" title="Riya">RM</span>' +
             '<span class="cluster-avatar is-you" title="You">You</span>' +
             '<span class="cluster-avatar" title="Dev">DK</span>' +
             '<span class="cluster-text">All ' + n + ' of ' + n + ' seats filled</span>' +
           '</div>' +
         '</div>' +
         '<p class="screen-action-note">Driver code shown to confirmed riders</p>' +
         '</div>',

      5: '<div class="screen step-screen-view">' +
         '<div class="screen-top-bar">' +
           '<span class="screen-badge">Fare Split</span>' +
           '<span class="screen-meta-time">Automated</span>' +
         '</div>' +
         '<div class="fare-receipt-card">' +
           '<div class="receipt-headline">' +
             '<span class="receipt-label">Your share</span>' +
             '<span class="receipt-amount">' + each + '</span>' +
             '<span class="receipt-formula">' + money(fare) + ' divided among ' + n + ' passengers</span>' +
           '</div>' +
           '<div class="receipt-divider"></div>' +
           '<div class="receipt-breakdown">' +
             '<div class="receipt-row">' +
               '<span>Agreed fare</span>' +
               '<strong>' + money(fare) + '</strong>' +
             '</div>' +
             '<div class="receipt-row">' +
               '<span>Confirmed passengers</span>' +
               '<strong>' + n + ' students</strong>' +
             '</div>' +
             '<div class="receipt-row highlight-row">' +
               '<span>Per person split</span>' +
               '<strong>' + each + '</strong>' +
             '</div>' +
           '</div>' +
         '</div>' +
         '<div class="split-assurance-box">' +
           '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>' +
           '<div>' +
             '<strong>Split automatically</strong>' +
             '<p>No awkward math or chasing classmates.</p>' +
           '</div>' +
         '</div>' +
         '<p class="screen-action-note">Each passenger pays their exact share directly</p>' +
         '</div>',

      6: '<div class="screen step-screen-view">' +
         '<div class="screen-top-bar">' +
           '<span class="screen-badge">Ride Status</span>' +
           '<span class="cancel-timer-chip">Not activated yet</span>' +
         '</div>' +
         '<div class="cancel-status-card">' +
           '<div class="cancel-card-head">' +
             '<div>' +
               '<span class="input-tiny-label">Destination</span>' +
               '<strong class="cancel-dest-text">' + dest + '</strong>' +
             '</div>' +
             '<span class="cancel-seats-tag">2 of ' + n + ' joined</span>' +
           '</div>' +
           '<div class="progress"><div class="progress-fill" style="width:' + (2 / n) * 100 + '%"></div></div>' +
           '<div class="cancel-notice-box">' +
             '<div class="cancel-notice-icon">&#9432;</div>' +
             '<p>Not enough passengers yet. You can cancel before the ride activates.</p>' +
           '</div>' +
         '</div>' +
         '<div class="cancel-actions-col">' +
           '<div class="screen-btn-cancel">Cancel token</div>' +
           '<span class="cancel-guarantee-note">Zero cancellation fee before activation</span>' +
         '</div>' +
         '</div>'
    };
  }

  function initSteps() {
    const steps = $$(".step");
    const stage = $("#stepStage");
    const pill = $("#stepPill");
    if (!steps.length || !stage) return;

    const screens = stepScreens();
    // Mobile: each step carries its own static screen.
    steps.forEach((step) => {
      const slot = $(".step-screen", step);
      if (slot) slot.innerHTML = screens[step.dataset.step];
    });

    let current = 0;
    function show(n) {
      if (n === current) return;
      current = n;
      steps.forEach((s) => s.classList.toggle("is-active", Number(s.dataset.step) === n));
      stage.innerHTML = screens[n];
      if (pill) pill.textContent = "Step " + n + " of " + steps.length;
    }
    show(1);

    steps.forEach((s) => {
      s.addEventListener("click", () => show(Number(s.dataset.step)));
    });

    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => { if (e.isIntersecting) show(Number(e.target.dataset.step)); });
      }, { rootMargin: "-45% 0px -50% 0px" });
      steps.forEach((s) => io.observe(s));
    }
  }

  /* ---------- Calculator ---------- */
  function initCalculator() {
    const fareEl = $("#calcFare");
    const seatsEl = $("#calcSeats");
    const seatsOut = $("#calcSeatsOut");
    const result = $("#calcResult");
    const err = $("#calcFareError");
    const visualSeats = $("#calcVisualSeats");
    const presetBtns = $$(".preset-btn");
    if (!fareEl || !seatsEl || !result) return;

    const cfg = Object.assign({ defaultFare: 600, defaultSeats: 4, minSeats: 2, maxSeats: 5 }, C.calculator);
    fareEl.value = cfg.defaultFare;
    seatsEl.min = cfg.minSeats;
    seatsEl.max = cfg.maxSeats;
    seatsEl.value = cfg.defaultSeats;

    function renderSeatAvatars(count) {
      if (!visualSeats) return;
      let html = "";
      for (let i = 0; i < count; i++) {
        const isHost = i === 0;
        html += '<div class="calc-seat-item">' +
          '<span class="calc-seat-circle ' + (isHost ? 'is-host' : 'is-rider') + '">' + (isHost ? 'Host' : 'R' + (i+1)) + '</span>' +
          '<span class="calc-seat-tag">' + (isHost ? 'Host' : 'Seat ' + (i+1)) + '</span>' +
          '</div>';
      }
      visualSeats.innerHTML = html;
    }

    function update() {
      const seats = Number(seatsEl.value);
      seatsOut.textContent = seats + " people";
      seatsEl.setAttribute("aria-valuetext", seats + " people");
      seatsEl.style.setProperty("--fill", ((seats - cfg.minSeats) / (cfg.maxSeats - cfg.minSeats)) * 100 + "%");
      renderSeatAvatars(seats);

      const r = calculateFareSplit(fareEl.value, seats);
      if (r.ok) {
        result.textContent = money(r.perPerson);
        result.classList.remove("is-empty");
        fareEl.removeAttribute("aria-invalid");
        err.textContent = "";
      } else {
        result.textContent = "—";
        result.classList.add("is-empty");
        fareEl.setAttribute("aria-invalid", "true");
        err.textContent = "Enter a fare above zero to see each share.";
      }
    }

    presetBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        presetBtns.forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");
        fareEl.value = btn.dataset.fare;
        seatsEl.value = btn.dataset.seats;
        update();
      });
    });

    fareEl.addEventListener("input", () => {
      presetBtns.forEach((b) => b.classList.remove("is-active"));
      update();
    });
    seatsEl.addEventListener("input", () => {
      presetBtns.forEach((b) => b.classList.remove("is-active"));
      update();
    });
    update();
  }

  /* ---------- FAQ ---------- */
  function initFaq() {
    const btns = $$(".faq-btn");
    btns.forEach((btn, i) => {
      btn.addEventListener("click", () => {
        const open = btn.getAttribute("aria-expanded") === "true";
        btn.setAttribute("aria-expanded", String(!open));
        document.getElementById(btn.getAttribute("aria-controls")).hidden = open;
      });
      // Arrow / Home / End navigation between questions
      btn.addEventListener("keydown", (e) => {
        let next = null;
        if (e.key === "ArrowDown") next = btns[(i + 1) % btns.length];
        else if (e.key === "ArrowUp") next = btns[(i - 1 + btns.length) % btns.length];
        else if (e.key === "Home") next = btns[0];
        else if (e.key === "End") next = btns[btns.length - 1];
        if (next) { e.preventDefault(); next.focus(); }
      });
    });
  }

  /* ---------- Forms ---------- */
  const MSG = {
    emailMissing: "Enter your college email so we can reach you.",
    emailBad: "That email address looks incomplete. Check for a missing @ or domain.",
    collegeMissing: "Enter your college name so we know which campus to open first.",
    network: () => "We couldn't send your request. Check your connection and try again" +
      (C.contactEmail ? ", or email " + C.contactEmail + "." : ".")
  };

  function checkField(input) {
    const v = input.value.trim();
    if (input.type === "email") {
      if (!v) return MSG.emailMissing;
      if (!validateEmail(v)) return MSG.emailBad;
    }
    if (input.name === "college" && !v) return MSG.collegeMissing;
    return "";
  }

  function setError(input, msg) {
    const errEl = document.getElementById(input.getAttribute("aria-describedby"));
    if (msg) input.setAttribute("aria-invalid", "true");
    else input.removeAttribute("aria-invalid");
    if (errEl) errEl.textContent = msg;
  }

  async function submitLead(payload) {
    if (C.useMockSubmit || !C.formEndpoint) {
      await new Promise((r) => setTimeout(r, C.mockSubmitDelayMs || 800));
      console.info("[ReturnRide] Mock submit (no network call):", payload);
      return;
    }
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), C.requestTimeoutMs || 10000);
    try {
      const res = await fetch(C.formEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
        signal: ctrl.signal
      });
      if (!res.ok) throw new Error("HTTP " + res.status);
    } finally {
      clearTimeout(t);
    }
  }

  function showSuccess(form) {
    const box = document.createElement("div");
    box.className = "form-success";
    box.setAttribute("role", "status");
    box.tabIndex = -1;
    box.innerHTML = '<svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m8 12.5 2.5 2.5L16 9.5"/></svg>' +
      '<div>' +
      "<p><strong>You're on the list.</strong> We'll email you when the pilot opens at your campus.</p>" +
      '<a href="https://api.whatsapp.com/send?text=I%20just%20joined%20the%20ReturnRide%20pilot%20for%20our%20campus.%20Check%20it%20out%20to%20share%20return%20rides%20home:%20https://returnride.app" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm" style="margin-top:12px; display:inline-flex; gap:6px;">' +
      '<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.301-.15-1.78-.878-2.056-.978-.276-.1-.476-.15-.676.15-.2.3-.776.978-.952 1.178-.175.2-.351.226-.652.075s-1.27-.468-2.42-1.494c-.895-.798-1.5-1.785-1.676-2.086-.175-.3-.019-.462.132-.612.135-.135.301-.35.451-.526.151-.175.201-.3.301-.5.1-.2.05-.376-.025-.526s-.677-1.632-.927-2.235c-.244-.587-.492-.507-.677-.516-.175-.008-.376-.01-.577-.01-.2 0-.526.075-.802.376s-1.053 1.028-1.053 2.508 1.078 2.908 1.228 3.109c.15.2 2.122 3.24 5.141 4.544 3.019 1.304 3.019.869 3.56.819.54-.05 1.74-.71 1.984-1.396.244-.686.244-1.275.17-1.396-.073-.121-.274-.196-.575-.346z"/></svg>Tell your college group</a>' +
      '</div>';
    form.replaceWith(box);
    box.focus({ preventScroll: true });
  }

  function initForms() {
    $$(".js-lead-form").forEach((form) => {
      const fields = $$("input[required]", form);
      const btn = $('button[type="submit"]', form);
      const status = $(".form-status", form);
      const label = btn.textContent;

      fields.forEach((input) => {
        input.addEventListener("input", () => {
          input.dataset.dirty = "1";
          if (input.getAttribute("aria-invalid") === "true" && !checkField(input)) setError(input, "");
        });
        input.addEventListener("blur", () => {
          if (input.dataset.dirty) setError(input, checkField(input));
        });
      });

      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        status.textContent = "";

        // Honeypot: bots fill hidden fields. Pretend success, send nothing.
        const hp = $('input[name="website"]', form);
        if (hp && hp.value) { showSuccess(form); return; }

        let firstBad = null;
        fields.forEach((input) => {
          const msg = checkField(input);
          setError(input, msg);
          input.dataset.dirty = "1";
          if (msg && !firstBad) firstBad = input;
        });
        if (firstBad) { firstBad.focus(); return; }

        const data = new FormData(form);
        const payload = {
          email: String(data.get("email") || "").trim(),
          college: String(data.get("college") || "").trim() || null,
          intent: data.get("intent") || null,
          source: form.dataset.source,
          submittedAt: new Date().toISOString()
        };

        btn.disabled = true;
        btn.textContent = "Sending…";
        try {
          await submitLead(payload);
          showSuccess(form);
        } catch (err) {
          status.textContent = MSG.network();
          btn.disabled = false;
          btn.textContent = label;
        }
      });
    });
  }

  /* ---------- Legal dialog (draft text) ---------- */
  const LEGAL = {
    privacy: {
      title: "Privacy",
      body: ["Draft for the pilot. Replace with your final policy before launch.",
        "We collect the email, college name and ride preference you submit, only to contact you about the pilot. We don't sell this information."]
    },
    terms: {
      title: "Terms",
      body: ["Draft for the pilot. Replace with your final terms before launch.",
        "The pilot is free and is being tested with a small group of students. Features may change."]
    }
  };

  function initLegal() {
    const dlg = $("#legalDialog");
    if (!dlg || typeof dlg.showModal !== "function") return;
    $$("[data-legal]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const doc = LEGAL[btn.dataset.legal];
        $("#legalTitle").textContent = doc.title;
        $("#legalBody").innerHTML = doc.body.map((p) => "<p>" + esc(p) + "</p>").join("");
        dlg.showModal();
      });
    });
    $("#legalClose").addEventListener("click", () => dlg.close());
    dlg.addEventListener("click", (e) => { if (e.target === dlg) dlg.close(); });
  }

  /* ---------- Pitch Deck Presentation ---------- */
  function initPitchDeck() {
    const tabs = $$(".deck-tab");
    const slides = $$(".deck-slide");
    const prevBtn = $("#deckPrevBtn");
    const nextBtn = $("#deckNextBtn");
    const numEl = $("#deckSlideNum");
    const fillEl = $("#deckProgressFill");
    const modeSlide = $("#deckModeSlide");
    const modeGrid = $("#deckModeGrid");
    const stage = $("#deckStage");
    if (!slides.length || !stage) return;

    let current = 1;
    const total = slides.length;

    function goToSlide(n) {
      if (n < 1) n = 1;
      if (n > total) n = total;
      current = n;

      slides.forEach((s) => s.classList.toggle("is-active", Number(s.dataset.index) === n));
      tabs.forEach((t) => {
        const isActive = Number(t.dataset.slide) === n;
        t.classList.toggle("is-active", isActive);
        t.setAttribute("aria-selected", isActive ? "true" : "false");
        if (isActive) {
          t.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
        }
      });

      if (numEl) numEl.textContent = "Slide " + n + " of " + total;
      if (fillEl) fillEl.style.width = ((n / total) * 100) + "%";
      if (prevBtn) prevBtn.disabled = n === 1;
      if (nextBtn) nextBtn.disabled = n === total;
    }

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        setGridMode(false);
        goToSlide(Number(tab.dataset.slide));
      });
    });

    if (prevBtn) prevBtn.addEventListener("click", () => goToSlide(current - 1));
    if (nextBtn) nextBtn.addEventListener("click", () => goToSlide(current + 1));

    function setGridMode(isGrid) {
      stage.classList.toggle("is-grid-mode", isGrid);
      if (modeSlide) {
        modeSlide.classList.toggle("is-active", !isGrid);
        modeSlide.setAttribute("aria-pressed", !isGrid ? "true" : "false");
      }
      if (modeGrid) {
        modeGrid.classList.toggle("is-active", isGrid);
        modeGrid.setAttribute("aria-pressed", isGrid ? "true" : "false");
      }
    }

    if (modeSlide) modeSlide.addEventListener("click", () => setGridMode(false));
    if (modeGrid) modeGrid.addEventListener("click", () => setGridMode(true));

    // In grid mode, clicking a slide card zooms in to that slide
    slides.forEach((s) => {
      s.addEventListener("click", () => {
        if (stage.classList.contains("is-grid-mode")) {
          setGridMode(false);
          goToSlide(Number(s.dataset.index));
        }
      });
    });

    // Keyboard navigation when deck is in view
    document.addEventListener("keydown", (e) => {
      if (stage.classList.contains("is-grid-mode")) return;
      const rect = stage.getBoundingClientRect();
      const inView = rect.top < window.innerHeight && rect.bottom > 0;
      if (!inView) return;

      if (e.key === "ArrowRight") {
        e.preventDefault();
        goToSlide(current + 1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goToSlide(current - 1);
      }
    });

    goToSlide(1);
  }

  /* ---------- Analytics (off by default) ---------- */
  function initAnalytics() {
    const a = C.analytics;
    if (!a || !a.enabled || !a.siteId) return;
    const s = document.createElement("script");
    s.defer = true;
    if (a.provider === "fathom") {
      s.src = "https://cdn.usefathom.com/script.js";
      s.dataset.site = a.siteId;
    } else {
      s.src = "https://plausible.io/js/script.js";
      s.dataset.domain = a.siteId;
    }
    document.head.appendChild(s);
  }

  function boot() {
    applyConfig();
    initNav();
    initDemo();
    initSteps();
    initPitchDeck();
    initCalculator();
    initFaq();
    initForms();
    initLegal();
    initAnalytics();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
