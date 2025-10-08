"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthenticatedLayout from "@/components/AuthenticatedLayout";
import jsQR from "jsqr";

export default function ScanPage() {
  const [user, setUser] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [deviceId, setDeviceId] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<number | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const userData = localStorage.getItem("stiger_user");
    if (!userData) {
      router.push("/auth");
      return;
    }
    setUser(JSON.parse(userData));
    
    // Если передан deviceId в URL, заполняем поле
    const urlDeviceId = searchParams.get("deviceId");
    if (urlDeviceId) {
      setDeviceId(urlDeviceId);
    }
  }, [router, searchParams]);

  const scanQRCode = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (!context || video.readyState !== video.HAVE_ENOUGH_DATA) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: "dontInvert",
    });

    if (code) {
      console.log("✅ QR код найден:", code.data);
      
      // Извлекаем deviceId из QR кода
      // Формат может быть разный, например:
      // - просто "DTA35552"
      // - URL: "https://chargenow.top/device/DTA35552"
      // - JSON: {"deviceId":"DTA35552"}
      
      let extractedDeviceId = code.data;
      
      // Если это URL, извлекаем последнюю часть
      if (code.data.includes('/')) {
        const parts = code.data.split('/');
        extractedDeviceId = parts[parts.length - 1];
      }
      
      // Если это число (qrCode из API), используем его
      if (/^\d+$/.test(code.data)) {
        extractedDeviceId = code.data; // это qrCode: "1753847843"
      }
      
      setDeviceId(extractedDeviceId);
      stopScan();
      
      // Автоматически переходим к выбору тарифа
      router.push(`/rental/tariff?deviceId=${extractedDeviceId}`);
    }
  };

  const startScan = async () => {
    setScanning(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } 
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Начинаем сканирование каждые 100ms
        scanIntervalRef.current = window.setInterval(scanQRCode, 100);
      }
      
    } catch (error) {
      console.error("Ошибка доступа к камере:", error);
      setScanning(false);
      alert("Не удалось получить доступ к камере. Проверьте разрешения.");
    }
  };

  const stopScan = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
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
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
      }
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
          <div className="glass-premium rounded-3xl p-10 shadow-2xl text-center animate-scale-in">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl gradient-bg text-white text-4xl mb-8 shadow-lg float-animation">
              📱
            </div>
            
            <h1 className="text-4xl font-bold mb-4">
              <span className="gradient-text">Сканировать QR-код</span>
            </h1>
            
            <p className="text-gray-600 dark:text-gray-300 mb-10 text-lg">
              Наведите камеру на QR-код шкафа
            </p>

            {!scanning ? (
              <button 
                onClick={startScan}
                className="w-full h-14 rounded-2xl gradient-bg text-white font-semibold text-lg shadow-lg button-premium"
              >
                <span className="flex items-center justify-center gap-3">
                  <span className="text-2xl">📷</span>
                  <span>Открыть камеру</span>
                </span>
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
                  <canvas ref={canvasRef} className="hidden" />
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-0 border-2 border-white/20" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-white rounded-xl animate-pulse" />
                  </div>
                  <div className="absolute bottom-4 left-0 right-0 text-center">
                    <p className="text-white text-sm font-semibold bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full inline-block">
                      Наведите на QR-код шкафа
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="glass-effect rounded-2xl p-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Или введите ID устройства вручную:
                    </label>
                    <input
                      type="text"
                      value={deviceId}
                      onChange={(e) => setDeviceId(e.target.value.toUpperCase())}
                      placeholder="Например: DTA35552"
                      className="w-full px-5 py-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono font-semibold text-lg input-premium focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500"
                    />
                  </div>
                  
                  <div className="flex gap-3">
                    <button 
                      onClick={stopScan}
                      className="flex-1 h-14 rounded-xl neumorphism text-gray-900 dark:text-white font-semibold transition-all hover:scale-98"
                    >
                      Отменить
                    </button>
                    <button 
                      onClick={processQRCode}
                      disabled={!deviceId}
                      className="flex-1 h-14 rounded-xl gradient-bg text-white font-semibold button-premium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Продолжить
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-10 glass-effect rounded-2xl p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <span className="text-xl">💡</span>
                <span>Как арендовать power bank</span>
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0 text-purple-600 dark:text-purple-400 font-semibold">
                    1
                  </div>
                  <div>
                    <p className="font-medium">Найдите шкаф Stiger</p>
                    <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">Используйте карту в приложении</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0 text-purple-600 dark:text-purple-400 font-semibold">
                    2
                  </div>
                  <div>
                    <p className="font-medium">Отсканируйте QR-код</p>
                    <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">Или введите ID устройства</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0 text-purple-600 dark:text-purple-400 font-semibold">
                    3
                  </div>
                  <div>
                    <p className="font-medium">Выберите тариф и оплатите</p>
                    <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">Безопасная оплата через CloudPayments</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0 text-purple-600 dark:text-purple-400 font-semibold">
                    4
                  </div>
                  <div>
                    <p className="font-medium">Заберите power bank</p>
                    <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">Он выедет автоматически</p>
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
