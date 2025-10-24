import { NextRequest, NextResponse } from "next/server";
import { BajieClient } from "@/lib/bajie";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { deviceId, shopId, userId } = body;
    
    if (!deviceId || !shopId) {
      return NextResponse.json({ error: "deviceId and shopId required" }, { status: 400 });
    }

    const client = new BajieClient();
    const externalOrderId = `stiger_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const response = await client.createRentOrder({
      deviceId,
      shopId,
      externalOrderId,
      userId: userId || externalOrderId,
    });

    return NextResponse.json({ ...response, externalOrderId });
  } catch (error) {
    console.error("Create order error:", error);
    return NextResponse.json({ error: "Order creation failed" }, { status: 500 });
  }
}








