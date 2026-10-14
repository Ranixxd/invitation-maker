import type { SectionOf } from '../../../types/invitation';
import type { SectionProps } from '../InvitationView';
import { SectionHead } from '../ui';

// 시작 멘트. 신랑·신부와 혼주 소개는 CoupleSection이 담당 (§4.1)
export function GreetingSection({ section }: SectionProps<SectionOf<'greeting'>>) {
  const { title, body } = section.data;
  return (
    <section className="inv-block greeting">
      <SectionHead title={title} />
      <p className="ui-body">{body}</p>
    </section>
  );
}
