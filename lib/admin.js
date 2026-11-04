import { timingSafeEqual } from "node:crypto";

/**
 * Admin auth for the intake API — mirrors the Phase-1 server: the key
 * arrives as the X-Admin-Key header or an Authorization: Bearer token and
 * is compared in constant time. Deliberate hardening vs. Phase 1: there is
 * no default key — when TORQUETITLES_ADMIN_KEY is unset, every admin
 * request is refused (401) instead of falling back to a known value.
 */
export function adminOk(request) {
  const expected = process.env.TORQUETITLES_ADMIN_KEY || "";
  if (!expected) return false;
  const presented =
    request.headers.get("x-admin-key") ||
    (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "").trim();
  if (!presented) return false;
  const a = Buffer.from(presented);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}
