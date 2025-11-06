"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PaymentSuccess() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/dashboard");
    }, 2000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">✅</div>
        <h1 className="text-3xl font-bold mb-2">Оплата прошла успешно</h1>
        <p className="text-gray-600 mb-6">Через пару секунд вернёмся в личный кабинет.</p>
        <button
          onClick={() => router.push("/dashboard")}
          className="px-6 py-3 rounded-xl gradient-bg text-white font-semibold"
        >
          В личный кабинет
        </button>
      </div>
    </div>
  );
}


