import Navbar from "@/components/Navbar";

export default function Admin() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 py-10 w-full space-y-6">
        <h1 className="text-2xl font-bold">Admin — Overview</h1>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="border border-black/10 dark:border-white/10 rounded-lg p-4">
            <div className="text-sm opacity-70">Devices</div>
            <div className="text-2xl font-semibold">—</div>
          </div>
          <div className="border border-black/10 dark:border-white/10 rounded-lg p-4">
            <div className="text-sm opacity-70">Active Orders</div>
            <div className="text-2xl font-semibold">—</div>
          </div>
          <div className="border border-black/10 dark:border-white/10 rounded-lg p-4">
            <div className="text-sm opacity-70">Revenue (today)</div>
            <div className="text-2xl font-semibold">—</div>
          </div>
        </div>
        <p className="opacity-70 text-sm">Плейсхолдер. Подключим данные после конфигов API.</p>
      </main>
    </div>
  );
}












