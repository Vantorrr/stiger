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
    <div className={`fixed inset-0 z-[9999] ${open ? "pointer-events-auto" : "pointer-events-none"}`}>
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
          <MenuItem href="/" onClick={onClose}>
            <MapIcon />
            <span>Карта зарядов</span>
          </MenuItem>
          <MenuItem href="/scan" onClick={onClose}>
            <ChargeIcon />
            <span>Взять заряд</span>
          </MenuItem>
          <MenuItem href="/profile" onClick={onClose}>
            <ProfileIcon />
            <span>Профиль</span>
          </MenuItem>
          <MenuItem href="/payment" onClick={onClose}>
            <PaymentIcon />
            <span>Способ оплаты</span>
          </MenuItem>
          <MenuItem href="/rewards" onClick={onClose}>
            <BonusIcon />
            <span>Бонусы</span>
          </MenuItem>
          <MenuItem href="/pricing" onClick={onClose}>
            <PricingIcon />
            <span>Тарифы</span>
          </MenuItem>
          <MenuItem href="/support" onClick={onClose}>
            <SupportIcon />
            <span>Поддержка</span>
          </MenuItem>
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

function MenuItem({ href, onClick, children }: { href: string; onClick?: () => void; children: React.ReactNode }) {
  return (
    <Link href={href} onClick={onClick} className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-black/[.04] dark:hover:bg-white/[.06] transition-all group">
      {children}
    </Link>
  );
}

// Premium custom icons
function MapIcon() {
  return (
    <div className="w-5 h-5 relative">
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        <path d="M9 20L3 17V5L9 8M9 20L15 17M9 20V8M15 17L21 20V8L15 5M15 17V5M9 8L15 5" 
          stroke="url(#map-gradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          className="group-hover:stroke-2"
        />
        <defs>
          <linearGradient id="map-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

function ChargeIcon() {
  return (
    <div className="w-5 h-5 relative flex items-center justify-center">
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full blur-sm opacity-30 group-hover:opacity-50 transition-opacity" />
      <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 relative z-10">
        <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" 
          fill="url(#charge-gradient)" 
          className="drop-shadow-sm"
        />
        <defs>
          <linearGradient id="charge-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FDE047" />
            <stop offset="100%" stopColor="#F97316" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

function ProfileIcon() {
  return (
    <div className="w-5 h-5 relative">
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        <circle cx="12" cy="8" r="3" stroke="url(#profile-gradient)" strokeWidth="2" />
        <path d="M16 14H8C5.79086 14 4 15.7909 4 18V20H20V18C20 15.7909 18.2091 14 16 14Z" 
          stroke="url(#profile-gradient)" strokeWidth="2" strokeLinecap="round"
        />
        <defs>
          <linearGradient id="profile-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#EC4899" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

function PaymentIcon() {
  return (
    <div className="w-5 h-5 relative">
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        <rect x="2" y="5" width="20" height="14" rx="2" 
          stroke="url(#payment-gradient)" strokeWidth="2"
        />
        <path d="M2 10H22" stroke="url(#payment-gradient)" strokeWidth="2" />
        <path d="M7 15H10" stroke="url(#payment-gradient)" strokeWidth="2" strokeLinecap="round" />
        <defs>
          <linearGradient id="payment-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

function BonusIcon() {
  return (
    <div className="w-5 h-5 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full blur-sm opacity-20 group-hover:opacity-40 transition-opacity" />
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full relative z-10">
        <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" 
          fill="url(#bonus-gradient)" 
          className="drop-shadow-sm"
        />
        <defs>
          <linearGradient id="bonus-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#A855F7" />
            <stop offset="100%" stopColor="#EC4899" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

function PricingIcon() {
  return (
    <div className="w-5 h-5 relative">
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        <path d="M12 2V6M12 18V22M6 12H2M22 12H18" 
          stroke="url(#pricing-gradient)" strokeWidth="2" strokeLinecap="round"
        />
        <circle cx="12" cy="12" r="4" 
          stroke="url(#pricing-gradient)" strokeWidth="2"
        />
        <defs>
          <linearGradient id="pricing-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#EF4444" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

function SupportIcon() {
  return (
    <div className="w-5 h-5 relative">
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        <circle cx="12" cy="12" r="10" stroke="url(#support-gradient)" strokeWidth="2" />
        <path d="M9 9C9 7.34315 10.3431 6 12 6C13.6569 6 15 7.34315 15 9C15 10.6569 13.6569 12 12 12V14" 
          stroke="url(#support-gradient)" strokeWidth="2" strokeLinecap="round"
        />
        <circle cx="12" cy="18" r="0.5" fill="url(#support-gradient)" stroke="url(#support-gradient)" />
        <defs>
          <linearGradient id="support-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#14B8A6" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}


