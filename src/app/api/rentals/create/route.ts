import { NextRequest, NextResponse } from "next/server";
import { BajieClient } from "@/lib/bajie";
import { cloudPaymentsPublicId } from "@/lib/cloudpayments";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { deviceId, userId, tariffId } = body;

    if (!deviceId || !userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Получаем информацию об устройстве
    const bajie = new BajieClient();
    const deviceInfo = await bajie.getDeviceInfo(deviceId);
    
    if (deviceInfo.data.code !== 0) {
      return NextResponse.json({ 
        error: "Device not available", 
        details: deviceInfo.data 
      }, { status: 400 });
    }

    const device = deviceInfo.data.data;
    const shop = device.shop;
    const shopId = shop.id;
    
    // Определяем параметры оплаты на основе тарифа
    const tariffs = {
      "1hour": { price: 200, deposit: 200, description: "1 час аренды" },
      "4hours": { price: 400, deposit: 200, description: "4 часа аренды" }, 
      "daily": { price: 1000, deposit: 200, description: "24 часа аренды" }
    };
    
    const selectedTariff = tariffs[tariffId as keyof typeof tariffs] || tariffs["1hour"];
    const totalAmount = selectedTariff.price + selectedTariff.deposit;

    // Находим или создаем пользователя
    // userId может быть telegram_XXX, phone или id пользователя
    let user;
    if (userId.startsWith("telegram_")) {
      const telegramId = parseInt(userId.replace("telegram_", ""));
      user = await prisma.user.upsert({
        where: { telegramId },
        update: {},
        create: {
          telegramId,
          firstName: "User",
        },
      });
    } else {
      // Пытаемся найти по phone или создать нового
      user = await prisma.user.upsert({
        where: { phone: userId },
        update: {},
        create: {
          phone: userId,
          firstName: "User",
        },
      });
    }

    // Создаем заказ в БД
    const rentalOrder = await prisma.rentalOrder.create({
      data: {
        userId: user.id,
        deviceId,
        shopId,
        tariffId,
        tariffPrice: selectedTariff.price * 100, // В копейках
        depositAmount: selectedTariff.deposit * 100, // В копейках
        status: "pending",
      },
    });

    const orderId = rentalOrder.id;

    // Подготавливаем данные для CloudPayments
    const paymentData = {
      publicId: cloudPaymentsPublicId(),
      amount: totalAmount,
      currency: "RUB",
      description: `${selectedTariff.description} - Stiger Power Bank`,
      invoiceId: orderId,
      accountId: userId,
      email: '', // CloudPayments может требовать email
      jsonData: {
        deviceId,
        shopId,
        tariffId,
        orderType: "rental",
        tariffPrice: selectedTariff.price,
        depositAmount: selectedTariff.deposit
      }
    };

    // Формируем полный объект заказа
    const orderData = {
      orderId,
      deviceId,
      shopId,
      userId,
      tariffId,
      status: "pending",
      createdAt: new Date().toISOString(),
      paymentData,
      device: {
        id: device.cabinet.id,
        qrCode: device.cabinet.qrCode,
        emptySlots: device.cabinet.emptySlots,
        address: shop.address
      }
    };
    
    // Сохраняем в cookies для обратной совместимости
    const response = NextResponse.json(orderData);
    response.cookies.set(`order_${orderId}`, JSON.stringify(orderData), {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 // 1 час
    });
    
    return response;

  } catch (error) {
    console.error("Rental creation error:", error);
    return NextResponse.json({ 
      error: "Failed to create rental",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
