/**
 * TorqueTitles eligibility screen — validation + verdict logic.
 *
 * Faithful JavaScript port of the Phase-1 server-authoritative module
 * (build/torquetitles/screen.py; rules from site-copy-final.md §7). The
 * intake widget mirrors evaluate() for instant feedback only; this module,
 * running in the API route, is authoritative. Keep the two in sync.
 *
 * Rules:
 *   RED   - Q4 = "h" (the pay-less-tax trigger): always decline + referral.
 *   RED   - Q5 includes "seller_not_owner": paper that isn't the customer's.
 *   RED   - open-state conversion garaged in TX / CA / FL (conversion barred).
 *   AMBER - insurance not in place / not at garaging address;
 *           lien or branded title in Q5;
 *           MT/SD route garaged in an active-enforcement state;
 *           Montana route with the vehicle not garaged in Montana;
 *           use state differs from garaging state;
 *           Q3 = vehicle kept in the state while the owner lives elsewhere.
 *   GREEN - otherwise.
 *
 * Amber requires the signed Montana disclosure (MT/SD routes) or a written
 * acknowledgment plus human review before any payment link is issued.
 * Red never receives a payment link.
 */

export const DISCLOSURE_VERSION = "2026-10-v1";

export const ROUTES = new Set([
  "florida_lsv", "florida_estate", "florida_rebuilt",
  "title_recovery", "open_state_conversion",
  "domicile_subscription", "montana_llc", "sd_title", "general",
]);

// Routes whose checkout is gated behind this screen (launch-checklist §0/§5).
export const GATED_ROUTES = new Set(["montana_llc", "sd_title", "open_state_conversion"]);

// Routes that require the signed Montana home-state tax disclosure.
export const DISCLOSURE_ROUTES = new Set(["montana_llc", "sd_title"]);

export const VEHICLE_CLASSES = new Set([
  "powersports", "car", "truck", "suv", "rv", "motorcycle",
  "golf_cart", "trailer", "other",
]);

const Q3_CONNECTIONS = new Set(["resident", "domiciled", "business", "stored_elsewhere"]);
const Q4_PROBLEMS = new Set(["a", "b", "c", "d", "e", "f", "g", "h"]);
const Q5_FLAGS = new Set(["lien", "no_title", "seller_not_owner", "branded", "none"]);
const Q6_INSURANCE = new Set(["yes", "no", "not_yet"]);

// States with active out-of-state-LLC enforcement named in the disclosure.
export const ENFORCEMENT_STATES = new Set(["CA", "UT", "GA", "WA", "TN"]);
// States that bar off-highway conversion filings outright (copy §4).
export const CONVERSION_BARRED_STATES = new Set(["TX", "CA", "FL"]);

const STATE_RE = /^[A-Z]{2}$/;
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export const VERDICT_COPY = {
  green: {
    headline: "We can file this.",
    body:
      "Your facts fit a lawful lane. You'll see the exact price " +
      "and the route before you pay.",
  },
  amber: {
    headline: "We can file this only with your signed acknowledgment.",
    body:
      "Your facts carry home-state registration/tax duties or " +
      "limits that a filing does not erase. We show you the " +
      "specific warning for your state, and a human reviews your " +
      "file before payment.",
  },
  red: {
    headline: "We won't file this.",
    body:
      "We decline this filing. A CPA or attorney — or your own " +
      "state's agency — is the professional who can actually " +
      "help with this situation. If your facts change, run the " +
      "screen again; the screen is free.",
  },
};

export const REFERRAL =
  "For tax questions: your own CPA or tax attorney. For legal " +
  "questions: a licensed attorney in your garaging state. For " +
  "registration duties: your state's motor-vehicle agency.";

export class ValidationError extends Error {
  constructor(problems) {
    super(problems.join("; "));
    this.name = "ValidationError";
    this.problems = problems;
  }
}

/** Python-style repr of a list of strings, for identical problem messages. */
function pyList(items) {
  return "[" + items.map((i) => `'${i}'`).join(", ") + "]";
}

function sortedList(set) {
  return [...set].sort();
}

function normState(value) {
  return String(value ?? "").trim().toUpperCase();
}

function asStr(value) {
  return value == null ? "" : String(value);
}

/**
 * Validate a raw intake payload; return the normalised record fields.
 * Throws ValidationError listing every problem found.
 */
