"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthenticatedLayout from "@/components/AuthenticatedLayout";

export default function TariffPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState<any>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const deviceId = searchParams.get("deviceId");

  useEffect(() => {
    const userData = localStorage.getItem("stinger_user");
    if (!userData) {
      router.push("/login");
      return;
    }
    setUser(JSON.parse(userData));
    
    if (deviceId) {
      fetchDeviceInfo();
    }
  }, [router, deviceId]);

  const fetchDeviceInfo = async () => {
    try {
      const response = await fetch(`/api/bajie/device?deviceId=${deviceId}`);
      const data = await response.json();
      
      if (data.data?.code === 0) {
        setDeviceInfo(data.data.data);
      } else {
        alert("Устройство недоступно");
        router.push("/scan");
      }
    } catch (error) {
      console.error("Error fetching device:", error);
      alert("Ошибка загрузки данных устройства");
    }
  };

  const selectTariff = async (tariffId: string) => {
    if (!user || !deviceId) return;
    
    setLoading(true);
    try {
      // Создаем заказ
      const response = await fetch("/api/rentals/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceId,
          userId: user.phone || user.email || "demo-user",
          tariffId
        })
      });

      const data = await response.json();
      
      if (data.orderId) {
        // Сохраняем заказ в localStorage
        localStorage.setItem(`order_${data.orderId}`, JSON.stringify(data));
        // Переход к оплате
        router.push(`/rental/payment?orderId=${data.orderId}`);
      } else {
        alert("Ошибка создания заказа");
      }
    } catch (error) {
      console.error("Error creating rental:", error);
      alert("Произошла ошибка. Попробуйте снова.");
    } finally {
      setLoading(false);
    }
  };

  if (!user || !deviceInfo) {
    return (
      <AuthenticatedLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Загрузка...</p>
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }

  const tariffs = [
    {
      id: "1hour",
      name: "На час",
      duration: "1 час",
      price: 200,
      deposit: 200,
      description: "Идеально для короткой прогулки",
      popular: false
    },
    {
      id: "4hours",
      name: "На полдня",
      duration: "4 часа",
      price: 400,
      deposit: 200,
      description: "Хватит на весь день в городе",
      popular: true
    },
    {
      id: "daily",
      name: "На сутки",
      duration: "24 часа",
      price: 1000,
      deposit: 200,
      description: "Для долгих путешествий",
      popular: false
    }
  ];

  return (
    <AuthenticatedLayout>
      <div className="min-h-screen px-6 py-20">
        <div className="max-w-4xl mx-auto">
          {/* Информация об устройстве */}
          <div className="glass-premium rounded-3xl p-8 mb-10 animate-fade-in">
            <div className="flex items-start gap-6">
              <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center text-white text-2xl flex-shrink-0">
                🏪
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-4 gradient-text">Точка выдачи</h2>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500 dark:text-gray-400">ID устройства:</span>
                    <span className="font-mono font-semibold bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-lg">
                      {deviceInfo.cabinet.id}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Доступно power bank:</span>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        {[...Array(deviceInfo.cabinet.slots)].map((_, i) => (
                          <div
                            key={i}
                            className={`w-2 h-6 rounded-full ${
                              i < deviceInfo.cabinet.emptySlots
                                ? 'bg-green-500'
                                : 'bg-gray-300 dark:bg-gray-700'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-medium">
                        {deviceInfo.cabinet.emptySlots}/{deviceInfo.cabinet.slots}
                      </span>
                    </div>
                  </div>
                  <div className="pt-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Адрес:</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {deviceInfo.shop.address || "Адрес не указан"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Выбор тарифа */}
          <div className="text-center mb-12 animate-slide-up">
            <h1 className="text-4xl font-bold mb-4">
              <span className="gradient-text">Выберите тариф</span>
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Оплачивайте только за время использования
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-3">
            {tariffs.map((tariff, index) => (
              <div 
                key={tariff.id}
                className={`relative glass-premium rounded-3xl p-8 cursor-pointer card-hover animate-scale-in ${
                  tariff.popular ? 'scale-105' : ''
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => !loading && selectTariff(tariff.id)}
              >
                {tariff.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 gradient-bg text-white text-sm font-semibold px-6 py-2 rounded-full shadow-lg">
                    🔥 Популярный выбор
                  </div>
                )}
                
                <div className="text-center">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 ${
                    tariff.popular ? 'gradient-bg' : 'bg-gray-100 dark:bg-gray-800'
                  }`}>
                    <span className="text-2xl">
                      {tariff.id === '1hour' ? '⚡' : tariff.id === '4hours' ? '🔋' : '💪'}
                    </span>
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-2">{tariff.name}</h3>
                  
                  <div className="my-6">
                    <div className="text-5xl font-bold gradient-text">
                      ₽{tariff.price}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">{tariff.duration}</div>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-300 mb-8 min-h-[3rem]">
                    {tariff.description}
                  </p>
                  
                  <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-500">Тариф</span>
                      <span className="font-semibold">₽{tariff.price}</span>
                    </div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm text-gray-500">Депозит</span>
                      <span className="font-semibold">₽{tariff.deposit}</span>
                    </div>
                    <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">Итого</span>
                        <span className="text-xl font-bold gradient-text">
                          ₽{tariff.price + tariff.deposit}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <button className={`w-full mt-6 py-3 rounded-xl font-semibold transition-all button-premium ${
                    tariff.popular 
                      ? 'gradient-bg text-white shadow-lg' 
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}>
                    Выбрать
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 glass-premium rounded-3xl p-8 animate-fade-in">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                <span className="text-xl">💡</span>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-3">Как работает система оплаты</h3>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <div className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>Депозит блокируется на карте при аренде</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>После возврата powerbank депозит автоматически возвращается</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>Оплата происходит только за фактическое время использования</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-yellow-500 mt-0.5">⚠️</span>
                    <span>При просрочке возврата взимается дополнительная плата</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
