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
            <div className="glass-effect rounded-2xl p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Детали заказа</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Устройство:</span>
                  <span className="font-medium">{order.deviceId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Адрес:</span>
                  <span className="font-medium text-sm text-right max-w-[200px]">
                    {order.device.address || "Не указан"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Тариф:</span>
                  <span className="font-medium">₽{tariffPrice}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Депозит:</span>
                  <span className="font-medium">₽{depositAmount}</span>
                </div>
                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Итого к оплате:</span>
                    <span className="text-purple-600">₽{totalAmount}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Информация о способе оплаты */}
            <div className="glass-effect rounded-2xl p-6 mb-6">
              <h3 className="font-semibold mb-3">Способ оплаты</h3>
              <div className="flex items-center gap-3">
                <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-red-600 rounded flex items-center justify-center text-white text-xs font-bold">
                  CP
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600">CloudPayments</p>
                  <p className="text-xs text-gray-500">Безопасная оплата картой</p>
                </div>
              </div>
            </div>

            {/* Кнопка оплаты */}
            <button
              onClick={handlePayment}
              disabled={loading || !scriptLoaded}
              className="w-full h-14 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Обработка..." : "Оплатить ₽" + totalAmount}
            </button>

            {/* Информация о безопасности */}
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                🔒 Платеж защищен с помощью SSL-шифрования
              </p>
            </div>

            {/* Дополнительная информация */}
            <div className="mt-8 p-4 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                <strong>⚡ Что произойдет после оплаты:</strong><br/>
                1. PowerBank автоматически выедет из слота<br/>
                2. Заберите его в течение 30 секунд<br/>
                3. Время аренды начнется с момента выдачи<br/>
                4. Верните в любой шкаф Stiger
              </p>
            </div>
          </div>
        </div>
      </AuthenticatedLayout>
    </>
  );
}
