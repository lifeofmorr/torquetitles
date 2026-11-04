import PhotoBand from "../components/PhotoBand";
import Reveal from "../components/Reveal";
import ScreenWidget from "../components/ScreenWidget";
import { FinalCta, SectionHead, Steps } from "../components/Sections";
import { GUARANTEE, PHOTOS, TIMELINE, TIMING_COPY } from "../lib/data";

const PROMISES = [
  {
    k: "01",
    h: "Published prices",
    p: "Powersports $749. Cars & RVs $949. White Glove $1,499. Ownership Cover $99/year. Government fees are separate, itemised at cost — never buried, never marked up in secret.",
  },
  {
    k: "02",
    h: "One timeline",
    p: "Intake → Eligibility screen → Documents → Filing submitted → Plates/registration → Title delivered → Renewal handled. You see your stage, always.",
  },
  {
    k: "03",
    h: "Refund until filed",
    p: "Full refund of our fee any time before your filing is submitted — and a full fee refund if we can't complete it.",
  },
  {
    k: "04",
    h: "We screen first",
    p: "Six short questions about where your vehicle is kept and used. They exist to protect you: some famous “loopholes” now get owners fined, taxed, or charged. If your case is one of those, we say so in writing and don't take your money.",
  },
];

const DESKS = [
  {
    n: "01",
    href: "/florida",
    h: "Florida Native Desk",
    p: "Golf-cart-to-LSV conversion filings, estate vehicle transfers, and rebuilt-title packets, done the Florida way.",
  },
  {
    n: "02",
    href: "/title-recovery",
    h: "Title Recovery Desk",
    p: "Lost titles, bonded titles, court-ordered titles, and lien-sale paperwork for shops and storage operators, nationwide triage.",
  },
  {
    n: "03",
    href: "/conversions",
    h: "Open-State Conversion Desk",
    p: "In-state street-legal conversion filings in the states that actually allow your vehicle class — including Michigan assembled-vehicle retitling.",
  },
  {
    n: "04",
    href: "/domicile",
    h: "Domicile & Renewals Desk",
    p: "Genuine full-time-traveller domicile support (by partner), renewals, and the $99/year ownership subscription that keeps every filing current.",
  },
];

const HOW = [
  { h: "Intake (10 minutes)", p: "Tell us the vehicle, the state it lives in, and the problem." },
  { h: "Eligibility screen", p: "Six questions. Green: proceed online. Amber: a written warning and a signed acknowledgment before any payment. Red: we decline the filing and tell you what kind of professional you actually need." },
  { h: "Documents", p: "A specific checklist for your route — nothing generic. Upload or mail; we verify before anything is filed." },
  { h: "Filing submitted", p: "We submit to the county/agency and your refund-until-filed window closes — because the work is now with the government, on the record." },
  { h: "Plates / registration issued", p: "Sent to you by trackable mail where the route produces them." },
  { h: "Title & documents delivered", p: "Your complete file copy goes into your document vault." },
  { h: "Renewal handled", p: "Subscribers never chase an annual report or renewal date again." },
];

const TRUST = [
  { v: "$749", l: "Powersports filing, all-in service fee" },
  { v: "$949", l: "Cars & RVs filing, all-in service fee" },
  { v: "$1,499", l: "White Glove filing, concierge handling" },
  { v: "$99/yr", l: "Ownership Cover — renewals, vault, alerts" },
  { v: "100%", l: "Service fee refunded until your filing is submitted" },
];

