// Pull a Spotify track id out of any of the common share-link forms:
//   https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT
//   https://open.spotify.com/intl-ko/track/4cOdK2wGLETKBW3PvgPWqT?si=...
//   spotify:track:4cOdK2wGLETKBW3PvgPWqT
const TRACK_RE = /(?:open\.spotify\.com\/(?:[a-z-]+\/)?track\/|spotify:track:)([A-Za-z0-9]{22})/;

export function extractSpotifyTrackId(input: string): string | null {
  const m = input.trim().match(TRACK_RE);
  return m ? m[1] : null;
}

export function spotifyEmbedUrl(trackId: string): string {
  return `https://open.spotify.com/embed/track/${trackId}?theme=0`;
}

/** External search URL — opens Spotify's web search prefilled, so users can
 *  copy the track URL back into roomtone. */
export function spotifySearchUrl(query: string): string {
  return `https://open.spotify.com/search/${encodeURIComponent(query)}`;
}
