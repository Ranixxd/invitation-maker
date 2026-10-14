// 브랜드 소개: 항상 마지막, 순서 변경·숨김·편집 불가 (§4.9)
// 홍보 배너가 들어갈 자리. 배너가 준비될 때까지 자리 표시 문구만 둔다
import type { SectionOf } from '../../../types/invitation';
import type { SectionProps } from '../InvitationView';

export function BrandSection(_props: SectionProps<SectionOf<'brand'>>) {
  return (
    <section className="inv-brand">
      <p className="inv-brand-copy">홍보 배너 영역</p>
    </section>
  );
}
