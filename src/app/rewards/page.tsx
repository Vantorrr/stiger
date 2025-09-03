"use client";
import AuthenticatedLayout from "@/components/AuthenticatedLayout";
import { useMemo, useState, useEffect } from "react";

export default function RewardsPage() {
  const promo = useMemo(() => "stngr" + Math.floor(100000 + Math.random() * 899999), []);
  const [showQR, setShowQR] = useState(false);
  const [balance, setBalance] = useState<number>(0);

  useEffect(() => {
    const b = localStorage.getItem("stinger_rewards_balance");
    setBalance(b ? Number(b) || 0 : 0);
  }, []);

  const addBalance = (v: number) => {
    const nb = Math.max(0, balance + v);
    setBalance(nb);
    localStorage.setItem("stinger_rewards_balance", String(nb));
  };

  const copyPromo = async () => {
    try {
      await navigator.clipboard.writeText(promo);
      alert("Промокод скопирован");
    } catch {
      alert("Не удалось скопировать");
    }
  };

  const sharePromo = async () => {
    const text = `Мой промокод Stiger: ${promo} — получи 100 бонусов!`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "Stiger", text });
      } else {
        await navigator.clipboard.writeText(text);
        alert("Скопировал текст для отправки");
      }
    } catch {}
  };

  return (
    <AuthenticatedLayout>
      <div className="mx-auto max-w-2xl px-6 py-10 w-full space-y-8">
        <h1 className="text-2xl font-bold">Бонусы</h1>
        <section className="rounded-2xl p-6 shadow-xl" style={{ background: "linear-gradient(135deg, rgba(124,58,237,.15), rgba(59,130,246,.10))", border: "1px solid rgba(255,255,255,.12)" }}>
          <div className="flex items-center gap-3 text-xl font-bold mb-1">
            <span>{balance}</span>
            <span>⭐</span>
          </div>
          <p className="text-sm text-white/70 mb-6">1 бонус = 1 ₽</p>

          <h2 className="font-semibold mb-2">Делись бонусами и заряжайся бесплатно</h2>
          <p className="text-sm text-white/80 mb-4">Отправь промокод другу — он получит 100 бонусов. Когда друг потратит первые 100 ₽, ты получишь 100 бонусов.</p>

          <div className="mb-4">
            <div className="flex w-full max-w-md rounded-xl overflow-hidden border border-white/20">
              <input
                value={promo}
                readOnly
                className="flex-1 h-11 px-3 bg-white/10 text-white outline-none placeholder-white/60"
              />
              <button className="h-11 px-4 bg-white text-black hover:opacity-90" onClick={copyPromo}>Копировать</button>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={sharePromo} className="h-11 px-5 rounded-xl bg-blue-500 hover:bg-blue-600">Поделиться</button>
            <button onClick={() => setShowQR(true)} className="h-11 px-5 rounded-xl border border-white/20 hover:bg-white/10">Показать QR</button>
          </div>
          <div className="mt-4 flex gap-3">
            <button onClick={() => addBalance(100)} className="h-9 px-3 rounded-lg bg-green-600 hover:bg-green-700">Зачислить +100 (тест)</button>
            <button onClick={() => addBalance(-100)} className="h-9 px-3 rounded-lg bg-yellow-600 hover:bg-yellow-700">Списать -100 (тест)</button>
          </div>
        </section>
      </div>

      {showQR && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60" onClick={() => setShowQR(false)}>
          <div className="bg-white rounded-2xl p-6 w-[320px] text-black" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">Промокод</h3>
            <div className="grid place-items-center mb-4">
              <img
                alt="QR"
                className="w-48 h-48"
                src={`https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(promo)}`}
              />
            </div>
            <div className="flex items-center justify-between">
              <code className="px-2 py-1 rounded bg-black/5">{promo}</code>
              <button className="h-9 px-3 rounded-lg bg-black text-white" onClick={copyPromo}>Копировать</button>
            </div>
          </div>
        </div>
      )}
    </AuthenticatedLayout>
  );
}


