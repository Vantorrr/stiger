import { NextRequest, NextResponse } from "next/server";
import { BajieClient } from "@/lib/bajie";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const deviceId = req.nextUrl.searchParams.get("deviceId");
  if (!deviceId) {
    return NextResponse.json({ error: "deviceId required" }, { status: 400 });
  }

  try {
    const client = new BajieClient();
    const response = await client.getDeviceInfo(deviceId);
    return NextResponse.json(response);
  } catch (error) {
    console.error("Bajie API error:", error);
    return NextResponse.json({ error: "API call failed" }, { status: 500 });
  }
}
