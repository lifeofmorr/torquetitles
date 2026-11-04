import { notFound } from "next/navigation";
import PhotoBand from "../../components/PhotoBand";
import Reveal from "../../components/Reveal";
import { FinalCta, SectionHead } from "../../components/Sections";
import { GUARANTEE, PHOTOS, PRICING } from "../../lib/data";
import pages from "../../content/pages.json";

// Content pages served from content/pages.json (the Phase-1 URL space,
// exactly): the four desks, pricing, and the legal pages.
export const dynamicParams = false;

const SLUGS = Object.keys(pages);

export function generateStaticParams() {
  return SLUGS.map((page) => ({ page }));
}

export async function generateMetadata({ params }) {
  const { page } = await params;
  const p = pages[page];
  if (!p) return {};
  return {
    title: { absolute: p.title },
    description: p.description || p.intro,
    alternates: { canonical: `/${page}` },
    openGraph: {
      title: p.title,
      description: p.description || p.intro,
      url: `/${page}`,
      type: "website",
    },
  };
}

function ProseSections({ sections }) {
  return sections.map((s) => (
    <div className="prose-sec" key={s.h}>
      <h2>{s.h}</h2>
      {(s.paras || []).map((para, i) => (
        <p key={i}>{para}</p>
      ))}
      {s.list && (
        <ul>
          {s.list.map((li, i) => (
            <li key={i}>{li}</li>
          ))}
        </ul>
      )}
      {s.priceLine && <p className="price-line">{s.priceLine}</p>}
    </div>
  ));
}

function PricingPage({ p }) {
  return (
    <>
      <section className="section on-paper">
        <div className="wrap">
          <SectionHead eyebrow="Core filings" title="The four published prices." />
          <div className="price-grid">
            {PRICING.map((t) => (
              <Reveal className="price-card" key={t.key}>
                <p className="p-name">{t.name}</p>
                <p className="p-detail">{t.detail}</p>
                <p className="p-price tnum">
                  {t.priceLabel}
                  <span className="per"> {t.cadence}</span>
                </p>
                <div className="p-row">
                  <b>Includes:</b> {t.includes}
                </div>
                <div className="p-row">
                  <b>Government / third-party:</b> {t.gov}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section on-paper2" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <SectionHead eyebrow="Quoted desks" title="Quoted in writing, after the free screen." />
          <div className="price-table-wrap">
            <table className="price-table">
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Our price</th>
                  <th>What it includes</th>
                  <th>Government / third-party costs</th>
                </tr>
              </thead>
              <tbody>
                {p.tableRows.map((r) => (
                  <tr key={r.svc}>
                    <td className="svc">{r.svc}</td>
                    <td className="amt">{r.price}</td>
                    <td>{r.includes}</td>
                    <td>{r.gov}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {p.note && (
            <div style={{ marginTop: 36 }}>
              <div className="honest">
                <h3>{p.note.h}</h3>
                {(p.note.paras || []).map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </div>
          )}
          <p className="checkout-note">
            <strong>How checkout works here:</strong> no checkout link is
            reachable before the eligibility screen. After a green screen —
            or an amber screen with the signed acknowledgment and human
            review — you receive your route's payment link for the exact
            price above. Red files never receive one. That order is the
            product: screen first, pay second, never the other way around.
          </p>
        </div>
      </section>

      <section className="section on-asphalt">
        <div className="wrap">
          <Reveal>
            <div className="guarantee">
              <p className="g-label">The guarantee, again — one sentence, no fine-print ladder</p>
              <blockquote>{GUARANTEE}</blockquote>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

export default async function ContentPage({ params }) {
  const { page } = await params;
  const p = pages[page];
  if (!p) notFound();
  const band = p.band ? PHOTOS[p.band.photo] : null;
  const isPricing = page === "pricing";

  return (
    <>
      <section className="page-hero">
        <div className="wrap">
          <p className="t-eyebrow">{p.kicker}</p>
          <h1 className="t-display">{p.h1}</h1>
          {p.intro && <p className="t-lead">{p.intro}</p>}
          {!isPricing && (
            <div className="btn-row">
              <a className="btn btn-accent" href="/intake">
                Run the free screen
              </a>
              <a className="btn btn-ghost-dark" href="/pricing">
                See published prices
              </a>
            </div>
          )}
        </div>
      </section>

      {band && (
        <PhotoBand src={band.url} alt={p.band.alt || band.subject} caption={p.band.caption} />
      )}

      {isPricing ? (
        <PricingPage p={p} />
      ) : (
        <section className="section on-paper" style={{ paddingTop: 40 }}>
          <div className="wrap">
            <div className="prose-wrap">
              <ProseSections sections={p.sections || []} />
              {p.note && (
                <div style={{ marginTop: 36 }}>
                  <div className="honest">
                    <h3>{p.note.h}</h3>
                    {(p.note.paras || []).map((para, i) => (
                      <p key={i}>{para}</p>
                    ))}
                    {p.note.list && (
                      <ul style={{ margin: "10px 0 0", paddingLeft: 22 }}>
                        {p.note.list.map((li, i) => (
                          <li key={i} style={{ fontSize: 15.5, lineHeight: 1.65, color: "var(--ink-2)", marginBottom: 8 }}>
                            {li}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      <FinalCta />
    </>
  );
}