export default function Home() {
  return (
    <>
      {/* Hero — type first, the machine as the anchor image */}
      <section className="hero">
        <div className="hero-grid">
          <div className="hero-copy">
            <p className="t-eyebrow">TorqueTitles — Vehicle Titles &amp; Registration Filings</p>
            <h1 className="t-display">
              Vehicle paperwork, <span className="hl">filed honestly.</span>
            </h1>
            <p className="t-lead hero-sub">
              TorqueTitles prepares and files vehicle title and registration
              paperwork — conversions, lost titles, estates, rebuilt vehicles,
              and the routes that are actually lawful for where your vehicle
              lives. Our prices are published, our timeline is the same on
              every page, and if your situation shouldn't be filed at all, we
              tell you before you pay.
            </p>
            <div className="btn-row">
              <a className="btn btn-accent" href="/intake">
                Start with the free eligibility screen
              </a>
              <a className="btn btn-ghost-dark" href="/pricing">
                See published prices
              </a>
            </div>
          </div>
          <figure className="hero-photo">
            <img
              src={PHOTOS.hero.url}
              alt={PHOTOS.hero.subject}
              loading="eager"
              fetchPriority="high"
            />
            <figcaption>The vehicle is the easy part. The paper is the work.</figcaption>
          </figure>
        </div>
      </section>

      {/* Trust bar — the business's own published facts */}
      <div className="trustbar">
        <div className="wrap-w trustbar-in">
          {TRUST.map((t) => (
            <div className="cell" key={t.l}>
              <div className="v tnum">{t.v}</div>
              <div className="l">{t.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* The screen — the conversion core, one dark product panel */}
      <section className="section on-asphalt" id="screen">
        <div className="wrap">
          <SectionHead
            dark
            eyebrow="The eligibility screen"
            title="Six questions decide whether we can take your money."
            lead="The screen runs before any payment link exists. Green proceeds, amber proceeds only with your signed acknowledgment and a human review, and red is declined — in writing, with the reason."
          />
          <Reveal>
            <div className="screen-panel">
              <ScreenWidget />
            </div>
          </Reveal>
        </div>
      </section>

      {/* The promise */}
      <section className="section on-paper">
        <div className="wrap">
          <SectionHead
            eyebrow="The promise"
            title="Published. Screened. Guaranteed."
          />
          <div className="rows">
            {PROMISES.map((p) => (
              <Reveal className="row-item" key={p.k}>
                <span className="k">{p.k}</span>
                <div>
                  <h3>{p.h}</h3>
                  <p>{p.p}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <PhotoBand
        src={PHOTOS.dune.url}
        alt={PHOTOS.dune.subject}
        caption="Powersports is where we started"
      />

      {/* The four desks */}
      <section className="section on-asphalt">
        <div className="wrap">
          <SectionHead
            dark
            eyebrow="What we file"
            title="Four desks. Every lawful lane has one."
          />
          <div className="desk-rows">
            {DESKS.map((d) => (
              <a className="desk-row" href={d.href} key={d.n}>
                <span className="n">{d.n}</span>
                <span>
                  <h3>{d.h}</h3>
                  <p>{d.p}</p>
                </span>
                <span className="go">Visit the desk</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Honest box */}
      <section className="section on-paper">
        <div className="wrap">
          <Reveal>
            <div className="honest">
              <h3>A plate is not permission</h3>
              <p>
                A registration from one state does not make a vehicle legal to
                drive in another state, and it does not erase the registration
                or tax duties of the state where the vehicle is actually kept.
                The state where you drive decides whether your vehicle class
                may use its roads. The state where you garage decides your
                registration and tax duties. Anyone who tells you otherwise —
                in any state, guaranteed — is selling you their problem. We
                file paperwork that respects all three, and we'll show you the
                rule for your state before you pay.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* How it works — the one timeline */}
      <section className="section on-paper2">
        <div className="wrap">
          <SectionHead
            eyebrow="How it works"
            title="One timeline, on every page."
            lead={`The same seven stages — ${TIMELINE.join(" → ")} — for every route and every file.`}
          />
          <Steps steps={HOW} />
          <p className="timing-note">{TIMING_COPY}</p>
        </div>
      </section>

      <PhotoBand
        src={PHOTOS.rvRoad.url}
        alt={PHOTOS.rvRoad.subject}
        caption="Cars, trucks, and motorhomes — filed the same honest way"
      />

      {/* Who we turn away + the guarantee */}
      <section className="section on-asphalt">
        <div className="wrap">
          <SectionHead
            dark
            eyebrow="Who we turn away — yes, on the homepage"
            title="Declining the wrong files is the service."
            lead="We decline filings whose purpose is to avoid a home state's taxes or registration duties for a vehicle that lives in that state, requests to remove or hide a title brand, anything involving a VIN that doesn't match the vehicle, and paperwork that would require a statement we know isn't true."
          />
          <Reveal>
            <div className="guarantee">
              <p className="g-label">The guarantee, verbatim</p>
              <blockquote>{GUARANTEE}</blockquote>
            </div>
          </Reveal>
        </div>
      </section>

      <FinalCta />
    </>
  );
}
