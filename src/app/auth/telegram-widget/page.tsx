"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";

declare global {
  interface Window {
    onTelegramAuth?: (user: any) => void;
  }
}

export default function TelegramWidgetPage() {
  const botUsername = useMemo(() => {
    // Должно быть задано в окружении билда
    return process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || "";
  }, []);

  useEffect(() => {
    // Глобальный callback для Telegram Login Widget
    window.onTelegramAuth = (user: any) => {
      try {
        const userId = user?.id;
        const firstName = user?.first_name || "";
        const username = user?.username || "";
        if (!userId || !firstName) {
          alert("Не удалось получить данные Telegram. Попробуйте еще раз.");
          return;
        }
        const params = new URLSearchParams({
          user_id: String(userId),
          first_name: encodeURIComponent(firstName),
          username: encodeURIComponent(username),
        });
        // Переходим на обработчик успеха, который сохранит пользователя в localStorage
        window.location.href = `/auth/telegram-success?${params.toString()}`;
      } catch (e) {
        console.error("Telegram auth error:", e);
        alert("Ошибка авторизации через Telegram");
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl gradient-bg text-white text-3xl mb-6 shadow-lg">
          ⚡
        </div>
        <h1 className="text-3xl font-bold mb-2 text-white">Вход через Telegram</h1>
        <p className="text-white/70 mb-6">Авторизуйтесь, чтобы взять power bank</p>

        {!botUsername ? (
          <div className="bg-red-500/20 text-red-200 p-4 rounded-xl mb-6">
            Не задан NEXT_PUBLIC_TELEGRAM_BOT_USERNAME. Установите имя бота в переменных окружения.
          </div>
        ) : null}

        {/* Telegram Login Widget */}
        <div className="mb-6">
          {/* eslint-disable-next-line @next/next/no-script-in-document */}
          <script
            async
            src="https://telegram.org/js/telegram-widget.js?22"
            data-telegram-login={botUsername || "set_bot_username"}
            data-size="large"
            data-userpic="false"
            data-request-access="write"
            data-lang="ru"
            data-onauth="onTelegramAuth(user)"
          />
        </div>

        <div className="text-white/60 text-sm space-y-3">
          <p>Если кнопка не работает, откройте Telegram и найдите нашего бота:</p>
          <p className="font-mono text-white">
            @{botUsername || "set_bot_username"}
          </p>
          <p>
            После входа вы будете перенаправлены автоматически.{" "}
            <Link href="/" className="underline">
              Вернуться на главную
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}


