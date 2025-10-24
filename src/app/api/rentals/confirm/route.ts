import { NextRequest, NextResponse } from "next/server";
import { BajieClient } from "@/lib/bajie";
import { cpConfirm, cpVoid } from "@/lib/cloudpayments";
import crypto from "crypto";

export const dynamic = "force-dynamic";

// Эндпоинт вызывается после успешной оплаты Auth от CloudPayments
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, transactionId, deviceId, shopId, slotNum, skipPayment } = body;

    if (!orderId || !transactionId) {
      return NextResponse.json({ error: "Missing orderId or transactionId" }, { status: 400 });
    }
    
    // Получаем данные заказа из cookies или localStorage
    let orderDeviceId = deviceId;
    let orderShopId = shopId;
    
    if (!orderDeviceId || !orderShopId) {
      // Пытаемся получить из cookies
      const orderCookie = req.cookies.get(`order_${orderId}`);
      if (orderCookie) {
        const orderData = JSON.parse(orderCookie.value);
        orderDeviceId = orderData.deviceId;
        orderShopId = orderData.shopId;
      }
    }
    
    if (!orderDeviceId || !orderShopId) {
      return NextResponse.json({ 
        error: "Missing deviceId or shopId. Order may have expired." 
      }, { status: 400 });
    }

    // Проверяем авторизацию платежа и подтверждаем списание (если аккаунт двухстадийный)
    if (!skipPayment) {
      const confirmRes = await cpConfirm({ transactionId });
      if (!confirmRes.ok) {
        return NextResponse.json({ 
          error: "Payment confirm failed",
          details: confirmRes.error || confirmRes.data
        }, { status: 402 });
      }
    }
    // TODO: Проверить, что заказ существует и не обработан

    // Создаем аренду в Bajie
    const bajie = new BajieClient();
    const callbackUrl = `${process.env.APP_URL}/api/webhooks/bajie`;
    const createUrl = `${process.env.BAJIE_BASE_URL}/rent/order/create?deviceId=${orderDeviceId}&callbackURL=${encodeURIComponent(callbackUrl)}`;
    
    console.log('Creating Bajie order:', createUrl);
    
    const createResponse = await fetch(createUrl, {
      method: "POST",
      headers: {
        Authorization: bajie.authHeader,
      }
    });

    const createData = await createResponse.json();
    
    console.log('Bajie order response:', createData);
    
    if (createData.code !== 0) {
      // Отменяем оплату если не удалось создать аренду
      if (!skipPayment) {
        await cpVoid({ transactionId }).catch(() => {});
      }
      return NextResponse.json({ 
        error: "Failed to create rent order",
        details: createData 
      }, { status: 400 });
    }

    const tradeNo = createData.data.tradeNo;

    // Выдаем powerbank
    const ejectUrl = `${process.env.BAJIE_BASE_URL}/cabinet/ejectByRent?cabinetid=${orderDeviceId}&rentOrderId=${tradeNo}&slotNum=${slotNum || 1}`;
    
    console.log('Ejecting power bank:', ejectUrl);
    
    const ejectResponse = await fetch(ejectUrl, {
      method: "POST", 
      headers: {
        Authorization: bajie.authHeader,
      }
    });

    const ejectData = await ejectResponse.json();
    
    console.log('Eject response:', ejectData);
    
    if (ejectData.code !== 0) {
      // Возврат/отмена платежа при неудачной выдаче
      if (!skipPayment) {
        await cpVoid({ transactionId }).catch(() => {});
      }
      console.error("Eject failed:", ejectData);
      return NextResponse.json({
        success: false,
        error: "Eject failed",
        details: ejectData
      }, { status: 400 });
    }

    // Сохраняем заказ в базе
    // TODO: сохранить в DB: orderId, transactionId, tradeNo, userId, deviceId, status

    return NextResponse.json({
      success: true,
      orderId,
      tradeNo,
      transactionId,
      ejected: true,
      message: "PowerBank выдан! Заберите его из открывшегося слота."
    });

  } catch (error) {
    console.error("Rental confirmation error:", error);
    return NextResponse.json({ 
      error: "Failed to confirm rental",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}



