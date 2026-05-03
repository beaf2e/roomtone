// Take a user-picked image File, resize so the long edge ≤ maxEdge, encode as
// JPEG data URL. Uses createImageBitmap with imageOrientation:"from-image" so
// EXIF rotation (iPhone photos) is applied automatically — no exif library.

export type ResizedPhoto = {
  dataUrl: string;
  width: number;
  height: number;
};

const MAX_EDGE_DEFAULT = 1280;
const JPEG_QUALITY_DEFAULT = 0.82;

export async function fileToResizedPhoto(
  file: File,
  maxEdge: number = MAX_EDGE_DEFAULT,
  quality: number = JPEG_QUALITY_DEFAULT,
): Promise<ResizedPhoto> {
  if (!file.type.startsWith("image/")) {
    throw new Error("이미지 파일이 아닙니다");
  }
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const { width: srcW, height: srcH } = bitmap;
  const scale = Math.min(1, maxEdge / Math.max(srcW, srcH));
  const w = Math.round(srcW * scale);
  const h = Math.round(srcH * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas 사용 불가");
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close?.();
  const dataUrl = canvas.toDataURL("image/jpeg", quality);
  return { dataUrl, width: w, height: h };
}
