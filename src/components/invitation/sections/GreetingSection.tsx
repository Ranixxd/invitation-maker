import type { SectionOf } from '../../../types/invitation';
import type { SectionProps } from '../InvitationView';
import { SectionHead } from '../ui';

// 시작 멘트. 신랑·신부와 혼주 소개는 CoupleSection이 담당하고, 바로 뒤에 오면 한 섹션처럼 이어 보인다 (§4.1)
export function GreetingSection({ section }: SectionProps<SectionOf<'greeting'>>) {
  const { title, body } = section.data;
  return (
    <section className="inv-block greeting">
      <SectionHead heart title={title} />
      <p className="ui-body">{body}</p>
    </section>
  );
}
