import { createBasicAuthHeader, httpRequest } from "@/lib/http";

export interface BajieDeviceInfoResponse {
  msg: string;
  code: number;
  data?: {
    cabinet?: {
      id: string;
      shopId?: string;
      slots?: number;
      online?: boolean;
      emptySlots?: number;
      busySlots?: number;
      qrCode?: string;
    };
  };
}

export interface CreateRentOrderRequest {
  deviceId: string;
  shopId: string;
  externalOrderId: string;
  userId?: string;
}

export class BajieClient {
  private baseUrl: string;
  private authHeader: string;

  constructor(params?: { baseUrl?: string; username?: string; password?: string }) {
    const baseUrl = params?.baseUrl ?? process.env.BAJIE_BASE_URL ?? "https://developer.chargenow.top/cdb-open-api/v1";
    const u = params?.username ?? process.env.BAJIE_BASIC_USERNAME ?? "";
    const p = params?.password ?? process.env.BAJIE_BASIC_PASSWORD ?? "";
    if (!u || !p) {
      // Intentionally not throwing to allow stubs in dev; network calls will fail without creds
    }
    this.baseUrl = baseUrl.replace(/\/$/, "");
    this.authHeader = createBasicAuthHeader(u, p);
  }

  async getDeviceInfo(deviceId: string) {
    const url = `${this.baseUrl}/rent/cabinet/query?deviceId=${encodeURIComponent(deviceId)}`;
    return httpRequest<BajieDeviceInfoResponse>(url, {
      headers: { Authorization: this.authHeader },
      method: "GET",
    });
  }

  async createRentOrder(input: CreateRentOrderRequest) {
    const url = `${this.baseUrl}/rent/order/create`;
    return httpRequest<Record<string, unknown>>(url, {
      method: "POST",
      headers: { Authorization: this.authHeader },
      body: input,
    });
  }

  async markOrderCompleted(orderId: string) {
    const url = `${this.baseUrl}/rent/order/complete`;
    return httpRequest<Record<string, unknown>>(url, {
      method: "POST",
      headers: { Authorization: this.authHeader },
      body: { orderId },
    });
  }
}


