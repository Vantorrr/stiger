import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { accountId } = body;

    console.log(`[API] ========== CARDS/LIST REQUEST ==========`);
    console.log(`[API] Request body:`, JSON.stringify(body, null, 2));
    console.log(`[API] accountId: ${accountId}`);
    console.log(`[API] ========================================`);

    if (!accountId) {
      console.error(`[API] ❌ accountId is missing!`);
      return NextResponse.json({ error: "accountId is required" }, { status: 400 });
    }

    // ВАЖНО: CloudPayments НЕ имеет API метода cards/list
    // Получаем список карт из нашей базы данных
    const savedCards = await prisma.savedCard.findMany({
      where: { accountId },
      orderBy: { createdAt: "desc" },
    });

    console.log(`[API] ========== CARDS/LIST RESULT ==========`);
    console.log(`[API] accountId used: ${accountId}`);
    console.log(`[API] cards count: ${savedCards.length}`);
    if (savedCards.length > 0) {
      console.log(`[API] cards:`, savedCards.map(c => ({ token: c.token, lastFour: c.cardLastFour, type: c.cardType })));
    }
    console.log(`[API] ========================================`);

    // Преобразуем в формат, ожидаемый клиентом
    const cards = savedCards.map(card => ({
      Token: card.token,
      LastFour: card.cardLastFour,
      FirstSix: card.cardFirstSix,
      Type: card.cardType,
      PaymentSystem: card.cardType,
      ExpDate: card.cardExpDate,
      Issuer: card.issuer,
    }));

    return NextResponse.json({
      success: true,
      cards,
    });
  } catch (e) {
    console.error("[API] cards/list error", e);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
