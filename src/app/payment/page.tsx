"use client";

export const dynamic = "force-dynamic";

import AuthenticatedLayout from "@/components/AuthenticatedLayout";
import { useCallback, useEffect, useMemo, useState } from "react";
import Script from "next/script";

type SavedCard = {
  id: string;
  mask: string;
  type: string;
  token?: string;
};

interface CloudPaymentsSuccessPayload {
  CardLastFour?: string;
  CardType?: string;
  Token?: string;
  RebillId?: string;
  TransactionId?: string;
  transactionId?: string;
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
  requireConfirmation?: boolean;
  saveCard?: boolean;
  accountId?: string;
  successUrl?: string;
  failUrl?: string;
  paymentMethod?: 'card' | 'applepay' | 'googlepay' | 'tinkoff' | 'qiwi' | 'yandex' | string;
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

function resolveAccountId(): string | null {
  try {
    const userRaw = localStorage.getItem("stiger_user");
    if (!userRaw) return null;

    const user = JSON.parse(userRaw);
    // Приоритет: id (telegram_XXX) > telegramId > phone
    // Важно: accountId должен быть одинаковым везде для CloudPayments
    const accountId = user?.id || 
                     (user?.telegramId ? `telegram_${user.telegramId}` : null) ||
                     user?.phone ||
                     null;
    
    console.log(`[Payment] resolveAccountId: ${accountId}`, { user });
    return accountId;
  } catch (e) {
    console.error("Failed to parse stiger_user", e);
    return null;
  }
}

function normalizeCards(cards: Array<{ LastFour?: string; Token?: string; Type?: string; PaymentSystem?: string }> = []): SavedCard[] {
  return cards.map((card, index) => {
    const token = card.Token || `card-${index}`;
    const cardType = card.PaymentSystem || card.Type || "Unknown";
    const mask = card.LastFour ? `•••• ${card.LastFour}` : "•••• ••••";

    return {
      id: token,
      mask,
      type: cardType,
      token: card.Token,
    };
  });
}

export default function PaymentPage() {
  const [accountId, setAccountId] = useState<string | null>(null);
  const [savedCards, setSavedCards] = useState<SavedCard[]>([]);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingCards, setLoadingCards] = useState(true);
  const [cardsError, setCardsError] = useState<string | null>(null);
  const publicId = (process.env.NEXT_PUBLIC_CLOUDPAYMENTS_PUBLIC_ID as string) || "";

