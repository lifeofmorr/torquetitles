/**
 * TorqueTitles intake service — port of IntakeService in the Phase-1
 * server (build/torquetitles/server.py). All intake logic, independent
 * of the HTTP layer: validate → server-side verdict → attestation
 * timestamps → persist → customer-facing next steps.
 */
import { randomBytes } from "node:crypto";
import {
  DISCLOSURE_ROUTES,
  evaluate,
  nextSteps,
  validateIntake,
} from "./screen";
import { store } from "./store";

export const APP_VERSION = "1.0.0";

function newId(prefix) {
  return `${prefix}_${randomBytes(6).toString("hex")}`;
}

function nowIso() {
  // Python original: time.strftime("%Y-%m-%dT%H:%M:%SZ", gmtime) — seconds
  // precision, Z suffix. Match that shape.
  return new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
}

export async function submitIntake(payload) {
  const rec = validateIntake(payload);
  const { verdict, reasons } = evaluate(rec);

  const disclosure = rec.montana_disclosure;
  disclosure.received_at_server = nowIso();
  disclosure.version_confirmed = disclosure.version;

  let status = { green: "ready", amber: "needs_review", red: "declined" }[verdict];

  let disclosureOk = true;
  if (DISCLOSURE_ROUTES.has(rec.route) && verdict !== "red") {
    disclosureOk = Boolean(disclosure.accepted);
    if (!disclosureOk && status === "ready") {
      status = "needs_review";
    }
  }

  const record = {
    id: newId("tt"),
    created_at: nowIso(),
    stage: verdict !== "red" ? 2 : 1, // one-timeline stage
    status,
    verdict,
    verdict_reasons: reasons,
    requires_human_review: verdict === "amber" || !disclosureOk,
    disclosure_satisfied: disclosureOk,
    source: "web",
    ...rec,
  };
  await store.createIntake(record);

  const out = nextSteps(record, verdict);
  out.intake_id = record.id;
  out.reasons = reasons;
  out.disclosure_satisfied = disclosureOk;
  out.received_at = record.created_at;
  return out;
}

export { store };
