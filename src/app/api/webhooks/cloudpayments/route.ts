import { NextRequest, NextResponse } from "next/server";
import { verifyCloudPaymentsHmac } from "@/lib/cloudpayments";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const raw = await req.text();
  const payload = JSON.parse(raw || "{}");
  
  // Check-запрос приходит БЕЗ signature!
  const isCheckRequest = !payload.TransactionId && payload.InvoiceId;
  
  if (!isCheckRequest) {
    const signature = req.headers.get("content-hmac") || req.headers.get("Content-HMAC");
    const ok = verifyCloudPaymentsHmac(raw, signature);
    if (!ok) {
      return NextResponse.json({ success: false, message: "invalid signature" }, { status: 401 });
    }
  }
  
  console.log("[CP Webhook]", payload?.Status, payload?.InvoiceId, payload?.TransactionId);
  
  // Обрабатываем разные типы уведомлений
  const { Status, InvoiceId, TransactionId, Amount, Data } = payload;
  
  // Check-запрос (перед авторизацией)
  if (isCheckRequest) {
    console.log(`[CP] Check request for order ${InvoiceId}`);
    // Всегда разрешаем платеж (можно добавить проверки)
    return NextResponse.json({ code: 0 }); // 0 = разрешить платеж
  }
  
  switch (Status) {
    case "Authorized":
      // Платеж авторизован (деньги заблокированы)
      // Здесь можно сразу инициировать выдачу powerbank
      console.log(`[CP] Payment authorized for order ${InvoiceId}, amount: ${Amount}`);
      
      try {
        await fetch(`${process.env.APP_URL}/api/rentals/confirm`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: InvoiceId,
            transactionId: TransactionId,
            deviceId: Data?.deviceId,
            shopId: Data?.shopId,
            slotNum: Data?.slotNum
          })
        });
      } catch (e) {
        console.error("Confirm via webhook failed", e);
      }
      
      break;
      
    case "Completed":
      // Платеж подтвержден (деньги списаны)
      console.log(`[CP] Payment completed for order ${InvoiceId}`);
      // TODO: Обновить статус заказа в базе
      break;
      
    case "Cancelled":
    case "Declined":
      // Платеж отменен или отклонен
      console.log(`[CP] Payment ${Status} for order ${InvoiceId}`);
      // TODO: Отменить заказ, освободить ресурсы
      break;
      
    case "Refunded":
      // Возврат средств
      console.log(`[CP] Payment refunded for order ${InvoiceId}`);
      // TODO: Обновить статус заказа
      break;
  }
  
  return NextResponse.json({ success: true, code: 0 });
}




