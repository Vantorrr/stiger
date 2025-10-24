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

export async function cpConfirm(params: { transactionId: string; amount?: number }): Promise<{ ok: boolean; data?: any; status: number; error?: string }> {
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
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, data, status: res.status, error: res.ok ? undefined : data?.Message || data?.message };
  } catch (e) {
    return { ok: false, status: 500, error: e instanceof Error ? e.message : "confirm failed" };
  }
}

export async function cpVoid(params: { transactionId: string }): Promise<{ ok: boolean; data?: any; status: number; error?: string }> {
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
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, data, status: res.status, error: res.ok ? undefined : data?.Message || data?.message };
  } catch (e) {
    return { ok: false, status: 500, error: e instanceof Error ? e.message : "void failed" };
  }
}

