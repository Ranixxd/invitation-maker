export interface HSL {
  h: number; // 0~360
  s: number; // 0~1
  l: number; // 0~1
}

export function hexToRgb(hex: string): [number, number, number] {
  const v = hex.replace('#', '');
  const n = parseInt(v.length === 3 ? v.split('').map((c) => c + c).join('') : v, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((x) => Math.round(Math.max(0, Math.min(255, x))).toString(16).padStart(2, '0')).join('');
}

export function rgbToHsl(r: number, g: number, b: number): HSL {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  return { h: h * 60, s, l };
}

export function hslToHex({ h, s, l }: HSL): string {
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return rgbToHex(f(0) * 255, f(8) * 255, f(4) * 255);
}

export function hexToHsl(hex: string): HSL {
  return rgbToHsl(...hexToRgb(hex));
}

export const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

// ---- 포인트 색 바꾸기 (CONSTITUTION §3.6) ----
// 포인트 바탕 위에는 크림 글자(버튼·예식일 숫자 등)가 올라가므로, 대비가 모자라면 어둡게 맞춘다.

export const isHex = (v: string) => /^#[0-9a-f]{6}$/i.test(v);

/** WCAG 상대 휘도 */
function luminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** 버튼 글자(15px)가 읽히는 대비 */
export const ACCENT_MIN_CONTRAST = 4.5;

/** `on`(크림) 글자가 읽히도록 포인트 색을 필요한 만큼만 어둡게. 이미 충분하면 그대로 */
export function readableAccent(hex: string, on: string, min = ACCENT_MIN_CONTRAST): string {
  if (!isHex(hex) || contrast(hex, on) >= min) return hex;
  const [r, g, b] = hexToRgb(hex);
  for (let k = 0.95; k > 0; k -= 0.05) {
    const next = rgbToHex(r * k, g * k, b * k);
    if (contrast(next, on) >= min) return next;
  }
  return '#151515';
}
