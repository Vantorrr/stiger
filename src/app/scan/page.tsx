"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import AuthenticatedLayout from "@/components/AuthenticatedLayout";

export default function ScanPage() {
  const [user, setUser] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [deviceId, setDeviceId] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
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
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      // TODO: Интегрировать реальный QR сканер (например, qr-scanner или jsQR)
      // Пока делаем демо с ручным вводом
      
    } catch (error) {
      setScanning(false);
      alert("Не удалось получить доступ к камере");
    }
  };

  const stopScan = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setScanning(false);
  };

  const processQRCode = () => {
    if (!deviceId) {
      alert("Введите ID устройства");
      return;
    }
    
    stopScan();
    // Переход к выбору тарифа
    router.push(`/rental/tariff?deviceId=${deviceId}`);
  };

  useEffect(() => {
    // Cleanup при размонтировании
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

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
                <div className="w-full h-64 rounded-xl overflow-hidden bg-black relative">
                  <video 
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-0 border-2 border-white/20" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-white rounded-xl" />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Или введите ID устройства вручную:
                    </label>
                    <input
                      type="text"
                      value={deviceId}
                      onChange={(e) => setDeviceId(e.target.value)}
                      placeholder="Например: DTA35552"
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div className="flex gap-3">
                    <button 
                      onClick={stopScan}
                      className="flex-1 h-12 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                      Отменить
                    </button>
                    <button 
                      onClick={processQRCode}
                      className="flex-1 h-12 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold hover:shadow-lg transition-all"
                    >
                      Продолжить
                    </button>
                  </div>
                </div>
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
