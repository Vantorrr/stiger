"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import Script from "next/script";

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
    // Грузим виджет программно — гарантируем появление кнопки
    const mountWidget = () => {
      try {
        const existing = document.getElementById("tg-login-script");
        if (existing) existing.remove();
        const script = document.createElement("script");
        script.id = "tg-login-script";
        script.async = true;
        script.src = "https://telegram.org/js/telegram-widget.js?22";
        script.setAttribute("data-telegram-login", botUsername || "set_bot_username");
        script.setAttribute("data-size", "large");
        script.setAttribute("data-userpic", "false");
        script.setAttribute("data-request-access", "write");
        script.setAttribute("data-lang", "ru");
        script.setAttribute("data-onauth", "onTelegramAuth(user)");
        const container = document.getElementById("tg-login-container");
        (container || document.body).appendChild(script);
      } catch (e) {
        console.error("Failed to mount Telegram widget:", e);
      }
    };

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
    mountWidget();
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

        {/* Крупная заметная кнопка как у обычного сервиса */}
        {botUsername ? (
          <div className="mb-6">
            <button
              onClick={() => {
                try {
                  // Пытаемся открыть приложение Telegram
                  window.location.href = `tg://resolve?domain=${botUsername}`;
                  // Фолбэк в веб, если схема не поддерживается
                  setTimeout(() => {
                    window.location.href = `https://t.me/${botUsername}`;
                  }, 300);
                } catch {
                  window.location.href = `https://t.me/${botUsername}`;
                }
              }}
              className="w-full h-12 rounded-2xl bg-white text-purple-900 font-bold text-lg hover:bg-white/90 transition-all"
            >
              Войти через Telegram
            </button>
          </div>
        ) : null}

        {/* Telegram Login Widget */}
        <div className="mb-6" id="tg-login-container">
          {/* Кнопка появится здесь после загрузки скрипта */}
        </div>

        <div className="text-white/60 text-sm space-y-3">
          <p>Если кнопка не работает, откройте Telegram и найдите нашего бота:</p>
          <p className="font-mono text-white">
            @{botUsername || "set_bot_username"}
          </p>
          <p>
            <a
              className="underline"
              href={botUsername ? `https://t.me/${botUsername}` : "https://t.me/"}
              target="_blank"
              rel="noopener noreferrer"
            >
              Открыть бота в Telegram
            </a>
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


