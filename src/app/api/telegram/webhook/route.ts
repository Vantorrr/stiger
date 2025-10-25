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
        
        // Отправляем запрос номера телефона
        const welcomeMessage = `🎉 *Добро пожаловать в Stiger!*

Привет, ${user.first_name}! 

Для завершения регистрации поделитесь номером телефона 📱

Это нужно для:
🔋 Аренды power bank
💳 Уведомлений об оплате
📞 Связи в экстренных случаях

_Нажмите кнопку ниже для отправки номера_`;

        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: welcomeMessage,
            parse_mode: 'Markdown',
            reply_markup: {
              keyboard: [[
                {
                  text: "📱 Поделиться номером телефона",
                  request_contact: true
                }
              ]],
              resize_keyboard: true,
              one_time_keyboard: true
            }
          }),
        });
        
        // Сохраняем пользователя (пока в памяти)
        global.telegramUsers = global.telegramUsers || new Map();
        global.telegramUsers.set(user.id, userData);
        
        return NextResponse.json({ ok: true });
      }
    }

    // Обработка контакта (номера телефона)
    if (update.message && update.message.contact) {
      const chatId = update.message.chat.id;
      const contact = update.message.contact;
      const user = update.message.from;

      // Обновляем данные пользователя с номером телефона
      const userData = {
        id: `telegram_${user.id}`,
        telegramId: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        username: user.username,
        phone: contact.phone_number,
        authDate: Math.floor(Date.now() / 1000),
      };

      // Сохраняем пользователя с номером телефона
      global.telegramUsers = global.telegramUsers || new Map();
      global.telegramUsers.set(user.id, userData);

      // Отправляем финальное сообщение
      const finalMessage = `✅ *Регистрация завершена!*

Спасибо, ${user.first_name}!

Ваш номер: ${contact.phone_number}

Теперь вы можете пользоваться всеми функциями Stiger! ⚡`;

      await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: finalMessage,
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [[
              {
                text: "🌐 Войти в Stiger",
                url: `https://stiger.app/auth/telegram-success?user_id=${user.id}&first_name=${encodeURIComponent(user.first_name)}&username=${user.username || ''}&phone=${encodeURIComponent(contact.phone_number)}`
              }
            ]]
          }
        }),
      });

      return NextResponse.json({ ok: true });
    }
    
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Telegram webhook error:", error);
    return NextResponse.json({ ok: true });
  }
}
