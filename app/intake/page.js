import Reveal from "../../components/Reveal";
import ScreenWidget from "../../components/ScreenWidget";
import { GUARANTEE } from "../../lib/data";

export const metadata = {
  title: "Free eligibility screen — TorqueTitles",
  description:
    "Six questions decide whether TorqueTitles can file your vehicle paperwork. Green: proceed online. Amber: signed acknowledgment + human review. Red: declined, in writing. The screen is always free.",
  alternates: { canonical: "/intake" },
};

export default function IntakePage() {
  return (
    <>
      <section className="page-hero">
        <div className="wrap">
          <p className="t-eyebrow">Intake — stage 1 of 7</p>
          <h1 className="t-display">The free eligibility screen.</h1>
          <p className="t-lead">
            Tell us the vehicle, the state it lives in, and the problem. The
            screen runs on your answers immediately; the office copy is
            recorded with the verdict our team computed — the server's answer
            is the one that counts.
          </p>
        </div>
      </section>
      <section className="section on-asphalt" style={{ paddingTop: 56 }}>
        <div className="wrap">
          <Reveal>
            <div className="screen-panel">
              <ScreenWidget />
            </div>
          </Reveal>
          <div className="guarantee" style={{ marginTop: 48 }}>
            <p className="g-label">The guarantee</p>
            <blockquote style={{ fontSize: 20 }}>{GUARANTEE}</blockquote>
          </div>
        </div>
      </section>
    </>
  );
}
