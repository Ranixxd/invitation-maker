import type { HostSide, Parent, SectionOf } from '../../../types/invitation';
import type { SectionProps } from '../InvitationView';

const parentName = (p: Parent) => (p.name ? `${p.deceased ? '故 ' : ''}${p.name}` : '');

function relationWord(h: HostSide) {
  if (h.label === '신랑') return '아들';
  if (h.label === '신부') return '딸';
  return '';
}

export function GreetingSection({ doc, section }: SectionProps<SectionOf<'greeting'>>) {
  const { title, body, showSignature } = section.data;
  return (
    <section className="inv-block greeting">
      <p className="inv-eyebrow">INVITATION</p>
      <h2 className="inv-title">{title}</h2>
      <p className="greeting-body">{body}</p>
      {showSignature && (
        <div className="greeting-sign">
          {doc.core.hosts.map((h) => {
            const parents = [parentName(h.father), parentName(h.mother)].filter(Boolean).join(' · ');
            const rel = relationWord(h);
            return (
              <p key={h.id}>
                {parents && (
                  <>
                    <span className="sign-parents">{parents}</span>
                    <span className="sign-rel">{rel ? `의 ${rel}` : '의'}</span>{' '}
                  </>
                )}
                <strong>{h.name || h.label}</strong>
              </p>
            );
          })}
        </div>
      )}
    </section>
  );
}
