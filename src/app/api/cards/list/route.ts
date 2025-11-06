import { NextRequest, NextResponse } from "next/server";
import { cpListCards } from "@/lib/cloudpayments";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { accountId } = body;

    console.log(`[API] ========== CARDS/LIST REQUEST ==========`);
    console.log(`[API] Request body:`, JSON.stringify(body, null, 2));
    console.log(`[API] accountId: ${accountId}`);
    console.log(`[API] accountId type: ${typeof accountId}`);
    console.log(`[API] accountId length: ${accountId?.length || 0}`);
    console.log(`[API] ========================================`);

    if (!accountId) {
      console.error(`[API] ❌ accountId is missing!`);
      return NextResponse.json({ error: "accountId is required" }, { status: 400 });
    }

    const result = await cpListCards(accountId);

    console.log(`[API] ========== CARDS/LIST RESULT ==========`);
    console.log(`[API] accountId used: ${accountId}`);
    console.log(`[API] result.ok: ${result.ok}`);
    console.log(`[API] result.status: ${result.status}`);
    console.log(`[API] result.error: ${result.error || "none"}`);
    console.log(`[API] cards count: ${result.data?.Model?.length || 0}`);
    if (result.data?.Model && result.data.Model.length > 0) {
      console.log(`[API] cards:`, JSON.stringify(result.data.Model, null, 2));
    }
    console.log(`[API] ========================================`);

    // Если 404 от CloudPayments - это нормально (нет карт), возвращаем пустой список
    // Проверяем и status, и ok, потому что cpListCards уже обрабатывает 404
    if (result.status === 404 || (result.ok && result.data?.Model === undefined)) {
      console.log(`[API] cards/list: 404 or empty, returning empty list`);
      return NextResponse.json({
        success: true,
        cards: [],
      });
    }

    // Если ok=true, возвращаем данные
    if (result.ok && result.data?.Model) {
      return NextResponse.json({
        success: true,
        cards: result.data.Model,
      });
    }

    // Если ok=false, возвращаем ошибку
    console.error(`[API] cards/list failed: ${result.error}`);
    return NextResponse.json({ error: result.error || "CloudPayments cards list failed" }, { status: 502 });
  } catch (e) {
    console.error("[API] cards/list error", e);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
