// 청첩장 만들기(발행 정보): 제목·링크 규칙. CONSTITUTION §6.6
import type { InvitationDoc } from '../types/invitation';
import { WEDDING } from '../data/templates';

/** 링크 경로: <현재 사이트 + 배포 경로>/i/<slug> (발행 서버 연동 전까지는 표시용) */
export function linkPrefix(): string {
  const base = import.meta.env.BASE_URL.startsWith('/') ? import.meta.env.BASE_URL : '/';
  return `${window.location.host}${base}i/`;
}

/** 제목을 비워두면 신랑·신부 이름으로 자동 생성 */
export function autoTitle(doc: InvitationDoc): string {
  return WEDDING.title(doc.core.hosts.map((h) => h.name || h.label));
}

export function resolveTitle(doc: InvitationDoc): string {
  return doc.title.trim() || autoTitle(doc);
}

export { defaultSlug, normalizeSlug, validateSlug, SLUG_MIN, SLUG_MAX } from './slug';
