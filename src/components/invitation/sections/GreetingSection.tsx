import type { SectionOf } from '../../../types/invitation';
import type { SectionProps } from '../InvitationView';

// 시작 멘트. 신랑·신부와 혼주 소개는 CoupleSection이 담당 (§4.1)
export function GreetingSection({ section }: SectionProps<SectionOf<'greeting'>>) {
  const { title, body } = section.data;
  return (
    <section className="inv-block greeting">
      <p className="inv-eyebrow">INVITATION</p>
      <h2 className="inv-title">{title}</h2>
      <p className="greeting-body">{body}</p>
    </section>
  );
}
