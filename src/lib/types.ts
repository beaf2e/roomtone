export type Room = {
  /** Local date key, "YYYY-MM-DD" in user's local time. The room id. */
  date: string;
  /** A single line — the title of the day. Optional but encouraged. */
  line?: string;
  /** The day's track. */
  song?: {
    title: string;
    artist?: string;
    /** Apple/iTunes track id, when picked from search. */
    trackId?: number;
    /** 30s m4a preview URL — playable in <audio>. */
    previewUrl?: string;
    /** Square artwork URL (highest the API returns, 600x600). */
    artworkUrl?: string;
    /** Deep link to the song on Apple Music (for "전체 듣기" exit). */
    trackViewUrl?: string;
  };
  /** Hue 0–360 used to tint the room. Picked by the user (or auto from song). */
  hue: number;
  /** Mood scale 0–1: 0 = somber/cool, 1 = warm/bright. Affects lightness. */
  warmth: number;
  /** ISO timestamp of last edit. */
  updatedAt: string;
};
