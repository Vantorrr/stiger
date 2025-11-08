import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { transactionId } = await req.json();
    
    if (!transactionId) {
      return NextResponse.json({ error: "Transaction ID required" }, { status: 400 });
    }
    
    // В реальном приложении здесь будет вызов CloudPayments API для отмены транзакции
    // Для привязки карты с авторизацией на 1 рубль и saveCard=true,
    // CloudPayments автоматически отменяет транзакцию, поэтому дополнительный вызов не требуется
    
    console.log("Card binding verification completed for transaction:", transactionId);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Refund error:", error);
    return NextResponse.json({ error: "Failed to process refund" }, { status: 500 });
  }
}







