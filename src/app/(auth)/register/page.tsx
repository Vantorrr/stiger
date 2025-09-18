import Navbar from "@/components/Navbar";
import Link from "next/link";

export default function Register() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-blue-900 dark:to-purple-900">
      <Navbar />
      <main className="flex items-center justify-center px-6 py-20">
        <div className="w-full max-w-md">
          <div className="glass-effect rounded-3xl p-8 shadow-2xl">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 backdrop-blur mb-4 overflow-hidden">
                <img src="/logoo.png" alt="Stiger" className="w-12 h-12 object-contain" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Создать аккаунт
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Присоединяйтесь к Stiger уже сегодня
              </p>
            </div>
            
            <form className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Email
                </label>
                <input 
                  className="w-full h-12 px-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur focus:border-purple-500 focus:outline-none transition-colors" 
                  type="email" 
                  placeholder="your@email.com" 
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Пароль
                </label>
                <input 
                  className="w-full h-12 px-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur focus:border-purple-500 focus:outline-none transition-colors" 
                  type="password" 
                  placeholder="Создайте надёжный пароль" 
                />
              </div>
              
              <button className="w-full h-12 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300">
                Создать аккаунт
              </button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Уже есть аккаунт?{" "}
                <Link href="/auth" className="font-semibold text-purple-600 hover:text-purple-700 transition-colors">
                  Войти
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}


