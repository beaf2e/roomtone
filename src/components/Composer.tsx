"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X, Trash2, Search, Play, Pause, Loader2, Wand2, ExternalLink } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useStore } from "@/lib/store";
import { roomTone, DEFAULT_HUE, DEFAULT_WARMTH } from "@/lib/colors";
import { formatDateLong } from "@/lib/utils";
import { searchTracks, bigArtwork, type ItunesTrack } from "@/lib/itunes";
import { usePlayer } from "@/lib/player";
import { toneFromImage } from "@/lib/dominant-color";
import { extractYoutubeId, youtubeSearchUrl } from "@/lib/youtube";

type Picked = NonNullable<ReturnType<typeof useStore.getState>["rooms"][string]>["song"];

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
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState<Picked | undefined>(undefined);
  const [results, setResults] = useState<ItunesTrack[]>([]);
  const [searching, setSearching] = useState(false);
  const [hue, setHue] = useState(DEFAULT_HUE);
  const [warmth, setWarmth] = useState(DEFAULT_WARMTH);
  const [toneAuto, setToneAuto] = useState(false);
  const [ytInput, setYtInput] = useState("");

  const playing = usePlayer((s) => s.playing);
  const togglePlay = usePlayer((s) => s.toggle);
  const stopPlay = usePlayer((s) => s.stop);

  // Hydrate fields when the composer opens for a given date
  useEffect(() => {
    if (!open) return;
    setLine(room?.line ?? "");
    setPicked(room?.song);
    setQuery(
      room?.song
        ? [room.song.title, room.song.artist].filter(Boolean).join(" ")
        : "",
    );
    setResults([]);
    setHue(room?.hue ?? DEFAULT_HUE);
    setWarmth(room?.warmth ?? DEFAULT_WARMTH);
    setToneAuto(false);
    setYtInput(
      room?.song?.youtubeId ? `https://youtu.be/${room.song.youtubeId}` : "",
    );
  }, [open, date, room]);

  // Stop any playback when the composer closes
  useEffect(() => {
    if (!open) stopPlay();
  }, [open, stopPlay]);

  // Debounced iTunes search whenever the query changes (and no track is locked in)
  const abortRef = useRef<AbortController | null>(null);
  useEffect(() => {
    if (!open) return;
    const term = query.trim();
    if (!term || picked) {
      setResults([]);
      setSearching(false);
      return;
    }
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    const t = window.setTimeout(async () => {
      setSearching(true);
      try {
        const r = await searchTracks(term, ctrl.signal);
        if (!ctrl.signal.aborted) setResults(r);
      } catch {
        if (!ctrl.signal.aborted) setResults([]);
      } finally {
        if (!ctrl.signal.aborted) setSearching(false);
      }
    }, 280);
    return () => {
      window.clearTimeout(t);
      ctrl.abort();
    };
  }, [query, open, picked]);

  const tone = roomTone(hue, warmth);

  function pick(t: ItunesTrack) {
    const artwork = bigArtwork(t.artworkUrl100, 600);
    setPicked({
      title: t.trackName,
      artist: t.artistName,
      trackId: t.trackId,
      previewUrl: t.previewUrl,
      artworkUrl: artwork,
      trackViewUrl: t.trackViewUrl,
      startAt: 0,
    });
    setQuery(`${t.trackName} ${t.artistName}`);
    setResults([]);
    stopPlay();
    // Auto-tone from album art (only if user hasn't manually customized yet)
    if (artwork) void applyToneFromArt(artwork, /*force*/ false);
  }

  async function applyToneFromArt(url: string, force: boolean) {
    const t = await toneFromImage(url);
    if (!t) return;
    if (force || !toneAuto) {
      setHue(t.hue);
      setWarmth(t.warmth);
      setToneAuto(true);
    }
  }

  function setStartAt(s: number) {
    if (!picked) return;
    setPicked({ ...picked, startAt: Math.max(0, Math.min(28, s)) });
  }

  function commitYoutubeUrl(value: string) {
    setYtInput(value);
    if (!picked) return;
    const id = extractYoutubeId(value);
    setPicked({ ...picked, youtubeId: id ?? undefined });
  }

  function clearPick() {
    stopPlay();
    setPicked(undefined);
    setQuery("");
  }

  function save() {
    const hasContent = line.trim() || picked;
    if (!hasContent) {
      onClose();
      return;
    }
    upsert(date, {
      line: line.trim() || undefined,
      song: picked,
      hue,
      warmth,
    });
    stopPlay();
    onClose();
  }

  function clearDay() {
    remove(date);
    stopPlay();
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
                  오늘의 곡
                </label>

                {picked ? (
                  <div className="mt-2 hairline rounded-2xl p-2.5 flex items-center gap-3">
                    {picked.artworkUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={picked.artworkUrl}
                        alt=""
                        className="w-12 h-12 rounded-lg object-cover"
                        draggable={false}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-[14px] font-semibold tracking-tight truncate">
                        {picked.title}
                      </div>
                      <div className="text-[12px] text-[var(--fg-muted)] truncate">
                        {picked.artist}
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        void togglePlay(
                          `composer:${date}`,
                          picked.previewUrl,
                          picked.startAt ?? 0,
                        )
                      }
                      disabled={!picked.previewUrl}
                      aria-label="미리듣기"
                      className="grid place-items-center w-9 h-9 rounded-full bg-white text-black disabled:opacity-30"
                    >
                      {playing === `composer:${date}` ? (
                        <Pause size={14} />
                      ) : (
                        <Play size={14} className="translate-x-[1px]" />
                      )}
                    </button>
                    <button
                      onClick={clearPick}
                      aria-label="곡 지우기"
                      className="btn-ghost p-1.5 rounded-full"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="mt-2 hairline rounded-2xl px-3 py-2 flex items-center gap-2">
                    {searching ? (
                      <Loader2 size={14} className="opacity-60 animate-spin" />
                    ) : (
                      <Search size={14} className="opacity-60" />
                    )}
                    <input
                      className="input-bare text-[14px]"
                      placeholder="곡 제목 + 아티스트로 검색"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                    />
                  </div>
                )}

                {picked && (
                  <div className="mt-3 flex items-center gap-2">
                    <input
                      className="input-bare hairline rounded-2xl px-3 py-2 text-[12.5px] flex-1"
                      placeholder="YouTube 영상 URL 붙여넣기 (풀곡 재생)"
                      value={ytInput}
                      onChange={(e) => commitYoutubeUrl(e.target.value)}
                      onPaste={(e) => {
                        const v = e.clipboardData.getData("text");
                        if (v) {
                          e.preventDefault();
                          commitYoutubeUrl(v);
                        }
                      }}
                    />
                    <a
                      href={youtubeSearchUrl(`${picked.title} ${picked.artist ?? ""}`.trim())}
                      target="_blank"
                      rel="noreferrer"
                      title="YouTube에서 검색하고 URL 복사"
                      className="btn-ghost p-1.5 rounded-full"
                    >
                      <ExternalLink size={14} />
                    </a>
                  </div>
                )}
                {picked && ytInput && !picked.youtubeId && (
                  <div className="mt-1 text-[10.5px] text-[var(--fg-faint)]">
                    YouTube URL 형식이 아니에요 (youtube.com/… 또는 youtu.be/…)
                  </div>
                )}
                {picked && picked.youtubeId && (
                  <div className="mt-1 text-[10.5px] text-[var(--fg-faint)]">
                    이 영상이 방에 풀곡으로 임베드돼요
                  </div>
                )}

                {picked && picked.previewUrl && !picked.youtubeId && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.16em] text-[var(--fg-faint)]">
                      <span>시작 지점</span>
                      <span className="tabular-nums">
                        {(picked.startAt ?? 0).toFixed(1)}초부터
                      </span>
                    </div>
                    <div className="relative mt-2">
                      <div
                        className="h-7 rounded-lg overflow-hidden hairline relative"
                        style={{
                          background:
                            "linear-gradient(90deg, rgba(255,255,255,0.06), rgba(255,255,255,0.18), rgba(255,255,255,0.06))",
                        }}
                      >
                        {/* 30s waveform-ish shimmer (decorative) */}
                        <div className="absolute inset-0 flex items-center gap-[2px] px-1 opacity-60">
                          {Array.from({ length: 60 }).map((_, i) => {
                            const h = 30 + (Math.sin(i * 1.7) * 0.5 + 0.5) * 60;
                            return (
                              <span
                                key={i}
                                className="block w-[3px] rounded-full bg-white/35"
                                style={{ height: `${h}%` }}
                              />
                            );
                          })}
                        </div>
                        {/* Trim marker */}
                        <div
                          className="absolute top-0 bottom-0 w-[3px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.4)] rounded-full"
                          style={{
                            left: `${((picked.startAt ?? 0) / 30) * 100}%`,
                            transform: "translateX(-50%)",
                          }}
                          aria-hidden
                        />
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={28}
                        step={0.1}
                        value={picked.startAt ?? 0}
                        onChange={(e) => setStartAt(Number(e.target.value))}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        aria-label="재생 시작 지점"
                      />
                    </div>
                    <div className="mt-2 text-[11px] text-[var(--fg-faint)]">
                      이 지점부터 재생돼요. 인스타처럼 좋아하는 부분으로 맞춰보세요.
                    </div>
                  </div>
                )}

                {!picked && results.length > 0 && (
                  <ul className="mt-2 max-h-[260px] overflow-y-auto rounded-2xl hairline divide-y divide-white/5">
                    {results.map((t) => (
                      <li key={t.trackId}>
                        <button
                          onClick={() => pick(t)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/[0.04] transition text-left"
                        >
                          {t.artworkUrl100 && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={t.artworkUrl100}
                              alt=""
                              className="w-10 h-10 rounded-md object-cover shrink-0"
                              draggable={false}
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="text-[13.5px] font-medium tracking-tight truncate">
                              {t.trackName}
                            </div>
                            <div className="text-[11.5px] text-[var(--fg-muted)] truncate">
                              {t.artistName}
                              {t.collectionName ? (
                                <span className="text-[var(--fg-faint)]"> · {t.collectionName}</span>
                              ) : null}
                            </div>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="mt-6">
                <div className="flex items-center justify-between gap-2">
                  <label className="text-[11px] uppercase tracking-[0.16em] text-[var(--fg-faint)]">
                    톤
                  </label>
                  <div className="flex items-center gap-2">
                    {picked?.artworkUrl && (
                      <button
                        onClick={() => void applyToneFromArt(picked.artworkUrl!, true)}
                        className="btn-ghost flex items-center gap-1 text-[11px] uppercase tracking-[0.14em]"
                        title="앨범 색에서 자동 추출"
                      >
                        <Wand2 size={12} />
                        앨범 색
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
