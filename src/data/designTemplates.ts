// 디자인 템플릿 정의 (CONSTITUTION §3.5). 템플릿 = 테마 + 레이아웃 + 헤드라인의 묶음
import type { CalendarStyle, GalleryLayout, HeroLayout, ImageAsset, InvitationDoc, ThemeFamily, ThemePreset, ThemeShape } from '../types/invitation';
import { THEME_PRESETS } from './templates';

export interface DesignTemplate {
  id: string;
  name: string;
  tagline: string;
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
    // 1번 테마: 모던 모노 — 흑백 사진, 버건디 포인트, 매거진 같은 구성 (§3.5, PRD-0016)
    id: 'modern-mono',
    name: '모던 모노',
    tagline: '레드와 크림, 두 가지 색으로 만든 포스터 같은 구성',
    preset: 'mono',
    family: 'editorial',
    shape: 'round',
    font: 'sans',
    accent: THEME_PRESETS.mono.accent,
    heroLayout: 'poster',
    galleryLayout: 'grid',
    calendarStyle: 'strip',
    headline: '',
    sample: ['#d6d6d6', '#262626'],
  },
  {
    id: 'classic-frame',
    name: '클래식 액자',
    tagline: '날짜를 크게, 사진은 액자처럼',
    preset: 'classic',
    font: 'serif',
    accent: '#7a6a55',
    heroLayout: 'frame',
    galleryLayout: 'slide',
    headline: 'Save the date',
    sample: ['#e8dccb', '#a28c6e'],
  },
  {
    id: 'modern-full',
    name: '모던 시네마',
    tagline: '흑백 사진에 어울리는 또렷한 고딕',
    preset: 'modern',
    font: 'sans',
    accent: '#2f2f33',
    heroLayout: 'full',
    galleryLayout: 'grid',
    headline: 'The wedding of',
    sample: ['#bdbdc2', '#2a2a2e'],
  },
  {
    id: 'modern-frame',
    name: '모던 미니멀',
    tagline: '여백을 살린 깔끔한 구성',
    preset: 'modern',
    font: 'sans',
    accent: '#3d5a80',
    heroLayout: 'frame',
    galleryLayout: 'slide',
    headline: 'Wedding invitation',
    sample: ['#cfd8e3', '#5b7088'],
  },
  {
    id: 'romantic-arch',
    name: '로맨틱 아치',
    tagline: '아치형 사진과 부드러운 핑크',
    preset: 'romantic',
    font: 'serif',
    accent: THEME_PRESETS.romantic.accent,
    heroLayout: 'arch',
    galleryLayout: 'grid',
    headline: 'Our wedding day',
    sample: ['#f6d6d8', '#c98a96'],
  },
  {
    id: 'romantic-full',
    name: '로맨틱 블룸',
    tagline: '화사한 사진을 위한 풀스크린',
    preset: 'romantic',
    font: 'serif',
    accent: '#a85f74',
    heroLayout: 'full',
    galleryLayout: 'slide',
    headline: 'Two hearts, one love',
    sample: ['#f3c9cf', '#8e5466'],
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
