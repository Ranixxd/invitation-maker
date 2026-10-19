// 붙이기(스티커) 정의: 프레임 모양·모션·크기·사진 조정·위치 규칙 (CONSTITUTION §4.10)
import type { Sticker, StickerCrop, StickerMotion, StickerShape, StickerSize } from '../types/invitation';

export const MAX_STICKERS_PER_SECTION = 5;

/** 프레임 모양. SVG(viewBox 0 0 100 100)를 CSS mask로 써서 사진을 잘라낸다 */
const SHAPE_SVG: Record<StickerShape, string> = {
  circle: '<circle cx="50" cy="50" r="50"/>',
  heart:
    '<path d="M50 92C22 71 3 54 3 31 3 15 15 4 29 4c9 0 16 5 21 12 5-7 12-12 21-12 14 0 26 11 26 27 0 23-19 40-47 61z"/>',
  star: '<path d="M50 2l14 30 33 4-24 23 6 33-29-16-29 16 6-33L3 36l33-4z"/>',
  // 네잎클로버: 꽃잎 위 2개 · 아래 2개
  clover:
    '<circle cx="29" cy="29" r="27"/><circle cx="71" cy="29" r="27"/><circle cx="29" cy="71" r="27"/><circle cx="71" cy="71" r="27"/><circle cx="50" cy="50" r="20"/>',
  square: '<rect x="0" y="0" width="100" height="100" rx="7"/>',
};

export const SHAPES: { value: StickerShape; label: string }[] = [
  { value: 'circle', label: '원' },
  { value: 'square', label: '네모' },
  { value: 'heart', label: '하트' },
  { value: 'star', label: '별' },
  { value: 'clover', label: '클로버' },
];

export function shapeMask(shape: StickerShape): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${SHAPE_SVG[shape]}</svg>`;
  return `url("data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}")`;
}

export const MOTIONS: { value: StickerMotion; label: string }[] = [
  { value: 'none', label: '없음' },
  { value: 'bounce', label: '뿅뿅' },
  { value: 'float', label: '둥실' },
  { value: 'spin', label: '빙글' },
  { value: 'pulse', label: '두근' },
  { value: 'wiggle', label: '흔들' },
];

/** 크기 = 섹션 너비 대비 비율(%) */
export const SIZES: { value: StickerSize; label: string; pct: number }[] = [
  { value: 'sm', label: '작게', pct: 18 },
  { value: 'md', label: '보통', pct: 26 },
  { value: 'lg', label: '크게', pct: 36 },
];

export const sizePct = (size: StickerSize) => SIZES.find((s) => s.value === size)?.pct ?? 26;

/** 위치: 스티커 중심은 섹션 안(0~100%). 스티커는 최상단 레이어라 섹션 경계에 걸쳐 밖으로 나올 수 있다 */
export const clampPos = (v: number) => Math.min(100, Math.max(0, Math.round(v * 10) / 10));

export function stickersIn(stickers: Sticker[], sectionId: string): Sticker[] {
  return stickers.filter((s) => s.sectionId === sectionId);
}

// ---- 사진 조정 (프레임 안에서 확대·이동) ----

export const DEFAULT_CROP: StickerCrop = { scale: 1, ox: 0, oy: 0 };
export const CROP_SCALE_MIN = 1;
export const CROP_SCALE_MAX = 3;

/** 사진이 프레임(정사각형)을 꽉 채우도록 한 기본 크기(프레임 대비 %) — object-fit: cover와 같은 규칙 */
export function coverSize(aspect: number): { w: number; h: number } {
  const a = aspect > 0 ? aspect : 1;
  return a >= 1 ? { w: 100 * a, h: 100 } : { w: 100, h: 100 / a };
}

/** 사진이 프레임 밖으로 빈틈을 만들지 않도록 이동 범위를 제한 */
export function clampCrop(c: StickerCrop, aspect: number): StickerCrop {
  const scale = Math.min(CROP_SCALE_MAX, Math.max(CROP_SCALE_MIN, c.scale));
  const { w, h } = coverSize(aspect);
  const maxX = Math.max(0, (w * scale) / 2 - 50);
  const maxY = Math.max(0, (h * scale) / 2 - 50);
  const r = (v: number) => Math.round(v * 10) / 10;
  return { scale: r(scale * 100) / 100, ox: r(Math.min(maxX, Math.max(-maxX, c.ox))), oy: r(Math.min(maxY, Math.max(-maxY, c.oy))) };
}
