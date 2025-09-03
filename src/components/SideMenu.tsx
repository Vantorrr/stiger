"use client";
import { useEffect } from "react";
import Link from "next/link";

export default function SideMenu({ open, onClose, clientNumber }: { open: boolean; onClose: () => void; clientNumber: string; }) {
  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [onClose]);

  return (
    <div className={`fixed inset-0 z-50 ${open ? "pointer-events-auto" : "pointer-events-none"}`}>
      <div
        className={`absolute inset-0 backdrop-blur-sm bg-black/40 transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
      />
      <aside
        className={`absolute top-0 left-0 h-full w-[86%] max-w-[380px] bg-white dark:bg-slate-900 shadow-2xl transition-transform duration-300 ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Brand header */}
        <div className="relative px-5 pt-6 pb-5 border-b border-black/5 dark:border-white/10">
          <div className="absolute inset-x-0 -top-0 h-16 -z-10 bg-gradient-to-r from-purple-600/25 via-blue-600/20 to-teal-600/15" />
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Stiger" className="w-8 h-8 object-contain" />
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Stiger</span>
          </div>
          <div className="mt-4">
            <div className="text-[11px] uppercase tracking-wide opacity-60">Номер клиента</div>
            <div className="text-base font-semibold">{clientNumber}</div>
          </div>
        </div>

        <nav className="px-2 py-2 text-[15px]">
          <MenuItem href="/profile" label="Профиль" svg="/icons/stinger-profile.svg" onClick={onClose} />
          <MenuItem href="/payment" label="Способ оплаты" svg="/icons/stinger-card.svg" onClick={onClose} />
          <MenuItem href="/rewards" label="Бонусы" svg="/icons/stinger-gift.svg" onClick={onClose} />
          <MenuItem href="/pricing" label="Тарифы" svg="/icons/stinger-pricing.svg" onClick={onClose} />
          <MenuItem href="/support" label="Поддержка" svg="/icons/stinger-support.svg" onClick={onClose} />
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-black/10 dark:border-white/10 bg-white/60 dark:bg-slate-900/60 backdrop-blur">
          <button
            className="w-full h-10 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600"
            onClick={() => {
              localStorage.removeItem("stinger_user");
              window.location.href = "/";
            }}
          >
            Выйти
          </button>
        </div>
      </aside>
    </div>
  );
}

function MenuItem({ href, label, icon, svg, onClick }: { href: string; label: string; icon?: string; svg?: string; onClick?: () => void }) {
  return (
    <Link href={href} onClick={onClick} className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-black/[.04] dark:hover:bg-white/[.06]">
      {svg ? (
        <img src={svg} alt="" className="w-5 h-5" />
      ) : icon ? (
        <span className="w-5 h-5 text-xl" aria-hidden>{icon}</span>
      ) : null}
      <span>{label}</span>
    </Link>
  );
}


