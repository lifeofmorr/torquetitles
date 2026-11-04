import photos from "../content/photos.json";

export const SITE = {
  name: "TorqueTitles",
  descriptor: "Vehicle Titles & Registration Filings",
  baseUrl: "https://torquetitles.com",
  themeColor: "#0d0d0f",
  // Business contact — mailbox on the brand domain (domain registering at
  // launch; the address is the published contact from day one).
  contactEmail: "support@torquetitles.com",
  // Entity line (Don's decision, 2026-11-03): the brand operates under
  // the existing LLC, with no fictitious name. Shown in the footer and on the
  // legal pages.
  entityLine: "TorqueTitles is a service of LIFEOFMORR LLC.",
  entityDetail:
    "TorqueTitles is a service of LIFEOFMORR LLC, a Florida limited liability company (Florida document no. L23000457288).",
};

/* Stripe payment links — LIVE (created and read-back verified on the
 * Lifeofmorr Stripe account, 2026-11-03; phone collection enabled on every
 * link). By design (launch-checklist §5) no checkout is reachable before
 * the eligibility screen: green files receive their route's link, amber
 * files receive it only after the signed disclosure + human review, and
 * red files never receive one. These constants are the post-screen
 * handoff targets — the pricing page publishes prices, not buy buttons. */
export const TORQUETITLES_STRIPE_POWERSPORTS =
  "https://buy.stripe.com/00w9AS1Jl9Z09la71D8sp1L"; // Powersports Registration — $749
export const TORQUETITLES_STRIPE_CARS_RV =
  "https://buy.stripe.com/28E9AS4Vx4EG1SIclX8sp1M"; // Car & RV Registration — $949
export const TORQUETITLES_STRIPE_WHITE_GLOVE =
  "https://buy.stripe.com/dRmfZggEffjk7d21Hj8sp1N"; // White Glove — $1,499
export const TORQUETITLES_STRIPE_OWNERSHIP_COVER =
  "https://buy.stripe.com/14A4gyfAbb34fJy1Hj8sp1O"; // Ownership Cover — $99/yr

export const STRIPE_LINKS = {
  powersports: TORQUETITLES_STRIPE_POWERSPORTS,
  carsRv: TORQUETITLES_STRIPE_CARS_RV,
  whiteGlove: TORQUETITLES_STRIPE_WHITE_GLOVE,
  ownershipCover: TORQUETITLES_STRIPE_OWNERSHIP_COVER,
};

/** Published prices (site-copy-final.md §6 — the business's own truth). */
export const PRICING = [
  {
    key: "powersports",
    name: "Powersports filing",
    detail: "Dirt bike / ATV / UTV, gated routes",
    price: 749,
    priceLabel: "$749",
    cadence: "one-time",
    stripe: TORQUETITLES_STRIPE_POWERSPORTS,
    includes:
      "Eligibility screen, document prep, LLC formation handling where the route uses one, county filing, temp tag where the route issues one, first-year renewal handling",
    gov: "Itemised at cost (e.g., Montana: $35 LLC filing, ~$12 title, $53.25–$114.50 permanent quadricycle registration + $16 safety + $10 MHP, plate/shipping)",
  },
  {
    key: "carsRv",
    name: "Car / truck / SUV / RV filing",
    detail: "Light vehicles and motorhomes, gated routes",
    price: 949,
    priceLabel: "$949",
    cadence: "one-time",
    stripe: TORQUETITLES_STRIPE_CARS_RV,
    includes:
      "Same as powersports, for light vehicles and motorhomes",
    gov: "Itemised at cost (e.g., Montana registration $217 → $87 → $28 by age, or $87.50 permanent at 11+ yrs; +$825 luxury surcharge where the state assesses it — that is Montana's fee, not ours)",
  },
  {
    key: "whiteGlove",
    name: "White Glove filing",
    detail: "Concierge handling, any gated route",
    price: 1499,
    priceLabel: "$1,499",
    cadence: "one-time",
    stripe: TORQUETITLES_STRIPE_WHITE_GLOVE,
    includes:
      "A named specialist, custom-plate application handling, overnight shipping both ways, priority document review; also the standard route for Michigan assembled-vehicle concierge filings",
    gov: "Itemised at cost",
  },
  {
    key: "ownershipCover",
    name: "Ownership Cover — the ownership subscription",
    detail: "Domicile & Renewals Desk",
    price: 99,
    priceLabel: "$99",
    cadence: "/year",
    stripe: TORQUETITLES_STRIPE_OWNERSHIP_COVER,
    includes:
      "Renewal/annual-report filing, document vault, replacement-document help, add-a-vehicle quotes, annual garaging-state law-change alert, 60/30/7-day lapse reminders",
    gov: "Government renewal fees at cost, itemised",
  },
];

/** The one timeline — exact stage names everywhere (site-copy-final.md). */
export const TIMELINE = [
  "Intake",
  "Eligibility screen",
  "Documents",
  "Filing submitted",
  "Plates / registration issued",
  "Title & documents delivered",
  "Renewal handled",
];

export const TIMING_COPY =
  "Most clean files reach Filing submitted within 1–2 business days of complete documents. Government offices then work on their own clocks: Montana titles commonly take about two weeks after filing, custom plates can take 3–8 weeks, bonded titles 4–6 weeks, court-ordered titles 2–6 months, and Michigan assembled-vehicle retitling about 3–4 months. We show you the stage your file is in, and we tell you the day a government office tells us about a delay.";

export const GUARANTEE =
  "Refund until filed. If you cancel before we submit your filing to the county or agency, we refund our service fee in full. If we cannot complete your filing, we refund our service fee in full. Government fees are refunded to the extent the government refunds them. No time windows, no deduction ladder, no store credit.";

export const DISCLAIMER =
  "TorqueTitles is a private filing-preparation service. We are not a DMV, tax collector, Secretary of State, court, or any government agency, and we do not issue titles, plates, or registrations — government offices do. We prepare and submit paperwork as your agent. We do not provide tax or legal advice; questions about your tax duties or legal position belong to your own CPA or attorney.";

export const PHOTOS = photos;

export const NAV = [
  { href: "/florida", label: "Florida" },
  { href: "/title-recovery", label: "Title recovery" },
  { href: "/conversions", label: "Conversions" },
  { href: "/domicile", label: "Domicile & renewals" },
  { href: "/pricing", label: "Pricing" },
];
