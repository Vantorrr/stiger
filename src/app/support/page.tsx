"use client";
import AuthenticatedLayout from "@/components/AuthenticatedLayout";

export default function SupportPage() {
  return (
    <AuthenticatedLayout>
      <div className="mx-auto max-w-2xl px-6 py-10 w-full space-y-8">
        <h1 className="text-2xl font-bold">Поддержка</h1>
        <section className="glass-effect rounded-2xl p-6 shadow-xl space-y-4">
          <p className="opacity-80">Напишите нам — ответим в течение 15 минут.</p>
          <a href="mailto:support@stinger.app" className="h-11 px-5 inline-flex items-center justify-center rounded-xl bg-black text-white dark:bg-white dark:text-black">support@stinger.app</a>
        </section>
      </div>
    </AuthenticatedLayout>
  );
}


