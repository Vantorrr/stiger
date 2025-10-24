import { createBasicAuthHeader, httpRequest } from "@/lib/http";

export interface BajieDeviceInfoResponse {
  msg: string;
  code: number;
  data?: {
    cabinet?: {
      id?: string;
      slots?: Array<any>;
      emptySlots?: number;
      online?: boolean;
      qrCode?: string;
    };
    shop?: {
      id?: string;
      address?: string;
      lat?: number;
      lng?: number;
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
  public readonly authHeader: string;

  constructor() {
    const baseUrl = process.env.BAJIE_BASE_URL;
    const username = process.env.BAJIE_BASIC_USERNAME;
    const password = process.env.BAJIE_BASIC_PASSWORD;

    if (!baseUrl) throw new Error("BAJIE_BASE_URL is not set");
    if (!username) throw new Error("BAJIE_BASIC_USERNAME is not set");
    if (!password) throw new Error("BAJIE_BASIC_PASSWORD is not set");

    this.baseUrl = baseUrl;
    this.authHeader = createBasicAuthHeader(username, password);
  }

  async getDeviceInfo(cabinetId: string) {
    const url = `${this.baseUrl}/cabinet/info?cabinetid=${encodeURIComponent(cabinetId)}`;
    return await httpRequest<BajieDeviceInfoResponse>(url, {
      method: "GET",
      headers: {
        Authorization: this.authHeader,
      },
    });
  }

  async createRentOrder(params: CreateRentOrderRequest) {
    const callbackUrl = `${process.env.APP_URL}/api/webhooks/bajie`;
    const url = `${this.baseUrl}/rent/order/create?deviceId=${encodeURIComponent(params.deviceId)}&shopId=${encodeURIComponent(params.shopId)}&callbackURL=${encodeURIComponent(callbackUrl)}`;
    return await httpRequest(url, {
      method: "POST",
      headers: {
        Authorization: this.authHeader,
      },
    });
  }

  async ejectByRent(cabinetId: string, rentOrderId: string, slotNum: number = 1) {
    const url = `${this.baseUrl}/cabinet/ejectByRent?cabinetid=${encodeURIComponent(cabinetId)}&rentOrderId=${encodeURIComponent(rentOrderId)}&slotNum=${encodeURIComponent(String(slotNum))}`;
    return await httpRequest(url, {
      method: "POST",
      headers: {
        Authorization: this.authHeader,
      },
    });
  }
}


