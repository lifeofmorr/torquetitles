import { NextResponse } from "next/server";
import { store } from "../../../../../../lib/service";
import { adminOk } from "../../../../../../lib/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/v1/admin/intakes/{id} — admin key required.
export async function GET(request, { params }) {
  if (!adminOk(request)) {
    return NextResponse.json({ error: "admin key required" }, { status: 401 });
  }
  const { id } = await params;
  const rec = await store.getIntake(id);
  if (!rec) {
    return NextResponse.json({ error: "intake not found" }, { status: 404 });
  }
  return NextResponse.json(rec);
}
