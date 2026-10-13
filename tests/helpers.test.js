// Run with: npm test  (or: node --test tests/)
const test = require("node:test");
const assert = require("node:assert/strict");
const { calculateFareSplit, validateEmail, formatMoney } = require("../script.js");

test("splits evenly", () => {
  assert.deepEqual(calculateFareSplit(600, 4), { ok: true, perPerson: 150, total: 600, seats: 4 });
  assert.equal(calculateFareSplit(100, 5).perPerson, 20);
});

test("rounds each share up so the fare is covered", () => {
  const r = calculateFareSplit(50, 3);
  assert.equal(r.perPerson, 16.67);
  assert.ok(r.perPerson * 3 >= 50);
});

test("accepts numeric strings from inputs", () => {
  assert.equal(calculateFareSplit("450", "3").perPerson, 150);
});

test("rejects bad fares", () => {
  for (const f of [0, -10, "", "abc", NaN, Infinity]) {
    assert.deepEqual(calculateFareSplit(f, 4), { ok: false, error: "fare" }, String(f));
  }
});

test("rejects bad seat counts", () => {
  for (const s of [0, -1, 2.5, "x"]) {
    assert.deepEqual(calculateFareSplit(600, s), { ok: false, error: "seats" }, String(s));
  }
});

test("validates email", () => {
  assert.ok(validateEmail("a.b@college.edu"));
  assert.ok(validateEmail("  student@uni.ac.in "));
  for (const bad of ["", "student", "student@", "student@college", "@college.edu", "a b@c.edu"]) {
    assert.equal(validateEmail(bad), false, bad);
  }
});

test("formats money", () => {
  assert.equal(formatMoney(150, { code: "INR", locale: "en-IN" }), "₹150");
  assert.equal(formatMoney(16.67, { code: "INR", locale: "en-IN" }), "₹16.67");
  assert.equal(formatMoney(20, { code: "USD", locale: "en-US" }), "$20");
});
