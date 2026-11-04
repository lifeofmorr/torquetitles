import { DISCLAIMER, NAV, SITE } from "../lib/data";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="wrap-w footer-in">
        <div className="footer-top">
          <div className="footer-brand">
            <a className="logo" href="/">
              <img src="/assets/logo.svg" alt="" width="34" height="34" />
              <span className="logo-word">
                TORQUE<em>TITLES</em>
              </span>
            </a>
            <p className="footer-tag">
              Vehicle paperwork, filed honestly. Published prices, one
              timeline, refund until filed.
            </p>
            <p className="footer-contact">
              <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>
            </p>
          </div>
          <nav className="footer-nav" aria-label="Desks">
            <p className="footer-h">Desks</p>
            {NAV.slice(0, 4).map((n) => (
              <a key={n.href} href={n.href}>
                {n.label}
              </a>
            ))}
          </nav>
          <nav className="footer-nav" aria-label="Company">
            <p className="footer-h">Start</p>
            <a href="/pricing">Pricing</a>
            <a href="/intake">Free eligibility screen</a>
            <a href="/privacy">Privacy</a>
            <a href="/terms">Terms</a>
          </nav>
        </div>
        <p className="footer-disclaimer">{DISCLAIMER}</p>
        <div className="footer-legal">
          <span>
            © {new Date().getFullYear()} {SITE.entityLine}. All rights reserved.
          </span>
          <span>{SITE.entityDetail}</span>
        </div>
      </div>
    </footer>
  );
}
