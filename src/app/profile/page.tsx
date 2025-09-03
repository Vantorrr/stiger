"use client";
import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const [user, setUser] = useState<{ name?: string; phone?: string; email?: string } | null>(null);
  useEffect(() => {
    const data = localStorage.getItem("stinger_user");
    if (data) setUser(JSON.parse(data));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-blue-900 dark:to-purple-900">
      <Navbar />
      <main className="mx-auto max-w-2xl px-6 py-10 w-full space-y-8">
        <h1 className="text-2xl font-bold">Профиль</h1>

        <section className="glass-effect rounded-2xl p-6 shadow-xl space-y-4">
          <Field label="Имя" value={user?.name || "Demo User"} />
          <Field label="Телефон" value={user?.phone || "+7 (900) 000-00-00"} />
          <Field label="Email" value={user?.email || "demo@stinger.ru"} />
        </section>

        <section className="glass-effect rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="font-semibold">Мои аренды</h2>
          <p className="text-sm opacity-70">Пока аренды отсутствуют.</p>
        </section>
      </main>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs uppercase opacity-60">{label}</div>
      <div className="text-base font-medium">{value}</div>
    </div>
  );
}