  // Перехватываем редирект на [object Object] ДО рендера
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const path = window.location.pathname;
    if (path.includes('[object') || path.includes('%5Bobject') || path === '/[object Object]' || path === '/%5Bobject%20Object%5D') {
      console.log('[Payment] Early intercept: redirecting from [object Object] to /payment/success');
      window.location.replace('/payment/success');
      return;
    }
  }, []);

  const fetchCards = useCallback(async (id: string) => {
    setLoadingCards(true);
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
      console.error("Failed to fetch cards", error);
      setSavedCards([]);
      setCardsError(error instanceof Error ? error.message : "Не удалось получить список карт");
    } finally {
      setLoadingCards(false);
    }
  }, []);

  useEffect(() => {
    const id = resolveAccountId();
    setAccountId(id);

    if (id) {
      // Всегда обновляем список карт при загрузке страницы
      fetchCards(id);
    } else {
      setLoadingCards(false);
      setCardsError("Не удалось определить пользователя. Залогинься заново.");
    }

    // Перехватываем редирект на [object Object] или другие несуществующие пути
    const checkRedirect = () => {
      const path = window.location.pathname;
      if (path.includes('[object') || path.includes('%5Bobject') || path === '/[object Object]' || path === '/%5Bobject%20Object%5D') {
        console.log('[Payment] Intercepted redirect to [object Object], redirecting to /payment/success');
        window.location.replace('/payment/success');
      }
    };

    // Проверяем сразу
    checkRedirect();

    // Проверяем при изменении URL
    const interval = setInterval(checkRedirect, 100);

    return () => clearInterval(interval);
  }, [fetchCards]);

  // Обновляем список карт при изменении URL (например, после возврата с /payment/success)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('refresh') === 'true') {
        // Убираем параметр из URL
        window.history.replaceState({}, '', '/payment');
        // Обновляем список карт
        const id = resolveAccountId();
        if (id) {
          fetchCards(id);
        }
      }
    }
  }, [fetchCards]);

  const deleteCard = useCallback(async (card: SavedCard) => {
    if (!accountId || !card.token) {
      alert("Не удалось удалить карту: нет token");
      return;
    }

    try {
      const res = await fetch("/api/cards/unbind", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId, token: card.token }),
      });

      const data = (await res.json().catch(() => ({}))) as {
        success?: boolean;
        error?: string;
      };

      if (!res.ok || !data?.success) {
        throw new Error(data?.error || "Не удалось отвязать карту");
      }

      await fetchCards(accountId);
    } catch (error) {
      console.error("Failed to unbind card", error);
      alert(error instanceof Error ? error.message : "Не удалось отвязать карту");
    }
  }, [accountId, fetchCards]);

  const saveCard = useCallback(() => {
    if (!publicId) {
      alert("Платежный ключ не настроен. Установите NEXT_PUBLIC_CLOUDPAYMENTS_PUBLIC_ID и перезапустите деплой.");
      return;
    }

    if (!scriptLoaded || !window.cp) {
      alert("Платежная система еще не загружена, попробуйте снова");
      return;
    }

    const id = accountId || resolveAccountId();
    if (!id) {
      alert("Не удалось определить пользователя. Авторизуйся и попробуй снова.");
      return;
    }

    const cp = window.cp;
    if (!cp) {
      alert("Платежная система не инициализирована");
      return;
    }

    setAccountId(id);
    setLoading(true);

    const widget = new cp.CloudPayments();
    const origin = window.location.origin;

    console.log(`[Payment] Binding card for accountId: ${id}`);
    console.log(`[Payment] User data:`, JSON.parse(localStorage.getItem("stiger_user") || "{}"));
    
    widget.auth({
      publicId,
      description: "Привязка карты к Stiger",
      amount: 1,
      currency: "RUB",
      accountId: id, // ВАЖНО: accountId должен быть одинаковым при привязке и запросе списка
      // НЕ передаём requireConfirmation, saveCard, paymentMethod - они вызывают предупреждения
      // saveCard работает автоматически при правильном accountId
      // НЕ передаём successUrl/failUrl - они вызывают редирект на [object Object]
      // Используем только onSuccess callback
    }, {
      onSuccess: async (options: CloudPaymentsSuccessPayload) => {
        console.log("[Payment] CloudPayments success", options);
        console.log(`[Payment] TransactionId: ${options?.TransactionId || options?.transactionId}`);
        console.log(`[Payment] AccountId used: ${id}`);
        setLoading(false);

        // CloudPayments сохраняет карту автоматически при saveCard: true
        // Делаем несколько попыток проверки карт с увеличивающейся задержкой
        let attempts = 0;
        const maxAttempts = 6;
        const delays = [2000, 3000, 4000, 5000, 6000, 7000]; // Увеличиваем задержку с каждой попыткой

        const checkCardSaved = async (attempt: number) => {
          if (attempt >= maxAttempts) {
            console.log("[Payment] Max attempts reached, redirecting anyway");
            window.location.href = "/payment/success";
            return;
          }

          const delay = delays[attempt] || 3000;
          console.log(`[Payment] Attempt ${attempt + 1}/${maxAttempts}, waiting ${delay}ms before checking cards`);
          
          setTimeout(async () => {
            console.log(`[Payment] Fetching cards for accountId: ${id}`);
            try {
              // Проверяем карты напрямую через API
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

              const cardsCount = data?.cards?.length || 0;
              console.log(`[Payment] Cards found: ${cardsCount}`, data);
              console.log(`[Payment] AccountId used for check: ${id}`);
              console.log(`[Payment] Full API response:`, JSON.stringify(data, null, 2));
              
              // Обновляем состояние
              if (data?.success && data?.cards) {
                const normalized = normalizeCards(data.cards);
                console.log(`[Payment] Normalized cards:`, normalized);
                setSavedCards(normalized);
              }
              
              // Если карта появилась или это последняя попытка - редирект
              if (cardsCount > 0 || attempt === maxAttempts - 1) {
                if (cardsCount > 0) {
                  console.log(`[Payment] ✅ Card found! Redirecting to /payment/success`);
                } else {
                  console.log(`[Payment] ⚠️ No cards found after ${maxAttempts} attempts. AccountId: ${id}`);
                  console.log(`[Payment] ⚠️ Check CloudPayments dashboard for accountId: ${id}`);
                }
                window.location.href = "/payment/success";
              } else {
                // Продолжаем проверку
                console.log(`[Payment] No cards yet, continuing check...`);
                checkCardSaved(attempt + 1);
              }
            } catch (e) {
              console.error("[Payment] Failed to fetch cards:", e);
              // При ошибке продолжаем попытки
              if (attempt < maxAttempts - 1) {
                checkCardSaved(attempt + 1);
              } else {
                window.location.href = "/payment/success";
              }
            }
          }, delay);
        };

        // Начинаем проверку
        checkCardSaved(0);
      },
      onFail: (reason: string, data: unknown) => {
        console.error("CloudPayments fail", reason, data);
        setLoading(false);
        alert(`Ошибка: ${reason}`);
      },
      onComplete: () => {
        setLoading(false);
        // Виджет закрыт, но редирект уже сделан в onSuccess
      }
    });
  }, [accountId, fetchCards, publicId, scriptLoaded]);

  const heading = useMemo(() => {
    if (loadingCards) return "Загрузка карт...";
    if (cardsError) return "Способы оплаты";
    return "Способы оплаты";
  }, [cardsError, loadingCards]);

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
              <span className="gradient-text">{heading}</span>
            </h1>

            <div className="glass-premium rounded-3xl p-8 animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Мои способы оплаты</h2>
                <div className="text-4xl">💳</div>
              </div>

              {cardsError && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
                  {cardsError}
                </div>
              )}

              {loadingCards ? (
                <div className="text-center py-8 mb-8">Загружаем сохраненные карты…</div>
              ) : savedCards.length > 0 ? (
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
                        onClick={() => deleteCard(card)}
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
                    У тебя пока нет привязанных карт
                  </p>
                </div>
              )}

              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  CloudPayments поддерживает все популярные способы оплаты: карты, СБП, Apple Pay, Google Pay и другие
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

            <div className="mt-6 p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <div className="flex gap-3">
                <div className="text-blue-500 mt-0.5">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  <p className="font-semibold mb-1">Безопасность платежей</p>
                  <p>Все платежи защищены по стандарту PCI DSS. Мы не храним данные твоих карт — токены и маски берем напрямую из CloudPayments.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AuthenticatedLayout>
    </>
  );
}