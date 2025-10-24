import { NextRequest, NextResponse } from "next/server";
import { verifyCloudPaymentsHmac } from "@/lib/cloudpayments";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  // Универсальный парсинг тела: JSON или x-www-form-urlencoded
  const contentType = req.headers.get("content-type") || "";
  let raw = "";
  let payload: any = {};
  try {
    raw = await req.text();
    if (contentType.includes("application/json")) {
      payload = JSON.parse(raw || "{}");
    } else if (contentType.includes("application/x-www-form-urlencoded")) {
      const params = new URLSearchParams(raw);
      payload = Object.fromEntries(params.entries());
    } else {
      // Пытаемся сначала как JSON, затем как form-urlencoded
      try {
        payload = JSON.parse(raw || "{}");
      } catch {
        const params = new URLSearchParams(raw || "");
        payload = Object.fromEntries(params.entries());
      }
    }
  } catch (e) {
    console.error("[CP Webhook] body parse error", e);
    // Даже при ошибке парсинга возвращаем code:0 для Check, чтобы не блокировать платежи
    return NextResponse.json({ code: 0 });
  }

  // Приводим числовые поля, если пришли строками (типично для form-urlencoded)
  if (payload.Amount && typeof payload.Amount === "string") {
    const n = Number(payload.Amount);
    if (!Number.isNaN(n)) payload.Amount = n;
  }

  // Check-запрос часто приходит без подписи. Определяем его максимально либерально
  const isCheckRequest = (!payload.TransactionId && !!payload.InvoiceId) || payload.Status === "Check";

  if (!isCheckRequest) {
    const signature = req.headers.get("content-hmac") || req.headers.get("Content-HMAC");
    if (signature) {
      const ok = verifyCloudPaymentsHmac(raw, signature);
      if (!ok) {
        return NextResponse.json({ success: false, message: "invalid signature" }, { status: 401 });
      }
    }
  }

  console.log("[CP Webhook]", payload?.Status, payload?.InvoiceId, payload?.TransactionId);

  const { Status, InvoiceId, TransactionId, Amount, Data } = payload;

  // Check-запрос (перед авторизацией)
  if (isCheckRequest) {
    console.log(`[CP] Check request for order ${InvoiceId}`);
    // Разрешаем платеж
    return NextResponse.json({ code: 0 });
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

// На всякий случай: поддержим GET-запросы как Check-пинг
export async function GET(_req: NextRequest) {
  return NextResponse.json({ code: 0 });
}

// И HEAD: некоторые клиенты могут стучаться HEAD перед POST
export async function HEAD(_req: NextRequest) {
  return NextResponse.json({ code: 0 });
}




