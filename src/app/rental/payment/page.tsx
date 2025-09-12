"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthenticatedLayout from "@/components/AuthenticatedLayout";
import Script from "next/script";

declare global {
  interface Window {
    cp: any;
  }
}

export default function PaymentPage() {
  const [user, setUser] = useState<any>(null);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  useEffect(() => {
    const userData = localStorage.getItem("stinger_user");
    if (!userData) {
      router.push("/login");
      return;
    }
    setUser(JSON.parse(userData));
    
    // Загружаем сохраненный заказ
    const savedOrder = localStorage.getItem(`order_${orderId}`);
    if (savedOrder) {
      setOrder(JSON.parse(savedOrder));
    } else {
      alert("Заказ не найден");
      router.push("/scan");
    }
  }, [router, orderId]);

  const handlePayment = () => {
    if (!scriptLoaded || !window.cp || !order) {
      alert("Платежная система еще не загружена, попробуйте снова");
      return;
    }

    setLoading(true);

    const widget = new window.cp.CloudPayments();
    
    widget.auth({
      publicId: order.paymentData.publicId,
      description: order.paymentData.description,
      amount: order.paymentData.amount,
      currency: order.paymentData.currency,
      invoiceId: order.paymentData.invoiceId,
      accountId: order.paymentData.accountId,
      requireConfirmation: true,
      data: order.paymentData.jsonData,
      
      // Настройки виджета
      skin: "modern",
      language: "ru-RU"
    },
    {
      onSuccess: function(options: any) {
        // Платеж прошел, powerbank должен выехать автоматически через вебхук
        setLoading(false);
        router.push(`/rental/success?orderId=${orderId}&transactionId=${options.id}`);
      },
      onFail: function(reason: string, options: any) {
        setLoading(false);
        alert(`Ошибка оплаты: ${reason}`);
      },
      onComplete: function(paymentResult: any, options: any) {
        // Окно закрыто после оплаты
        console.log("Payment completed:", paymentResult);
      }
    });
  };

  if (!user || !order) {
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

  const totalAmount = order.paymentData.amount;
  const tariffPrice = order.paymentData.jsonData.tariffPrice;
  const depositAmount = order.paymentData.jsonData.depositAmount;

  return (
    <>
      <Script 
        src="https://widget.cloudpayments.ru/bundles/cloudpayments.js"
        onLoad={() => setScriptLoaded(true)}
      />
      
      <AuthenticatedLayout>
        <div className="min-h-screen px-6 py-20">
          <div className="max-w-md mx-auto">
            <h1 className="text-3xl font-bold text-center mb-8">Оплата аренды</h1>
            
            {/* Информация о заказе */}
            <div className="glass-premium rounded-3xl p-8 mb-8 animate-fade-in">
              <h2 className="text-2xl font-bold mb-6 gradient-text">Детали заказа</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                      <span className="text-lg">📍</span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Устройство</p>
                      <p className="font-mono font-semibold">{order.deviceId}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start justify-between p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <span className="text-lg">🏢</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Адрес</p>
                      <p className="font-medium text-sm">
                        {order.device.address || "Адрес не указан"}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-300">Тариф</span>
                    <span className="font-semibold text-lg">₽{tariffPrice}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-300">Депозит</span>
                    <span className="font-semibold text-lg">₽{depositAmount}</span>
                  </div>
                  <div className="pt-4 border-t-2 border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold">Итого к оплате</span>
                      <span className="text-3xl font-bold gradient-text">₽{totalAmount}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Информация о способе оплаты */}
            <div className="glass-effect rounded-3xl p-6 mb-8">
              <h3 className="font-semibold mb-4 text-lg">Способ оплаты</h3>
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
                <div className="w-16 h-12 gradient-bg rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-lg">
                  CP
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">CloudPayments</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Безопасная оплата картой • SSL защита</p>
                </div>
                <div className="text-green-500">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Кнопка оплаты */}
            <button
              onClick={handlePayment}
              disabled={loading || !scriptLoaded}
              className="w-full h-16 rounded-3xl gradient-bg text-white font-bold text-xl shadow-2xl button-premium disabled:opacity-50 disabled:cursor-not-allowed pulse-glow"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <span className="animate-spin">⏳</span>
                  Обработка...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-3">
                  💳 Оплатить ₽{totalAmount}
                </span>
              )}
            </button>

            {/* Информация о безопасности */}
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                🔒 Платеж защищен с помощью SSL-шифрования
              </p>
            </div>

            {/* Дополнительная информация */}
            <div className="mt-10 glass-effect rounded-3xl p-8 animate-fade-in">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <span className="text-2xl">⚡</span>
                Что произойдет после оплаты
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg gradient-success flex items-center justify-center flex-shrink-0 text-white font-bold">
                    1
                  </div>
                  <div>
                    <p className="font-medium">PowerBank выедет автоматически</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Слот откроется сразу после оплаты</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg gradient-success flex items-center justify-center flex-shrink-0 text-white font-bold">
                    2
                  </div>
                  <div>
                    <p className="font-medium">Заберите в течение 30 секунд</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Слот закроется автоматически</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg gradient-success flex items-center justify-center flex-shrink-0 text-white font-bold">
                    3
                  </div>
                  <div>
                    <p className="font-medium">Время аренды начнется</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">С момента выдачи PowerBank</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg gradient-success flex items-center justify-center flex-shrink-0 text-white font-bold">
                    4
                  </div>
                  <div>
                    <p className="font-medium">Верните в любой шкаф Stiger</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Найдите ближайший на карте</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AuthenticatedLayout>
    </>
  );
}
