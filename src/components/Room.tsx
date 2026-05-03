"use client";

import { Disc, Play, Pause } from "lucide-react";
import type { Room as RoomT } from "@/lib/types";
import { roomTone, DEFAULT_HUE, DEFAULT_WARMTH } from "@/lib/colors";
import { formatDateLong, isToday } from "@/lib/utils";
import { PLACEHOLDER_LINE } from "@/lib/store";
import { usePlayer } from "@/lib/player";

export default function Room({
  date,
  room,
  active,
  onTap,
}: {
  date: string;
  room: RoomT | undefined;
  active: boolean;
  onTap: () => void;
}) {
  const hue = room?.hue ?? DEFAULT_HUE;
  const warmth = room?.warmth ?? DEFAULT_WARMTH;
  const tone = roomTone(hue, warmth);
  const empty = !room?.line && !room?.song;

  const playing = usePlayer((s) => s.playing) === date;
  const progress = usePlayer((s) => s.progress);
  const toggle = usePlayer((s) => s.toggle);
  const canPlay = Boolean(room?.song?.previewUrl);

  function onDiscClick(e: React.MouseEvent) {
    if (!canPlay) return;
    e.stopPropagation();
    void toggle(date, room?.song?.previewUrl);
  }

  return (
    <article
      className="room-slide relative shrink-0 w-full h-[100dvh] flex items-center justify-center"
      onClick={onTap}
      style={{ background: tone.bg }}
    >
      <div
        className="drift absolute inset-[-10%] -z-10"
        style={{ background: tone.gradient }}
        aria-hidden
      />
      <div
        className="absolute inset-0 -z-10 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.55) 100%)",
        }}
        aria-hidden
      />

      <div className="relative w-full max-w-[480px] px-6 text-center">
        <div className="text-[11px] uppercase tracking-[0.22em] text-[var(--fg-faint)]">
          {isToday(date) ? "오늘 · " : ""}
          {formatDateLong(date)}
        </div>

        <div className="mt-10 flex items-center justify-center">
          <button
            onClick={onDiscClick}
            disabled={!canPlay}
            aria-label={canPlay ? (playing ? "일시정지" : "30초 미리듣기") : "이 방엔 곡이 없습니다"}
            className={
              "relative grid place-items-center w-[128px] h-[128px] rounded-full " +
              (canPlay ? "cursor-pointer" : "cursor-default") +
              " group"
            }
            style={{
              background: room?.song?.artworkUrl
                ? "transparent"
                : `conic-gradient(from 220deg, ${tone.glowA}, ${tone.glowB}, ${tone.glowA})`,
              boxShadow:
                "inset 0 0 0 1px rgba(255,255,255,0.08), 0 18px 60px -20px rgba(0,0,0,0.7)",
            }}
          >
            {room?.song?.artworkUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={room.song.artworkUrl}
                alt=""
                className={
                  "absolute inset-0 w-full h-full rounded-full object-cover " +
                  (playing || active ? "vinyl" : "")
                }
                style={{
                  animationPlayState: playing ? "running" : active ? "running" : "paused",
                  filter: "saturate(0.95) brightness(0.92)",
                }}
                draggable={false}
              />
            )}
            {/* Center hole */}
            <div
              className="relative w-[36px] h-[36px] rounded-full"
              style={{
                background: "rgba(8,9,11,0.92)",
                boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.12)",
              }}
            />
            {/* Play / pause overlay */}
            {canPlay && (
              <div
                className="absolute inset-0 grid place-items-center rounded-full transition"
                style={{
                  background:
                    "radial-gradient(circle at center, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0) 60%)",
                  opacity: playing ? 0.0 : 1,
                }}
              >
                <span className="grid place-items-center w-9 h-9 rounded-full bg-white/95 text-black shadow-lg group-hover:scale-105 transition">
                  {playing ? <Pause size={14} /> : <Play size={14} className="translate-x-[1px]" />}
                </span>
              </div>
            )}
            {/* Progress ring */}
            {canPlay && (
              <svg
                className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none"
                viewBox="0 0 128 128"
                aria-hidden
              >
                <circle
                  cx="64"
                  cy="64"
                  r="62"
                  fill="none"
                  stroke="rgba(255,255,255,0.12)"
                  strokeWidth="2"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="62"
                  fill="none"
                  stroke="rgba(255,255,255,0.85)"
                  strokeWidth="2"
                  strokeDasharray={`${2 * Math.PI * 62}`}
                  strokeDashoffset={`${2 * Math.PI * 62 * (1 - (playing ? progress : 0))}`}
                  strokeLinecap="round"
                  style={{ transition: "stroke-dashoffset 200ms linear" }}
                />
              </svg>
            )}
          </button>
        </div>

        <h1
          className="mt-8 text-[26px] font-semibold tracking-tight leading-snug"
          style={{ color: tone.ink }}
        >
          {room?.line || (
            <span className="text-[var(--fg-faint)] font-normal">
              {PLACEHOLDER_LINE}
            </span>
          )}
        </h1>

        <div className="mt-4 flex items-center justify-center gap-2 text-[13.5px] text-[var(--fg-muted)]">
          <Disc size={13} className="opacity-70" />
          {room?.song?.title ? (
            <span className="truncate">
              {room.song.title}
              {room.song.artist ? (
                <span className="text-[var(--fg-faint)]"> · {room.song.artist}</span>
              ) : null}
            </span>
          ) : (
            <span className="text-[var(--fg-faint)]">아직 곡이 없습니다</span>
          )}
        </div>

        {room?.song?.trackViewUrl && (
          <a
            href={room.song.trackViewUrl}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="mt-3 inline-block text-[11px] uppercase tracking-[0.18em] text-[var(--fg-faint)] hover:text-[var(--fg-muted)]"
          >
            Apple Music에서 전체 듣기 →
          </a>
        )}

        {empty && isToday(date) && (
          <div className="mt-10 text-[12px] text-[var(--fg-faint)]">
            방을 두드려 오늘을 봉인하세요
          </div>
        )}
      </div>
    </article>
  );
}
