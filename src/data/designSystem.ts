// 청첩장 템플릿 디자인 시스템 (CONSTITUTION §3.6)
// 템플릿 = 스타일 계열(family) + 색 구성(palette) + 모양(shape)
//  - family: 레이아웃·타이포·장식 규칙. CSS `.inv--fam-<family>` 아래에 토큰만 써서 작성한다(색·라운드 값을 직접 쓰지 않음)
//  - palette: 색 토큰. 같은 계열에 팔레트만 바꿔 새 템플릿을 만든다
//  - shape: 라운드 토큰. round(알약·둥근 카드) / square(각진)
import type { CSSProperties } from 'react';
import type { ThemeFamily, ThemeShape } from '../types/invitation';

/** 색 토큰. 모든 계열 CSS는 이 이름(--inv-*)으로만 색을 쓴다 */
export interface Palette {
  label: string;
  bg: string; // 바탕
  surface: string; // 카드·옅은 면
  text: string; // 본문·제목
  muted: string; // 보조 글자
  accent: string; // 포인트(하트·숫자·서명)
  band: string; // 짙은 띠 섹션 바탕(예: 오시는 길)
  onBand: string; // 띠 위 카드 바탕
  paper: string; // 방명록 쪽지 종이
  board: string; // 방명록 보드 바탕
}

/** 라운드 토큰 */
export interface ShapeTokens {
  control: string; // 버튼·칩·한 줄 입력칸
  card: string; // 카드·여러 줄 입력칸·모달
  paper: string; // 쪽지 종이
  media: string; // 사진(갤러리 등)
}

export const SHAPES: Record<ThemeShape, ShapeTokens> = {
  round: { control: '8px', card: '20px', paper: '8px', media: '0px' },
  square: { control: '0px', card: '0px', paper: '0px', media: '0px' },
};

export const FAMILY_LABELS: Record<ThemeFamily, string> = {
  basic: '기본',
  editorial: '에디토리얼',
  ticket: '티켓',
};

/** 계열별 글꼴 토큰 */
const FAMILY_FONTS: Record<ThemeFamily, { title: string; display: string }> = {
  basic: { title: 'inherit', display: 'inherit' },
  // 에디토리얼: 숫자·장식 문구까지 모두 고딕(Pretendard)
  editorial: { title: "'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, sans-serif", display: "'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, sans-serif" },
  // 티켓: 본문 고딕 + 제목·이름·숫자 명조(고운바탕)
  ticket: { title: "'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, sans-serif", display: "'Gowun Batang', serif" },
};

/** 팔레트·모양·계열 → CSS 변수 */
export function designTokens(palette: Palette, accent: string, family: ThemeFamily, shape: ThemeShape): CSSProperties {
  const sh = SHAPES[shape];
  const f = FAMILY_FONTS[family];
  return {
    '--inv-bg': palette.bg,
    '--inv-surface': palette.surface,
    '--inv-text': palette.text,
    '--inv-muted': palette.muted,
    '--inv-accent': accent,
    '--inv-band': palette.band,
    '--inv-on-band': palette.onBand,
    '--inv-paper': palette.paper,
    '--inv-board': palette.board,
    '--inv-r-control': sh.control,
    '--inv-r-card': sh.card,
    '--inv-r-paper': sh.paper,
    '--inv-r-media': sh.media,
    '--inv-font-title': f.title,
    '--inv-font-display': f.display,
  } as CSSProperties;
}
