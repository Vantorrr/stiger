import { NextRequest, NextResponse } from "next/server";
import { cpListCards } from "@/lib/cloudpayments";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { accountId } = await req.json();

    if (!accountId) {
      return NextResponse.json({ error: "accountId is required" }, { status: 400 });
    }

    const result = await cpListCards(accountId);

    if (!result.ok) {
      return NextResponse.json({ error: result.error || "CloudPayments cards list failed" }, { status: 502 });
    }

    return NextResponse.json({
      success: true,
      cards: result.data?.Model || [],
    });
  } catch (e) {
    console.error("cards/list error", e);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
