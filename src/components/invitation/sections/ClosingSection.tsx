// 마무리 멘트 (§4.1)
import type { SectionOf } from '../../../types/invitation';
import type { SectionProps } from '../InvitationView';

export function ClosingSection({ doc, section }: SectionProps<SectionOf<'closing'>>) {
  const { body, showNames } = section.data;
  const names = doc.core.hosts.map((h) => `${h.label} ${h.name || ''}`.trim());
  return (
    <section className="inv-block closing">
      <p className="inv-eyebrow">Thank You</p>
      <p className="closing-body">{body}</p>
      {showNames && <p className="closing-names">{names.join(' · ')} 드림</p>}
    </section>
  );
}
