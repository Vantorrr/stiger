"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function TelegramSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const userId = searchParams.get('user_id');
    const firstName = searchParams.get('first_name');
    const username = searchParams.get('username');

    if (userId && firstName) {
      // Создаем пользователя и сохраняем в localStorage
      const userData = {
        id: `telegram_${userId}`,
        telegramId: parseInt(userId),
        firstName: decodeURIComponent(firstName),
        username: username || null,
        authDate: new Date().toISOString(),
      };

      localStorage.setItem('stiger_user', JSON.stringify(userData));
      
      // Редиректим на главную
      router.push('/');
    } else {
      // Если нет параметров, отправляем на авторизацию
      router.push('/auth');
    }
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="glass-premium rounded-3xl p-8 shadow-2xl text-center animate-scale-in bg-white/10 backdrop-blur-xl">
          {/* Логотип */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl gradient-bg text-white text-3xl mb-6 shadow-lg">
            <div className="animate-spin">⚡</div>
          </div>
          
          <h1 className="text-3xl font-bold mb-4 text-white">
            Авторизация успешна!
          </h1>
          
          <p className="text-white/70 mb-8">
            Добро пожаловать в Stiger!<br/>
            Перенаправляем на главную страницу...
          </p>

          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
