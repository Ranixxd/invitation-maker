// 쉽게 시작 v1 (규칙 기반). CONSTITUTION §5
import type { ImageAsset, InvitationDoc, Theme, ThemePreset, Venue } from '../types/invitation';
import { createDoc, THEME_PRESETS, WEDDING } from '../data/templates';
import { clamp, hexToHsl, hslToHex } from './color';

export interface QuickStartInput {
  images: ImageAsset[];
  names: string[];
  datetime: string;
  venue: Pick<Venue, 'name' | 'address'>;
}

/** §5.3 대표 사진 점수 */
export function heroScore(img: ImageAsset, index: number): number {
  const a = img.aspect;
  const shape = a >= 0.6 && a <= 0.85 ? 1 : a < 0.95 ? 0.5 : a <= 1.05 ? 0.3 : 0;
  const light = Math.max(0, 1 - Math.abs(img.luminance - 0.55) * 1.5);
  const order = index === 0 ? 0.3 : 0;
  return shape + light + order;
}

export function pickHero(images: ImageAsset[]): ImageAsset | null {
  let best: ImageAsset | null = null;
  let bestScore = -Infinity;
  images.forEach((img, i) => {
    const s = heroScore(img, i);
    if (s > bestScore) {
      best = img;
      bestScore = s;
    }
  });
  return best;
}

/** §5.5 테마 추천 */
export function recommendTheme(hero: ImageAsset | null): Theme {
  if (!hero) return { preset: 'classic', accent: THEME_PRESETS.classic.accent, font: 'serif' };
  const { h, s } = hexToHsl(hero.color);
  let preset: ThemePreset;
  if (s < 0.15) preset = 'modern';
  else if ((h >= 330 || h <= 30) && hero.luminance > 0.55) preset = 'romantic';
  else preset = 'classic';
  return { preset, accent: accentFrom(hero.color, preset), font: THEME_PRESETS[preset].font };
}

/** 사진 색 → 흰 배경 대비 확보된 포인트 색 */
export function accentFrom(color: string, preset: ThemePreset): string {
  const { h, s, l } = hexToHsl(color);
  if (s < 0.15) return THEME_PRESETS[preset].accent;
  return hslToHex({ h, s: clamp(s, 0.35, 0.55), l: clamp(l, 0.38, 0.45) });
}

export function buildFromQuickStart(input: QuickStartInput): InvitationDoc {
  const doc = createDoc();

  doc.core.hosts.forEach((h, i) => {
    const name = input.names[i]?.trim();
    if (name) h.name = name;
  });
  if (input.datetime) doc.core.datetime = input.datetime;
  doc.core.venue = { ...doc.core.venue, ...input.venue };
  doc.title = WEDDING.title(doc.core.hosts.map((h) => h.name));

  for (const img of input.images) doc.images[img.id] = img;

  const hero = pickHero(input.images);
  const rest = input.images.filter((i) => i !== hero);
  doc.theme = recommendTheme(hero);

  doc.sections = doc.sections.map((s) => {
    switch (s.type) {
      case 'hero':
        return {
          ...s,
          data: { ...s.data, imageId: hero?.id ?? null, layout: hero && hero.aspect < 1 ? 'full' : 'frame' },
        };
      case 'gallery':
        return {
          ...s,
          enabled: rest.length > 0,
          data: { ...s.data, imageIds: rest.map((i) => i.id), layout: rest.length >= 6 ? 'grid' : 'slide' },
        };
      case 'account':
        return {
          ...s,
          data: {
            ...s.data,
            accounts: s.data.accounts.map((a) => {
              const host = doc.core.hosts.find((h) => h.id === a.hostId);
              return host && a.relation === host.label ? { ...a, holder: host.name } : a;
            }),
          },
        };
      default:
        return s;
    }
  });
  return doc;
}

/** 쉽게 시작 결과 화면에서 프리셋만 바꿔볼 때 */
export function applyPreset(doc: InvitationDoc, preset: ThemePreset): InvitationDoc {
  const heroId = doc.sections.find((s) => s.type === 'hero')?.data;
  const hero = heroId && 'imageId' in heroId && heroId.imageId ? doc.images[heroId.imageId] : null;
  return {
    ...doc,
    theme: {
      preset,
      font: THEME_PRESETS[preset].font,
      accent: hero ? accentFrom(hero.color, preset) : THEME_PRESETS[preset].accent,
    },
  };
}
