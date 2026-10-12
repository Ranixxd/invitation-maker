// 디자인 템플릿 정의 (CONSTITUTION §3.5). 템플릿 = 테마 + 레이아웃 + 헤드라인의 묶음
import type { GalleryLayout, HeroLayout, ImageAsset, InvitationDoc, ThemePreset } from '../types/invitation';
import { THEME_PRESETS } from './templates';

export interface DesignTemplate {
  id: string;
  name: string;
  tagline: string;
  preset: ThemePreset;
  font: 'serif' | 'sans';
  accent: string;
  heroLayout: HeroLayout;
  galleryLayout: GalleryLayout;
  headline: string;
  /** 템플릿 카드 미리보기용 샘플 사진 색 [위, 아래] */
  sample: [string, string];
}

export const DESIGN_TEMPLATES: DesignTemplate[] = [
  {
    id: 'classic-full',
    name: '클래식 풀스크린',
    tagline: '사진을 화면 가득, 단정한 명조',
    preset: 'classic',
    font: 'serif',
    accent: THEME_PRESETS.classic.accent,
    heroLayout: 'full',
    galleryLayout: 'grid',
    headline: 'We are getting married',
    sample: ['#d8c3a5', '#6b5640'],
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
    theme: { preset: t.preset, font: t.font, accent: t.accent },
    sections: doc.sections.map((s) => {
      if (s.type === 'hero') return { ...s, data: { ...s.data, layout: t.heroLayout, headline: t.headline } };
      if (s.type === 'gallery') return { ...s, data: { ...s.data, layout: t.galleryLayout } };
      return s;
    }),
  };
}

/** 템플릿 카드용 샘플 대표 사진 (실사진 대신 부드러운 그라데이션 SVG) */
export function sampleHeroImage(t: DesignTemplate): ImageAsset {
  const [top, bottom] = t.sample;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800">
<defs><linearGradient id="g" x1="0" y1="0" x2="0.4" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bottom}"/></linearGradient>
<radialGradient id="l" cx="0.3" cy="0.25" r="0.6"><stop offset="0" stop-color="#fff" stop-opacity="0.55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>
<rect width="600" height="800" fill="url(#g)"/><rect width="600" height="800" fill="url(#l)"/>
<circle cx="255" cy="430" r="90" fill="none" stroke="#fff" stroke-opacity="0.7" stroke-width="10"/>
<circle cx="345" cy="430" r="90" fill="none" stroke="#fff" stroke-opacity="0.7" stroke-width="10"/></svg>`;
  return {
    id: `sample_${t.id}`,
    src: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`,
    width: 600,
    height: 800,
    aspect: 0.75,
    luminance: 0.6,
    color: bottom,
  };
}
