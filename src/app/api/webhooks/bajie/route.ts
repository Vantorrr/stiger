import { NextRequest, NextResponse } from "next/server";
import { cpChargeToken } from "@/lib/cloudpayments";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function isAuthorized(req: NextRequest): boolean {
  const provided = req.headers.get("x-bajie-sign") || req.nextUrl.searchParams.get("sign");
  const expected = process.env.BAJIE_EVENT_PUSH_SECRET;
  if (!expected) return true; // allow when not configured
  return !!provided && provided === expected;
}

// Рассчитывает стоимость аренды на основе времени использования
function calculateRentalCost(startTime: Date, endTime: Date, tariffId: string): number {
  const tariffs: Record<string, { price: number; hours: number }> = {
    "1hour": { price: 200, hours: 1 },
    "4hours": { price: 400, hours: 4 },
    "daily": { price: 1000, hours: 24 }
  };

  const tariff = tariffs[tariffId] || tariffs["1hour"];
  const hoursUsed = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
  
  // Если использовано меньше тарифа - списываем только тариф
  if (hoursUsed <= tariff.hours) {
    return tariff.price;
  }
  
  // Если больше - списываем тариф + доплата за каждый час сверх тарифа
  const extraHours = Math.ceil(hoursUsed - tariff.hours);
  const extraCost = extraHours * 100; // 100 руб за каждый дополнительный час
  return tariff.price + extraCost;
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
      // Батарея возвращена - списываем тариф
      console.log(`[Bajie] Battery returned to ${deviceId}, slot: ${data?.slotNum}`);
      
      try {
        const rentOrderId = data?.rentOrderId;
        
        if (!rentOrderId) {
          console.error("[Bajie] Missing rentOrderId for BATTERY_IN");
          break;
        }

        // Получаем заказ из БД по rentOrderId
        const rentalOrder = await prisma.rentalOrder.findFirst({
          where: { rentOrderId },
          include: { user: true },
        });

        if (!rentalOrder) {
          console.error(`[Bajie] Order not found for rentOrderId: ${rentOrderId}`);
          break;
        }

        if (rentalOrder.status !== "active") {
          console.error(`[Bajie] Order ${rentalOrder.id} is not active, status: ${rentalOrder.status}`);
          break;
        }

        // Формируем accountId для CloudPayments
        const accountId = rentalOrder.user.telegramId 
          ? `telegram_${rentalOrder.user.telegramId}` 
          : rentalOrder.user.phone || rentalOrder.userId;

        // Получаем список карт пользователя из базы данных
        const savedCards = await prisma.savedCard.findMany({
          where: { accountId },
          orderBy: { createdAt: "desc" },
        });

        if (savedCards.length === 0) {
          console.error(`[Bajie] No cards found for account ${accountId}`);
          // Обновляем статус заказа на completed без списания
          await prisma.rentalOrder.update({
            where: { id: rentalOrder.id },
            data: {
              status: "completed",
              endTime: new Date(),
            },
          });
          break;
        }

        // Берем первую привязанную карту
        const card = savedCards[0];
        if (!card.token) {
          console.error("[Bajie] Card token not found");
          break;
        }

        // Получаем время начала аренды из БД
        const startTime = rentalOrder.startTime || new Date();
        const endTime = new Date();
        
        // Рассчитываем стоимость (в рублях)
        const tariffCost = calculateRentalCost(startTime, endTime, rentalOrder.tariffId);
        
        // Списываем с карты (в копейках)
        const chargeResult = await cpChargeToken({
          token: card.token,
          amount: tariffCost * 100, // В копейках
          currency: "RUB",
          accountId: accountId,
          invoiceId: `tariff-${rentalOrder.id}-${Date.now()}`,
          description: `Списание тарифа за аренду power bank`,
          jsonData: {
            rentOrderId: rentalOrder.id,
            tariffId: rentalOrder.tariffId,
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
          }
        });

        if (chargeResult.ok) {
          console.log(`[Bajie] Tariff charged successfully: ${tariffCost} RUB`);
          
          // Сохраняем транзакцию списания тарифа
          const chargeData = chargeResult.data as { TransactionId?: string; Model?: { CardLastFour?: string } };
          await prisma.transaction.create({
            data: {
              orderId: rentalOrder.id,
              transactionId: chargeData.TransactionId || `charge-${Date.now()}`,
              accountId: accountId,
              amount: tariffCost * 100, // В копейках
              currency: "RUB",
              status: "completed",
              description: `Списание тарифа за аренду power bank`,
              cardToken: card.token,
              cardLastFour: card.cardLastFour || chargeData.Model?.CardLastFour,
            },
          });

          // Обновляем статус заказа на completed
          await prisma.rentalOrder.update({
            where: { id: rentalOrder.id },
            data: {
              status: "completed",
              endTime: endTime,
            },
          });
        } else {
          console.error(`[Bajie] Failed to charge tariff: ${chargeResult.error}`);
          // Обновляем статус заказа на completed даже при ошибке списания
          // (можно добавить поле для отслеживания ошибок)
          await prisma.rentalOrder.update({
            where: { id: rentalOrder.id },
            data: {
              status: "completed",
              endTime: endTime,
            },
          });
        }
      } catch (error) {
        console.error("[Bajie] Error processing BATTERY_IN:", error);
      }
      
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




