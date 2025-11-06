import { NextRequest, NextResponse } from "next/server";
import { cpUnbindCard } from "@/lib/cloudpayments";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { accountId, token } = await req.json();

    if (!accountId || !token) {
      return NextResponse.json({ error: "accountId и token обязательны" }, { status: 400 });
    }

    const result = await cpUnbindCard(accountId, token);

    if (!result.ok) {
      return NextResponse.json({ error: result.error || "CloudPayments card unbind failed" }, { status: 502 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("cards/unbind error", e);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
