import Reveal from "./Reveal";

/** Section heading pattern — plain-text eyebrow, display title, lead. */
export function SectionHead({ eyebrow, title, lead, dark = false }) {
  return (
    <div className={dark ? "sec-head on-dark" : "sec-head"}>
      {eyebrow && <p className="t-eyebrow">{eyebrow}</p>}
      <h2 className="t-h2">{title}</h2>
      {lead && <p className="t-lead sec-lead">{lead}</p>}
    </div>
  );
}

/** §5.6 Steps — oversized machined numerals over hairline rows. */
export function Steps({ steps }) {
  return (
    <ol className="steps">
      {steps.map((s, i) => (
        <li key={s.h}>
          <div className="n">{String(i + 1).padStart(2, "0")}</div>
          <div>
            <h3>{s.h}</h3>
            <p>{s.p}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

/** §5.11 FinalCta — dark, one headline, one paragraph, the hero's CTAs. */
export function FinalCta({
  title = "Start with the free eligibility screen.",
  body = "Six questions. If we can file it, you'll see the exact price. If we can't, you'll know why — in writing.",
}) {
  return (
    <section className="final">
      <div className="wrap">
        <Reveal>
          <p className="t-eyebrow">TorqueTitles</p>
          <h2 className="t-cta">{title}</h2>
          <p className="final-body">{body}</p>
          <div className="btn-row">
            <a className="btn btn-accent" href="/intake">
              Run the free screen
            </a>
            <a className="btn btn-ghost-dark" href="/pricing">
              See published prices
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
