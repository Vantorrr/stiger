"use client";
import AuthenticatedLayout from "@/components/AuthenticatedLayout";
import { useEffect, useState } from "react";
import Script from "next/script";

declare global {
  interface Window {
    cp: any;
  }
}

export default function PaymentPage() {
  const [savedCards, setSavedCards] = useState<Array<{id: string, mask: string, type: string, token?: string}>>([]);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const publicId = (process.env.NEXT_PUBLIC_CLOUDPAYMENTS_PUBLIC_ID as string) || "";
  
  useEffect(() => {
    // Загружаем сохраненные карты (единый ключ)
    const cards = JSON.parse(localStorage.getItem("stiger_cards") || "[]");
    setSavedCards(cards);
  }, []);

  const saveCard = () => {
    console.log("saveCard called", { scriptLoaded, cp: window.cp });
    if (!publicId) {
      alert("Платежный ключ не настроен. Установите NEXT_PUBLIC_CLOUDPAYMENTS_PUBLIC_ID и перезапустите деплой.");
      return;
    }

    if (!scriptLoaded || !window.cp) {
      alert("Платежная система еще не загружена, попробуйте снова");
      return;
    }
    
    setLoading(true);
    // Определяем accountId для привязки карты к конкретному пользователю
    let accountId: string | undefined = undefined;
    try {
      const userRaw = localStorage.getItem("stiger_user");
      if (userRaw) {
        const user = JSON.parse(userRaw);
        accountId = user?.id || user?.telegramId?.toString() || user?.phone || undefined;
      }
    } catch {}
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const widget = new window.cp.CloudPayments();
    
    // Используем метод auth с суммой 1 рубль для проверки и токенизации карты
    widget.auth({
      publicId,
      description: "Привязка карты к Stiger",
      amount: 1,
      currency: "RUB",
      requireConfirmation: false, // Автоматическая отмена после проверки
      saveCard: true, // Важно! Сохраняем карту для будущих платежей
      accountId, // Привязываем карту к аккаунту пользователя
      // Явно указываем пустые строки, чтобы CloudPayments не делал редирект
      successUrl: "",
      failUrl: "",
    }, {
      onSuccess: (options: any) => {
        console.log("CloudPayments success:", options);
        
        // Проверяем, что данные есть
        if (!options) {
          console.error("No options returned from CloudPayments");
          alert("Ошибка: не получены данные карты");
          setLoading(false);
          return;
        }
        
        // Сохраняем токен карты
        const newCard = {
          id: Date.now().toString(),
          mask: options.CardLastFour ? `•••• ${options.CardLastFour}` : "•••• ••••",
          type: options.CardType || "Unknown",
          token: options.Token || options.RebillId, // Иногда токен приходит как RebillId
          transactionId: options.TransactionId
        };
        
        console.log("Saving card:", newCard);
        
        const updated = [...savedCards, newCard];
        localStorage.setItem("stiger_cards", JSON.stringify(updated));
        setSavedCards(updated);
        
        setLoading(false);
        alert("Карта успешно привязана!");
        
        // Возвращаем 1 рубль (отменяем транзакцию)
        fetch("/api/cloudpayments/refund", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transactionId: options.TransactionId })
        });
        
        // Редирект в личный кабинет
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 1000);
      },
      onFail: (reason: any, options: any) => {
        setLoading(false);
        alert(`Ошибка: ${reason}`);
      },
      onComplete: () => {
        setLoading(false);
      }
    });
  };

  const deleteCard = (id: string) => {
    const updated = savedCards.filter(card => card.id !== id);
    localStorage.setItem("stiger_cards", JSON.stringify(updated));
    setSavedCards(updated);
  };

  const detectCardType = (pan: string): string => {
    const firstDigit = pan[0];
    const firstTwo = pan.substring(0, 2);
    const firstFour = pan.substring(0, 4);
    
    if (firstDigit === "4") return "Visa";
    if (["51", "52", "53", "54", "55"].includes(firstTwo)) return "Mastercard";
    if (firstTwo === "22") return "МИР";
    if (["34", "37"].includes(firstTwo)) return "AmEx";
    if (firstTwo === "62") return "UnionPay";
    if (["2200", "2201", "2202", "2203", "2204"].includes(firstFour)) return "МИР";
    
    return "Unknown";
  };

  return (
    <>
      <Script 
        src="https://widget.cloudpayments.ru/bundles/cloudpayments.js"
        onLoad={() => setScriptLoaded(true)}
      />
      <AuthenticatedLayout>
        <div className="min-h-screen px-6 py-20">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">
              <span className="gradient-text">Способы оплаты</span>
            </h1>

            {/* Основной блок с картами */}
            <div className="glass-premium rounded-3xl p-8 animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Мои способы оплаты</h2>
                <div className="text-4xl">💳</div>
              </div>
              
              {/* Сохраненные карты */}
              {savedCards.length > 0 ? (
                <div className="space-y-3 mb-8">
                  {savedCards.map((card) => (
                    <div key={card.id} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-8 rounded bg-gradient-to-r from-gray-700 to-gray-900 flex items-center justify-center text-white text-xs font-bold">
                          {card.type}
                        </div>
                        <span className="font-mono font-medium">{card.mask}</span>
                      </div>
                      <button
                        onClick={() => deleteCard(card.id)}
                        className="text-red-500 hover:text-red-600 transition-colors p-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 mb-8">
                  <div className="text-6xl mb-4">💳</div>
                  <p className="text-gray-600 dark:text-gray-400">
                    У вас пока нет привязанных карт
                  </p>
                </div>
              )}

              {/* Кнопка добавления */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  CloudPayments поддерживает все популярные способы оплаты: банковские карты, СБП, Apple Pay, Google Pay и другие
                </p>
                {!scriptLoaded && (
                  <div className="text-sm text-gray-500 mb-2">Загрузка платежной системы...</div>
                )}
                <button 
                  onClick={saveCard}
                  disabled={loading || !scriptLoaded}
                  className="w-full h-12 rounded-xl gradient-bg text-white font-semibold button-premium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    "Обработка..."
                  ) : !scriptLoaded ? (
                    "Загрузка..."
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Добавить способ оплаты
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Информационный блок */}
            <div className="mt-6 p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <div className="flex gap-3">
                <div className="text-blue-500 mt-0.5">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  <p className="font-semibold mb-1">Безопасность платежей</p>
                  <p>Все платежи защищены по стандарту PCI DSS. Мы не храним данные ваших карт.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AuthenticatedLayout>
    </>
  );
}