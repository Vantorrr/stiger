"use client";
import Link from "next/link";
import Logo from "@/components/Logo";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface User {
  email: string;
  name: string;
}

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem("stiger_user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("stiger_user");
    setUser(null);
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-black/10 dark:border-white/10 bg-background/80 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <Logo size={28} />
        </Link>
        <nav className="flex items-center gap-8 text-sm font-medium">
          <Link href="/" className="hover:text-purple-600 transition-colors">Аренда</Link>
          <Link href="/map" className="hover:text-purple-600 transition-colors">Карта</Link>
          
          {user ? (
            // Авторизованный пользователь
            <>
              <Link href="/dashboard" className="hover:text-purple-600 transition-colors">ЛК</Link>
              <button 
                onClick={handleLogout}
                className="inline-flex items-center justify-center h-9 px-4 rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold hover:shadow-lg transition-all duration-300"
              >
                Выйти
              </button>
            </>
          ) : (
            // Неавторизованный пользователь
            <Link href="/auth" className="inline-flex items-center justify-center h-9 px-4 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold hover:shadow-lg transition-all duration-300">
              Войти
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}


