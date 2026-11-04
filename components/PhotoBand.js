// Photography band — full-bleed real photography from the locked pool
// (content/photos.json; provenance in BUILD-REPORT.md). Hero bands load
// eager + high priority; later bands lazy (standard §6.6).
export default function PhotoBand({
  src,
  alt = "",
  eager = false,
  tall = false,
  caption = null,
  className = "",
}) {
  if (!src) return null;
  const cls = `photo-band${tall ? " tall" : ""}${className ? ` ${className}` : ""}`;
  return (
    <figure className={cls}>
      <img
        src={src}
        alt={alt}
        loading={eager ? "eager" : "lazy"}
        fetchPriority={eager ? "high" : undefined}
      />
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}
