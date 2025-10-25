"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface User {
  email: string;
  name: string;
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [savedCards, setSavedCards] = useState<Array<{id: string, mask: string, type: string, token?: string}>>([]);
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem("stiger_user");
    if (userData) {
      setUser(JSON.parse(userData));
      // Загружаем привязанные карты
      const cards = JSON.parse(localStorage.getItem("stiger_cards") || "[]");
      setSavedCards(cards);
    } else {
      router.push("/auth");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("stiger_user");
    router.push("/");
  };

  if (!user) {
    return <div>Загрузка...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-blue-900 dark:to-purple-900">
      <header className="sticky top-0 z-40 w-full border-b border-black/10 dark:border-white/10 bg-background/80 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Stiger
          </Link>
          <nav className="flex items-center gap-8 text-sm font-medium">
            <Link href="/dashboard" className="text-purple-600">Личный кабинет</Link>
            <Link href="/wallet" className="hover:text-purple-600 transition-colors">Кошелёк</Link>
            <Link href="/map" className="hover:text-purple-600 transition-colors">Карта</Link>
            <button 
              onClick={handleLogout}
              className="inline-flex items-center justify-center h-9 px-4 rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold hover:shadow-lg transition-all duration-300"
            >
              Выйти
            </button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10 w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Добро пожаловать, {user.name}!</h1>
          <p className="text-gray-600 dark:text-gray-300">{user.email}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="glass-effect rounded-2xl p-6 shadow-xl">
            <h3 className="font-semibold mb-2">Активные аренды</h3>
            <div className="text-3xl font-bold text-green-500">0</div>
            <p className="text-sm opacity-70">Power bank в аренде</p>
          </div>
          <div className="glass-effect rounded-2xl p-6 shadow-xl">
            <h3 className="font-semibold mb-2">Потрачено всего</h3>
            <div className="text-3xl font-bold text-blue-500">₽0</div>
            <p className="text-sm opacity-70">На аренду power bank</p>
          </div>
          <div className="glass-effect rounded-2xl p-6 shadow-xl">
            <h3 className="font-semibold mb-2">Всего аренд</h3>
            <div className="text-3xl font-bold text-purple-500">0</div>
            <p className="text-sm opacity-70">За всё время</p>
          </div>
        </div>

        {/* Привязанные карты */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">💳 Привязанные карты</h2>
          {savedCards.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {savedCards.map((card) => (
                <div key={card.id} className="glass-effect rounded-2xl p-4 shadow-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">{card.mask}</div>
                      <div className="text-sm opacity-70">{card.type}</div>
                    </div>
                    <div className="text-green-500">✓</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-effect rounded-2xl p-6 shadow-xl text-center">
              <p className="text-gray-600 dark:text-gray-300 mb-4">Нет привязанных карт</p>
              <Link href="/payment" className="inline-flex items-center justify-center h-10 px-6 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold hover:shadow-lg transition-all duration-300">
                Привязать карту
              </Link>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Link href="/map" className="glass-effect rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 group">
            <h3 className="font-semibold mb-2 group-hover:text-purple-600 transition-colors">⚡ Взять заряд</h3>
            <p className="text-sm opacity-70">Найти ближайший шкаф и арендовать power bank</p>
          </Link>
          <Link href="/scan" className="glass-effect rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 group">
            <h3 className="font-semibold mb-2 group-hover:text-purple-600 transition-colors">⚡ Взять заряд</h3>
            <p className="text-sm opacity-70">Отсканировать QR-код и арендовать power bank</p>
          </Link>
        </div>
      </main>
    </div>
  );
}
