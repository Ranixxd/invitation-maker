// 이미지 재인코딩 + 분석. CONSTITUTION §5.2, §7.2
import type { ImageAsset } from '../types/invitation';
import { rgbToHex, rgbToHsl } from './color';
import { uid } from './id';

export const IMAGE_MAX_EDGE = 1600;
export const IMAGE_QUALITY = 0.82;
export const MAX_UPLOAD_PER_BATCH = 20;
export const MAX_IMAGES_PER_DOC = 30;
/** 갤러리 사진 최대 장수 (§4.6) */
export const GALLERY_MAX = 9;

async function decode(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if ('createImageBitmap' in window) {
    try {
      return await createImageBitmap(file);
    } catch {
      /* 일부 형식은 <img>로 폴백 */
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function analyze(source: CanvasImageSource): { luminance: number; color: string } {
  const size = 32;
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const ctx = c.getContext('2d', { willReadFrequently: true })!;
  ctx.drawImage(source, 0, 0, size, size);
  const { data } = ctx.getImageData(0, 0, size, size);

  let lumSum = 0;
  let r = 0, g = 0, b = 0, wSum = 0;
  let ar = 0, ag = 0, ab = 0;
  const px = data.length / 4;
  for (let i = 0; i < data.length; i += 4) {
    const R = data[i], G = data[i + 1], B = data[i + 2];
    lumSum += (0.2126 * R + 0.7152 * G + 0.0722 * B) / 255;
    ar += R; ag += G; ab += B;
    // 채도 가중 평균: 색이 있는 픽셀이 대표색을 결정
    const { s, l } = rgbToHsl(R, G, B);
    const w = s * (1 - Math.abs(l - 0.5) * 2);
    r += R * w; g += G * w; b += B * w; wSum += w;
  }
  const color = wSum > px * 0.05 ? rgbToHex(r / wSum, g / wSum, b / wSum) : rgbToHex(ar / px, ag / px, ab / px);
  return { luminance: lumSum / px, color };
}

export async function fileToAsset(file: File): Promise<ImageAsset> {
  const src = await decode(file);
  const w0 = src.width;
  const h0 = src.height;
  const scale = Math.min(1, IMAGE_MAX_EDGE / Math.max(w0, h0));
  const width = Math.round(w0 * scale);
  const height = Math.round(h0 * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(src, 0, 0, width, height);
  if ('close' in src) src.close();

  const { luminance, color } = analyze(canvas);
  return {
    id: uid('img'),
    src: canvas.toDataURL('image/jpeg', IMAGE_QUALITY),
    width,
    height,
    aspect: width / height,
    luminance,
    color,
  };
}

export async function filesToAssets(files: FileList | File[], limit = MAX_UPLOAD_PER_BATCH): Promise<ImageAsset[]> {
  const list = Array.from(files)
    .filter((f) => f.type.startsWith('image/'))
    .slice(0, limit);
  const out: ImageAsset[] = [];
  for (const f of list) {
    try {
      out.push(await fileToAsset(f));
    } catch (e) {
      console.warn('이미지 처리 실패', f.name, e);
    }
  }
  return out;
}
