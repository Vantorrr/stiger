import { NextRequest, NextResponse } from "next/server";
import { verifyCloudPaymentsHmac } from "@/lib/cloudpayments";
import { prisma } from "@/lib/prisma";

type CloudPaymentsWebhookPayload = {
  Status?: string;
  InvoiceId?: string;
  TransactionId?: string;
  Amount?: number;
  Description?: string;
  AccountId?: string;
  CardId?: string;
  CardLastFour?: string;
  CardFirstSix?: string;
  CardType?: string;
  CardExpDate?: string;
  Issuer?: string;
  Token?: string; // Токен карты из вебхука
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
    case "Completed":
      // Платеж авторизован (деньги заблокированы) или завершен (деньги списаны)
      const statusText = Status === "Authorized" ? "authorized" : "completed";
      console.log(`[CP] Payment ${statusText} for order ${InvoiceId}, amount: ${Amount}`);
      
      if (Amount === 1 && payload.Description?.includes("Привязка карты")) {
        const accountId = payload.AccountId || "";
        const cardId = payload.CardId || "";
        const cardLastFour = payload.CardLastFour || "";
        const cardFirstSix = payload.CardFirstSix || "";
        const cardType = payload.CardType || "";
        const token = payload.Token || ""; // Токен карты из вебхука
        
        console.log(`[CP] ========== CARD BINDING EVENT ==========`);
        console.log(`[CP] TransactionId: ${TransactionId}`);
        console.log(`[CP] AccountId: ${accountId}`);
        console.log(`[CP] CardId: ${cardId}`);
        console.log(`[CP] CardLastFour: ${cardLastFour}`);
        console.log(`[CP] CardFirstSix: ${cardFirstSix}`);
        console.log(`[CP] CardType: ${cardType}`);
        console.log(`[CP] Token: ${token}`);
        console.log(`[CP] Status: ${Status}`);
        console.log(`[CP] Full payload:`, JSON.stringify(payload, null, 2));
        console.log(`[CP] ========================================`);
        
        // ВАЖНО: Если есть Token, но карта не сохранилась, это значит saveCard: true не сработал
        // CloudPayments должен сохранить карту автоматически при saveCard: true
        // Если карта не сохранилась, возможно проблема в настройках CloudPayments
        
        // ВАЖНО: CloudPayments НЕ имеет API метода cards/list для получения списка карт
        // Решение: сохраняем Token из вебхука в нашу базу данных
        // Используем сохраненные токены для последующих платежей через cpChargeToken
        
        if (token) {
          try {
            // Находим или создаем пользователя по accountId
            let user;
            if (accountId.startsWith("telegram_")) {
              const telegramId = parseInt(accountId.replace("telegram_", ""));
              user = await prisma.user.upsert({
                where: { telegramId },
                update: {},
                create: {
                  telegramId,
                  firstName: "User",
                },
              });
            } else {
              // Пытаемся найти по phone или создать нового
              user = await prisma.user.upsert({
                where: { phone: accountId },
                update: {},
                create: {
                  phone: accountId,
                  firstName: "User",
                },
              });
            }
            
            // Сохраняем карту в базу данных
            await prisma.savedCard.upsert({
              where: { token },
              update: {
                cardLastFour,
                cardFirstSix: cardFirstSix || undefined,
                cardType: cardType || undefined,
                cardExpDate: cardExpDate || undefined,
                issuer: issuer || undefined,
                accountId,
                updatedAt: new Date(),
              },
              create: {
                userId: user.id,
                accountId,
                token,
                cardLastFour,
                cardFirstSix: cardFirstSix || undefined,
                cardType: cardType || undefined,
                cardExpDate: cardExpDate || undefined,
                issuer: issuer || undefined,
              },
            });
            
            console.log(`[CP] ✅ Card saved to database: token=${token}, accountId=${accountId}, lastFour=${cardLastFour}`);
          } catch (e) {
            console.error(`[CP] ❌ Failed to save card to database:`, e);
          }
        } else {
          console.error(`[CP] ❌ No token in webhook payload for card binding`);
        }
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




