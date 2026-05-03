"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import Corridor from "@/components/Corridor";
import Composer from "@/components/Composer";
import PwaInstaller from "@/components/PwaInstaller";
import { useStore } from "@/lib/store";
import { todayKey, formatDateShort, isToday } from "@/lib/utils";

export default function Page() {
  const focus = useStore((s) => s.focus);
  const setFocus = useStore((s) => s.setFocus);
  const [composeFor, setComposeFor] = useState<string | null>(null);

  const today = todayKey();

  return (
    <main className="relative w-full h-[100dvh] overflow-hidden">
      <Corridor onTapRoom={(d) => setComposeFor(d)} />

      {/* Header — wordmark + date crumb */}
      <div className="pointer-events-none fixed top-0 left-0 right-0 z-20 flex items-center justify-between px-5 pt-[max(env(safe-area-inset-top),12px)]">
        <div className="text-[13px] font-semibold tracking-tight text-[var(--fg)]">
          roomtone
        </div>
        <button
          onClick={() => setFocus(today)}
          disabled={isToday(focus)}
          className="pointer-events-auto btn-ghost text-[11.5px] uppercase tracking-[0.18em]"
        >
          {isToday(focus) ? "오늘" : `오늘로 · ${formatDateShort(focus)}`}
        </button>
      </div>

      {/* FAB — open composer for the focused day */}
      <button
        onClick={() => setComposeFor(focus)}
        aria-label="이 방 채우기"
        className="fixed z-30 right-5 grid place-items-center w-14 h-14 rounded-full
          bg-white text-black shadow-[0_18px_48px_-16px_rgba(255,255,255,0.4)]
          hover:scale-[1.03] active:scale-[0.98] transition"
        style={{
          bottom: "calc(env(safe-area-inset-bottom) + 20px)",
        }}
      >
        <Plus size={22} strokeWidth={2.4} />
      </button>

      <Composer
        date={composeFor ?? focus}
        open={composeFor !== null}
        onClose={() => setComposeFor(null)}
      />

      <PwaInstaller />
    </main>
  );
}
