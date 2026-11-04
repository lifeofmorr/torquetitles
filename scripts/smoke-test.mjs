/**
 * TorqueTitles API smoke test — port of the Phase-1 pytest suite
 * (build/tests/test_smoke.py) to the Next.js production server.
 *
 * Boots `next start` on an ephemeral port with a temp data dir and a test
 * admin key, then verifies through the real HTTP stack:
 *   - GET /api/health
 *   - the seven Phase-1 pages return 200 and carry the brand
 *   - green / amber / red intakes return the screen's verdicts
 *   - records persist to torquetitles.json, incl. the Montana disclosure
 *     attestation fields (accepted, client + server timestamps, version)
 *   - admin endpoints require the key and return the stored records
 *   - validation rejects a malformed intake with 422 + problems
 *
 * Run AFTER `npm run build`:  npm run smoke
 */
import { spawn } from "node:child_process";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const ADMIN = "test-admin-key";
const dataDir = mkdtempSync(path.join(tmpdir(), "tt-smoke-"));
const PORT = 18000 + Math.floor(Math.random() * 2000);
const BASE = `http://127.0.0.1:${PORT}`;

let failures = 0;
function check(name, cond) {
  if (cond) console.log(`  ok — ${name}`);
  else {
    failures += 1;
    console.log(`  FAIL — ${name}`);
  }
}

