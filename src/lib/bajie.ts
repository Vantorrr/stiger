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
  public authHeader: string;

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

  async getDeviceInfoByCabinetId(cabinetId: string) {
    const url = `${this.baseUrl}/rent/cabinet/query?cabinetId=${encodeURIComponent(cabinetId)}`;
    return httpRequest<BajieDeviceInfoResponse>(url, {
      headers: { Authorization: this.authHeader },
      method: "GET",
    });
  }

  async getDeviceInfo(deviceIdOrCabinetId: string) {
    // Try with deviceId first (IDs like DTAxxxxx are often deviceId), then fallback to cabinetId.
    const byDeviceUrl = `${this.baseUrl}/rent/cabinet/query?deviceId=${encodeURIComponent(deviceIdOrCabinetId)}`;
    const deviceRes = await httpRequest<BajieDeviceInfoResponse>(byDeviceUrl, {
      headers: { Authorization: this.authHeader },
      method: "GET",
    });

    // If backend returns generic error (code 500) or non-OK, try cabinetId as a fallback
    const deviceCode = deviceRes?.data?.code;
    if (!deviceRes.ok || deviceCode === 500 || deviceCode === 2004) {
      const byCabinetUrl = `${this.baseUrl}/rent/cabinet/query?cabinetId=${encodeURIComponent(deviceIdOrCabinetId)}`;
      const cabinetRes = await httpRequest<BajieDeviceInfoResponse>(byCabinetUrl, {
        headers: { Authorization: this.authHeader },
        method: "GET",
      });
      return cabinetRes;
    }

    return deviceRes;
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


