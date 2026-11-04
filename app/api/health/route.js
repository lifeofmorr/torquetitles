import { NextResponse } from "next/server";
import { APP_VERSION, store } from "../../../lib/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/health — public; version + intake count (Phase-1 contract).
export async function GET() {
  return NextResponse.json({
    ok: true,
    version: APP_VERSION,
    intakes: await store.count(),
  });
}
