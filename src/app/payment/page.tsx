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
  const [selectedMethod, setSelectedMethod] = useState<string>("card");
  const [savedCards, setSavedCards] = useState<Array<{id: string, mask: string, type: string, token?: string}>>([]);
  const [savedPhone, setSavedPhone] = useState<string | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    // Загружаем сохраненные способы оплаты
    const cards = JSON.parse(localStorage.getItem("stinger_cards") || "[]");
    setSavedCards(cards);
    
    const phone = localStorage.getItem("stinger_sbp_phone");
    setSavedPhone(phone);
  }, []);

  const saveCard = () => {
    console.log("saveCard called", { scriptLoaded, cp: window.cp });
    
    if (!scriptLoaded || !window.cp) {
      alert("Платежная система еще не загружена, попробуйте снова");
      return;
    }
    
    setLoading(true);
    const widget = new window.cp.CloudPayments();
    
    // Используем метод auth с суммой 1 рубль для проверки и токенизации карты
    widget.auth({
      publicId: "pk_2730acd022c1e22194e001a467f28", // TODO: проверить полный ключ
      description: "Привязка карты к Stiger",
      amount: 1,
      currency: "RUB",
      requireConfirmation: false, // Автоматическая отмена после проверки
      saveCard: true, // Важно! Сохраняем карту для будущих платежей
    }, {
      onSuccess: (options: any) => {
        // Сохраняем токен карты
        const newCard = {
          id: Date.now().toString(),
          mask: options.CardLastFour ? `•••• ${options.CardLastFour}` : "•••• ••••",
          type: options.CardType || "Unknown",
          token: options.Token, // Токен для будущих платежей
          transactionId: options.TransactionId
        };
        
        const updated = [...savedCards, newCard];
        localStorage.setItem("stinger_cards", JSON.stringify(updated));
        setSavedCards(updated);
        
        setLoading(false);
        alert("Карта успешно привязана!");
        
        // Возвращаем 1 рубль (отменяем транзакцию)
        fetch("/api/cloudpayments/refund", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transactionId: options.TransactionId })
        });
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

  const saveSBP = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const phone = String(data.get("phone") || "").replace(/\s/g, "");
    
    if (!/^\d{10}$/.test(phone)) {
      alert("Введите 10 цифр номера телефона");
      return;
    }
    
    const fullPhone = "7" + phone;
    localStorage.setItem("stinger_sbp_phone", fullPhone);
    setSavedPhone(fullPhone);
    alert("Номер для СБП сохранен!");
    e.currentTarget.reset();
  };

  const deleteCard = (id: string) => {
    const updated = savedCards.filter(c => c.id !== id);
    localStorage.setItem("stinger_cards", JSON.stringify(updated));
    setSavedCards(updated);
  };

  const detectCardType = (pan: string): string => {
    if (pan.startsWith("4")) return "visa";
    if (pan.startsWith("5")) return "mastercard";
    if (pan.startsWith("2")) return "mir";
    return "card";
  };

  const paymentMethods = [
    { id: "card", name: "Банковская карта", icon: "💳", description: "Visa, Mastercard, МИР" },
    { id: "sbp", name: "СБП", icon: "📱", description: "Система быстрых платежей" },
    { id: "phone", name: "По номеру телефона", icon: "☎️", description: "Оплата со счета мобильного" }
  ];

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

          {/* Выбор способа оплаты */}
          <div className="grid gap-4 mb-8">
            {paymentMethods.map((method) => (
              <button
                key={method.id}
                onClick={() => setSelectedMethod(method.id)}
                className={`glass-effect rounded-2xl p-6 text-left transition-all ${
                  selectedMethod === method.id 
                    ? 'ring-2 ring-purple-500 scale-[1.02]' 
                    : 'hover:scale-[1.01]'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="text-3xl">{method.icon}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{method.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{method.description}</p>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 ${
                    selectedMethod === method.id
                      ? 'border-purple-500 bg-purple-500'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}>
                    {selectedMethod === method.id && (
                      <div className="w-full h-full flex items-center justify-center text-white text-xs">✓</div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Банковские карты */}
          {selectedMethod === "card" && (
            <div className="glass-premium rounded-3xl p-8 animate-fade-in">
              <h2 className="text-xl font-semibold mb-6">Мои карты</h2>
              
              {/* Сохраненные карты */}
              {savedCards.length > 0 && (
                <div className="space-y-3 mb-6">
                  {savedCards.map((card) => (
                    <div key={card.id} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-8 rounded bg-gradient-to-r from-gray-700 to-gray-900 flex items-center justify-center text-white text-xs font-bold">
                          {card.type.toUpperCase()}
                        </div>
                        <span className="font-mono font-medium">{card.mask}</span>
                      </div>
                      <button
                        onClick={() => deleteCard(card.id)}
                        className="text-red-500 hover:text-red-600 transition-colors"
                      >
                        Удалить
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Форма добавления карты */}
              <h3 className="font-medium text-lg mb-4">Добавить новую карту</h3>
              {!scriptLoaded && (
                <div className="text-sm text-gray-500 mb-2">Загрузка платежной системы...</div>
              )}
              <button 
                onClick={saveCard}
                disabled={loading || !scriptLoaded}
                className="w-full h-12 rounded-xl gradient-bg text-white font-semibold button-premium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Обработка..." : !scriptLoaded ? "Загрузка..." : "Привязать карту через CloudPayments"}
              </button>
            </div>
          )}

          {/* СБП */}
          {selectedMethod === "sbp" && (
            <div className="glass-premium rounded-3xl p-8 animate-fade-in">
              <h2 className="text-xl font-semibold mb-6">Система быстрых платежей</h2>
              
              {savedPhone ? (
                <div className="space-y-4 mb-6">
                  <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                    <p className="text-sm text-green-700 dark:text-green-300 mb-2">Номер для СБП привязан:</p>
                    <p className="font-mono text-lg font-semibold">+{savedPhone}</p>
                  </div>
                  <button
                    onClick={() => {
                      localStorage.removeItem("stinger_sbp_phone");
                      setSavedPhone(null);
                    }}
                    className="text-red-500 hover:text-red-600 transition-colors"
                  >
                    Изменить номер
                  </button>
                </div>
              ) : (
                <form onSubmit={saveSBP} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Номер телефона</label>
                    <div className="flex gap-2">
                      <span className="px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 font-mono">+7</span>
                      <input
                        name="phone"
                        type="tel"
                        placeholder="999 123 45 67"
                        maxLength={10}
                        className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 input-premium"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      К этому номеру должен быть подключен банк с СБП
                    </p>
                  </div>
                  <button className="w-full h-12 rounded-xl gradient-bg text-white font-semibold button-premium">
                    Привязать номер
                  </button>
                </form>
              )}

              <div className="mt-6 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  <strong>ℹ️ Как работает СБП:</strong><br/>
                  • Мгновенные переводы между банками<br/>
                  • Без комиссии до 100 000 ₽ в месяц<br/>
                  • Подтверждение через приложение банка
                </p>
              </div>
            </div>
          )}

          {/* Оплата со счета телефона */}
          {selectedMethod === "phone" && (
            <div className="glass-premium rounded-3xl p-8 animate-fade-in">
              <h2 className="text-xl font-semibold mb-6">Оплата со счета мобильного</h2>
              
              <div className="space-y-6">
                <div className="p-6 rounded-2xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">⚠️</span>
                    <h3 className="font-semibold">Временно недоступно</h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Мы работаем над подключением оплаты со счета мобильного телефона. 
                    Пока используйте банковскую карту или СБП.
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Поддерживаемые операторы:</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {["МТС", "Билайн", "МегаФон", "Теле2"].map((operator) => (
                      <div key={operator} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-center opacity-50">
                        <span className="text-lg font-medium">{operator}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AuthenticatedLayout>
    </>
  );
}


