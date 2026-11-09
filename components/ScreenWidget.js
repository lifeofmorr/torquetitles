"use client";
import { useRef, useState } from "react";
import {
  DISCLOSURE_VERSION,
  VERDICT_COPY,
  evaluate,
} from "../lib/screen";
import { PRICING } from "../lib/data";

/**
 * The eligibility screen widget — React port of the Phase-1 widget
 * (build/site/app.js). The verdict logic is imported from lib/screen.js,
 * the same module the API route runs, so the instant (client) verdict and
 * the server-authoritative verdict are computed by one implementation.
 * Wording of every question is site-copy-final.md §7, verbatim.
 */

const DISCLOSURE_ROUTES = ["montana_llc", "sd_title"];

const DISCLOSURE_INTRO =
  "I am asking TorqueTitles to prepare paperwork to form a Montana limited liability company and/or to title and register the vehicle identified in my intake in that company's name through a Montana registered agent and county. I understand and acknowledge each of the following:";

const DISCLOSURE_POINTS = [
  "Montana law is not my home state's law. Forming a Montana LLC and titling/registering a vehicle in Montana is lawful under Montana law. It does not, by itself, satisfy the registration, titling, tax, insurance, or road-use laws of any other state.",
  "My garaging state likely has its own claim. If my vehicle is kept, garaged, stored, or mainly used in another state, that state may require me to register and title it there and to pay sales or use tax there — commonly within 10 to 30 days of bringing the vehicle into the state — regardless of the name on the Montana title. A Montana plate also does not make my vehicle legal to operate in a state that prohibits its vehicle class.",
  "Enforcement is active and personal. Several states have recently acted against out-of-state LLC vehicle registrations, including: California's SB 1406 (effective 2026), under which a California-resident member can make the entity a California resident for use-tax purposes and officers/members can be personally liable for unpaid tax, interest, and penalties; Utah's SB 52 programme, which matched insurance records against registrations (about 80,000 vehicles flagged; owners assessed tax and penalties); Georgia's HB 551 (from 1 January 2026), which doubles certain late-registration penalties for resident-owned out-of-state \u201cpassive entities\u201d; and Washington law making registration in another state to evade taxes a gross misdemeanour. Criminal tax charges have been brought against individuals in California and Tennessee in cases involving fabricated paperwork. My state's rules may change again after I sign this.",
  "Insurance must match reality. I will insure the vehicle at its actual garaging address and disclose the titled owner (including the LLC) to my insurer. I understand that an insurance record showing a different garaging state than the registration is a data trail enforcement programmes use.",
  "No advice, no tax purpose. TorqueTitles is a private filing-preparation service, not a law or tax firm, and has not advised me that this filing avoids, reduces, or eliminates any tax. TorqueTitles has not marketed this filing to me as a tax-saving product, and avoiding my home state's taxes is not the purpose of my filing. I have been advised to consult my own CPA or attorney about my home-state duties before proceeding, and I am proceeding (or not) on that basis.",
  "My facts are true. The garaging, use, residency/nexus, lien, title-brand, and insurance answers in my intake are complete and accurate. I understand TorqueTitles may decline or stop my filing — without completing it — if any answer proves inaccurate, and that its Refund-Until-Filed guarantee applies as published.",
  "Road use is my responsibility. Whether my vehicle may be operated on any particular road is governed by the law of the place and time it is operated. I will not rely on the Montana registration as permission to operate it anywhere.",
];

const STATES =
  "AL AK AZ AR CA CO CT DE FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY DC".split(
    " "
  );

/* Q4 (Wave-1) — the post-screen payment step.
 * The Stripe links in lib/data.js are post-screen handoff targets
 * (launch-checklist §5): a tier link renders on this confirmation ONLY
 * after the server has recorded the intake and returned a green "ready"
 * verdict with the route's disclosure (where required) satisfied — i.e.
 * exactly the files the records say receive their route's link. Amber
 * never renders one (signed acknowledgment + human review come first);
 * red never renders one. The API contract is unchanged: it still returns
 * payment_link: null in every case (Phase-1 semantics); this step is a
 * presentation of the recorded green outcome, not a public buy button.
 * Routes priced by written quote (the Florida desks, title recovery)
 * and vehicle classes with no published tier resolve to null — for
 * those files the office confirms the exact price in writing first,
 * as the verdict copy states. */
const CORE_FILING_ROUTES = [
  "general",
  "montana_llc",
  "sd_title",
  "open_state_conversion",
];
const CARS_RV_CLASSES = ["car", "truck", "suv", "rv", "motorcycle"];

function payableTier(route, vehicleClass) {
  let key = null;
  if (route === "domicile_subscription") {
    key = "ownershipCover";
  } else if (CORE_FILING_ROUTES.includes(route)) {
    if (vehicleClass === "powersports") key = "powersports";
    else if (CARS_RV_CLASSES.includes(vehicleClass)) key = "carsRv";
  }
  return key ? PRICING.find((t) => t.key === key) || null : null;
}

