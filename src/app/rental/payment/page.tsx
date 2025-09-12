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
    if (!order) {
      alert("Заказ не найден");
      return;
    }

    // Проверяем выбранный способ оплаты
    const selectedPayment = document.querySelector('input[name="payment"]:checked');
    if (!selectedPayment) {
      alert("Выберите способ оплаты");
      return;
    }

    const paymentType = selectedPayment.nextElementSibling?.querySelector('.font-medium')?.textContent;
    
    if (paymentType === "СБП") {
      // Для СБП генерируем QR-код или редирект
      setLoading(true);
      
      // Здесь будет интеграция с СБП API
      // Пока делаем заглушку
      setTimeout(() => {
        alert("СБП платеж в разработке. Используйте банковскую карту.");
        setLoading(false);
      }, 1000);
      
      return;
    }

    // Для карт используем CloudPayments
    if (!scriptLoaded || !window.cp) {
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
              
              {/* Сохраненные способы оплаты */}
              {(() => {
                const savedCards = JSON.parse(localStorage.getItem("stinger_cards") || "[]");
                const savedSBP = localStorage.getItem("stinger_sbp_phone");
                
                if (savedCards.length > 0 || savedSBP) {
                  return (
                    <div className="space-y-3">
                      {savedCards.map((card: any, index: number) => (
                        <label key={card.id} className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">
                          <input type="radio" name="payment" defaultChecked={index === 0} className="w-4 h-4 text-purple-600" />
                          <div className="flex items-center gap-3 flex-1">
                            <div className="w-12 h-8 rounded bg-gradient-to-r from-gray-700 to-gray-900 flex items-center justify-center text-white text-xs font-bold">
                              {card.type.toUpperCase()}
                            </div>
                            <span className="font-mono">{card.mask}</span>
                          </div>
                        </label>
                      ))}
                      
                      {savedSBP && (
                        <label className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">
                          <input type="radio" name="payment" defaultChecked={savedCards.length === 0} className="w-4 h-4 text-purple-600" />
                          <div className="flex items-center gap-3 flex-1">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center text-white text-lg">
                              📱
                            </div>
                            <div>
                              <p className="font-medium">СБП</p>
                              <p className="text-sm text-gray-500">+{savedSBP}</p>
                            </div>
                          </div>
                        </label>
                      )}
                      
                      <a href="/payment" className="block text-center text-purple-600 hover:text-purple-700 font-medium text-sm mt-2">
                        + Добавить способ оплаты
                      </a>
                    </div>
                  );
                }
                
                // Если нет сохраненных способов
                return (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">Нет сохраненных способов оплаты</p>
                    <a href="/payment" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl gradient-bg text-white font-medium">
                      <span>💳</span>
                      <span>Добавить способ оплаты</span>
                    </a>
                  </div>
                );
              })()}
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
