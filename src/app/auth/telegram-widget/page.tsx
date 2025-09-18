"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";

declare global {
  interface Window {
    onTelegramAuth: (user: any) => void;
  }
}

export default function TelegramWidgetAuth() {
  const router = useRouter();

  useEffect(() => {
    // Обработчик успешной авторизации через виджет Telegram
    window.onTelegramAuth = (user: any) => {
      console.log("Telegram auth:", user);
      
      // Сохраняем пользователя
      const userData = {
        id: `telegram_${user.id}`,
        telegramId: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        username: user.username,
        photoUrl: user.photo_url,
        authDate: user.auth_date,
        hash: user.hash,
        phone: user.phone || null,
      };
      
      localStorage.setItem('stiger_user', JSON.stringify(userData));
      
      // Отправляем уведомление в Telegram
      fetch('/api/auth/telegram/welcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      
      // Редиректим на главную
      router.push('/');
    };
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="glass-premium rounded-3xl p-8 shadow-2xl text-center animate-scale-in bg-white/10 backdrop-blur-xl">
          {/* Логотип */}
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl gradient-bg text-white text-4xl mb-8 shadow-lg float-animation">
            ⚡
          </div>
          
          <h1 className="text-4xl font-bold mb-3 text-white">
            Добро пожаловать в Stiger
          </h1>
          
          <p className="text-white/80 mb-10 text-lg">
            Быстрая аренда power bank
          </p>

          {/* Преимущества */}
          <div className="space-y-4 mb-10">
            <div className="flex items-center gap-3 text-left bg-white/10 rounded-2xl p-4">
              <div className="text-2xl">⚡</div>
              <div className="text-white">
                <p className="font-semibold">Мгновенная авторизация</p>
                <p className="text-sm text-white/70">Через ваш Telegram аккаунт</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 text-left bg-white/10 rounded-2xl p-4">
              <div className="text-2xl">🔒</div>
              <div className="text-white">
                <p className="font-semibold">Безопасно</p>
                <p className="text-sm text-white/70">Telegram не передает ваш номер</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 text-left bg-white/10 rounded-2xl p-4">
              <div className="text-2xl">🚀</div>
              <div className="text-white">
                <p className="font-semibold">Быстро</p>
                <p className="text-sm text-white/70">Один клик и вы в системе</p>
              </div>
            </div>
          </div>

          {/* Telegram Login Widget */}
          <div className="flex justify-center">
            <div id="telegram-login-container" className="relative">
              <Script
                src="https://telegram.org/js/telegram-widget.js?22"
                strategy="afterInteractive"
                onLoad={() => {
                  // Создаем виджет после загрузки скрипта
                  const script = document.createElement('script');
                  script.innerHTML = `
                    TelegramLoginWidget.init(
                      document.getElementById('telegram-login-container'),
                      {
                        bot_id: '8479841984',
                        request_access: true,
                        lang: 'ru'
                      },
                      window.onTelegramAuth
                    );
                  `;
                  document.body.appendChild(script);
                }}
              />
            </div>
          </div>

          {/* Альтернативный вариант */}
          <div className="mt-8 pt-8 border-t border-white/20">
            <p className="text-white/60 text-sm mb-4">Или войдите по номеру телефона</p>
            <a 
              href="/auth/phone" 
              className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors"
            >
              <span>📱</span>
              <span className="underline">Войти по номеру</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
