import { NextRequest, NextResponse } from "next/server";
import { isCodeValid } from "@/lib/telegram";

export async function POST(req: NextRequest) {
  try {
    const { phone, code } = await req.json();

    if (!phone || !code) {
      return NextResponse.json(
        { error: "Телефон и код обязательны" },
        { status: 400 }
      );
    }

    // Получаем сохраненный код
    global.authCodes = global.authCodes || new Map();
    const authCode = global.authCodes.get(phone);

    if (!authCode) {
      return NextResponse.json(
        { error: "Код не найден или истек" },
        { status: 400 }
      );
    }

    // Увеличиваем счетчик попыток
    authCode.attempts++;

    // Проверяем валидность
    if (!isCodeValid(authCode)) {
      global.authCodes.delete(phone);
      return NextResponse.json(
        { error: "Код истек или превышено количество попыток" },
        { status: 400 }
      );
    }

    // Проверяем сам код
    if (authCode.code !== code) {
      if (authCode.attempts >= 3) {
        global.authCodes.delete(phone);
        return NextResponse.json(
          { error: "Неверный код. Превышено количество попыток" },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { error: `Неверный код. Осталось попыток: ${3 - authCode.attempts}` },
        { status: 400 }
      );
    }

    // Код верный - создаем пользователя/сессию
    const user = {
      id: `telegram_${authCode.telegramId}`,
      phone: authCode.phone,
      telegramId: authCode.telegramId,
      firstName: "Пользователь", // В реальном приложении получили бы из Telegram API
      createdAt: new Date().toISOString(),
    };

    // Удаляем использованный код
    global.authCodes.delete(phone);

    // В реальном приложении создали бы JWT токен
    // Пока возвращаем данные пользователя
    return NextResponse.json({
      success: true,
      message: "Авторизация успешна",
      user,
    });

  } catch (error) {
    console.error("Verify code error:", error);
    return NextResponse.json(
      { error: "Ошибка сервера" },
      { status: 500 }
    );
  }
}


