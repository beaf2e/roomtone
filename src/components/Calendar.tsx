"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { roomTone } from "@/lib/colors";
import { todayKey } from "@/lib/utils";

function monthMatrix(year: number, month: number): (string | null)[] {
  const first = new Date(year, month, 1);
  const startDow = first.getDay(); // 0=Sun
  const last = new Date(year, month + 1, 0).getDate();
  const cells: (string | null)[] = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= last; d++) {
    const k = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    cells.push(k);
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

const DOW = ["일", "월", "화", "수", "목", "금", "토"];

export default function Calendar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const rooms = useStore((s) => s.rooms);
  const setFocus = useStore((s) => s.setFocus);

  const today = todayKey();
  const [today_y, today_m] = today.split("-").map(Number);
  const [view, setView] = useState({ y: today_y, m: today_m - 1 });

  const cells = useMemo(() => monthMatrix(view.y, view.m), [view]);

  function shift(delta: number) {
    const dt = new Date(view.y, view.m + delta, 1);
    setView({ y: dt.getFullYear(), m: dt.getMonth() });
  }

  function jump(date: string) {
    setFocus(date);
    onClose();
  }

  const monthLabel = `${view.y}년 ${view.m + 1}월`;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="bd"
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            key="cal"
            className="glass fixed z-50 rounded-3xl overflow-hidden flex flex-col
              inset-x-3 bottom-3 max-h-[88dvh]
              md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2
              md:w-[420px] md:max-h-[80dvh]"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
            style={{ paddingBottom: "max(env(safe-area-inset-bottom), 0px)" }}
          >
            <div className="flex items-center justify-between px-5 pt-4">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => shift(-1)}
                  className="btn-ghost p-1.5 rounded-full"
                  aria-label="이전 달"
                >
                  <ChevronLeft size={16} />
                </button>
                <div className="text-[14px] font-semibold tracking-tight px-2 tabular-nums">
                  {monthLabel}
                </div>
                <button
                  onClick={() => shift(1)}
                  className="btn-ghost p-1.5 rounded-full"
                  aria-label="다음 달"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
              <button
                onClick={onClose}
                className="btn-ghost -mr-2 p-1.5 rounded-full"
                aria-label="닫기"
              >
                <X size={16} />
              </button>
            </div>

            <div className="px-5 pt-4 pb-5">
              <div className="grid grid-cols-7 gap-1.5 text-[10.5px] uppercase tracking-[0.18em] text-[var(--fg-faint)] text-center">
                {DOW.map((d) => (
                  <div key={d} className="py-1">
                    {d}
                  </div>
                ))}
              </div>

              <div className="mt-1 grid grid-cols-7 gap-1.5">
                {cells.map((k, i) => {
                  if (!k) return <div key={i} className="aspect-square" />;
                  const room = rooms[k];
                  const isToday = k === today;
                  const isFuture = k > today;
                  const day = Number(k.slice(-2));
                  const tone = room ? roomTone(room.hue, room.warmth) : null;

                  return (
                    <button
                      key={k}
                      onClick={() => !isFuture && jump(k)}
                      disabled={isFuture}
                      className={
                        "relative aspect-square rounded-xl text-[12px] font-medium tabular-nums " +
                        "flex items-center justify-center transition " +
                        (isFuture
                          ? "opacity-25 cursor-not-allowed"
                          : "hover:bg-white/5 active:scale-[0.97]") +
                        (isToday ? " ring-1 ring-white/70" : "")
                      }
                      style={
                        tone
                          ? {
                              background: tone.gradient,
                              color: "white",
                            }
                          : undefined
                      }
                    >
                      <span className={room ? "drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]" : ""}>
                        {day}
                      </span>
                      {room && (
                        <span
                          className="absolute bottom-1.5 w-[4px] h-[4px] rounded-full bg-white/85"
                          aria-hidden
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="mt-5 flex items-center justify-between text-[11px] text-[var(--fg-faint)]">
                <span>방이 채워진 날엔 색이 입혀져요</span>
                <button
                  onClick={() => jump(today)}
                  className="btn-ghost text-[11.5px] uppercase tracking-[0.16em]"
                >
                  오늘
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
