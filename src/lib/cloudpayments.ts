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
  const key = process.env.CLOUDPAYMENTS_SECRET;
  if (!key) throw new Error("CLOUDPAYMENTS_SECRET is not set");
  return key;
}

export function verifyCloudPaymentsHmac(rawBody: string, headerValue?: string | null): boolean {
  if (!headerValue) return false;
  const secret = cloudPaymentsSecret();
  const hmac = crypto.createHmac("sha256", secret).update(rawBody, "utf8").digest("base64");
  // CloudPayments header commonly named "Content-HMAC"
  return hmac === headerValue;
}