function StateOptions() {
  return STATES.map((s) => (
    <option key={s} value={s}>
      {s}
    </option>
  ));
}

export default function ScreenWidget() {
  const formRef = useRef(null);
  const verdictRef = useRef(null);
  const [showDisclosure, setShowDisclosure] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null); // {verdict, reasons, extra}
  const [payTier, setPayTier] = useState(null); // PRICING entry, green + recorded only
  const [sending, setSending] = useState(false);

  function gather() {
    const fd = new FormData(formRef.current);
    const route = fd.get("route") || "general";
    const answers = {
      q1_garaging_state: fd.get("q1_state") || "",
      q1_garaging_detail: fd.get("q1_detail") || "",
      q2_use_state: fd.get("q2_use") || "",
      q3_connection: fd.get("q3") || "",
      q4_problem: fd.get("q4") || "",
      q5_flags: fd.getAll("q5"),
      q6_insurance: fd.get("q6") || "",
    };
    const payload = {
      contact: {
        name: fd.get("c_name") || "",
        email: fd.get("c_email") || "",
        phone: fd.get("c_phone") || "",
      },
      vehicle: {
        year: fd.get("v_year") ? Number(fd.get("v_year")) : null,
        make: fd.get("v_make") || "",
        model: fd.get("v_model") || "",
        vin: fd.get("v_vin") || "",
        vehicle_class: fd.get("v_class") || "",
      },
      route,
      screen: answers,
      notes: fd.get("notes") || "",
    };
    if (DISCLOSURE_ROUTES.includes(route)) {
      payload.montana_disclosure = {
        accepted: fd.get("disc_accept") === "yes",
        accepted_at:
          fd.get("disc_accept") === "yes" ? new Date().toISOString() : null,
        version: DISCLOSURE_VERSION,
        printed_name: fd.get("disc_name") || "",
      };
    }
    return { payload, answers, route };
  }

  async function onSubmit(ev) {
    ev.preventDefault();
    setError("");
    setPayTier(null);
    const g = gather();
    if (!g.payload.contact.name || !g.payload.contact.email) {
      setError("Name and email are required.");
      return;
    }
    if (
      !g.answers.q1_garaging_state ||
      !g.answers.q2_use_state ||
      !g.answers.q3_connection ||
      !g.answers.q4_problem ||
      !g.answers.q6_insurance
    ) {
      setError("Please answer all six questions — the screen can't run without them.");
      return;
    }
    // Instant (client) verdict, then the server-authoritative verdict.
    const local = evaluate({ screen: g.answers, route: g.route });
    setResult({ ...local, extra: "Checking with the office…" });
    setSending(true);
    try {
      const r = await fetch("/api/v1/intakes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(g.payload),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) {
        const probs = (j.problems || [j.error || "submission failed"]).join(" ");
        setError(probs);
        setResult({
          ...local,
          extra: `Your screen result above stands, but the intake could not be recorded: ${probs}`,
        });
        return;
      }
      let extra = `Intake recorded. Reference: ${j.intake_id}. `;
      if (j.action === "human_review") {
        extra +=
          "A human reviews your file before any payment link is issued." +
          (j.requires ? ` Required: ${j.requires}.` : "");
      } else if (j.action === "ready") {
        // Post-screen payment step (Q4): only a server-recorded green
        // file whose disclosure (where the route requires one) is
        // satisfied receives its route's link — on this confirmation,
        // never before the screen.
        const tier =
          j.disclosure_satisfied === false
            ? null
            : payableTier(g.route, g.payload.vehicle.vehicle_class);
        if (tier) {
          setPayTier(tier);
          extra +=
            "Next: we send your route's document checklist. Your payment step is below — it opens only now, after your green screen, for this file.";
        } else {
          extra +=
            "Next: we send your route's document checklist and confirm the exact price in writing before any payment.";
        }
      } else if (j.action === "declined") {
        extra += j.referral || "";
      }
      setResult({ verdict: j.verdict, reasons: j.reasons, extra });
    } catch {
      setResult({
        ...local,
        extra:
          "The screen result above is your answer. The office copy could not be sent just now — please try again in a moment.",
      });
    } finally {
      setSending(false);
      requestAnimationFrame(() =>
        verdictRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" })
      );
    }
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="screen-form">
      <p className="screen-intro">
        Six questions. They take two minutes, and they decide whether we can
        take your money. Answer for where the vehicle actually lives — not
        where the paperwork would be convenient. If your answers say a filing
        would put you on the wrong side of your home state's rules, we will
        decline it and tell you why in writing.
      </p>

      <fieldset className="qset">
        <legend>About you</legend>
        <div className="field-grid">
          <label className="field">
            Full name
            <input type="text" name="c_name" autoComplete="name" required />
          </label>
          <label className="field">
            Email
            <input type="email" name="c_email" autoComplete="email" required />
          </label>
          <label className="field">
            Phone (optional)
            <input type="tel" name="c_phone" autoComplete="tel" />
          </label>
        </div>
      </fieldset>

      <fieldset className="qset">
        <legend>The vehicle</legend>
        <div className="field-grid">
          <label className="field">
            Year
            <input type="number" name="v_year" min="1900" max="2100" placeholder="2021" />
          </label>
          <label className="field">
            Make
            <input type="text" name="v_make" placeholder="Polaris" />
          </label>
          <label className="field">
            Model
            <input type="text" name="v_model" placeholder="RZR XP 1000" />
          </label>
          <label className="field">
            VIN (optional at this stage)
            <input type="text" name="v_vin" />
          </label>
          <label className="field">
            Vehicle class
            <select name="v_class" defaultValue="">
              <option value="">— choose —</option>
              <option value="powersports">Powersports (dirt bike / ATV / UTV)</option>
              <option value="car">Car</option>
              <option value="truck">Truck</option>
              <option value="suv">SUV</option>
              <option value="rv">RV / motorhome</option>
              <option value="motorcycle">Motorcycle</option>
              <option value="golf_cart">Golf cart / LSV</option>
              <option value="trailer">Trailer</option>
              <option value="other">Other</option>
            </select>
          </label>
          <label className="field">
            Which desk / route?
            <select
              name="route"
              defaultValue="general"
              onChange={(e) => setShowDisclosure(DISCLOSURE_ROUTES.includes(e.target.value))}
            >
              <option value="general">Not sure — route me</option>
              <option value="florida_lsv">Florida — LSV conversion (golf cart)</option>
              <option value="florida_estate">Florida — estate transfer (§319.28)</option>
              <option value="florida_rebuilt">Florida — rebuilt title</option>
              <option value="title_recovery">Title recovery (lost / bonded / court / lien)</option>
              <option value="open_state_conversion">Open-state conversion filing (in my state)</option>
              <option value="montana_llc">Montana LLC route (gated — disclosure required)</option>
              <option value="sd_title">South Dakota titling (financed / non-resident)</option>
              <option value="domicile_subscription">Domicile &amp; renewals / ownership subscription</option>
            </select>
          </label>
        </div>
      </fieldset>

      <fieldset className="qset">
        <legend>Q1 — Garaging</legend>
        <p className="qtext">
          Where will this vehicle be kept overnight most of the time? (A storage
          unit, home garage, lot, or “on the road full-time” all count; tell us
          which.)
        </p>
        <div className="field-grid">
          <label className="field">
            State
            <select name="q1_state" required defaultValue="">
              <option value="">— choose —</option>
              <option value="FULLTIME">On the road full-time (no fixed garaging state)</option>
              <StateOptions />
            </select>
          </label>
          <label className="field">
            Detail (city, storage unit, home garage…)
            <input type="text" name="q1_detail" />
          </label>
        </div>
      </fieldset>

      <fieldset className="qset">
        <legend>Q2 — Use</legend>
        <p className="qtext">Where will it mainly be driven or used?</p>
        <label className="field">
          <select name="q2_use" required defaultValue="">
            <option value="">— choose —</option>
            <option value="SAME">Same state as Q1</option>
            <option value="MANY">Genuinely across many states</option>
            <StateOptions />
          </select>
        </label>
      </fieldset>

      <fieldset className="qset">
        <legend>Q3 — Connection</legend>
        <p className="qtext">What is your connection to the state in Q1/Q2?</p>
        <div className="choices">
          <label><input type="radio" name="q3" value="resident" required /> I live there</label>
          <label><input type="radio" name="q3" value="domiciled" /> I am domiciled there</label>
          <label><input type="radio" name="q3" value="business" /> I operate a real business there</label>
          <label><input type="radio" name="q3" value="stored_elsewhere" /> The vehicle is genuinely kept there, but I live elsewhere</label>
        </div>
      </fieldset>

      <fieldset className="qset">
        <legend>Q4 — The problem</legend>
        <p className="qtext">What problem are we solving? Choose the closest one:</p>
        <div className="choices">
          <label><input type="radio" name="q4" value="a" required /> (a) I have no title / my title paperwork is broken</label>
          <label><input type="radio" name="q4" value="b" /> (b) My state won't title or plate this vehicle class at all</label>
          <label><input type="radio" name="q4" value="c" /> (c) Estate, inheritance, or a death in the family</label>
          <label><input type="radio" name="q4" value="d" /> (d) Salvage / rebuilt vehicle</label>
          <label><input type="radio" name="q4" value="e" /> (e) The vehicle is financed and the lender holds the paper</label>
          <label><input type="radio" name="q4" value="f" /> (f) I'm moving, or I genuinely live on the road full-time</label>
          <label><input type="radio" name="q4" value="g" /> (g) The vehicle genuinely lives in Montana / I have a real Montana business or storage</label>
          <label><input type="radio" name="q4" value="h" /> (h) I want to pay less sales/use tax or registration cost in my home state</label>
        </div>
      </fieldset>

      <fieldset className="qset">
        <legend>Q5 — Paper and liens</legend>
        <p className="qtext">Which of these are true? (tick all that apply)</p>
        <div className="choices">
          <label><input type="checkbox" name="q5" value="lien" /> There is a loan/lien on the vehicle</label>
          <label><input type="checkbox" name="q5" value="no_title" /> The title is lost or was never issued</label>
          <label><input type="checkbox" name="q5" value="seller_not_owner" /> The seller is not the owner named on the title</label>
          <label><input type="checkbox" name="q5" value="branded" /> The title is branded salvage/rebuilt/flood/junk</label>
          <label><input type="checkbox" name="q5" value="none" /> None of these</label>
        </div>
      </fieldset>

      <fieldset className="qset">
        <legend>Q6 — Insurance truth</legend>
        <p className="qtext">
          Will the vehicle be insured at the address where it is actually kept
          (Q1), with the titled owner (including an LLC, if one is used)
          disclosed to the insurer?
        </p>
        <div className="choices">
          <label><input type="radio" name="q6" value="yes" required /> Yes</label>
          <label><input type="radio" name="q6" value="no" /> No</label>
          <label><input type="radio" name="q6" value="not_yet" /> I haven't arranged insurance yet</label>
        </div>
      </fieldset>

      {showDisclosure && (
        <fieldset className="qset disclosure-set">
          <legend>Montana route — signed disclosure</legend>
          <p className="qtext">
            This route requires the disclosure below. Reading it and ticking
            the box stores your acknowledgment with this intake (with
            timestamps) — the attestation record for your file.
          </p>
          <div className="disclosure-text">
            <p className="disclosure-title">
              MONTANA ROUTE — CUSTOMER DISCLOSURE AND ACKNOWLEDGMENT
            </p>
            <p>{DISCLOSURE_INTRO}</p>
            <ol>
              {DISCLOSURE_POINTS.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ol>
          </div>
          <div className="field-grid">
            <label className="field">
              Printed name
              <input type="text" name="disc_name" />
            </label>
          </div>
          <div className="choices">
            <label>
              <input type="checkbox" name="disc_accept" value="yes" /> I have
              read and I acknowledge the disclosure above.
            </label>
          </div>
        </fieldset>
      )}

      <label className="field notes-field">
        Anything else we should know? (optional)
        <textarea name="notes" rows={3} />
      </label>

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      <button className="btn btn-accent screen-submit" type="submit" disabled={sending}>
        {sending ? "Running the screen…" : "Run the free screen & submit intake"}
      </button>

      {result && (
        <div ref={verdictRef} className={`verdict verdict-${result.verdict}`} role="status">
          <p className="verdict-tag">
            {result.verdict === "green" && "Green — clear to file"}
            {result.verdict === "amber" && "Amber — acknowledgment + review"}
            {result.verdict === "red" && "Red — declined"}
          </p>
          <h3>{VERDICT_COPY[result.verdict].headline}</h3>
          <p>{VERDICT_COPY[result.verdict].body}</p>
          {result.reasons?.length > 0 && (
            <ul>
              {result.reasons.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          )}
          {result.extra && <p className="verdict-extra">{result.extra}</p>}
          {payTier && result.verdict === "green" && (
            <div
              className="pay-step"
              style={{
                borderTop: "1px solid var(--line-dark)",
                marginTop: 16,
                paddingTop: 18,
              }}
            >
              <p className="verdict-tag" style={{ color: "#5cc488" }}>
                Payment — the step after the screen
              </p>
              <p>
                Your file matches the <b>{payTier.name}</b> —{" "}
                <b>
                  {payTier.priceLabel}
                  {payTier.cadence === "/year" ? " / year" : ""}
                </b>
                {payTier.cadence === "one-time" ? ", one-time" : ""}, plus
                government fees itemised at cost. Paying starts your file,
                and the Refund-Until-Filed guarantee applies from the moment
                you pay.
              </p>
              <a
                className="btn btn-accent"
                href={payTier.stripe}
                target="_blank"
                rel="noopener noreferrer"
              >
                Pay {payTier.priceLabel}
                {payTier.cadence === "/year" ? "/yr" : ""} — secure Stripe
                checkout
              </a>
            </div>
          )}
        </div>
      )}
    </form>
  );
}
