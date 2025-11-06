import { NextRequest, NextResponse } from "next/server";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "8479841984:AAFUw7lBiJw2IpTbMbsyPEfvN2VrNCv7VmE";
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

export async function POST(req: NextRequest) {
  try {
    const user = await req.json();

    if (!user.telegramId) {
      return NextResponse.json({ success: true });
    }

    const message = `🎉 *Добро пожаловать в Stiger!*

Привет, ${user.firstName}! 

Теперь вы можете:
🔋 Арендовать power bank в любое время
💳 Привязать карту для быстрой оплаты
🗺️ Найти ближайшие станции на карте

_Приятного использования!_ ⚡`;

    await fetch(`${TELEGRAM_API_URL}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: user.telegramId,
        text: message,
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
      }),
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Welcome message error:", error);
    return NextResponse.json({ success: true });
  }
}






