"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X, Trash2, ImagePlus, Wand2, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useStore } from "@/lib/store";
import { roomTone, DEFAULT_HUE, DEFAULT_WARMTH } from "@/lib/colors";
import { formatDateLong } from "@/lib/utils";
import { toneFromImage } from "@/lib/dominant-color";
import { fileToResizedPhoto } from "@/lib/photo";

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
  const [photo, setPhoto] = useState<{ dataUrl: string; width: number; height: number } | undefined>(undefined);
  const [hue, setHue] = useState(DEFAULT_HUE);
  const [warmth, setWarmth] = useState(DEFAULT_WARMTH);
  const [toneAuto, setToneAuto] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  // Hydrate fields when the composer opens for a given date
  useEffect(() => {
    if (!open) return;
    setLine(room?.line ?? "");
    setPhoto(room?.photo);
    setHue(room?.hue ?? DEFAULT_HUE);
    setWarmth(room?.warmth ?? DEFAULT_WARMTH);
    setToneAuto(false);
    setError(null);
  }, [open, date, room]);

  const tone = roomTone(hue, warmth);

  async function applyToneFromArt(url: string, force: boolean) {
    const t = await toneFromImage(url);
    if (!t) return;
    if (force || !toneAuto) {
      setHue(t.hue);
      setWarmth(t.warmth);
      setToneAuto(true);
    }
  }

  async function onPickFile(file: File) {
    setError(null);
    setBusy(true);
    try {
      const p = await fileToResizedPhoto(file);
      setPhoto(p);
      // Auto-tone from the photo (force, since the user just changed photo)
      void applyToneFromArt(p.dataUrl, true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "사진 처리 실패");
    } finally {
      setBusy(false);
    }
  }

  function clearPhoto() {
    setPhoto(undefined);
  }

  function save() {
    const hasContent = line.trim() || photo;
    if (!hasContent) {
      onClose();
      return;
    }
    upsert(date, {
      line: line.trim() || undefined,
      photo,
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
              md:w-[460px] md:max-h-[82dvh]"
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

              <div className="mt-6">
                <label className="block text-[11px] uppercase tracking-[0.16em] text-[var(--fg-faint)]">
                  오늘의 사진
                </label>

                {photo ? (
                  <div className="mt-2 relative rounded-2xl overflow-hidden hairline">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.dataUrl}
                      alt=""
                      className="block w-full max-h-[280px] object-cover"
                      draggable={false}
                    />
                    <div className="absolute top-2 right-2 flex items-center gap-1.5">
                      <button
                        onClick={() => fileRef.current?.click()}
                        className="grid place-items-center w-8 h-8 rounded-full bg-black/55 backdrop-blur text-white"
                        aria-label="사진 바꾸기"
                        title="사진 바꾸기"
                      >
                        <ImagePlus size={14} />
                      </button>
                      <button
                        onClick={clearPhoto}
                        className="grid place-items-center w-8 h-8 rounded-full bg-black/55 backdrop-blur text-white"
                        aria-label="사진 지우기"
                        title="사진 지우기"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => fileRef.current?.click()}
                    disabled={busy}
                    className="mt-2 w-full hairline rounded-2xl py-8 flex flex-col items-center justify-center gap-2 text-[var(--fg-muted)] hover:bg-white/5 transition disabled:opacity-50"
                  >
                    {busy ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <ImagePlus size={18} className="opacity-80" />
                    )}
                    <span className="text-[12.5px]">
                      {busy ? "처리 중…" : "사진 추가"}
                    </span>
                  </button>
                )}

                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void onPickFile(f);
                    e.currentTarget.value = "";
                  }}
                />

                {error && (
                  <div className="mt-2 text-[11px] text-red-300/85">{error}</div>
                )}
              </div>

              <div className="mt-6">
                <div className="flex items-center justify-between gap-2">
                  <label className="text-[11px] uppercase tracking-[0.16em] text-[var(--fg-faint)]">
                    톤
                  </label>
                  <div className="flex items-center gap-2">
                    {photo && (
                      <button
                        onClick={() => void applyToneFromArt(photo.dataUrl, true)}
                        className="btn-ghost flex items-center gap-1 text-[11px] uppercase tracking-[0.14em]"
                        title="사진 색에서 자동 추출"
                      >
                        <Wand2 size={12} />
                        사진 색
                      </button>
                    )}
                    <div
                      className="w-7 h-7 rounded-full"
                      style={{
                        background: `conic-gradient(from 200deg, ${tone.glowA}, ${tone.glowB}, ${tone.glowA})`,
                        boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.12)",
                      }}
                      aria-hidden
                    />
                  </div>
                </div>
                <input
                  type="range"
                  min={0}
                  max={359}
                  value={hue}
                  onChange={(e) => {
                    setHue(Number(e.target.value));
                    setToneAuto(false);
                  }}
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
                  onChange={(e) => {
                    setWarmth(Number(e.target.value) / 100);
                    setToneAuto(false);
                  }}
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
