/**
 * TorqueTitles screen unit tests — the verdict matrix of site-copy-final.md
 * §7, run against lib/screen.js directly (the same module the API route
 * executes). Port/extension of the Phase-1 pytest coverage: the HTTP-level
 * assertions live in scripts/smoke-test.mjs; every verdict rule gets an
 * individual case here.
 *
 * Run: npm run test:screen
 */
import {
  evaluate,
  nextSteps,
  validateIntake,
  ValidationError,
} from "../lib/screen.js";

let failures = 0;
function check(name, cond) {
  if (cond) {
    console.log(`  ok — ${name}`);
  } else {
    failures += 1;
    console.log(`  FAIL — ${name}`);
  }
}
function verdictOf(payload) {
  const rec = validateIntake(payload);
  return evaluate(rec);
}

const base = (over = {}) => ({
  contact: { name: "Test Person", email: "test@example.com" },
  vehicle: { year: 2022, make: "Polaris", model: "RZR", vehicle_class: "powersports" },
  route: "general",
  screen: {
    q1_garaging_state: "AZ",
    q1_garaging_detail: "home garage",
    q2_use_state: "SAME",
    q3_connection: "resident",
    q4_problem: "b",
    q5_flags: ["none"],
    q6_insurance: "yes",
  },
  ...over,
});
const withScreen = (s) => base({ screen: { ...base().screen, ...s } });

// --- GREEN baseline
{
  const { verdict, reasons } = verdictOf(base());
  check("clean facts → green", verdict === "green");
  check("green carries the no-flags reason", reasons.includes("No screen flags: the facts fit a lawful lane."));
  const steps = nextSteps(validateIntake(base()), verdict);
  check("green → action ready, payment link withheld", steps.action === "ready" && steps.payment_link === null);
}

// --- RED: Q4 = h (the tax-motive trigger) — the headline rule
{
  const { verdict, reasons } = verdictOf(withScreen({ q4_problem: "h" }));
  check("Q4=h → red", verdict === "red");
  check("Q4=h reason names the tax purpose first", reasons[0].includes("paying less sales/use tax"));
  const steps = nextSteps(validateIntake(withScreen({ q4_problem: "h" })), verdict);
  check("red → declined + referral + no payment link",
    steps.action === "declined" && steps.payment_link === null && typeof steps.referral === "string");
}

// --- RED: seller_not_owner
{
  const { verdict, reasons } = verdictOf(withScreen({ q5_flags: ["seller_not_owner"] }));
  check("Q5 seller_not_owner → red", verdict === "red");
  check("seller_not_owner reason cites the fraud pattern", reasons.some((r) => r.includes("fraud pattern")));
}

// --- RED: open-state conversion garaged in TX / CA / FL
for (const st of ["TX", "CA", "FL"]) {
  const { verdict, reasons } = verdictOf(base({
    route: "open_state_conversion",
    screen: { ...base().screen, q1_garaging_state: st },
  }));
  check(`conversion garaged in ${st} → red`, verdict === "red" && reasons.some((r) => r.includes("bars off-highway")));
}
{
  const { verdict } = verdictOf(base({
    route: "open_state_conversion",
    screen: { ...base().screen, q1_garaging_state: "FL" },
  }));
  const { reasons } = verdictOf(base({
    route: "open_state_conversion",
    screen: { ...base().screen, q1_garaging_state: "FL" },
  }));
  check("FL conversion red points at the Florida Native Desk",
    verdict === "red" && reasons.some((r) => r.includes("Florida Native Desk")));
}

// --- AMBER triggers, one at a time
const amberCases = [
  ["Q6 = no", withScreen({ q6_insurance: "no" })],
  ["Q6 = not_yet", withScreen({ q6_insurance: "not_yet" })],
  ["Q5 lien", withScreen({ q5_flags: ["lien"] })],
  ["Q5 branded", withScreen({ q5_flags: ["branded"] })],
  ["Q3 stored_elsewhere", withScreen({ q3_connection: "stored_elsewhere" })],
  ["Q2 different state", withScreen({ q2_use_state: "NM" })],
  ["MT route garaged CO", base({ route: "montana_llc", screen: { ...base().screen, q1_garaging_state: "CO", q4_problem: "g" } })],
  ["MT route garaged in enforcement state CA", base({ route: "montana_llc", screen: { ...base().screen, q1_garaging_state: "CA", q4_problem: "g" } })],
  ["SD route garaged in enforcement state UT", base({ route: "sd_title", screen: { ...base().screen, q1_garaging_state: "UT", q4_problem: "e", q5_flags: ["lien"] } })],
];
for (const [name, payload] of amberCases) {
  const { verdict } = verdictOf(payload);
  check(`${name} → amber`, verdict === "amber");
  const steps = nextSteps(validateIntake(payload), verdict);
  check(`${name} → human_review, no payment link`, steps.action === "human_review" && steps.payment_link === null);
}

// --- Amber on a disclosure route requires the signed-disclosure wording
{
  const payload = base({ route: "montana_llc", screen: { ...base().screen, q1_garaging_state: "CO", q4_problem: "g" } });
  const steps = nextSteps(validateIntake(payload), "amber");
  check("amber MT route → requires names the signed Montana disclosure",
    steps.requires.includes("signed Montana disclosure"));
}

// --- GREEN edge: FULLTIME traveller used across many states is not amber
{
  const { verdict } = verdictOf(base({
    route: "domicile_subscription",
    screen: { ...base().screen, q1_garaging_state: "FULLTIME", q2_use_state: "MANY", q3_connection: "domiciled", q4_problem: "f" },
  }));
  check("FULLTIME + MANY use → green", verdict === "green");
}

// --- GREEN edge: Montana route actually garaged in Montana
{
  const { verdict } = verdictOf(base({
    route: "montana_llc",
    screen: { ...base().screen, q1_garaging_state: "MT", q4_problem: "g" },
  }));
  check("MT route garaged in MT → green", verdict === "green");
}

// --- Validation failures
function expectProblems(name, payload, needle) {
  try {
    validateIntake(payload);
    check(name, false);
  } catch (err) {
    check(name, err instanceof ValidationError && err.problems.some((p) => p.includes(needle)));
  }
}
expectProblems("bad email rejected", base({ contact: { name: "X", email: "not-an-email" } }), "contact.email");
expectProblems("missing name rejected", base({ contact: { name: "", email: "x@example.com" } }), "contact.name is required");
expectProblems("unknown route rejected", base({ route: "moon_filing" }), "route must be one of");
expectProblems("Q4 outside a–h rejected", withScreen({ q4_problem: "z" }), "screen.q4_problem must be one of a-h");
expectProblems("bad garaging state rejected", withScreen({ q1_garaging_state: "XX1" }), "q1_garaging_state");
expectProblems("q5 none+lien combination rejected", withScreen({ q5_flags: ["none", "lien"] }), "cannot combine 'none'");
expectProblems("unknown q5 flag rejected", withScreen({ q5_flags: ["stolen"] }), "unknown values");
expectProblems("bad vehicle class rejected", base({ vehicle: { vehicle_class: "hovercraft" } }), "vehicle_class must be one of");
expectProblems("year out of range rejected", base({ vehicle: { year: 1700 } }), "vehicle.year looks out of range");
expectProblems("non-object body rejected", "hello", "request body must be a JSON object");

console.log(failures === 0 ? "\nSCREEN TESTS: PASS" : `\nSCREEN TESTS: ${failures} FAILURE(S)`);
process.exit(failures === 0 ? 0 : 1);
