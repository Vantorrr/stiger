"use client";
import Navbar from "@/components/Navbar";
import { useState } from "react";

export default function WalletPage() {
  const [amount, setAmount] = useState(300);
  const presetAmounts = [100, 300, 500, 1000, 2000];
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-blue-900 dark:to-purple-900">
      <Navbar />
      <main className="flex items-center justify-center px-6 py-20">
        <div className="w-full max-w-lg">
          <div className="glass-effect rounded-3xl p-8 shadow-2xl">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-bg text-white text-2xl mb-4">
                💳
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Пополнить кошелёк
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Добавьте средства для быстрой аренды
              </p>
            </div>

            {/* Current Balance */}
            <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-green-500/20 to-teal-500/20 border border-green-200 dark:border-green-800">
              <div className="text-center">
                <p className="text-sm text-green-700 dark:text-green-300 mb-1">Текущий баланс</p>
                <p className="text-3xl font-bold text-green-600">₽0</p>
              </div>
            </div>

            {/* Quick Amount Selection */}
            <div className="mb-6">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 block">
                Выберите сумму
              </label>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {presetAmounts.map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setAmount(preset)}
                    className={`h-12 rounded-xl font-semibold transition-all duration-200 ${
                      amount === preset
                        ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg"
                        : "bg-white/50 dark:bg-gray-800/50 border-2 border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600"
                    }`}
                  >
                    ₽{preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Amount */}
            <div className="mb-6">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                Или введите свою сумму
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(parseInt(e.target.value || "0", 10))}
                  className="w-full h-12 px-4 pr-12 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur focus:border-purple-500 focus:outline-none transition-colors text-lg font-semibold"
                  min={50}
                  step={50}
                  placeholder="500"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">₽</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Минимум: ₽50</p>
            </div>

            {/* Pay Button */}
            <button 
              disabled={amount < 50}
              className="w-full h-14 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:transform-none"
            >
              Пополнить на ₽{amount}
            </button>

            <div className="mt-6 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>💡 Подсказка:</strong> После пополнения кошелька вы сможете арендовать power bank одним касанием без ввода карты.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}


