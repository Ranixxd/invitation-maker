import type { HostSide, SectionOf } from '../../../types/invitation';
import type { SectionProps } from '../InvitationView';

function ContactRow({ role, name, phone, deceased, showContact }: {
  role: string;
  name: string;
  phone: string;
  deceased?: boolean;
  showContact: boolean;
}) {
  if (!name) return null;
  return (
    <li className="contact-row">
      <span className="contact-role">{role}</span>
      <span className="contact-name">
        {deceased && '故 '}
        {name}
      </span>
      {showContact && phone && !deceased && (
        <span className="contact-actions">
          <a href={`tel:${phone}`} aria-label={`${role} ${name}에게 전화`}>
            전화
          </a>
          <a href={`sms:${phone}`} aria-label={`${role} ${name}에게 문자`}>
            문자
          </a>
        </span>
      )}
    </li>
  );
}

function HostCard({ host, showContact }: { host: HostSide; showContact: boolean }) {
  return (
    <div className="contact-card">
      <h3>{host.label}측</h3>
      <ul>
        <ContactRow role={host.label} name={host.name} phone={host.phone} showContact={showContact} />
        <ContactRow role="아버지" {...host.father} showContact={showContact} />
        <ContactRow role="어머니" {...host.mother} showContact={showContact} />
      </ul>
    </div>
  );
}

export function ParentsSection({ doc, section }: SectionProps<SectionOf<'parents'>>) {
  const { title, showContact } = section.data;
  return (
    <section className="inv-block parents">
      <p className="inv-eyebrow">CONTACT</p>
      <h2 className="inv-title">{title}</h2>
      <div className="contact-grid">
        {doc.core.hosts.map((h) => (
          <HostCard key={h.id} host={h} showContact={showContact} />
        ))}
      </div>
    </section>
  );
}
