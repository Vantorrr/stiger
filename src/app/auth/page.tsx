"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const [step, setStep] = useState<'phone' | 'telegram' | 'code'>('phone');
  const [phone, setPhone] = useState('');
  const [telegramId, setTelegramId] = useState('');
  const [firstName, setFirstName] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const router = useRouter();

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const formatPhone = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{1})(\d{3})(\d{3})(\d{2})(\d{2})$/);
    if (match) {
      return `+${match[1]} (${match[2]}) ${match[3]}-${match[4]}-${match[5]}`;
    }
    return value;
  };

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phone.replace(/\D/g, '');
    
    if (cleanPhone.length !== 11) {
      setError('Введите корректный номер телефона');
      return;
    }

    setError('');
    setStep('telegram');
  };

  const handleTelegramSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!telegramId || !firstName) {
      setError('Заполните все поля');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/telegram/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegramId: parseInt(telegramId),
          firstName,
          phone: phone.replace(/\D/g, ''),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setStep('code');
        setCountdown(300); // 5 минут
      } else {
        setError(data.error || 'Ошибка отправки кода');
      }
    } catch (error) {
      setError('Ошибка сети. Попробуйте снова.');
    } finally {
      setLoading(false);
    }
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (code.length !== 6) {
      setError('Код должен содержать 6 цифр');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/telegram/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phone.replace(/\D/g, ''),
          code,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Сохраняем пользователя в localStorage
        localStorage.setItem('stiger_user', JSON.stringify(data.user));
        router.push('/');
      } else {
        setError(data.error || 'Неверный код');
      }
    } catch (error) {
      setError('Ошибка сети. Попробуйте снова.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="glass-premium rounded-3xl p-8 shadow-2xl text-center animate-scale-in">
          {/* Логотип */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl gradient-bg text-white text-3xl mb-6 shadow-lg float-animation">
            ⚡
          </div>
          
          <h1 className="text-3xl font-bold mb-2">
            <span className="gradient-text">Добро пожаловать в Stiger</span>
          </h1>
          
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            Быстрая аренда power bank
          </p>

          {/* Шаг 1: Ввод телефона */}
          {step === 'phone' && (
            <form onSubmit={handlePhoneSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-left">
                  📱 Номер телефона
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(formatPhone(e.target.value))}
                  placeholder="+7 (999) 123-45-67"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-purple-500 transition-colors"
                  maxLength={18}
                />
              </div>
              
              {error && (
                <div className="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                  {error}
                </div>
              )}
              
              <button
                type="submit"
                className="w-full h-12 rounded-xl gradient-bg text-white font-semibold button-premium"
              >
                Продолжить
              </button>
            </form>
          )}

          {/* Шаг 2: Telegram данные */}
          {step === 'telegram' && (
            <form onSubmit={handleTelegramSubmit} className="space-y-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-2xl">📱</div>
                  <div className="text-left">
                    <p className="font-semibold text-blue-800 dark:text-blue-200">
                      Авторизация через Telegram
                    </p>
                    <p className="text-sm text-blue-600 dark:text-blue-300">
                      Код придет в Telegram бот
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-left">
                  🆔 Ваш Telegram ID
                </label>
                <input
                  type="number"
                  value={telegramId}
                  onChange={(e) => setTelegramId(e.target.value)}
                  placeholder="123456789"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-purple-500 transition-colors"
                />
                <p className="text-xs text-gray-500 mt-1 text-left">
                  Узнать ID: напишите @userinfobot в Telegram
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-left">
                  👤 Ваше имя
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Иван"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-purple-500 transition-colors"
                />
              </div>
              
              {error && (
                <div className="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                  {error}
                </div>
              )}
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep('phone')}
                  className="flex-1 h-12 rounded-xl border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Назад
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 h-12 rounded-xl gradient-bg text-white font-semibold button-premium disabled:opacity-50"
                >
                  {loading ? 'Отправка...' : 'Получить код'}
                </button>
              </div>
            </form>
          )}

          {/* Шаг 3: Ввод кода */}
          {step === 'code' && (
            <form onSubmit={handleCodeSubmit} className="space-y-6">
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-2xl">✅</div>
                  <div className="text-left">
                    <p className="font-semibold text-green-800 dark:text-green-200">
                      Код отправлен в Telegram
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-300">
                      Проверьте сообщения от бота
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-left">
                  🔐 Код из Telegram
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="123456"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-purple-500 transition-colors text-center text-2xl font-mono tracking-wider"
                  maxLength={6}
                />
                {countdown > 0 && (
                  <p className="text-sm text-gray-500 mt-2">
                    Код действителен: {formatTime(countdown)}
                  </p>
                )}
              </div>
              
              {error && (
                <div className="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                  {error}
                </div>
              )}
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep('telegram')}
                  className="flex-1 h-12 rounded-xl border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Назад
                </button>
                <button
                  type="submit"
                  disabled={loading || code.length !== 6}
                  className="flex-1 h-12 rounded-xl gradient-bg text-white font-semibold button-premium disabled:opacity-50"
                >
                  {loading ? 'Проверка...' : 'Войти'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Информация */}
        <div className="mt-6 text-center">
          <p className="text-white/70 text-sm">
            Нет Telegram? Скачайте приложение и создайте аккаунт
          </p>
        </div>
      </div>
    </div>
  );
}