export function validateIntake(payload) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new ValidationError(["request body must be a JSON object"]);
  }
  const problems = [];

  const contact = payload.contact || {};
  const name = asStr(contact.name).trim();
  const email = asStr(contact.email).trim();
  const phone = asStr(contact.phone).trim();
  if (!name) problems.push("contact.name is required");
  if (!EMAIL_RE.test(email)) {
    problems.push("contact.email must be a valid email address");
  }

  const vehicle = payload.vehicle || {};
  const vclass = asStr(vehicle.vehicle_class).trim();
  if (vclass && !VEHICLE_CLASSES.has(vclass)) {
    problems.push(
      `vehicle.vehicle_class must be one of ${pyList(sortedList(VEHICLE_CLASSES))}`
    );
  }
  let year = vehicle.year;
  if (year !== null && year !== undefined && year !== "") {
    // Python int(): accepts ints, floats (truncates), numeric strings.
    let parsed = NaN;
    if (typeof year === "number") parsed = Math.trunc(year);
    else if (typeof year === "string" && /^[+-]?\d+$/.test(year.trim())) {
      parsed = parseInt(year.trim(), 10);
    }
    if (Number.isNaN(parsed)) {
      problems.push("vehicle.year must be a number");
      year = null;
    } else {
      year = parsed;
      if (year < 1900 || year > 2100) {
        problems.push("vehicle.year looks out of range");
      }
    }
  } else {
    year = null;
  }

  const route = asStr(payload.route || "general").trim();
  if (!ROUTES.has(route)) {
    problems.push(`route must be one of ${pyList(sortedList(ROUTES))}`);
  }

  const screen = payload.screen || {};
  const q1 = normState(screen.q1_garaging_state);
  const q1Detail = asStr(screen.q1_garaging_detail).trim();
  if (q1 === "FULLTIME") {
    // genuinely on the road full-time
  } else if (!STATE_RE.test(q1)) {
    problems.push("screen.q1_garaging_state must be a 2-letter state or FULLTIME");
  }

  const q2Raw = screen.q2_use_state;
  let q2 = q2Raw !== null && q2Raw !== undefined ? normState(q2Raw) : "";
  if (q2 === "" || q2 === "SAME") {
    q2 = "SAME";
  } else if (q2 === "MANY") {
    // genuinely across many states
  } else if (!STATE_RE.test(q2)) {
    problems.push("screen.q2_use_state must be SAME, MANY, or a 2-letter state");
  }

  const q3 = asStr(screen.q3_connection).trim();
  if (!Q3_CONNECTIONS.has(q3)) {
    problems.push(
      `screen.q3_connection must be one of ${pyList(sortedList(Q3_CONNECTIONS))}`
    );
  }

  const q4 = asStr(screen.q4_problem).trim().toLowerCase();
  if (!Q4_PROBLEMS.has(q4)) {
    problems.push("screen.q4_problem must be one of a-h");
  }

  let q5Raw = screen.q5_flags ?? [];
  if (typeof q5Raw === "string") q5Raw = [q5Raw];
  if (!Array.isArray(q5Raw)) q5Raw = [q5Raw];
  const q5 = q5Raw.map((f) => asStr(f).trim());
  const bad = q5.filter((f) => !Q5_FLAGS.has(f));
  if (bad.length) {
    problems.push(`screen.q5_flags has unknown values: ${pyList(bad)}`);
  }
  if (q5.includes("none") && q5.length > 1) {
    problems.push("screen.q5_flags cannot combine 'none' with other flags");
  }

  const q6 = asStr(screen.q6_insurance).trim();
  if (!Q6_INSURANCE.has(q6)) {
    problems.push(
      `screen.q6_insurance must be one of ${pyList(sortedList(Q6_INSURANCE))}`
    );
  }

  const disclosure = payload.montana_disclosure || {};
  const disc = {
    accepted: Boolean(disclosure.accepted),
    accepted_at_client: asStr(disclosure.accepted_at) || null,
    version: asStr(disclosure.version) || DISCLOSURE_VERSION,
    printed_name: asStr(disclosure.printed_name).trim(),
  };

  if (problems.length) throw new ValidationError(problems);

  return {
    contact: { name, email, phone },
    vehicle: {
      year,
      make: asStr(vehicle.make).trim(),
      model: asStr(vehicle.model).trim(),
      vin: asStr(vehicle.vin).trim(),
      vehicle_class: vclass || null,
    },
    route,
    screen: {
      q1_garaging_state: q1,
      q1_garaging_detail: q1Detail,
      q2_use_state: q2,
      q3_connection: q3,
      q4_problem: q4,
      q5_flags: q5,
      q6_insurance: q6,
    },
    montana_disclosure: disc,
    notes: asStr(payload.notes).trim(),
  };
}

