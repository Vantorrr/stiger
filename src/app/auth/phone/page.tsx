"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function PhoneAuthPage() {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const formatPhone = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{1})(\d{3})(\d{3})(\d{2})(\d{2})$/);
    if (match) {
      return `+${match[1]} (${match[2]}) ${match[3]}-${match[4]}-${match[5]}`;
    }
    return value;
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phone.replace(/\D/g, '');
    
    if (cleanPhone.length !== 11) {
      setError('Введите корректный номер телефона');
      return;
    }

    setLoading(true);
    setError('');

    // SMS временно недоступен
    setTimeout(() => {
      setError('SMS авторизация временно недоступна. Пожалуйста, используйте вход через Telegram');
      setLoading(false);
    }, 1000);
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (code.length !== 6) {
      setError('Код должен содержать 6 цифр');
      return;
    }

    setLoading(true);
    
    // Имитация проверки кода
    setTimeout(() => {
      const userData = {
        id: `phone_${phone.replace(/\D/g, '')}`,
        phone: phone,
        firstName: 'Пользователь',
        createdAt: new Date().toISOString(),
      };
      
      localStorage.setItem('stiger_user', JSON.stringify(userData));
      router.push('/');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="glass-premium rounded-3xl p-8 shadow-2xl text-center animate-scale-in bg-white/10 backdrop-blur-xl">
          {/* Логотип */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl gradient-bg text-white text-3xl mb-6 shadow-lg float-animation">
            ⚡
          </div>
          
          <h1 className="text-3xl font-bold mb-2 text-white">
            Вход по телефону
          </h1>
          
          <p className="text-white/70 mb-8">
            Мы отправим вам SMS с кодом
          </p>

          {step === 'phone' ? (
            <form onSubmit={handlePhoneSubmit} className="space-y-6">
              <div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(formatPhone(e.target.value))}
                  placeholder="+7 (999) 123-45-67"
                  className="w-full px-4 py-4 rounded-2xl bg-white/20 border border-white/30 text-white placeholder-white/50 focus:border-white/60 transition-colors text-center text-lg"
                  maxLength={18}
                />
              </div>
              
              {error && (
                <div className="text-red-300 text-sm bg-red-500/20 p-3 rounded-lg">
                  {error}
                </div>
              )}
              
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-2xl bg-white text-purple-900 font-bold text-lg hover:bg-white/90 transition-all disabled:opacity-50"
              >
                {loading ? 'Отправка...' : 'Получить код'}
              </button>
              
              <Link 
                href="/auth/telegram-widget"
                className="block text-white/70 hover:text-white transition-colors"
              >
                ← Вернуться к Telegram входу
              </Link>
            </form>
          ) : (
            <form onSubmit={handleCodeSubmit} className="space-y-6">
              <div>
                <p className="text-white/70 mb-4">Код отправлен на {phone}</p>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  className="w-full px-4 py-4 rounded-2xl bg-white/20 border border-white/30 text-white placeholder-white/50 focus:border-white/60 transition-colors text-center text-2xl font-mono tracking-widest"
                  maxLength={6}
                />
              </div>
              
              {error && (
                <div className="text-red-300 text-sm bg-red-500/20 p-3 rounded-lg">
                  {error}
                </div>
              )}
              
              <button
                type="submit"
                disabled={loading || code.length !== 6}
                className="w-full h-12 rounded-2xl bg-white text-purple-900 font-bold text-lg hover:bg-white/90 transition-all disabled:opacity-50"
              >
                {loading ? 'Проверка...' : 'Войти'}
              </button>
              
              <button
                type="button"
                onClick={() => setStep('phone')}
                className="text-white/70 hover:text-white transition-colors"
              >
                ← Изменить номер
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
