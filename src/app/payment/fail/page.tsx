"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PaymentFail() {
  const router = useRouter();

  useEffect(() => {
    // Редирект на страницу привязки карты через 3 секунды
    const timer = setTimeout(() => {
      router.push("/payment");
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">❌</div>
        <h1 className="text-3xl font-bold text-red-600 mb-2">Ошибка привязки карты</h1>
        <p className="text-gray-600 mb-4">Попробуйте еще раз...</p>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
      </div>
    </div>
  );
}
