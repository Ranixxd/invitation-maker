// 신랑·신부 소개. 혼주(부모님)는 작게 (§4.1)
import type { HostSide, Parent, SectionOf } from '../../../types/invitation';
import type { SectionProps } from '../InvitationView';

const parentName = (p: Parent) => (p.name ? `${p.deceased ? '故 ' : ''}${p.name}` : '');
const childWord = (h: HostSide) => (h.label === '신랑' ? '아들' : h.label === '신부' ? '딸' : '');

function Person({ host, showParents }: { host: HostSide; showParents: boolean }) {
  const parents = [parentName(host.father), parentName(host.mother)].filter(Boolean).join(' · ');
  return (
    <div className="couple-person">
      <span className="couple-role">{host.label}</span>
      <strong className="couple-name">{host.name || host.label}</strong>
      {showParents && parents && (
        <span className="couple-parents">
          {parents}의 {childWord(host)}
        </span>
      )}
    </div>
  );
}

function ContactLinks({ role, name, phone }: { role: string; name: string; phone: string }) {
  if (!name || !phone) return null;
  return (
    <li>
      <span className="couple-contact-who">
        {role} <b>{name}</b>
      </span>
      <span className="contact-actions">
        <a href={`tel:${phone}`} aria-label={`${role} ${name}에게 전화`}>
          전화
        </a>
        <a href={`sms:${phone}`} aria-label={`${role} ${name}에게 문자`}>
          문자
        </a>
      </span>
    </li>
  );
}

export function CoupleSection({ doc, section }: SectionProps<SectionOf<'couple'>>) {
  const { title, showParents, showContact } = section.data;
  const hosts = doc.core.hosts;
  const hasContact = hosts.some((h) => h.phone || h.father.phone || h.mother.phone);

  return (
    <section className="inv-block couple">
      <p className="inv-eyebrow">BRIDE &amp; GROOM</p>
      <h2 className="inv-title">{title}</h2>
      <div className="couple-grid">
        {hosts.map((h, i) => (
          <div key={h.id} className="couple-cell">
            {i > 0 && (
              <span className="couple-amp" aria-hidden>
                &amp;
              </span>
            )}
            <Person host={h} showParents={showParents} />
          </div>
        ))}
      </div>
      {showContact && hasContact && (
        <details className="couple-contact">
          <summary>연락하기</summary>
          <ul>
            {hosts.map((h) => (
              <li key={h.id} className="couple-contact-group">
                <ul>
                  <ContactLinks role={h.label} name={h.name} phone={h.phone} />
                  {!h.father.deceased && <ContactLinks role={`${h.label} 아버지`} name={h.father.name} phone={h.father.phone} />}
                  {!h.mother.deceased && <ContactLinks role={`${h.label} 어머니`} name={h.mother.name} phone={h.mother.phone} />}
                </ul>
              </li>
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}
