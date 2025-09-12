"use client";
import Navbar from "@/components/Navbar";
import SideMenu from "@/components/SideMenu";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// Динамический импорт карты для избежания SSR ошибок
const InteractiveMap = dynamic(() => import("@/components/InteractiveMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Загрузка карты...</p>
      </div>
    </div>
  ),
});

interface User {
  email: string;
  name: string;
}

// Демо-точки зарядов
const chargePoints = [
  { id: 1, lat: 55.751244, lng: 37.618423, name: "ТЦ Охотный Ряд", slots: 8, available: 5 },
  { id: 2, lat: 55.757814, lng: 37.621320, name: "Красная площадь", slots: 6, available: 3 },
  { id: 3, lat: 55.755826, lng: 37.617299, name: "ГУМ", slots: 12, available: 8 },
  { id: 4, lat: 55.753215, lng: 37.622504, name: "Метро Театральная", slots: 10, available: 2 },
  { id: 5, lat: 55.749792, lng: 37.624879, name: "Кафе на Никольской", slots: 4, available: 4 },
];

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem("stinger_user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
    
    setMapReady(true);
  }, []);
  if (user) {
    // Авторизованный пользователь - показываем карту как в "Бери Заряд"
    return (
      <div className="min-h-screen flex flex-col relative">
        {/* Гамбургер меню слева */}
        <div className="absolute top-3 left-6 z-30">
          <button onClick={() => setMenuOpen(true)} className="glass-effect rounded-xl p-3 shadow-xl hover:bg-white/20 transition-all duration-300">
            <div className="w-6 h-6 flex flex-col justify-center space-y-1">
              <div className="w-full h-0.5 bg-gray-700 dark:bg-gray-300 rounded"></div>
              <div className="w-full h-0.5 bg-gray-700 dark:bg-gray-300 rounded"></div>
              <div className="w-full h-0.5 bg-gray-700 dark:bg-gray-300 rounded"></div>
            </div>
          </button>
        </div>

        {/* Логотип по центру сверху */}
        <div className="absolute top-3 left-1/2 transform -translate-x-1/2 z-20">
          <div className="glass-effect rounded-2xl px-6 py-3 shadow-xl">
            <div className="flex items-center gap-3">
              <img src="/logoo.png" alt="Stiger" className="w-8 h-8 object-contain" />
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Stiger
              </span>
            </div>
          </div>
        </div>

        {/* Тонированный фон под шапкой в цвет бренда (как на заставке) */}
        <div
          className="pointer-events-none absolute left-0 right-0 top-0 z-10"
          style={{
            height: "84px",
            background:
              "linear-gradient(180deg, rgba(124,58,237,0.35) 0%, rgba(59,130,246,0.25) 35%, rgba(13,148,136,0.20) 65%, rgba(255,255,255,0) 100%)",
          }}
        />
        
        {/* Интерактивная карта с маркерами устройств */}
        <main className="flex-1 relative pt-20 pb-0">
          <div className="w-full" style={{ height: "calc(100vh - 64px)" }}>
            <InteractiveMap />
          </div>

          {/* Мягкие градиентные переходы между картой и UI */}
          {/* Убрали вторую полоску, чтобы не было линии */}
          <div className="pointer-events-none absolute left-0 right-0 bottom-0 h-28 bg-gradient-to-t from-white to-transparent dark:from-slate-900"></div>
        </main>
        
        {/* Элегантная плавающая кнопка "Взять заряд" - вынесли из main для правильного z-index */}
        <div className="fixed z-50 left-4 right-4" style={{ bottom: "calc(20px + env(safe-area-inset-bottom))" }}>
            <a href="/scan" className="group relative flex items-center justify-center h-16 w-full max-w-[380px] mx-auto rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-blue-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative flex items-center gap-3">
                <span className="text-2xl">⚡</span>
                <div className="text-center">
                  <div className="font-semibold text-lg leading-tight">Взять заряд</div>
                  <div className="text-xs opacity-80">Сканировать QR-код</div>
                </div>
              </div>
            </a>
          </div>
        
        {/* Боковое меню */}
        <SideMenu open={menuOpen} onClose={() => setMenuOpen(false)} clientNumber={user?.email ?? "000000"} />
      </div>
    );
  }

  // Неавторизованный пользователь - показываем лендинг
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-blue-900 dark:to-purple-900">
      <Navbar />
      <main className="flex-1 flex items-center">
        <div className="mx-auto max-w-7xl px-6 py-20 w-full">
          <section className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8 text-center lg:text-left">
              <div className="space-y-4">
                <h1 className="text-5xl lg:text-7xl font-black tracking-tight">
                  <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-teal-600 bg-clip-text text-transparent">
                    Rent Power.
                  </span>
                  <br />
                  <span className="text-gray-900 dark:text-gray-100">Return Anywhere.</span>
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 max-w-lg mx-auto lg:mx-0">
                  Stiger — революция в прокате power bank. Оплати, забери, верни в любом шкафу города.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <a href="/map" className="group relative inline-flex items-center justify-center h-14 px-8 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-600 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="relative flex items-center gap-3">
                    <span className="text-xl">⚡</span>
                    <span>Взять заряд</span>
                  </span>
                </a>
                
                <a href="/login" className="group relative inline-flex items-center justify-center h-14 px-8 rounded-xl bg-white/10 backdrop-blur border border-white/20 text-white font-semibold text-lg hover:bg-white/20 transition-all duration-300">
                  <span className="flex items-center gap-3">
                    <span className="text-xl">👤</span>
                    <span>Войти в аккаунт</span>
                  </span>
                </a>
              </div>
            </div>
            
            <div className="relative">
              <div className="float-animation">
                <div className="glass-premium rounded-3xl p-10 shadow-2xl">
                  <div className="grid grid-cols-2 gap-8">
                    <div className="text-center space-y-3 animate-scale-in" style={{ animationDelay: "0.1s" }}>
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-success text-white text-2xl shadow-lg">
                        🏪
                      </div>
                      <div className="text-5xl font-black gradient-text">10</div>
                      <div className="text-sm font-medium text-gray-600 dark:text-gray-300">Активных шкафов</div>
                    </div>
                    <div className="text-center space-y-3 animate-scale-in" style={{ animationDelay: "0.2s" }}>
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-bg text-white text-2xl shadow-lg">
                        ⏰
                      </div>
                      <div className="text-5xl font-black gradient-text">24/7</div>
                      <div className="text-sm font-medium text-gray-600 dark:text-gray-300">Доступность</div>
                    </div>
                    <div className="text-center space-y-3 animate-scale-in" style={{ animationDelay: "0.3s" }}>
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-premium text-white text-2xl shadow-lg">
                        ⚡
                      </div>
                      <div className="text-5xl font-black gradient-text">30</div>
                      <div className="text-sm font-medium text-gray-600 dark:text-gray-300">Секунд на выдачу</div>
                    </div>
                    <div className="text-center space-y-3 animate-scale-in" style={{ animationDelay: "0.4s" }}>
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-2xl shadow-lg">
                        🔄
                      </div>
                      <div className="text-5xl font-black gradient-text">∞</div>
                      <div className="text-sm font-medium text-gray-600 dark:text-gray-300">Точек возврата</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
