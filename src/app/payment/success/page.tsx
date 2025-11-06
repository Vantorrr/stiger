"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PaymentSuccess() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/payment");
    }, 2000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">✅</div>
        <h1 className="text-3xl font-bold mb-2">Карта успешно привязана</h1>
        <p className="text-gray-600 mb-6">Через пару секунд вернёмся на страницу способов оплаты.</p>
        <button
          onClick={() => router.push("/payment")}
          className="px-6 py-3 rounded-xl gradient-bg text-white font-semibold"
        >
          К способам оплаты
        </button>
      </div>
    </div>
  );
}


