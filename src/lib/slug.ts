// 링크 경로(slug) 규칙. 의존성 없음 (CONSTITUTION §6.6)

/** 기본 링크: 예식일 + 랜덤 4자 (예: 20270116-k3x9) */
export function defaultSlug(datetime: string): string {
  const date = datetime.slice(0, 10).replace(/-/g, '') || 'wedding';
  const rand = Math.random().toString(36).slice(2, 6).padEnd(4, '0');
  return `${date}-${rand}`;
}

export const SLUG_MIN = 3;
export const SLUG_MAX = 40;

/** 입력 중 정규화: 소문자, 공백→하이픈, 허용 문자(a-z 0-9 -)만, 연속 하이픈은 하나로 */
export function normalizeSlug(v: string): string {
  return v
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-{2,}/g, '-') // 'a & b' → 'a-b'
    .slice(0, SLUG_MAX);
}

/** 오류 메시지, 문제 없으면 null */
export function validateSlug(slug: string): string | null {
  if (slug.length < SLUG_MIN) return `링크는 ${SLUG_MIN}자 이상이어야 해요`;
  if (slug.startsWith('-') || slug.endsWith('-')) return '링크는 하이픈(-)으로 시작하거나 끝날 수 없어요';
  if (slug.includes('--')) return '하이픈(-)을 연속으로 쓸 수 없어요';
  return null;
}
