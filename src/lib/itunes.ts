// iTunes Search API — no auth, CORS-friendly, returns 30s previewUrl + artwork.
// Doc: https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/iTuneSearchAPI/

export type ItunesTrack = {
  trackId: number;
  trackName: string;
  artistName: string;
  collectionName?: string;
  previewUrl?: string;
  artworkUrl100?: string;
  trackViewUrl?: string;
};

const ENDPOINT = "https://itunes.apple.com/search";

/** Upgrade Apple's 100x100 thumbnail URL to a higher-res square. */
export function bigArtwork(url: string | undefined, size = 600): string | undefined {
  if (!url) return undefined;
  return url.replace(/\/\d+x\d+bb\.jpg$/, `/${size}x${size}bb.jpg`);
}

export async function searchTracks(
  query: string,
  signal?: AbortSignal,
): Promise<ItunesTrack[]> {
  const term = query.trim();
  if (!term) return [];
  const url = new URL(ENDPOINT);
  url.searchParams.set("term", term);
  url.searchParams.set("entity", "song");
  url.searchParams.set("limit", "8");
  url.searchParams.set("country", "KR");
  const res = await fetch(url.toString(), { signal });
  if (!res.ok) throw new Error(`iTunes search failed: ${res.status}`);
  const json = (await res.json()) as { results?: ItunesTrack[] };
  return (json.results ?? []).filter((t) => t.previewUrl);
}
