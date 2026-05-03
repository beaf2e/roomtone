"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Room } from "./types";
import { todayKey } from "./utils";
import { DEFAULT_HUE, DEFAULT_WARMTH } from "./colors";

type State = {
  rooms: Record<string, Room>;
  /** The day currently focused in the corridor. Defaults to today. */
  focus: string;
  setFocus: (date: string) => void;
  upsert: (date: string, patch: Partial<Room>) => void;
  remove: (date: string) => void;
};

const SEED_LINE = "오늘의 공기를 한 줄로.";

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      rooms: {},
      focus: todayKey(),
      setFocus: (date) => set({ focus: date }),
      upsert: (date, patch) => {
        const prev = get().rooms[date];
        const base: Room = prev ?? {
          date,
          hue: DEFAULT_HUE,
          warmth: DEFAULT_WARMTH,
          updatedAt: new Date().toISOString(),
        };
        const next: Room = {
          ...base,
          ...patch,
          date,
          updatedAt: new Date().toISOString(),
        };
        set({ rooms: { ...get().rooms, [date]: next } });
      },
      remove: (date) => {
        const r = { ...get().rooms };
        delete r[date];
        set({ rooms: r });
      },
    }),
    {
      name: "roomtone.v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ rooms: s.rooms }),
    },
  ),
);

export const PLACEHOLDER_LINE = SEED_LINE;
