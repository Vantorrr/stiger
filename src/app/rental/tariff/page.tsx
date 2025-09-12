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
          <div className="glass-effect rounded-2xl p-6 mb-8">
            <h2 className="text-xl font-semibold mb-3">Устройство</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">ID:</span>
                <span className="ml-2 font-medium">{deviceInfo.cabinet.id}</span>
              </div>
              <div>
                <span className="text-gray-500">Доступно:</span>
                <span className="ml-2 font-medium">{deviceInfo.cabinet.emptySlots} из {deviceInfo.cabinet.slots}</span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-500">Адрес:</span>
                <span className="ml-2 font-medium">{deviceInfo.shop.address || "Не указан"}</span>
              </div>
            </div>
          </div>

          {/* Выбор тарифа */}
          <h1 className="text-3xl font-bold text-center mb-8">Выберите тариф</h1>
          
          <div className="grid gap-4 md:grid-cols-3">
            {tariffs.map((tariff) => (
              <div 
                key={tariff.id}
                className={`relative glass-effect rounded-2xl p-6 cursor-pointer transform transition-all hover:scale-105 ${
                  tariff.popular ? 'ring-2 ring-purple-500' : ''
                }`}
                onClick={() => !loading && selectTariff(tariff.id)}
              >
                {tariff.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-500 text-white text-xs px-3 py-1 rounded-full">
                    Популярный
                  </div>
                )}
                
                <div className="text-center">
                  <h3 className="text-xl font-bold mb-2">{tariff.name}</h3>
                  <div className="text-3xl font-bold text-purple-600 mb-1">
                    ₽{tariff.price}
                  </div>
                  <div className="text-sm text-gray-500 mb-4">{tariff.duration}</div>
                  
                  <p className="text-sm text-gray-600 mb-4">{tariff.description}</p>
                  
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-xs text-gray-500">
                      + депозит ₽{tariff.deposit}
                    </div>
                    <div className="text-sm font-semibold mt-1">
                      Итого: ₽{tariff.price + tariff.deposit}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>ℹ️ Как работает депозит:</strong><br/>
              • Депозит блокируется на карте при аренде<br/>
              • После возврата powerbank депозит возвращается<br/>
              • Если не вернуть вовремя, депозит будет списан
            </p>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
