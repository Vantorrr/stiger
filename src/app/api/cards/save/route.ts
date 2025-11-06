import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { accountId, cardLastFour, cardType, token, transactionId } = await req.json();
    
    if (!accountId || !transactionId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Формируем данные карты
    const cardData = {
      id: Date.now().toString(),
      mask: cardLastFour ? `•••• ${cardLastFour}` : "•••• ••••",
      type: cardType || "Unknown",
      token: token || "",
      transactionId,
      accountId,
      savedAt: new Date().toISOString()
    };

    console.log("Saving card via webhook:", cardData);

    // В будущем здесь будет сохранение в БД
    // Пока возвращаем успех и карта должна отображаться через вебхук
    // TODO: сохранить в Redis/DB привязку accountId -> cardData

    return NextResponse.json({
      success: true,
      card: cardData
    });

  } catch (error) {
    console.error("Card save error:", error);
    return NextResponse.json({ 
      error: "Failed to save card",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

