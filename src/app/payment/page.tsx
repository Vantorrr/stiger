"use client";
import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";

export default function PaymentPage() {
  const [masked, setMasked] = useState<string | null>(null);
  useEffect(() => {
    const m = localStorage.getItem("stinger_card_mask");
    setMasked(m);
  }, []);

  const saveCard = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const pan = String(data.get("pan") || "");
    if (!/^\d{16}$/.test(pan)) {
      alert("Введите 16 цифр номера карты");
      return;
    }
    const mask = `**** **** **** ${pan.slice(-4)}`;
    localStorage.setItem("stinger_card_mask", mask);
    setMasked(mask);
    alert("Карта сохранена (демо)");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-blue-900 dark:to-purple-900">
      <Navbar />
      <main className="mx-auto max-w-2xl px-6 py-10 w-full space-y-8">
        <h1 className="text-2xl font-bold">Способ оплаты</h1>
        <section className="glass-effect rounded-2xl p-6 shadow-xl space-y-4">
          {masked ? (
            <div className="space-y-3">
              <div className="text-sm opacity-70">Привязана карта</div>
              <div className="text-lg font-semibold">{masked}</div>
              <button className="h-10 px-4 rounded-lg border border-black/10 dark:border-white/10" onClick={() => { localStorage.removeItem("stinger_card_mask"); setMasked(null); }}>Отвязать</button>
            </div>
          ) : (
            <form onSubmit={saveCard} className="space-y-3">
              <div>
                <label className="text-sm opacity-70">Номер карты</label>
                <input name="pan" inputMode="numeric" pattern="\d*" maxLength={16} className="w-full h-11 px-3 rounded-lg border border-black/10 dark:border-white/10 bg-transparent" placeholder="0000000000000000" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm opacity-70">MM/YY</label>
                  <input name="exp" className="w-full h-11 px-3 rounded-lg border border-black/10 dark:border-white/10 bg-transparent" placeholder="12/26" />
                </div>
                <div>
                  <label className="text-sm opacity-70">CVC</label>
                  <input name="cvc" className="w-full h-11 px-3 rounded-lg border border-black/10 dark:border-white/10 bg-transparent" placeholder="123" />
                </div>
              </div>
              <button className="h-11 px-5 rounded-xl bg-black text-white dark:bg-white dark:text-black">Привязать карту</button>
            </form>
          )}
        </section>
      </main>
    </div>
  );
}


