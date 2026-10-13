// 붙이기(스티커) 정의: 프레임 모양·모션·크기·위치 규칙 (CONSTITUTION §4.10)
import type { Sticker, StickerMotion, StickerShape, StickerSize } from '../types/invitation';

export const MAX_STICKERS_PER_SECTION = 5;

/** 프레임 모양. SVG(viewBox 0 0 100 100)를 CSS mask로 써서 사진을 잘라낸다 */
const SHAPE_SVG: Record<StickerShape, string> = {
  circle: '<circle cx="50" cy="50" r="50"/>',
  heart:
    '<path d="M50 92C22 71 3 54 3 31 3 15 15 4 29 4c9 0 16 5 21 12 5-7 12-12 21-12 14 0 26 11 26 27 0 23-19 40-47 61z"/>',
  star: '<path d="M50 2l14 30 33 4-24 23 6 33-29-16-29 16 6-33L3 36l33-4z"/>',
  clover:
    '<circle cx="50" cy="27" r="23"/><circle cx="73" cy="50" r="23"/><circle cx="50" cy="73" r="23"/><circle cx="27" cy="50" r="23"/><circle cx="50" cy="50" r="18"/>',
};

export const SHAPES: { value: StickerShape; label: string }[] = [
  { value: 'circle', label: '원' },
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

/** 위치는 섹션 안으로 제한: 중심 좌표 4~96% */
export const clampPos = (v: number) => Math.min(96, Math.max(4, Math.round(v * 10) / 10));

export function stickersIn(stickers: Sticker[], sectionId: string): Sticker[] {
  return stickers.filter((s) => s.sectionId === sectionId);
}