async function call(method, p, body, headers = {}) {
  const res = await fetch(BASE + p, {
    method,
    headers: { "Content-Type": "application/json", ...headers },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json = {};
  try {
    json = JSON.parse(text);
  } catch {
    /* HTML pages */
  }
  return { status: res.status, json, text };
}

const GREEN = {
  contact: { name: "Sam Rider", email: "sam@example.com" },
  vehicle: { year: 2022, make: "Polaris", model: "RZR XP 1000", vehicle_class: "powersports" },
  route: "open_state_conversion",
  screen: {
    q1_garaging_state: "AZ", q1_garaging_detail: "home garage, Phoenix",
    q2_use_state: "SAME", q3_connection: "resident",
    q4_problem: "b", q5_flags: ["none"], q6_insurance: "yes",
  },
};

const AMBER = {
  contact: { name: "Casey Collector", email: "casey@example.com" },
  vehicle: { year: 2019, make: "Ford", model: "F-150", vin: "1FTFW1E50KFA00000", vehicle_class: "truck" },
  route: "montana_llc",
  screen: {
    q1_garaging_state: "CO", q1_garaging_detail: "home garage, Denver",
    q2_use_state: "SAME", q3_connection: "resident",
    q4_problem: "g", q5_flags: ["lien"], q6_insurance: "not_yet",
  },
  montana_disclosure: {
    accepted: true,
    accepted_at: "2026-10-20T15:00:00Z",
    version: "2026-10-v1",
    printed_name: "Casey Collector",
  },
};

const RED = {
  contact: { name: "Tommy Taxman", email: "tommy@example.com" },
  vehicle: { year: 2024, make: "Porsche", model: "911", vehicle_class: "car" },
  route: "montana_llc",
  screen: {
    q1_garaging_state: "CA", q1_garaging_detail: "home garage, Los Angeles",
    q2_use_state: "SAME", q3_connection: "resident",
    q4_problem: "h", q5_flags: ["none"], q6_insurance: "yes",
  },
};

async function waitReady(proc) {
  for (let i = 0; i < 60; i++) {
    if (proc.exitCode !== null) throw new Error("server exited early");
    try {
      const r = await fetch(BASE + "/api/health");
      if (r.ok) return;
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error("server did not become ready");
}

const server = spawn("npx", ["next", "start", "-p", String(PORT)], {
  env: {
    ...process.env,
    TORQUETITLES_DATA_DIR: dataDir,
    TORQUETITLES_ADMIN_KEY: ADMIN,
  },
  stdio: "pipe",
});

try {
  await waitReady(server);

  const health = await call("GET", "/api/health");
  check("health 200 + ok", health.status === 200 && health.json.ok === true);

  for (const p of ["/", "/florida", "/title-recovery", "/conversions", "/domicile", "/pricing", "/intake", "/privacy", "/terms"]) {
    const page = await call("GET", p);
    check(`page ${p} 200 + brand`, page.status === 200 && page.text.includes("TorqueTitles"));
  }

  const green = await call("POST", "/api/v1/intakes", GREEN);
  check("green → 201 green/ready",
    green.status === 201 && green.json.verdict === "green" && green.json.action === "ready");

  const amber = await call("POST", "/api/v1/intakes", AMBER);
  check("amber → 201 amber/human_review",
    amber.status === 201 && amber.json.verdict === "amber" && amber.json.action === "human_review");
  check("amber disclosure_satisfied", amber.json.disclosure_satisfied === true);

  const red = await call("POST", "/api/v1/intakes", RED);
  check("red → 201 red/declined",
    red.status === 201 && red.json.verdict === "red" && red.json.action === "declined");
  check("red → no payment link + referral present",
    red.json.payment_link === null && "referral" in red.json);
  check("red reasons name the tax trigger",
    red.json.reasons.some((r) => r.toLowerCase().includes("tax")));

  // Persistence: the JSON store on disk holds all three records.
  const db = JSON.parse(readFileSync(path.join(dataDir, "torquetitles.json"), "utf-8"));
  check("store holds 3 intakes", Object.keys(db.intakes).length === 3);
  const amberRec = db.intakes[amber.json.intake_id];
  const disc = amberRec.montana_disclosure;
  check("attestation: accepted stored", disc.accepted === true);
  check("attestation: client timestamp stored", disc.accepted_at_client === "2026-10-20T15:00:00Z");
  check("attestation: server receipt timestamp stored", Boolean(disc.received_at_server));
  check("attestation: version stored", disc.version === "2026-10-v1");
  check("amber record status needs_review", amberRec.verdict === "amber" && amberRec.status === "needs_review");
  check("red record status declined", db.intakes[red.json.intake_id].status === "declined");

  const noKey = await call("GET", "/api/v1/admin/intakes");
  check("admin without key → 401", noKey.status === 401);
  const listing = await call("GET", "/api/v1/admin/intakes", undefined, { "X-Admin-Key": ADMIN });
  check("admin list with key → 200, count 3", listing.status === 200 && listing.json.count === 3);
  const one = await call("GET", `/api/v1/admin/intakes/${green.json.intake_id}`, undefined, { "X-Admin-Key": ADMIN });
  check("admin get one → the green record", one.status === 200 && one.json.contact.email === "sam@example.com");
  const amberOnly = await call("GET", "/api/v1/admin/intakes?verdict=amber", undefined, { "X-Admin-Key": ADMIN });
  check("admin verdict filter → 1 amber", amberOnly.json.count === 1);
  const bearer = await call("GET", "/api/v1/admin/intakes", undefined, { Authorization: `Bearer ${ADMIN}` });
  check("admin accepts Bearer token", bearer.status === 200);

  const bad = await call("POST", "/api/v1/intakes", {
    contact: { name: "", email: "not-an-email" },
    route: "montana_llc",
    screen: { q1_garaging_state: "XX", q4_problem: "z" },
  });
  check("malformed intake → 422 + problems", bad.status === 422 && Array.isArray(bad.json.problems) && bad.json.problems.length > 0);

  const notJson = await fetch(BASE + "/api/v1/intakes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{nope",
  });
  check("invalid JSON → 400", notJson.status === 400);
} catch (err) {
  failures += 1;
  console.log("  FAIL — smoke harness:", err.message);
} finally {
  server.kill("SIGTERM");
}

console.log(failures === 0 ? "\nSMOKE: PASS" : `\nSMOKE: ${failures} FAILURE(S)`);
process.exit(failures === 0 ? 0 : 1);
