"use client";
import AuthenticatedLayout from "@/components/AuthenticatedLayout";

export default function PricingPage() {
  return (
    <AuthenticatedLayout>
      <div className="mx-auto max-w-3xl px-6 py-10 w-full space-y-8">
        <h1 className="text-2xl font-bold">Тарифы</h1>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { name: "Базовый", price: "5 ₽/10 мин", note: "Дневной потолок 150 ₽" },
            { name: "Стандарт", price: "9 ₽/10 мин", note: "Потолок 250 ₽" },
            { name: "Премиум", price: "12 ₽/10 мин", note: "Потолок 300 ₽" },
          ].map((t) => (
            <div key={t.name} className="glass-effect rounded-2xl p-6 shadow-xl">
              <div className="text-lg font-semibold mb-2">{t.name}</div>
              <div className="text-2xl font-bold mb-1">{t.price}</div>
              <div className="text-sm opacity-70">{t.note}</div>
            </div>
          ))}
        </div>
      </div>
    </AuthenticatedLayout>
  );
}


