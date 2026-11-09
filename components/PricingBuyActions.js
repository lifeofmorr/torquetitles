/**
 * =====================================================================
 * GATE-PENDING — Q4 PRICING BUY ACTIONS — DO NOT SHIP
 * =====================================================================
 * Staged 2026-11-07 for Wave-1 Q4 adjudication ONLY. This component
 * renders PUBLIC buy buttons on the pricing page. It conflicts with
 * the business's documented standing rule — launch-checklist §5, as
 * recorded in files/torquetitles/BUILD-REPORT.md, "Deviations from
 * Phase 1 (deliberate, flagged)", item 2:
 *
 *   "Stripe links are wired but deliberately not public buy buttons.
 *    The sector rule — screen before payment — means checkout is
 *    issued per-file after a green screen (or amber + signed
 *    disclosure + review); red files never receive one. The API still
 *    returns `payment_link: null` in every case, exactly as Phase 1.
 *    Wiring them as public buttons would break the business's core
 *    promise; the pricing page states the flow in writing."
 *
 * Reaffirmed in files/torquetitles/REDESIGN-2026-11-03.md, item 5:
 * "Preserved, untouched — … screen-before-payment flow (no public buy
 * buttons added)."
 *
 * The Wave-1 Q4 spec (WAVE-1-BUILD-QUEUE.md) directs visible pricing
 * payment entry points anyway. Both cannot ship. This component and
 * its single usage site in app/[page]/page.js (marked with the same
 * GATE-PENDING banner and a data-gate-pending attribute below) are
 * the ENTIRE gate-pending change: remove the usage block and delete
 * this file and the site returns to its current, rule-compliant
 * state with no other effect.
 *
 * DO NOT SHIP without Don / main-seat adjudication. If adjudicated
 * TO ship, the pricing page's checkout-note paragraph (which states
 * the screen-first flow in writing) must be rewritten in the same
 * change — it contradicts these buttons as written.
 * =====================================================================
 */
export default function PricingBuyAction({ tier }) {
  return (
    <div
      data-gate-pending="q4-pricing-buy-buttons"
      style={{ marginTop: "auto", paddingTop: 18 }}
    >
      <a
        className="btn btn-ghost-light"
        href={tier.stripe}
        target="_blank"
        rel="noopener noreferrer"
      >
        Pay {tier.priceLabel}
        {tier.cadence === "/year" ? "/yr" : ""} — start checkout
      </a>
      <p
        style={{
          fontSize: 13,
          lineHeight: 1.55,
          color: "var(--ink-3)",
          margin: "10px 0 0",
        }}
      >
        Most files start with the free screen instead — it takes two
        minutes and confirms this is your price before you pay.
      </p>
    </div>
  );
}
