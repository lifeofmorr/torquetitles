import { NextResponse } from "next/server";
import { store } from "../../../../../lib/service";
import { adminOk } from "../../../../../lib/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/v1/admin/intakes?status=&verdict=&limit= — admin key required.
export async function GET(request) {
  if (!adminOk(request)) {
    return NextResponse.json({ error: "admin key required" }, { status: 401 });
  }
  const qs = request.nextUrl.searchParams;
  let limit = parseInt(qs.get("limit") || "100", 10);
  if (Number.isNaN(limit)) limit = 100;
  limit = Math.min(limit, 500);
  const rows = await store.listIntakes({
    status: qs.get("status"),
    verdict: qs.get("verdict"),
    limit,
  });
  return NextResponse.json({ count: rows.length, intakes: rows });
}
