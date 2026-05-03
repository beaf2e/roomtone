// Build the room's ambient gradient from hue (0–360) and warmth (0–1).
// Stays inside dark Apple-tone palette: low lightness, low-mid saturation.
// Two stops drift slowly via the .drift CSS animation.

export type RoomTone = {
  bg: string;       // base body fallback
  gradient: string; // CSS gradient
  glowA: string;    // accent stop A
  glowB: string;    // accent stop B
  ink: string;      // foreground tint hint (rgba)
};

export function roomTone(hue: number, warmth: number): RoomTone {
  const h = ((hue % 360) + 360) % 360;
  const w = Math.max(0, Math.min(1, warmth));
  // Lightness: dark base. Warmer days push slightly brighter.
  const lA = 18 + w * 14;       // 18–32
  const lB = 8 + w * 8;         // 8–16
  const sA = 38 + w * 22;       // 38–60
  const sB = 22 + w * 14;       // 22–36

  const a = `hsl(${h}, ${sA}%, ${lA}%)`;
  const b = `hsl(${(h + 32) % 360}, ${sB}%, ${lB}%)`;

  return {
    bg: `hsl(${h}, ${sB}%, ${lB - 4}%)`,
    gradient: `radial-gradient(circle at 30% 25%, ${a} 0%, transparent 55%), radial-gradient(circle at 75% 80%, ${b} 0%, transparent 60%), #08090b`,
    glowA: a,
    glowB: b,
    ink: `hsla(${h}, 30%, 92%, 0.94)`,
  };
}

export const DEFAULT_HUE = 230; // cool blue
export const DEFAULT_WARMTH = 0.5;
