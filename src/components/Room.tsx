"use client";

import { Disc } from "lucide-react";
import type { Room as RoomT } from "@/lib/types";
import { roomTone, DEFAULT_HUE, DEFAULT_WARMTH } from "@/lib/colors";
import { formatDateLong, isToday } from "@/lib/utils";
import { PLACEHOLDER_LINE } from "@/lib/store";

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

  return (
    <article
      className="room-slide relative shrink-0 w-full h-[100dvh] flex items-center justify-center"
      onClick={onTap}
      style={{ background: tone.bg }}
    >
      {/* Ambient gradient */}
      <div
        className="drift absolute inset-[-10%] -z-10"
        style={{ background: tone.gradient }}
        aria-hidden
      />
      {/* Soft vignette */}
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
          <div
            className={
              "vinyl grid place-items-center w-[112px] h-[112px] rounded-full " +
              (active ? "" : "[animation-play-state:paused]")
            }
            style={{
              background: `conic-gradient(from 220deg, ${tone.glowA}, ${tone.glowB}, ${tone.glowA})`,
              boxShadow:
                "inset 0 0 0 1px rgba(255,255,255,0.08), 0 18px 60px -20px rgba(0,0,0,0.7)",
            }}
            aria-hidden
          >
            <div
              className="w-[34px] h-[34px] rounded-full"
              style={{
                background: "rgba(8,9,11,0.92)",
                boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08)",
              }}
            />
          </div>
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

        {empty && isToday(date) && (
          <div className="mt-10 text-[12px] text-[var(--fg-faint)]">
            방을 두드려 오늘을 봉인하세요
          </div>
        )}
      </div>
    </article>
  );
}
