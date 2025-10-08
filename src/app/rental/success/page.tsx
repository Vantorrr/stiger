"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import AuthenticatedLayout from "@/components/AuthenticatedLayout";

export default function RentalSuccessPage() {
  const [countdown, setCountdown] = useState(30);
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  useEffect(() => {
    // Таймер обратного отсчета
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <AuthenticatedLayout>
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-md w-full">
          <div className="glass-effect rounded-3xl p-8 text-center">
            {/* Анимированная галочка */}
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <div className="text-5xl animate-bounce">✅</div>
            </div>

            <h1 className="text-3xl font-bold mb-4">Оплата прошла успешно!</h1>
            
            <div className="mb-6 p-4 rounded-2xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
              <p className="text-lg font-semibold text-yellow-700 dark:text-yellow-300 mb-2">
                ⚡ PowerBank выезжает!
              </p>
              <p className="text-sm text-yellow-600 dark:text-yellow-400">
                Заберите его в течение <span className="font-bold text-lg">{countdown}</span> секунд
              </p>
            </div>

            <div className="space-y-4 text-left mb-8">
              <div className="flex items-start gap-3">
                <span className="text-2xl">📱</span>
                <div>
                  <p className="font-semibold">Заберите PowerBank</p>
                  <p className="text-sm text-gray-500">Он выедет из открывшегося слота</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <span className="text-2xl">⏱️</span>
                <div>
                  <p className="font-semibold">Время пошло</p>
                  <p className="text-sm text-gray-500">Аренда началась с момента выдачи</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <span className="text-2xl">🔄</span>
                <div>
                  <p className="font-semibold">Верните в любой шкаф Stiger</p>
                  <p className="text-sm text-gray-500">Найдите ближайший на карте</p>
                </div>
              </div>
            </div>

            {orderId && (
              <div className="mb-6 p-3 rounded-xl bg-gray-100 dark:bg-gray-800">
                <p className="text-xs text-gray-500 mb-1">Номер заказа:</p>
                <p className="font-mono text-sm">{orderId}</p>
              </div>
            )}

            <div className="space-y-3">
              <Link 
                href="/"
                className="block w-full h-12 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold leading-[48px] text-center hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
              >
                Перейти на карту
              </Link>
              
              <Link 
                href="/profile"
                className="block w-full h-12 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white font-semibold leading-[48px] text-center hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Мои аренды
              </Link>
            </div>

            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                Возникли проблемы? <Link href="/support" className="text-purple-600 hover:underline">Свяжитесь с нами</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}



