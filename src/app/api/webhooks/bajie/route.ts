import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function isAuthorized(req: NextRequest): boolean {
  const provided = req.headers.get("x-bajie-sign") || req.nextUrl.searchParams.get("sign");
  const expected = process.env.BAJIE_EVENT_PUSH_SECRET;
  if (!expected) return true; // allow when not configured
  return !!provided && provided === expected;
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  // TODO: persist event, update order state, handle return events
  console.log("[Bajie Event]", body);

  return NextResponse.json({ ok: true });
}


