"use client";

import { ImageOff } from "lucide-react";
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
  const empty = !room?.line && !room?.photo;
  const photo = room?.photo;

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

        <div className="mt-8 flex items-center justify-center">
          {photo ? (
            <div
              className={
                "rounded-2xl overflow-hidden hairline " +
                (active ? "shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)]" : "")
              }
              style={{
                width: "min(82vw, 360px)",
                aspectRatio: photo.width && photo.height ? `${photo.width}/${photo.height}` : "4/3",
                maxHeight: "52dvh",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.dataUrl}
                alt=""
                className="block w-full h-full object-cover"
                draggable={false}
              />
            </div>
          ) : (
            <div
              className="grid place-items-center rounded-2xl hairline"
              style={{
                width: "min(60vw, 220px)",
                height: "min(60vw, 220px)",
                background: `radial-gradient(circle at 35% 30%, ${tone.glowA}, transparent 60%), ${tone.bg}`,
              }}
              aria-hidden
            >
              <ImageOff size={20} className="opacity-30" />
            </div>
          )}
        </div>

        <h1
          className="mt-7 text-[26px] font-semibold tracking-tight leading-snug"
          style={{ color: tone.ink }}
        >
          {room?.line || (
            <span className="text-[var(--fg-faint)] font-normal">
              {PLACEHOLDER_LINE}
            </span>
          )}
        </h1>

        {empty && isToday(date) && (
          <div className="mt-8 text-[12px] text-[var(--fg-faint)]">
            방을 두드려 오늘을 봉인하세요
          </div>
        )}
      </div>
    </article>
  );
}
