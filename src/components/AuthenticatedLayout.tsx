"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SideMenu from "@/components/SideMenu";

interface User {
  email: string;
  name: string;
}

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem("stiger_user");
    if (!userData) {
      router.push("/auth");
      return;
    }
    setUser(JSON.parse(userData));
  }, [router]);

  if (!user) {
    return <div>Загрузка...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-blue-50 dark:from-slate-900 dark:via-blue-900 dark:to-purple-900 relative">
      {/* Гамбургер меню слева */}
      <div className="absolute top-6 left-6 z-[9998]">
        <button onClick={() => setMenuOpen(true)} className="glass-effect rounded-xl p-3 shadow-xl hover:bg-white/20 transition-all duration-300">
          <div className="w-6 h-6 flex flex-col justify-center space-y-1">
            <div className="w-full h-0.5 bg-gray-700 dark:bg-gray-300 rounded"></div>
            <div className="w-full h-0.5 bg-gray-700 dark:bg-gray-300 rounded"></div>
            <div className="w-full h-0.5 bg-gray-700 dark:bg-gray-300 rounded"></div>
          </div>
        </button>
      </div>

      {/* Логотип по центру сверху */}
      <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-[9997]">
        <div className="glass-effect rounded-2xl px-6 py-3 shadow-xl">
          <div className="flex items-center gap-3">
            <img src="/logoo.png" alt="Stiger" className="w-8 h-8 object-contain" />
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Stiger
            </span>
          </div>
        </div>
      </div>

      {/* Тонированный фон под шапкой */}
      <div
        className="pointer-events-none absolute left-0 right-0 top-0 z-10"
        style={{
          height: "84px",
          background: "linear-gradient(180deg, rgba(124,58,237,0.35) 0%, rgba(59,130,246,0.25) 35%, rgba(13,148,136,0.20) 65%, rgba(255,255,255,0) 100%)",
        }}
      />

      {/* Контент */}
      <main className="pt-20">
        {children}
      </main>

      {/* Боковое меню */}
      <SideMenu open={menuOpen} onClose={() => setMenuOpen(false)} clientNumber={user?.phone || (user?.username ? `@${user.username}` : user?.telegramId?.toString()) || "000000"} />
    </div>
  );
}
