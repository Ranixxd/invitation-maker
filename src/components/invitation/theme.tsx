// 청첩장 테마 토큰·환경 (디자인 시스템 §3.6)
import type { CSSProperties, ReactNode } from 'react';
import type { InvitationDoc } from '../../types/invitation';
import { THEME_PRESETS } from '../../data/templates';
import { designTokens } from '../../data/designSystem';

/** 문서 테마 → CSS 변수(팔레트·모양·글꼴 토큰) */
export function themeVars(doc: InvitationDoc): CSSProperties {
  const p = THEME_PRESETS[doc.theme.preset];
  return {
    ...designTokens(p, doc.theme.accent, doc.theme.family ?? 'basic', doc.theme.shape ?? 'round'),
    '--inv-font': doc.theme.font === 'serif' ? "'Gowun Batang', serif" : "'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
  } as CSSProperties;
}

/** 계열·모양 클래스 (CSS는 `.inv--fam-*`, `.inv--shape-*` 아래 토큰으로 작성) */
export function themeClasses(doc: InvitationDoc): string {
  return `inv--${doc.theme.preset} inv--fam-${doc.theme.family ?? 'basic'} inv--shape-${doc.theme.shape ?? 'round'}`;
}

/** 포털(모달·떠 있는 버튼)은 청첩장 루트 밖에 그려지므로 테마 토큰을 다시 입힌다 */
export function ThemePortal({ doc, children }: { doc: InvitationDoc; children: ReactNode }) {
  return (
    <div className={`inv-portal ${themeClasses(doc)}`} style={themeVars(doc)}>
      {children}
    </div>
  );
}

