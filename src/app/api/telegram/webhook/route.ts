import { NextRequest, NextResponse } from "next/server";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "8479841984:AAFUw7lBiJw2IpTbMbsyPEfvN2VrNCv7VmE";

export async function POST(req: NextRequest) {
  try {
    const update = await req.json();
    
    // Обработка текстовых сообщений
    if (update.message && update.message.text) {
      const chatId = update.message.chat.id;
      const text = update.message.text;
      const user = update.message.from;
      
      if (text === '/start' || text.startsWith('/start auth')) {
        // Пользователь начал авторизацию
        const userData = {
          id: `telegram_${user.id}`,
          telegramId: user.id,
          firstName: user.first_name,
          lastName: user.last_name,
          username: user.username,
          photoUrl: user.photo_url,
          authDate: Math.floor(Date.now() / 1000),
        };
        
        // Отправляем приветственное сообщение
        const welcomeMessage = `🎉 *Добро пожаловать в Stiger!*

Привет, ${user.first_name}! 

Вы успешно авторизовались в системе Stiger.

Теперь вы можете:
🔋 Арендовать power bank
💳 Привязать карту для быстрой оплаты  
🗺️ Найти ближайшие станции

Вернитесь на сайт - вы уже авторизованы! ⚡

_Приятного использования!_`;

        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: welcomeMessage,
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: [[
                {
                  text: "🌐 Открыть Stiger",
                  url: "https://stiger.vercel.app"
                }
              ]]
            }
          }),
        });
        
        // Сохраняем пользователя (пока в памяти)
        global.telegramUsers = global.telegramUsers || new Map();
        global.telegramUsers.set(user.id, userData);
        
        return NextResponse.json({ ok: true });
      }
    }
    
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Telegram webhook error:", error);
    return NextResponse.json({ ok: true });
  }
}
