import { NextRequest, NextResponse } from "next/server";
import { BajieClient } from "@/lib/bajie";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const deviceId = req.nextUrl.searchParams.get("deviceId");
  const cabinetId = req.nextUrl.searchParams.get("cabinetId");
  const id = cabinetId || deviceId;
  
  if (!id) {
    return NextResponse.json({ error: "cabinetId or deviceId required" }, { status: 400 });
  }

  try {
    const client = new BajieClient();
    const result = await client.getDeviceInfo(id);
    
    console.log('Bajie getDeviceInfo result:', JSON.stringify(result, null, 2));
    
    // result уже содержит { ok, status, data }
    // data это ответ от Bajie API: { msg, code, data: {...} }
    if (!result.ok) {
      return NextResponse.json({ 
        error: result.error || "Failed to fetch device info",
        data: result.data 
      }, { status: result.status || 500 });
    }
    
    return NextResponse.json(result);
  } catch (error) {
    console.error("Bajie API error:", error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "API call failed" 
    }, { status: 500 });
  }
}

