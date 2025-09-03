import { NextRequest, NextResponse } from "next/server";
import { verifyCloudPaymentsHmac } from "@/lib/cloudpayments";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const raw = await req.text();
  const signature = req.headers.get("content-hmac") || req.headers.get("Content-HMAC");
  const ok = verifyCloudPaymentsHmac(raw, signature);
  if (!ok) {
    return NextResponse.json({ success: false, message: "invalid signature" }, { status: 401 });
  }
  const payload = JSON.parse(raw || "{}");
  // TODO: idempotent update payment state, capture/void logic if needed
  console.log("[CP Webhook]", payload?.Status, payload?.InvoiceId);
  return NextResponse.json({ success: true });
}


