// 브랜드 소개: 항상 마지막, 순서 변경·숨김·편집 불가 (§4.9)
import type { SectionOf } from '../../../types/invitation';
import type { SectionProps } from '../InvitationView';

export function BrandSection({ mode }: SectionProps<SectionOf<'brand'>>) {
  const href = `${import.meta.env.BASE_URL}templates`;
  return (
    <section className="inv-brand">
      <p className="inv-brand-logo">청첩장 메이커</p>
      <p className="inv-brand-copy">사진 몇 장이면 완성되는 모바일 청첩장</p>
      {/* 편집기 미리보기에서는 링크로 이동하지 않는다 */}
      {mode === 'view' ? (
        <a className="inv-brand-link" href={href}>
          나도 청첩장 만들기
        </a>
      ) : (
        <span className="inv-brand-link">나도 청첩장 만들기</span>
      )}
    </section>
  );
}
