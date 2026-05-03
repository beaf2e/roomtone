"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { roomTone, DEFAULT_HUE, DEFAULT_WARMTH } from "@/lib/colors";
import { formatDateLong } from "@/lib/utils";

export default function Composer({
  date,
  open,
  onClose,
}: {
  date: string;
  open: boolean;
  onClose: () => void;
}) {
  const room = useStore((s) => s.rooms[date]);
  const upsert = useStore((s) => s.upsert);
  const remove = useStore((s) => s.remove);

  const [line, setLine] = useState("");
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [hue, setHue] = useState(DEFAULT_HUE);
  const [warmth, setWarmth] = useState(DEFAULT_WARMTH);

  // Hydrate fields when the composer opens for a given date
  useEffect(() => {
    if (!open) return;
    setLine(room?.line ?? "");
    setTitle(room?.song?.title ?? "");
    setArtist(room?.song?.artist ?? "");
    setHue(room?.hue ?? DEFAULT_HUE);
    setWarmth(room?.warmth ?? DEFAULT_WARMTH);
  }, [open, date, room]);

  const tone = roomTone(hue, warmth);

  function save() {
    const hasContent = line.trim() || title.trim();
    if (!hasContent) {
      onClose();
      return;
    }
    upsert(date, {
      line: line.trim() || undefined,
      song: title.trim()
        ? { title: title.trim(), artist: artist.trim() || undefined }
        : undefined,
      hue,
      warmth,
    });
    onClose();
  }

  function clearDay() {
    remove(date);
    onClose();
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="bd"
            className="fixed inset-0 z-40 bg-black/55 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            key="sheet"
            className="glass fixed z-50 rounded-3xl overflow-hidden flex flex-col
              inset-x-3 bottom-3 max-h-[88dvh]
              md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2
              md:w-[440px] md:max-h-[80dvh]"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
            style={{ paddingBottom: "max(env(safe-area-inset-bottom), 0px)" }}
          >
            <div
              className="absolute inset-0 -z-10 opacity-70"
              style={{ background: tone.gradient }}
              aria-hidden
            />
            <div className="flex items-center justify-between px-5 pt-4">
              <div className="text-[11px] uppercase tracking-[0.18em] text-[var(--fg-faint)]">
                {formatDateLong(date)}
              </div>
              <button
                onClick={onClose}
                aria-label="닫기"
                className="btn-ghost -mr-2 p-1.5 rounded-full"
              >
                <X size={16} />
              </button>
            </div>

            <div className="px-5 pt-3 pb-5 flex-1 overflow-y-auto">
              <label className="block text-[11px] uppercase tracking-[0.16em] text-[var(--fg-faint)] mt-1">
                한 줄
              </label>
              <input
                className="input-bare mt-2 text-[19px] font-semibold tracking-tight"
                placeholder="오늘을 한 줄로"
                value={line}
                onChange={(e) => setLine(e.target.value)}
                maxLength={80}
              />

              <div className="mt-6 grid gap-3">
                <label className="block text-[11px] uppercase tracking-[0.16em] text-[var(--fg-faint)]">
                  오늘의 곡
                </label>
                <input
                  className="input-bare hairline rounded-2xl px-3.5 py-2.5 text-[14px]"
                  placeholder="곡 제목"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                <input
                  className="input-bare hairline rounded-2xl px-3.5 py-2.5 text-[14px]"
                  placeholder="아티스트 (선택)"
                  value={artist}
                  onChange={(e) => setArtist(e.target.value)}
                />
              </div>

              <div className="mt-6">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] uppercase tracking-[0.16em] text-[var(--fg-faint)]">
                    톤
                  </label>
                  <div
                    className="w-7 h-7 rounded-full"
                    style={{
                      background: `conic-gradient(from 200deg, ${tone.glowA}, ${tone.glowB}, ${tone.glowA})`,
                      boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.12)",
                    }}
                    aria-hidden
                  />
                </div>
                <input
                  type="range"
                  min={0}
                  max={359}
                  value={hue}
                  onChange={(e) => setHue(Number(e.target.value))}
                  className="mt-3 w-full accent-white"
                  style={{
                    background:
                      "linear-gradient(90deg, hsl(0,60%,50%), hsl(60,60%,50%), hsl(120,60%,50%), hsl(180,60%,50%), hsl(240,60%,50%), hsl(300,60%,50%), hsl(360,60%,50%))",
                    borderRadius: 999,
                    height: 6,
                    appearance: "none",
                    WebkitAppearance: "none",
                  }}
                />
                <div className="mt-3 flex items-center justify-between text-[11px] text-[var(--fg-faint)] uppercase tracking-[0.14em]">
                  <span>차가움</span>
                  <span>따뜻함</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={Math.round(warmth * 100)}
                  onChange={(e) => setWarmth(Number(e.target.value) / 100)}
                  className="mt-1 w-full accent-white"
                />
              </div>

              <div className="mt-7 flex items-center justify-between gap-3">
                {room ? (
                  <button
                    onClick={clearDay}
                    className="btn-ghost flex items-center gap-1.5 text-[12.5px]"
                  >
                    <Trash2 size={13} />
                    지우기
                  </button>
                ) : (
                  <span />
                )}
                <button onClick={save} className="btn-primary">
                  봉인
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
