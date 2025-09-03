"use client";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 300);
          return 100;
        }
        return prev + 2;
      });
    }, 30);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-purple-600 via-blue-600 to-teal-600">
      <div className="text-center space-y-8">
        {/* Animated Logo */}
        <div className="relative">
          <div className="w-24 h-24 mx-auto rounded-3xl bg-white/25 backdrop-blur flex items-center justify-center animate-pulse overflow-hidden z-10 relative">
            <Image src="/logoo.png" alt="Stiger" width={64} height={64} className="object-contain" />
          </div>
          <div className="absolute inset-0 w-24 h-24 mx-auto rounded-3xl bg-white/20 animate-ping pointer-events-none z-0"></div>
        </div>

        {/* Brand Name */}
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-white tracking-tight">Stiger</h1>
          <p className="text-white/80 text-lg">Революция в прокате power bank</p>
        </div>

        {/* Charging Battery Progress */}
        <div className="mx-auto w-[280px] select-none">
          {/* Battery shell */}
          <div className="relative mx-auto flex items-center gap-1">
            <div className="relative w-full h-10 rounded-xl border-2 border-white/70 bg-white/10 overflow-hidden">
              {/* Fill */}
              <div
                className="h-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 transition-all duration-150 ease-out"
                style={{ width: `${progress}%` }}
              />
              {/* Bolt overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white text-xl drop-shadow">⚡</span>
              </div>
            </div>
            {/* Battery pin */}
            <div className="w-2.5 h-5 rounded-md bg-white/70" />
          </div>
          <p className="text-white/80 text-sm mt-2">Зарядка: {Math.round(progress)}%</p>
        </div>
      </div>
    </div>
  );
}
