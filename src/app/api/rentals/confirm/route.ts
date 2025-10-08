import { NextRequest, NextResponse } from "next/server";
import { BajieClient } from "@/lib/bajie";
import crypto from "crypto";

export const dynamic = "force-dynamic";

// Эндпоинт вызывается после успешной оплаты Auth от CloudPayments
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, transactionId, deviceId, shopId, slotNum } = body;

    if (!orderId || !transactionId || !deviceId || !shopId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // TODO: Проверить статус транзакции в CloudPayments
    // TODO: Проверить, что заказ существует и не обработан

    // Создаем аренду в Bajie
    const bajie = new BajieClient();
    const callbackUrl = `${process.env.APP_URL}/api/webhooks/bajie`;
    const createUrl = `${process.env.BAJIE_BASE_URL}/rent/order/create?deviceId=${deviceId}&callbackURL=${encodeURIComponent(callbackUrl)}`;
    
    const createResponse = await fetch(createUrl, {
      method: "POST",
      headers: {
        Authorization: bajie.authHeader,
      }
    });

    const createData = await createResponse.json();
    
    if (createData.code !== 0) {
      // Отменяем оплату если не удалось создать аренду
      // TODO: вызвать CloudPayments void для отмены транзакции
      return NextResponse.json({ 
        error: "Failed to create rent order",
        details: createData 
      }, { status: 400 });
    }

    const tradeNo = createData.data.tradeNo;

    // Выдаем powerbank
    const ejectUrl = `${process.env.BAJIE_BASE_URL}/cabinet/ejectByRent?cabinetid=${deviceId}&rentOrderId=${tradeNo}&slotNum=${slotNum || 1}`;
    
    const ejectResponse = await fetch(ejectUrl, {
      method: "POST", 
      headers: {
        Authorization: bajie.authHeader,
      }
    });

    const ejectData = await ejectResponse.json();
    
    if (ejectData.code !== 0) {
      // Логируем ошибку, но не отменяем - пользователь может попробовать другой слот
      console.error("Eject failed:", ejectData);
    }

    // Сохраняем заказ в базе
    // TODO: сохранить в DB: orderId, transactionId, tradeNo, userId, deviceId, status

    return NextResponse.json({
      success: true,
      orderId,
      tradeNo,
      transactionId,
      ejected: ejectData.code === 0,
      message: ejectData.code === 0 
        ? "PowerBank выдан! Заберите его из открывшегося слота."
        : "Оплата прошла, но выдача не удалась. Обратитесь в поддержку."
    });

  } catch (error) {
    console.error("Rental confirmation error:", error);
    return NextResponse.json({ 
      error: "Failed to confirm rental",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}



