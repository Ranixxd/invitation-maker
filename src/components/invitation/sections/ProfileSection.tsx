// 우리의 이야기: 타임라인만. 좌우로 번갈아 놓고 사이를 점선 화살표로 잇는다 (§4.1)
import { Fragment } from 'react';
import type { SectionOf } from '../../../types/invitation';
import type { SectionProps } from '../InvitationView';
import { SectionHead } from '../ui';

export function ProfileSection({ section, mode }: SectionProps<SectionOf<'profile'>>) {
  const { title, timeline } = section.data;
  const items = timeline.filter((t) => t.date || t.text);

  // 내용이 없으면 하객 화면에서는 그리지 않고, 편집기에서는 안내 (§4.1)
  if (!items.length) {
    if (mode === 'view') return null;
    return (
      <section className="inv-block profile">
        <SectionHead heart title={title} desc="우리의 타임라인을 채워 주세요" />
      </section>
    );
  }

  return (
    <section className="inv-block profile">
      <SectionHead heart title={title} />
      <ol className="story">
        {items.map((t, i) => (
          <Fragment key={t.id}>
            {/* 왼쪽 → 오른쪽이면 오른쪽 아래, 오른쪽 → 왼쪽이면 왼쪽 아래를 가리킨다 */}
            {i > 0 && <li className={`story-arrow ${i % 2 ? 'to-right' : 'to-left'}`} aria-hidden />}
            <li className={`story-item ${i % 2 ? 'is-right' : 'is-left'}`}>
              {t.date && <span className="story-date">{t.date}</span>}
              {t.text && <span className="story-text">{t.text}</span>}
            </li>
          </Fragment>
        ))}
      </ol>
    </section>
  );
}
