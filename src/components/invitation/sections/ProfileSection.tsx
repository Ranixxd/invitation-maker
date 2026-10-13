// 신랑·신부 추가 정보: MBTI·한 줄 소개·타임라인 (§4.1)
import type { SectionOf } from '../../../types/invitation';
import type { SectionProps } from '../InvitationView';

export function ProfileSection({ doc, section, mode }: SectionProps<SectionOf<'profile'>>) {
  const { title, people, timeline } = section.data;
  const filledPeople = doc.core.hosts
    .map((h) => ({ host: h, p: people.find((x) => x.hostId === h.id) }))
    .filter(({ p }) => p && (p.mbti || p.intro));
  const items = timeline.filter((t) => t.date || t.text);

  // 내용이 없으면 하객 화면에서는 그리지 않고, 편집기에서는 안내 (§4.1)
  if (!filledPeople.length && !items.length) {
    if (mode === 'view') return null;
    return (
      <section className="inv-block profile">
        <h2 className="inv-title">{title}</h2>
        <p className="inv-muted">MBTI, 한 줄 소개, 우리의 타임라인을 채워 주세요</p>
      </section>
    );
  }

  return (
    <section className="inv-block profile">
      <h2 className="inv-title">{title}</h2>
      {filledPeople.length > 0 && (
        <div className="profile-cards">
          {filledPeople.map(({ host, p }) => (
            <div key={host.id} className="profile-card">
              <span className="couple-role">{host.label}</span>
              <strong>{host.name || host.label}</strong>
              {p!.mbti && <span className="profile-mbti">{p!.mbti}</span>}
              {p!.intro && <p className="profile-intro">{p!.intro}</p>}
            </div>
          ))}
        </div>
      )}
      {items.length > 0 && (
        <ol className="timeline">
          {items.map((t) => (
            <li key={t.id}>
              <span className="timeline-date">{t.date}</span>
              <span className="timeline-text">{t.text}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
