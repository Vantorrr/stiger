// Telegram Bot API клиент
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  phone_number?: string;
}

export interface AuthCode {
  code: string;
  phone: string;
  telegramId?: number;
  expiresAt: Date;
  attempts: number;
}

// Отправка кода авторизации в Telegram
export async function sendTelegramAuthCode(telegramId: number, code: string, firstName: string): Promise<boolean> {
  try {
    const message = `🔐 *Код входа в Stiger*

Привет, ${firstName}!

Ваш код для входа: \`${code}\`

⏰ Код действителен 5 минут
🔒 Никому не сообщайте этот код

_Если вы не запрашивали код, просто проигнорируйте это сообщение._`;

    const response = await fetch(`${TELEGRAM_API_URL}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: telegramId,
        text: message,
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
      }),
    });

    const result = await response.json();
    return result.ok;
  } catch (error) {
    console.error('Failed to send Telegram message:', error);
    return false;
  }
}

// Отправка уведомления об успешной аренде
export async function sendRentalNotification(telegramId: number, orderData: any): Promise<boolean> {
  try {
    const message = `✅ *Аренда успешно оформлена!*

🔋 Power Bank выдан из устройства: *${orderData.deviceName}*
💰 Сумма: *${orderData.amount} ₽*
⏰ Время: *${new Date().toLocaleString('ru-RU')}*

📍 Адрес: ${orderData.address}

Приятного использования! 🚀`;

    const response = await fetch(`${TELEGRAM_API_URL}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: telegramId,
        text: message,
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
      }),
    });

    const result = await response.json();
    return result.ok;
  } catch (error) {
    console.error('Failed to send rental notification:', error);
    return false;
  }
}

// Генерация случайного 6-значного кода
export function generateAuthCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Проверка валидности кода
export function isCodeValid(authCode: AuthCode): boolean {
  return authCode.expiresAt > new Date() && authCode.attempts < 3;
}
