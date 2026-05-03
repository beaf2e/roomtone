"use client";

import { useEffect, useMemo, useRef } from "react";
import { useStore } from "@/lib/store";
import { shiftDate, todayKey } from "@/lib/utils";
import Room from "./Room";

const PAST_DAYS = 365;
// We render today + PAST_DAYS days back, oldest first → today is the rightmost slide.

export default function Corridor({ onTapRoom }: { onTapRoom: (date: string) => void }) {
  const rooms = useStore((s) => s.rooms);
  const focus = useStore((s) => s.focus);
  const setFocus = useStore((s) => s.setFocus);

  const scrollerRef = useRef<HTMLDivElement | null>(null);

  const dates = useMemo(() => {
    const today = todayKey();
    const out: string[] = [];
    for (let i = PAST_DAYS; i >= 0; i--) out.push(shiftDate(today, -i));
    return out;
  }, []);

  // On mount and when focus changes externally, scroll the focused slide into view.
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const idx = dates.indexOf(focus);
    if (idx < 0) return;
    const slide = el.children[idx] as HTMLElement | undefined;
    if (slide) {
      slide.scrollIntoView({ behavior: "instant" as ScrollBehavior, inline: "center", block: "nearest" });
    }
  }, [focus, dates]);

  // Track which slide is centered while user scrolls; update focus.
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const center = el.scrollLeft + el.clientWidth / 2;
        let best = -1;
        let bestD = Infinity;
        for (let i = 0; i < el.children.length; i++) {
          const c = el.children[i] as HTMLElement;
          const mid = c.offsetLeft + c.offsetWidth / 2;
          const d = Math.abs(mid - center);
          if (d < bestD) {
            bestD = d;
            best = i;
          }
        }
        if (best >= 0 && dates[best] !== focus) {
          setFocus(dates[best]);
        }
      });
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("scroll", onScroll);
    };
  }, [dates, focus, setFocus]);

  return (
    <div
      ref={scrollerRef}
      className="corridor flex w-full h-[100dvh] overflow-x-auto overflow-y-hidden"
    >
      {dates.map((d) => (
        <Room
          key={d}
          date={d}
          room={rooms[d]}
          active={d === focus}
          onTap={() => onTapRoom(d)}
        />
      ))}
    </div>
  );
}
