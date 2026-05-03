"use client";

import { create } from "zustand";

// One shared <audio>; only one preview plays at a time across the app.
let el: HTMLAudioElement | null = null;
function audio(): HTMLAudioElement {
  if (typeof window === "undefined") throw new Error("audio used on server");
  if (!el) {
    el = new Audio();
    el.preload = "none";
    el.crossOrigin = "anonymous";
  }
  return el;
}

type State = {
  /** Date key of the room currently playing, or null. */
  playing: string | null;
  /** 0..1 progress for the playing track (driven by timeupdate). */
  progress: number;
  /** Current playback position in seconds. */
  currentTime: number;
  /** Track duration in seconds (≈ 30 for iTunes previews). */
  duration: number;
  toggle: (date: string, src: string | undefined, startAt?: number) => Promise<void>;
  stop: () => void;
};

export const usePlayer = create<State>((set, get) => ({
  playing: null,
  progress: 0,
  currentTime: 0,
  duration: 0,
  toggle: async (date, src, startAt = 0) => {
    if (!src) return;
    const a = audio();
    if (get().playing === date) {
      a.pause();
      set({ playing: null });
      return;
    }
    a.pause();
    a.src = src;
    const seekTo = Math.max(0, startAt);
    const trySeek = () => {
      try {
        a.currentTime = seekTo;
      } catch {
        /* ignore — some browsers need loadedmetadata first */
      }
    };
    trySeek();
    a.addEventListener("loadedmetadata", trySeek, { once: true });
    const onTime = () => {
      const p = a.duration > 0 ? a.currentTime / a.duration : 0;
      set({
        progress: p,
        currentTime: a.currentTime,
        duration: isFinite(a.duration) ? a.duration : 0,
      });
    };
    const onEnd = () => {
      set({ playing: null, progress: 0, currentTime: 0 });
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("ended", onEnd);
    };
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("ended", onEnd);
    try {
      await a.play();
      set({ playing: date, progress: 0, currentTime: seekTo, duration: isFinite(a.duration) ? a.duration : 0 });
    } catch {
      set({ playing: null, progress: 0 });
    }
  },
  stop: () => {
    if (el) el.pause();
    set({ playing: null, progress: 0, currentTime: 0 });
  },
}));

export function fmtTime(sec: number): string {
  if (!isFinite(sec) || sec < 0) sec = 0;
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}
