import { NextResponse } from "next/server";
import { submitIntake } from "../../../../lib/service";
import { ValidationError } from "../../../../lib/screen";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/v1/intakes — submit an intake (contact + vehicle + screen
// answers); the verdict is computed server-side. Mirrors the Phase-1 API:
// 201 with verdict + next steps, 422 with a problem list, 400 on bad JSON.
export async function POST(request) {
  let payload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }
  try {
    const result = await submitIntake(payload);
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    if (err instanceof ValidationError) {
      return NextResponse.json(
        { error: "validation failed", problems: err.problems },
        { status: 422 }
      );
    }
    throw err;
  }
}
