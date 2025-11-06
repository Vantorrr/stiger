import crypto from "crypto";

export interface CloudPaymentsInitPayload {
  publicId: string;
  amount: number;
  currency: string;
  description: string;
  invoiceId: string;
  accountId: string;
  jsonData?: Record<string, unknown>;
}

export function cloudPaymentsPublicId(): string {
  const id = process.env.CLOUDPAYMENTS_PUBLIC_ID;
  if (!id) throw new Error("CLOUDPAYMENTS_PUBLIC_ID is not set");
  return id;
}

export function cloudPaymentsSecret(): string {
  const key = process.env.CLOUDPAYMENTS_API_SECRET;
  if (!key) throw new Error("CLOUDPAYMENTS_API_SECRET is not set");
  return key;
}

export interface CloudPaymentsSavedCard {
  FirstSix?: string;
  LastFour?: string;
  ExpDate?: string;
  Token?: string;
  Type?: string;
  Issuer?: string;
  IssuerBankCountry?: string;
  PaymentSystem?: string;
}

export function verifyCloudPaymentsHmac(rawBody: string, headerValue?: string | null): boolean {
  if (!headerValue) return false;
  const secret = cloudPaymentsSecret();
  const hmac = crypto.createHmac("sha256", secret).update(rawBody, "utf8").digest("base64");
  // CloudPayments header commonly named "Content-HMAC"
  return hmac === headerValue;
}

const API_URL = process.env.CLOUDPAYMENTS_API_URL || "https://api.cloudpayments.ru";

function getBasicAuthHeader(): Record<string, string> {
  const publicId = cloudPaymentsPublicId();
  const secret = cloudPaymentsSecret();
  const token = Buffer.from(`${publicId}:${secret}`).toString("base64");
  return { Authorization: `Basic ${token}` };
}

export async function cpConfirm(params: { transactionId: string; amount?: number }): Promise<{ ok: boolean; data?: Record<string, unknown>; status: number; error?: string }> {
  try {
    const res = await fetch(`${API_URL}/payments/confirm`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getBasicAuthHeader(),
      },
      body: JSON.stringify({
        TransactionId: params.transactionId,
        ...(params.amount ? { Amount: params.amount } : {}),
      }),
      // CloudPayments API expects basic auth over HTTPS
    });
    const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    const messageField = data as { Message?: unknown };
    const lowerMessageField = data as { message?: unknown };
    const errorMessage = typeof messageField.Message === "string"
      ? messageField.Message
      : typeof lowerMessageField.message === "string"
        ? lowerMessageField.message
        : undefined;
    return { ok: res.ok, data, status: res.status, error: res.ok ? undefined : errorMessage };
  } catch (e) {
    return { ok: false, status: 500, error: e instanceof Error ? e.message : "confirm failed" };
  }
}

export async function cpVoid(params: { transactionId: string }): Promise<{ ok: boolean; data?: Record<string, unknown>; status: number; error?: string }> {
  try {
    const res = await fetch(`${API_URL}/payments/void`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getBasicAuthHeader(),
      },
      body: JSON.stringify({
        TransactionId: params.transactionId,
      }),
    });
    const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    const messageField = data as { Message?: unknown };
    const lowerMessageField = data as { message?: unknown };
    const errorMessage = typeof messageField.Message === "string"
      ? messageField.Message
      : typeof lowerMessageField.message === "string"
        ? lowerMessageField.message
        : undefined;
    return { ok: res.ok, data, status: res.status, error: res.ok ? undefined : errorMessage };
  } catch (e) {
    return { ok: false, status: 500, error: e instanceof Error ? e.message : "void failed" };
  }
}

