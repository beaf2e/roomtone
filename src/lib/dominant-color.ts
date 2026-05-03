// Compute a single dominant hue + warmth from an artwork image.
// Apple's mzstatic.com CDN sends `access-control-allow-origin: *`, so canvas
// readback works without tainting. Skips near-greyscale / near-black / near-white
// pixels so a black album cover with one tiny red logo still picks red.

export type Tone = { hue: number; warmth: number };

export async function toneFromImage(url: string): Promise<Tone | null> {
  if (typeof window === "undefined") return null;
  return new Promise<Tone | null>((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.referrerPolicy = "no-referrer";
    const finish = (t: Tone | null) => resolve(t);
    img.onload = () => {
      try {
        const W = 36;
        const H = 36;
        const c = document.createElement("canvas");
        c.width = W;
        c.height = H;
        const ctx = c.getContext("2d");
        if (!ctx) return finish(null);
        ctx.drawImage(img, 0, 0, W, H);
        const data = ctx.getImageData(0, 0, W, H).data;
        let R = 0,
          G = 0,
          B = 0,
          n = 0;
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i],
            g = data[i + 1],
            b = data[i + 2];
          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          const sat = max === 0 ? 0 : (max - min) / max;
          if (sat < 0.18) continue;
          if (max < 28 || min > 232) continue;
          R += r;
          G += g;
          B += b;
          n++;
        }
        if (n < 4) {
          R = G = B = 0;
          n = 0;
          for (let i = 0; i < data.length; i += 4) {
            R += data[i];
            G += data[i + 1];
            B += data[i + 2];
            n++;
          }
        }
        if (n === 0) return finish(null);
        R /= n;
        G /= n;
        B /= n;
        const r = R / 255,
          g = G / 255,
          b = B / 255;
        const max = Math.max(r, g, b),
          min = Math.min(r, g, b);
        const l = (max + min) / 2;
        let h = 0;
        if (max !== min) {
          const d = max - min;
          if (max === r) h = ((g - b) / d) % 6;
          else if (max === g) h = (b - r) / d + 2;
          else h = (r - g) / d + 4;
          h *= 60;
          if (h < 0) h += 360;
        }
        // Warmth: peak at orange (≈30°), trough at azure (≈210°).
        const offset = ((h - 30 + 540) % 360) - 180; // -180..180, 0 at 30°
        const warmthRaw = 0.5 + 0.5 * Math.cos((offset / 180) * Math.PI);
        const warmth = Math.max(0.2, Math.min(0.9, warmthRaw * (0.6 + l * 0.6)));
        finish({ hue: Math.round(h), warmth: Number(warmth.toFixed(2)) });
      } catch {
        finish(null);
      }
    };
    img.onerror = () => finish(null);
    img.src = url;
  });
}
