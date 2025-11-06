import { NextRequest, NextResponse } from "next/server";
import { verifyCloudPaymentsHmac } from "@/lib/cloudpayments";

type CloudPaymentsWebhookPayload = {
  Status?: string;
  InvoiceId?: string;
  TransactionId?: string;
  Amount?: number;
  Description?: string;
  AccountId?: string;
  Data?: Record<string, unknown> | string | null;
  [key: string]: unknown;
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  // Универсальный парсинг тела: JSON или x-www-form-urlencoded
  const contentType = req.headers.get("content-type") || "";
  let raw = "";
  let payload: CloudPaymentsWebhookPayload = {};
  try {
    raw = await req.text();
    if (contentType.includes("application/json")) {
      payload = JSON.parse(raw || "{}") as CloudPaymentsWebhookPayload;
    } else if (contentType.includes("application/x-www-form-urlencoded")) {
      const params = new URLSearchParams(raw);
      payload = Object.fromEntries(params.entries()) as CloudPaymentsWebhookPayload;
    } else {
      // Пытаемся сначала как JSON, затем как form-urlencoded
      try {
        payload = JSON.parse(raw || "{}") as CloudPaymentsWebhookPayload;
      } catch {
        const params = new URLSearchParams(raw || "");
        payload = Object.fromEntries(params.entries()) as CloudPaymentsWebhookPayload;
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

  const { Status, InvoiceId, TransactionId, Amount } = payload;
  const dataPayload: Record<string, unknown> | undefined = (() => {
    if (!payload.Data) return undefined;
    if (typeof payload.Data === "string") {
      try {
        return JSON.parse(payload.Data) as Record<string, unknown>;
      } catch {
        return undefined;
      }
    }
    if (typeof payload.Data === "object") {
      return payload.Data as Record<string, unknown>;
    }
    return undefined;
  })();
  const getString = (value: unknown): string | undefined => (typeof value === "string" ? value : undefined);

  // Check-запрос (перед авторизацией)
  if (isCheckRequest) {
    console.log(`[CP] Check request for order ${InvoiceId}`);
    // Разрешаем платеж
    return new NextResponse(JSON.stringify({ code: 0 }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  }

  switch (Status) {
    case "Authorized":
      // Платеж авторизован (деньги заблокированы)
      console.log(`[CP] Payment authorized for order ${InvoiceId}, amount: ${Amount}`);
      
      if (Amount === 1 && payload.Description?.includes("Привязка карты")) {
        console.log(`[CP] Card binding authorized for account ${payload.AccountId}`);
        console.log(`[CP] Card binding transaction: ${TransactionId}, AccountId: ${payload.AccountId}`);
        // Карта должна быть сохранена автоматически CloudPayments при saveCard: true
        // Проверяем через несколько секунд, что карта появилась
        setTimeout(async () => {
          try {
            const { cpListCards } = await import("@/lib/cloudpayments");
            const cardsResult = await cpListCards(payload.AccountId || "");
            console.log(`[CP] Card binding check: accountId=${payload.AccountId}, cards found=${cardsResult.data?.Model?.length || 0}`);
          } catch (e) {
            console.error("[CP] Failed to check cards after binding:", e);
          }
        }, 5000);
        break;
      }
      
      const deviceId = dataPayload ? getString(dataPayload["deviceId"]) : undefined;
      const shopId = dataPayload ? getString(dataPayload["shopId"]) : undefined;
      const slotNum = dataPayload ? getString(dataPayload["slotNum"]) : undefined;
      
      try {
        await fetch(`${process.env.APP_URL}/api/rentals/confirm`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: InvoiceId,
            transactionId: TransactionId,
            deviceId,
            shopId,
            slotNum
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
  
  return new NextResponse(JSON.stringify({ success: true, code: 0 }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}

// На всякий случай: поддержим GET-запросы как Check-пинг
export async function GET(_req: NextRequest) {
  return new NextResponse(JSON.stringify({ code: 0 }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

// И HEAD: некоторые клиенты могут стучаться HEAD перед POST
export async function HEAD(_req: NextRequest) {
  return new NextResponse(JSON.stringify({ code: 0 }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}




