"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthenticatedLayout from "@/components/AuthenticatedLayout";
import Script from "next/script";

type SavedCard = {
  id: string;
  mask: string;
  type: string;
  token?: string;
};

interface User {
  id?: string;
  telegramId?: number;
  phone?: string;
  [key: string]: unknown;
}

interface PaymentData {
  publicId: string;
  description: string;
  amount: number;
  currency: string;
  invoiceId: string;
  accountId: string;
  jsonData: {
    tariffPrice: number;
    depositAmount: number;
    [key: string]: unknown;
  };
}

interface RentalOrder {
  paymentData: PaymentData;
  deviceId: string;
  device: {
    address?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

interface CloudPaymentsSuccessPayload {
  TransactionId?: string;
  transactionId?: string;
  CardLastFour?: string;
  CardType?: string;
}

interface CloudPaymentsWidgetCallbacks {
  onSuccess(result: CloudPaymentsSuccessPayload): void;
  onFail(reason: string, data: unknown): void;
  onComplete(): void;
}

interface CloudPaymentsAuthParams {
  publicId: string;
  description: string;
  amount: number;
  currency: string;
  invoiceId?: string;
  accountId?: string;
  requireConfirmation?: boolean;
  saveCard?: boolean;
  data?: Record<string, unknown>;
  skin?: string;
  language?: string;
}

interface CloudPaymentsWidget {
  auth(params: CloudPaymentsAuthParams, callbacks: CloudPaymentsWidgetCallbacks): void;
}

interface CloudPaymentsNamespace {
  CloudPayments: new () => CloudPaymentsWidget;
}

declare global {
  interface Window {
    cp?: CloudPaymentsNamespace;
  }
}

function resolveAccountId(user: User | null): string | null {
  if (!user) return null;
  return (
    user?.id ||
    (user?.telegramId ? String(user.telegramId) : null) ||
    user?.phone ||
    null
  );
}

function normalizeCards(cards: Array<{ LastFour?: string; Token?: string; Type?: string; PaymentSystem?: string }> = []): SavedCard[] {
  return cards.map((card, index) => {
    const token = card.Token || `card-${index}`;
    const type = card.PaymentSystem || card.Type || "Unknown";
    const mask = card.LastFour ? `•••• ${card.LastFour}` : "•••• ••••";

    return {
      id: token,
      mask,
      type,
      token: card.Token,
    };
  });
}

export default function PaymentPage() {
  const [user, setUser] = useState<User | null>(null);
  const [order, setOrder] = useState<RentalOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [savedCards, setSavedCards] = useState<SavedCard[]>([]);
  const [savedCardsLoading, setSavedCardsLoading] = useState(true);
  const [cardsError, setCardsError] = useState<string | null>(null);
  const [savedSBPPhone, setSavedSBPPhone] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  const fetchCards = useCallback(async (id: string) => {
    setSavedCardsLoading(true);
    setCardsError(null);

    try {
      const res = await fetch("/api/cards/list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId: id }),
      });

      const data = (await res.json().catch(() => ({}))) as {
        success?: boolean;
        cards?: Array<{ LastFour?: string; Token?: string; Type?: string; PaymentSystem?: string }>;
        error?: string;
      };

      if (!res.ok || !data?.success) {
        throw new Error(data?.error || "Не удалось получить список карт");
      }

      setSavedCards(normalizeCards(data.cards));
    } catch (error) {
      console.error("rental payment cards", error);
      setSavedCards([]);
      setCardsError(error instanceof Error ? error.message : "Не удалось получить список карт");
    } finally {
      setSavedCardsLoading(false);
    }
  }, []);

  useEffect(() => {
    const userData = localStorage.getItem("stiger_user");
    if (!userData) {
      router.push("/auth");
      return;
    }

    try {
      const parsedUser = JSON.parse(userData) as User;
      setUser(parsedUser);
      const id = resolveAccountId(parsedUser);
      // setAccountId(id); // This line is removed

      if (id) {
        fetchCards(id);
      } else {
        setSavedCardsLoading(false);
        setCardsError("Не удалось определить аккаунт для CloudPayments. Авторизуйся заново.");
      }
    } catch (error) {
      console.error("Failed to parse stiger_user", error);
      localStorage.removeItem("stiger_user");
      router.push("/auth");
      return;
    }
    
    const savedOrder = localStorage.getItem(`order_${orderId}`);
    if (savedOrder) {
      setOrder(JSON.parse(savedOrder) as RentalOrder);
    } else {
      alert("Заказ не найден");
      router.push("/scan");
    }

    const sbp = localStorage.getItem("stinger_sbp_phone");
    setSavedSBPPhone(sbp);
  }, [router, orderId, fetchCards]);

  const handlePayment = () => {
    if (!order) {
      alert("Заказ не найден");
      return;
    }

    // Проверяем выбранный способ оплаты
    const selectedPayment = document.querySelector<HTMLInputElement>('input[name="payment"]:checked');
    if (!selectedPayment) {
      alert("Выберите способ оплаты");
      return;
    }

    const paymentType = selectedPayment.dataset.type;
    
    if (paymentType === "sbp") {
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

    const cp = window.cp;
    if (!cp) {
      alert("Платежная система не инициализирована");
      return;
    }

    setLoading(true);

    const widget = new cp.CloudPayments();
    
    // Используем auth для двухстадийной оплаты (холд средств)
    widget.auth({
      publicId: order.paymentData.publicId,
      description: order.paymentData.description,
      amount: order.paymentData.amount,
      currency: order.paymentData.currency,
      invoiceId: order.paymentData.invoiceId,
      accountId: order.paymentData.accountId,
      data: order.paymentData.jsonData as Record<string, unknown>,
      
      // Настройки виджета
      skin: "modern",
      language: "ru-RU"
    },
    {
      onSuccess: (options: CloudPaymentsSuccessPayload) => {
        console.log("✅ Платеж успешен:", options);
        // Тригерим серверный confirm для выдачи (не ждем вебхук)
        fetch('/api/rentals/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: orderId,
            transactionId: options.TransactionId || options.transactionId
          })
        }).then(() => {
          setLoading(false);
          router.push(`/rental/success?orderId=${orderId}&transactionId=${options.TransactionId || options.transactionId || ''}`);
        }).catch(() => {
          setLoading(false);
          router.push(`/rental/success?orderId=${orderId}&transactionId=${options.TransactionId || options.transactionId || ''}`);
        });
      },
      onFail: (reason: string, data: unknown) => {
        console.error('❌ Платеж отклонен:', reason, data);
        setLoading(false);
        alert(`Ошибка оплаты: ${reason}`);
      },
      onComplete: () => {
        // Окно закрыто после оплаты
        console.log("Payment completed");
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
              {cardsError && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
                  {cardsError}
                </div>
              )}
              {savedCardsLoading ? (
                <div className="text-center py-6 text-gray-500">Загружаем сохраненные способы оплаты…</div>
              ) : savedCards.length > 0 || savedSBPPhone ? (
                <div className="space-y-3">
                  {savedCards.map((card, index) => (
                    <label
                      key={card.id}
                      className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <input
                        type="radio"
                        name="payment"
                        defaultChecked={index === 0}
                        className="w-4 h-4 text-purple-600"
                        data-type="card"
                        data-token={card.token || ""}
                      />
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-12 h-8 rounded bg-gradient-to-r from-gray-700 to-gray-900 flex items-center justify-center text-white text-xs font-bold">
                          {card.type.toUpperCase()}
                        </div>
                        <span className="font-mono">{card.mask}</span>
                      </div>
                    </label>
                  ))}

                  {savedSBPPhone && (
                    <label className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">
                      <input
                        type="radio"
                        name="payment"
                        defaultChecked={savedCards.length === 0}
                        className="w-4 h-4 text-purple-600"
                        data-type="sbp"
                      />
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center text-white text-lg">
                          📱
                        </div>
                        <div>
                          <p className="font-medium">СБП</p>
                          <p className="text-sm text-gray-500">+{savedSBPPhone}</p>
                        </div>
                      </div>
                    </label>
                  )}

                  <a href="/payment" className="block text-center text-purple-600 hover:text-purple-700 font-medium text-sm mt-2">
                    + Добавить способ оплаты
                  </a>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">Нет сохраненных способов оплаты</p>
                  <a href="/payment" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl gradient-bg text-white font-medium">
                    <span>💳</span>
                    <span>Добавить способ оплаты</span>
                  </a>
                </div>
              )}
            </div>

            {/* Кнопка оплаты */}
            <div className="space-y-3">
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
              
              {/* ТЕСТОВАЯ кнопка для проверки выдачи */}
              <button
                onClick={async () => {
                  if (!confirm('⚠️ ТЕСТ: Выдать power bank без оплаты?')) return;
                  
                  setLoading(true);
                  try {
                    const response = await fetch('/api/rentals/confirm', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        orderId: orderId,
                        transactionId: 'TEST_' + Date.now(),
                        skipPayment: true
                      })
                    });
                    
                    const result = await response.json();
                    
                    if (result.success) {
                      alert('✅ Команда отправлена! Проверьте шкаф.');
                      router.push(`/rental/success?orderId=${orderId}&test=true`);
                    } else {
                      alert('❌ Ошибка: ' + (result.error || 'Не удалось'));
                    }
                  } catch (error) {
                    console.error(error);
                    alert('❌ Ошибка');
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
                className="w-full h-12 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-semibold shadow-lg transition-all disabled:opacity-50"
              >
                🧪 ТЕСТ: Выдать без оплаты
              </button>
            </div>

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
