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
    // Проверяем авторизацию каждые 3 секунды
    const checkAuth = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const telegramId = urlParams.get('telegram_id');
      
      if (telegramId) {
        try {
          const response = await fetch('/api/auth/telegram/check', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ telegramId }),
          });
          
          const data = await response.json();
          
          if (data.authorized) {
            localStorage.setItem('stiger_user', JSON.stringify(data.user));
            router.push('/');
          }
        } catch (error) {
          console.error('Auth check error:', error);
        }
      }
    };
    
    // Проверяем сразу и потом каждые 3 секунды
    checkAuth();
    const interval = setInterval(checkAuth, 3000);
    
    return () => clearInterval(interval);
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

          {/* Telegram Login Button */}
          <div className="flex justify-center">
            <a
              href={`https://t.me/stiger_sms_bot?start=auth&telegram_id=${Date.now()}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 py-4 bg-[#0088cc] hover:bg-[#006bb3] text-white font-semibold rounded-2xl transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.374 0 0 5.373 0 12s5.374 12 12 12 12-5.373 12-12S18.626 0 12 0zm5.568 8.16c-.169 1.858-.896 6.728-.896 6.728-.896 0-.896 0-.896 0s-.169 0-.338-.169c-.338-.169-.507-.338-.845-.507-.169-.169-.507-.338-.676-.507-.338-.169-.507-.338-.845-.507-.169 0-.338-.169-.507-.169-.169 0-.338 0-.507.169l.845.676c.169.169.338.169.507.338.338.169.507.338.845.507.169.169.338.169.507.338.169.169.338.338.507.507.169.169.338.169.507.338l.338.338c.169.169.169.338.338.507 0 .169.169.338.169.507v.338c0 .169 0 .338-.169.507-.169.338-.338.507-.676.676-.169.169-.507.169-.676.338-.338 0-.676.169-1.014.169-.507 0-1.014-.169-1.521-.338-.338-.169-.676-.338-1.014-.676-.169-.169-.338-.338-.507-.676-.169-.169-.338-.507-.338-.845 0-.169 0-.507.169-.676.169-.338.507-.507.845-.676.169-.169.507-.169.676-.338.338-.169.507-.338.845-.507.169-.169.338-.169.507-.338.338-.169.507-.338.845-.507.169-.169.507-.338.676-.507.338-.169.676-.507.845-.676.338-.338.507-.676.676-1.183.169-.338.169-.845.169-1.183 0-.676-.169-1.352-.507-1.859-.169-.338-.507-.676-.845-.845-.507-.338-1.183-.507-1.69-.507-.676 0-1.352.169-1.859.507-.338.169-.676.507-.845.845-.338.507-.507 1.183-.507 1.859 0 .338 0 .845.169 1.183z"/>
              </svg>
              Войти через Telegram
            </a>
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-white/60 text-sm mb-2">
              После нажатия на кнопку:
            </p>
            <div className="text-white/80 text-sm space-y-1">
              <p>1. Откроется чат с ботом @stiger_sms_bot</p>
              <p>2. Нажмите "START" в боте</p>
              <p>3. Вернитесь сюда - вы будете авторизованы!</p>
            </div>
          </div>

          {/* Информация */}
          <div className="mt-8 pt-8 border-t border-white/20">
            <p className="text-white/60 text-sm">
              Нажмите кнопку выше для входа через Telegram
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
