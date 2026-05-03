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
  toggle: (date: string, src: string | undefined) => Promise<void>;
  stop: () => void;
};

export const usePlayer = create<State>((set, get) => ({
  playing: null,
  progress: 0,
  toggle: async (date, src) => {
    if (!src) return;
    const a = audio();
    if (get().playing === date) {
      a.pause();
      set({ playing: null });
      return;
    }
    a.pause();
    a.src = src;
    a.currentTime = 0;
    const onTime = () => {
      const p = a.duration > 0 ? a.currentTime / a.duration : 0;
      set({ progress: p });
    };
    const onEnd = () => {
      set({ playing: null, progress: 0 });
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("ended", onEnd);
    };
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("ended", onEnd);
    try {
      await a.play();
      set({ playing: date, progress: 0 });
    } catch {
      set({ playing: null, progress: 0 });
    }
  },
  stop: () => {
    if (el) el.pause();
    set({ playing: null, progress: 0 });
  },
}));
