export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface HttpRequestOptions {
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: unknown;
  timeoutMs?: number;
}

export interface HttpResponse<T> {
  status: number;
  ok: boolean;
  data: T;
}

export function createBasicAuthHeader(username: string, password: string): string {
  const token = Buffer.from(`${username}:${password}`).toString("base64");
  return `Basic ${token}`;
}

export async function httpRequest<T = unknown>(
  url: string,
  { method = "GET", headers = {}, body, timeoutMs }: HttpRequestOptions = {}
): Promise<HttpResponse<T>> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs ?? defaultTimeoutMs());

  try {
    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": body ? "application/json" : "application/json",
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
      cache: "no-store",
    });

    const text = await res.text();
    const data = (text ? JSON.parse(text) : {}) as T;

    return { status: res.status, ok: res.ok, data };
  } finally {
    clearTimeout(timeout);
  }
}

function defaultTimeoutMs(): number {
  const raw = process.env.HTTP_DEFAULT_TIMEOUT_MS;
  const val = raw ? Number(raw) : NaN;
  return Number.isFinite(val) && val > 0 ? val : 15000;
}




