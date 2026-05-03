export type Room = {
  /** Local date key, "YYYY-MM-DD" in user's local time. The room id. */
  date: string;
  /** A single line — the title of the day. Optional but encouraged. */
  line?: string;
  /** The day's photo. Stored as a resized data URL (long edge ~1280, JPEG). */
  photo?: {
    dataUrl: string;
    width: number;
    height: number;
  };
  /** Hue 0–360 used to tint the room. Picked by the user (or auto from photo). */
  hue: number;
  /** Mood scale 0–1: 0 = somber/cool, 1 = warm/bright. Affects lightness. */
  warmth: number;
  /** ISO timestamp of last edit. */
  updatedAt: string;
};
