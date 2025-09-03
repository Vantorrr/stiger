"use client";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const [email, setEmail] = useState("demo@stinger.ru");
  const [password, setPassword] = useState("demo123");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Демо-логика входа
    if (email === "demo@stinger.ru" && password === "demo123") {
      // Сохраняем "авторизацию" в localStorage
      localStorage.setItem("stinger_user", JSON.stringify({ email, name: "Demo User" }));
      router.push("/");
    } else {
      alert("Неверный email или пароль!");
    }
    setLoading(false);
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-blue-900 dark:to-purple-900">
      <Navbar />
      <main className="flex items-center justify-center px-6 py-20">
        <div className="w-full max-w-md">
          <div className="glass-effect rounded-3xl p-8 shadow-2xl">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 backdrop-blur mb-4 overflow-hidden">
                <Image src="/logoo.png" alt="Stiger" width={48} height={48} className="object-contain" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Добро пожаловать
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Войдите в свой аккаунт Stiger
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Email
                </label>
                <input 
                  className="w-full h-12 px-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur focus:border-purple-500 focus:outline-none transition-colors" 
                  type="email" 
                  placeholder="demo@stinger.ru" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Пароль
                </label>
                <input 
                  className="w-full h-12 px-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur focus:border-purple-500 focus:outline-none transition-colors" 
                  type="password" 
                  placeholder="demo123" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              
              <button 
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50"
              >
                {loading ? "Вход..." : "Войти в аккаунт"}
              </button>
            </form>
            
            <div className="mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <p className="text-xs text-blue-700 dark:text-blue-300">
                <strong>Демо-доступ:</strong><br/>
                Email: demo@stinger.ru<br/>
                Пароль: demo123
              </p>
            </div>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Нет аккаунта?{" "}
                <Link href="/register" className="font-semibold text-purple-600 hover:text-purple-700 transition-colors">
                  Создать аккаунт
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}


