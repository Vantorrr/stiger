"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AuthenticatedLayout from "@/components/AuthenticatedLayout";

export default function ScanPage() {
  const [user, setUser] = useState(null);
  const [scanning, setScanning] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem("stinger_user");
    if (!userData) {
      router.push("/login");
      return;
    }
    setUser(JSON.parse(userData));
  }, [router]);

  const startScan = async () => {
    setScanning(true);
    try {
      // Запрос доступа к камере
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } 
      });
      
      // Здесь будет интеграция с QR-сканером
      setTimeout(() => {
        setScanning(false);
        alert("QR-код отсканирован! (демо)");
        // Здесь будет переход к выбору тарифа и оплате
      }, 3000);
      
    } catch (error) {
      setScanning(false);
      alert("Не удалось получить доступ к камере");
    }
  };

  if (!user) {
    return <div>Загрузка...</div>;
  }

  return (
    <AuthenticatedLayout>
      <div className="flex items-center justify-center px-6 py-20">
        <div className="w-full max-w-md">
          <div className="glass-effect rounded-3xl p-8 shadow-2xl text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl gradient-bg text-white text-3xl mb-6">
              📱
            </div>
            
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
              Сканировать QR-код
            </h1>
            
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              Наведите камеру на QR-код шкафа для аренды power bank
            </p>

            {!scanning ? (
              <button 
                onClick={startScan}
                className="w-full h-14 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
              >
                📷 Открыть камеру
              </button>
            ) : (
              <div className="space-y-4">
                <div className="w-full h-64 rounded-xl bg-black/20 flex items-center justify-center">
                  <div className="text-white/70">Камера активна...</div>
                </div>
                <button 
                  onClick={() => setScanning(false)}
                  className="w-full h-12 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors"
                >
                  Отменить
                </button>
              </div>
            )}

            <div className="mt-6 p-4 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                <strong>💡 Как это работает:</strong><br/>
                1. Найдите шкаф Stiger<br/>
                2. Отсканируйте QR-код<br/>
                3. Выберите тариф и оплатите<br/>
                4. Заберите power bank из открывшегося слота
              </p>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
