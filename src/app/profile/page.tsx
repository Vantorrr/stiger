"use client";
import AuthenticatedLayout from "@/components/AuthenticatedLayout";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const [user, setUser] = useState<{ name?: string; phone?: string; email?: string } | null>(null);
  useEffect(() => {
    const data = localStorage.getItem("stiger_user");
    if (data) setUser(JSON.parse(data));
  }, []);

  return (
    <AuthenticatedLayout>
      <div className="mx-auto max-w-2xl px-6 py-10 w-full space-y-8">
        <h1 className="text-2xl font-bold">Профиль</h1>

        <section className="glass-effect rounded-2xl p-6 shadow-xl space-y-4">
          <Field label="Имя" value={user?.firstName || user?.name || "Пользователь"} />
          <Field label="Телефон" value={user?.phone || "Не указан"} />
          <Field label="Telegram" value={user?.username ? `@${user.username}` : user?.telegramId ? `ID: ${user.telegramId}` : "Не указан"} />
        </section>

        <section className="glass-effect rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="font-semibold">Мои аренды</h2>
          <p className="text-sm opacity-70">Пока аренды отсутствуют.</p>
        </section>
      </div>
    </AuthenticatedLayout>
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


