import { NextRequest, NextResponse } from "next/server";
import { sendTelegramAuthCode, generateAuthCode } from "@/lib/telegram";

export async function POST(req: NextRequest) {
  try {
    const { telegramId, firstName, phone } = await req.json();

    if (!telegramId || !firstName || !phone) {
      return NextResponse.json(
        { error: "Telegram ID, имя и телефон обязательны" },
        { status: 400 }
      );
    }

    // Генерируем код
    const code = generateAuthCode();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 минут

    // Сохраняем код (пока в памяти, потом в БД)
    const authCode = {
      code,
      phone,
      telegramId,
      expiresAt,
      attempts: 0,
    };

    // В реальном приложении сохранили бы в Redis или БД
    // Пока используем глобальную переменную (только для демо!)
    global.authCodes = global.authCodes || new Map();
    global.authCodes.set(phone, authCode);

    // Отправляем код в Telegram
    const sent = await sendTelegramAuthCode(telegramId, code, firstName);

    if (!sent) {
      return NextResponse.json(
        { error: "Не удалось отправить код в Telegram" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Код отправлен в Telegram",
      expiresIn: 300, // 5 минут в секундах
    });

  } catch (error) {
    console.error("Telegram auth error:", error);
    return NextResponse.json(
      { error: "Ошибка сервера" },
      { status: 500 }
    );
  }
}





