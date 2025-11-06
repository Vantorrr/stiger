import { NextRequest, NextResponse } from "next/server";
import { cpListCards } from "@/lib/cloudpayments";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { accountId } = await req.json();

    console.log(`[API] cards/list called with accountId: ${accountId}`);

    if (!accountId) {
      return NextResponse.json({ error: "accountId is required" }, { status: 400 });
    }

    const result = await cpListCards(accountId);

    console.log(`[API] cards/list result: ok=${result.ok}, status=${result.status}, error=${result.error || "none"}`);

    // Если 404 от CloudPayments - это нормально (нет карт), возвращаем пустой список
    if (result.status === 404) {
      console.log(`[API] cards/list: 404 from CP, returning empty list`);
      return NextResponse.json({
        success: true,
        cards: [],
      });
    }

    if (!result.ok) {
      console.error(`[API] cards/list failed: ${result.error}`);
      return NextResponse.json({ error: result.error || "CloudPayments cards list failed" }, { status: 502 });
    }

    return NextResponse.json({
      success: true,
      cards: result.data?.Model || [],
    });
  } catch (e) {
    console.error("[API] cards/list error", e);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