export async function cpListCards(accountId: string): Promise<{ ok: boolean; status: number; data?: { Success?: boolean; Model?: CloudPaymentsSavedCard[]; Message?: string; message?: string }; error?: string }> {
  try {
    const res = await fetch(`${API_URL}/cards/list`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getBasicAuthHeader(),
      },
      body: JSON.stringify({
        AccountId: accountId,
      }),
    });

    console.log(`[CP] cards/list request: accountId=${accountId}`);
    console.log(`[CP] cards/list status: ${res.status} for accountId: ${accountId}`);

    // Парсим ответ
    const data = (await res.json().catch(() => ({}))) as { Success?: boolean; Model?: CloudPaymentsSavedCard[]; Message?: string; message?: string };
    
    // Проверяем, есть ли ошибка "404 - not found" в теле ответа
    const errorMessage = typeof data?.Message === "string" ? data.Message : typeof data?.message === "string" ? data.message : undefined;
    const is404Error = res.status === 404 || errorMessage?.includes("404") || errorMessage?.includes("not found");

    // Если у пользователя нет карт, CloudPayments может вернуть 404 или ошибку "404 - not found"
    if (is404Error) {
      console.log(`[CP] cards/list: 404/not found - no cards for accountId: ${accountId}, returning empty list`);
      return {
        ok: true,
        status: 404,
        data: { Success: true, Model: [] },
      };
    }

    const ok = res.ok && data?.Success !== false;

    console.log(`[CP] cards/list: ok=${ok}, status=${res.status}, error=${errorMessage || "none"}, cards count=${data?.Model?.length || 0}`);
    if (data?.Model && data.Model.length > 0) {
      console.log(`[CP] cards/list: cards found:`, data.Model.map(c => ({ LastFour: c.LastFour, Type: c.Type, PaymentSystem: c.PaymentSystem })));
    }

    return {
      ok,
      status: res.status,
      data,
      error: ok ? undefined : errorMessage || "cards list failed",
    };
  } catch (e) {
    console.error(`[CP] cards/list error:`, e);
    return {
      ok: false,
      status: 500,
      error: e instanceof Error ? e.message : "cards list failed",
    };
  }
}

export async function cpUnbindCard(accountId: string, token: string): Promise<{ ok: boolean; status: number; data?: Record<string, unknown>; error?: string }> {
  try {
    const res = await fetch(`${API_URL}/cards/unbind`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getBasicAuthHeader(),
      },
      body: JSON.stringify({
        AccountId: accountId,
        Token: token,
      }),
    });

    const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    const successField = data as { Success?: unknown };
    const messageField = data as { Message?: unknown };
    const lowerMessageField = data as { message?: unknown };
    const ok = res.ok && successField.Success !== false;
    const errorMessage = typeof messageField.Message === "string"
      ? messageField.Message
      : typeof lowerMessageField.message === "string"
        ? lowerMessageField.message
        : undefined;

    return {
      ok,
      status: res.status,
      data,
      error: ok ? undefined : errorMessage || "card unbind failed",
    };
  } catch (e) {
    return {
      ok: false,
      status: 500,
      error: e instanceof Error ? e.message : "card unbind failed",
    };
  }
}

// Списание средств с привязанной карты по токену
export async function cpChargeToken(params: {
  token: string;
  amount: number;
  currency: string;
  accountId: string;
  invoiceId?: string;
  description?: string;
  jsonData?: Record<string, unknown>;
}): Promise<{ ok: boolean; data?: Record<string, unknown>; status: number; error?: string }> {
  try {
    const res = await fetch(`${API_URL}/payments/tokens/charge`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getBasicAuthHeader(),
      },
      body: JSON.stringify({
        Token: params.token,
        Amount: params.amount,
        Currency: params.currency,
        AccountId: params.accountId,
        ...(params.invoiceId ? { InvoiceId: params.invoiceId } : {}),
        ...(params.description ? { Description: params.description } : {}),
        ...(params.jsonData ? { JsonData: params.jsonData } : {}),
      }),
    });

    const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    const messageField = data as { Message?: unknown };
    const lowerMessageField = data as { message?: unknown };
    const errorMessage = typeof messageField.Message === "string"
      ? messageField.Message
      : typeof lowerMessageField.message === "string"
        ? lowerMessageField.message
        : undefined;

    return { ok: res.ok, data, status: res.status, error: res.ok ? undefined : errorMessage };
  } catch (e) {
    return { ok: false, status: 500, error: e instanceof Error ? e.message : "charge token failed" };
  }
}

