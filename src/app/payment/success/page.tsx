"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function PaymentSuccess() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Проверяем параметры из CloudPayments и сохраняем карту
    const cardLastFour = searchParams.get("CardLastFour");
    const cardType = searchParams.get("CardType");
    const token = searchParams.get("Token");
    const transactionId = searchParams.get("TransactionId");
    
    if (cardLastFour || token) {
      // Это успешная привязка карты - сохраняем в localStorage
      const newCard = {
        id: Date.now().toString(),
        mask: cardLastFour ? `•••• ${cardLastFour}` : "•••• ••••",
        type: cardType || "Unknown",
        token: token || "",
        transactionId: transactionId || ""
      };
      
      const existingCards = JSON.parse(localStorage.getItem("stiger_cards") || "[]");
      const updated = [...existingCards, newCard];
      localStorage.setItem("stiger_cards", JSON.stringify(updated));
      
      console.log("Card saved from redirect:", newCard);
    }
    
    // Редирект в dashboard через 2 секунды
    const timer = setTimeout(() => {
      router.push("/dashboard");
    }, 2000);

    return () => clearTimeout(timer);
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">✅</div>
        <h1 className="text-3xl font-bold text-green-600 mb-2">Карта успешно привязана!</h1>
        <p className="text-gray-600 mb-4">Перенаправляем в личный кабинет...</p>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
      </div>
    </div>
  );
}


