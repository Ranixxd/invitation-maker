// 디자인 템플릿 정의 (CONSTITUTION §3.5). 템플릿 = 테마 + 레이아웃 + 헤드라인의 묶음
import type { CalendarStyle, GalleryLayout, HeroLayout, ImageAsset, InvitationDoc, ThemeFamily, ThemePreset, ThemeShape } from '../types/invitation';
import { THEME_PRESETS } from './templates';

export interface DesignTemplate {
  id: string;
  name: string;
  /** 색 구성(팔레트) */
  preset: ThemePreset;
  /** 스타일 계열 · 모양 (디자인 시스템 §3.6, 없으면 basic · round) */
  family?: ThemeFamily;
  shape?: ThemeShape;
  font: 'serif' | 'sans';
  accent: string;
  heroLayout: HeroLayout;
  galleryLayout: GalleryLayout;
  /** 예식 일자 표시 방식 (없으면 월 달력) */
  calendarStyle?: CalendarStyle;
  headline: string;
  /** 템플릿 카드 미리보기용 샘플 사진 색 [위, 아래] */
  sample: [string, string];
}

export const DESIGN_TEMPLATES: DesignTemplate[] = [
  {
    // 1번 테마(작업명 모던 모노) — 폴라로이드 사진·필기체, 레드 포인트 (§3.5, PRD-0018)
    id: 'modern-mono',
    name: '템플릿1', // 이름은 나중에 정한다
    preset: 'mono',
    family: 'editorial',
    shape: 'round',
    font: 'sans',
    accent: THEME_PRESETS.mono.accent,
    heroLayout: 'polaroid',
    galleryLayout: 'grid',
    calendarStyle: 'strip',
    headline: '함께 걸어온 시간 끝에\n두 사람이 결혼합니다',
    sample: ['#d6d6d6', '#262626'],
  },
  {
    // 2번 테마(작업명 크림 티켓) — 사진 위 명조 이름·꽃잎, 올리브 띠·플레이어, 종이 티켓 달력, 올리브 원톤 (§3.5, PRD-0021)
    id: 'cream-ticket',
    name: '템플릿2', // 이름은 나중에 정한다
    preset: 'cream',
    family: 'ticket',
    shape: 'round',
    font: 'sans',
    accent: THEME_PRESETS.cream.accent,
    heroLayout: 'cover',
    galleryLayout: 'grid',
    calendarStyle: 'ticket',
    headline: "WE'RE GETTING MARRIED",
    sample: ['#3a3f2a', '#f7eba0'],
  },
];

export const DEFAULT_TEMPLATE_ID = DESIGN_TEMPLATES[0].id;

export function getTemplate(id: string | null | undefined): DesignTemplate | undefined {
  return DESIGN_TEMPLATES.find((t) => t.id === id);
}

/** 템플릿의 디자인 값을 문서에 덮어쓴다. 내용(이름·날짜·사진·문구 본문)은 건드리지 않는다. */
export function applyTemplate(doc: InvitationDoc, t: DesignTemplate): InvitationDoc {
  return {
    ...doc,
    templateId: t.id,
    theme: { preset: t.preset, font: t.font, accent: t.accent, family: t.family ?? 'basic', shape: t.shape ?? 'round' },
    sections: doc.sections.map((s) => {
      if (s.type === 'hero') return { ...s, data: { ...s.data, layout: t.heroLayout, headline: t.headline } };
      if (s.type === 'gallery') return { ...s, data: { ...s.data, layout: t.galleryLayout } };
      if (s.type === 'calendar') return { ...s, data: { ...s.data, style: t.calendarStyle ?? 'month' } };
      return s;
    }),
  };
}

/** 샘플 사진 (실사진 대신 템플릿 색의 그라데이션 SVG). variant 0 = 대표 사진(반지 모티프) */
export function samplePhoto(t: DesignTemplate, variant = 0): ImageAsset {
  const [top, bottom] = t.sample;
  const angle = [0.4, 1, 0, 0.7, 0.2, 0.9, 0.5][variant % 7];
  const light = [0.3, 0.7, 0.5, 0.2, 0.8, 0.4, 0.6][variant % 7];
  const motif =
    variant === 0
      ? `<circle cx="255" cy="430" r="90" fill="none" stroke="#fff" stroke-opacity="0.7" stroke-width="10"/>
<circle cx="345" cy="430" r="90" fill="none" stroke="#fff" stroke-opacity="0.7" stroke-width="10"/>`
      : `<circle cx="${150 + ((variant * 97) % 300)}" cy="${250 + ((variant * 131) % 300)}" r="${60 + variant * 12}" fill="#fff" fill-opacity="0.18"/>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800">
<defs><linearGradient id="g" x1="0" y1="0" x2="${angle}" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bottom}"/></linearGradient>
<radialGradient id="l" cx="${light}" cy="0.25" r="0.6"><stop offset="0" stop-color="#fff" stop-opacity="0.55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>
<rect width="600" height="800" fill="url(#g)"/><rect width="600" height="800" fill="url(#l)"/>${motif}</svg>`;
  return {
    id: `sample_${t.id}_${variant}`,
    src: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`,
    width: 600,
    height: 800,
    aspect: 0.75,
    luminance: 0.6,
    color: bottom,
  };
}
