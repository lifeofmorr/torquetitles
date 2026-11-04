export default function NotFound() {
  return (
    <section className="notfound on-asphalt">
      <div className="wrap">
        <p className="t-eyebrow">404</p>
        <h1 className="t-display">That page isn't on file.</h1>
        <p className="t-lead" style={{ color: "var(--steel-2)", maxWidth: "52ch" }}>
          The desks, the prices, and the screen are all where they've always
          been — start from the homepage or run the free screen.
        </p>
        <div className="btn-row">
          <a className="btn btn-accent" href="/intake">
            Run the free screen
          </a>
          <a className="btn btn-ghost-dark" href="/">
            Homepage
          </a>
        </div>
      </div>
    </section>
  );
}
