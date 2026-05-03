// Pull a YouTube video id out of any of the common share-link forms:
//   https://www.youtube.com/watch?v=dQw4w9WgXcQ
//   https://youtu.be/dQw4w9WgXcQ?si=...
//   https://www.youtube.com/shorts/dQw4w9WgXcQ
//   https://www.youtube.com/embed/dQw4w9WgXcQ
//   https://music.youtube.com/watch?v=dQw4w9WgXcQ&list=...
const VIDEO_RE =
  /(?:youtube(?:-nocookie)?\.com\/(?:watch\?(?:[^&]*&)*v=|embed\/|shorts\/|v\/|live\/)|youtu\.be\/|music\.youtube\.com\/watch\?(?:[^&]*&)*v=)([A-Za-z0-9_-]{11})/;

export function extractYoutubeId(input: string): string | null {
  const m = input.trim().match(VIDEO_RE);
  return m ? m[1] : null;
}

export function youtubeEmbedUrl(id: string, opts: { autoplay?: boolean } = {}): string {
  const p = new URLSearchParams({
    rel: "0",
    modestbranding: "1",
    playsinline: "1",
    autoplay: opts.autoplay ? "1" : "0",
  });
  return `https://www.youtube-nocookie.com/embed/${id}?${p.toString()}`;
}

/** Open YouTube's web search prefilled, so users can copy a video URL back. */
export function youtubeSearchUrl(query: string): string {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
}

/** Square thumbnail (used as a tiny preview before the iframe loads). */
export function youtubeThumb(id: string): string {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}