/** Return {verdict, reasons} for a validated intake record. */
export function evaluate(record) {
  const s = record.screen;
  const route = record.route;
  const garage = s.q1_garaging_state;
  const reasons = [];
  let red = false;
  let amber = false;

  if (s.q4_problem === "h") {
    red = true;
    reasons.push(
      "Q4: the stated purpose is paying less sales/use tax or " +
        "registration cost in the home state. TorqueTitles does not file " +
        "tax-avoidance paperwork — this is an automatic decline."
    );
  }

  if (s.q5_flags.includes("seller_not_owner")) {
    red = true;
    reasons.push(
      "Q5: the seller is not the owner named on the title. We cannot " +
        "prepare a transfer or duplicate on paper that is not the " +
        "customer's — that is the fraud pattern, not a service."
    );
  }

  if (route === "open_state_conversion" && CONVERSION_BARRED_STATES.has(garage)) {
    red = true;
    reasons.push(
      `Route: ${garage} bars off-highway vehicle conversion filings ` +
        "for highway use; no conversion filing exists to sell there. " +
        "Florida customers: see the Florida Native Desk for the lawful " +
        "LSV/estate/rebuilt lanes."
    );
  }

  if (s.q6_insurance === "no") {
    amber = true;
    reasons.push(
      "Q6: the vehicle will not be insured at its actual garaging " +
        "address with the titled owner disclosed. Insurance must match " +
        "reality before this file can proceed."
    );
  } else if (s.q6_insurance === "not_yet") {
    amber = true;
    reasons.push(
      "Q6: insurance is not arranged yet. It must be placed at the " +
        "actual garaging address, with the titled owner disclosed, " +
        "before filing."
    );
  }

  if (s.q5_flags.includes("lien")) {
    amber = true;
    reasons.push(
      "Q5: a loan/lien is on the vehicle. Financed vehicles usually " +
        "route to South Dakota titling (lienholder stays on title) or " +
        "need a lender permission letter first."
    );
  }
  if (s.q5_flags.includes("branded")) {
    amber = true;
    reasons.push(
      "Q5: the title is branded salvage/rebuilt/flood/junk. Brands " +
        "follow the vehicle permanently (NMVTIS); we file the honest " +
        "branded-title lanes only — never brand removal."
    );
  }

  if (DISCLOSURE_ROUTES.has(route) && ENFORCEMENT_STATES.has(garage)) {
    amber = true;
    reasons.push(
      `Route: the vehicle is garaged in ${garage}, an active ` +
        "enforcement state for out-of-state LLC registrations " +
        "(personal member liability / insurance-data matching / doubled " +
        "penalties). The signed disclosure and human review are " +
        "required before payment."
    );
  }

  if (route === "montana_llc" && garage !== "MT" && garage !== "FULLTIME") {
    amber = true;
    reasons.push(
      "Route: Montana filing for a vehicle not garaged in Montana. " +
        "The garaging state's registration and tax duties are not " +
        "erased by a Montana title; signed disclosure + human review " +
        "required."
    );
  }

  if (
    s.q2_use_state !== "SAME" &&
    s.q2_use_state !== garage &&
    !(s.q2_use_state === "MANY" && garage === "FULLTIME")
  ) {
    amber = true;
    reasons.push(
      "Q2: the vehicle is mainly used in a different state than it " +
        "is garaged. The use state's road rules and the garaging " +
        "state's duties both apply."
    );
  }

  if (s.q3_connection === "stored_elsewhere") {
    amber = true;
    reasons.push(
      "Q3: the vehicle is kept in the state while the owner lives " +
        "elsewhere. That fact pattern gets extra scrutiny from " +
        "enforcement states; human review required."
    );
  }

  const verdict = red ? "red" : amber ? "amber" : "green";
  if (verdict === "green") {
    reasons.push("No screen flags: the facts fit a lawful lane.");
  }
  return { verdict, reasons };
}

/** What happens after submission, per verdict (customer-facing). */
export function nextSteps(record, verdict) {
  const route = record.route;
  const steps = {
    verdict,
    headline: VERDICT_COPY[verdict].headline,
    body: VERDICT_COPY[verdict].body,
  };
  if (verdict === "red") {
    steps.payment_link = null;
    steps.referral = REFERRAL;
    steps.action = "declined";
  } else if (verdict === "amber") {
    steps.payment_link = null;
    steps.action = "human_review";
    if (DISCLOSURE_ROUTES.has(route)) {
      steps.requires =
        "signed Montana disclosure (stored with this intake) + human review before a payment link is issued";
    } else {
      steps.requires =
        "written acknowledgment + human review before a payment link is issued";
    }
  } else {
    steps.action = "ready";
    steps.requires =
      "document checklist for the route; price confirmed in writing before payment";
    steps.payment_link = null; // issued per-file after review (post-screen handoff)
  }
  return steps;
}
