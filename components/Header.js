import { NAV, SITE } from "../lib/data";

export default function Header() {
  return (
    <header className="nav">
      <div className="nav-in">
        <a className="logo" href="/" aria-label="TorqueTitles — home">
          <img src="/assets/logo.svg" alt="" width="34" height="34" />
          <span className="logo-word">
            TORQUE<em>TITLES</em>
          </span>
        </a>
        <nav>
          {NAV.map((n) => (
            <a key={n.href} href={n.href}>
              {n.label}
            </a>
          ))}
          <a className="cta" href="/intake">
            Free eligibility screen
          </a>
        </nav>
      </div>
      <div className="nav-sub wrap-w">
        <span>{SITE.descriptor}</span>
        <span className="nav-sub-r">Screen first. Pay second. Never the other way around.</span>
      </div>
    </header>
  );
}
