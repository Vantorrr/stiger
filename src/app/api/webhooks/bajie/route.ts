import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function isAuthorized(req: NextRequest): boolean {
  const provided = req.headers.get("x-bajie-sign") || req.nextUrl.searchParams.get("sign");
  const expected = process.env.BAJIE_EVENT_PUSH_SECRET;
  if (!expected) return true; // allow when not configured
  return !!provided && provided === expected;
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  console.log("[Bajie Event]", JSON.stringify(body, null, 2));
  
  // Обрабатываем события от Bajie
  const { event, deviceId, data } = body;
  
  switch (event) {
    case "BATTERY_IN":
      // Батарея возвращена
      console.log(`[Bajie] Battery returned to ${deviceId}, slot: ${data?.slotNum}`);
      
      // TODO: 
      // 1. Найти активный заказ по deviceId и batteryId
      // 2. Рассчитать финальную стоимость
      // 3. Вызвать CloudPayments Confirm для списания
      // 4. Обновить статус заказа на completed
      
      break;
      
    case "BATTERY_BORROW_OUT":
      // Батарея взята (подтверждение выдачи)
      console.log(`[Bajie] Battery borrowed from ${deviceId}, slot: ${data?.slotNum}`);
      break;
      
    case "CABINET_ONLINE":
    case "CABINET_OFFLINE":
      // Статус устройства изменился
      console.log(`[Bajie] Cabinet ${deviceId} is ${event === "CABINET_ONLINE" ? "online" : "offline"}`);
      break;
      
    case "CABINET_STATUS":
      // Обновление статуса шкафа
      console.log(`[Bajie] Cabinet ${deviceId} status update:`, data);
      break;
      
    case "ADMIN_RENTAL_ORDER":
      // Административное действие с заказом
      console.log(`[Bajie] Admin action on rental order:`, data);
      break;
      
    case "BATTERY_ABNORMAL_WARNING":
      // Проблема с батареей
      console.log(`[Bajie] Battery warning for ${deviceId}:`, data);
      break;
  }

  return NextResponse.json({ ok: true, code: 0 });
}




