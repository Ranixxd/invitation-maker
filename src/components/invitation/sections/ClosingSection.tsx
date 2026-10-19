// 마무리 멘트: 하트 · 문단 · 서명 + 사진 띠(최대 3장, 섹션 자체 사진) (§4.1)
import type { SectionOf } from '../../../types/invitation';
import type { SectionProps } from '../InvitationView';
import { HeartMark } from '../ui';

export function ClosingSection({ doc, section }: SectionProps<SectionOf<'closing'>>) {
  const { body, showNames } = section.data;
  const names = doc.core.hosts.map((h) => `${h.label} ${h.name || ''}`.trim());
  const paragraphs = body.split(/\n{2,}/).filter((p) => p.trim());
  const strip = (section.data.imageIds ?? []).map((id) => doc.images[id]).filter(Boolean);

  return (
    <section className={`inv-block closing${strip.length ? ' has-strip' : ''}`}>
      <HeartMark />
      {paragraphs.map((p, i) => (
        <p key={i} className="ui-body">
          {p}
        </p>
      ))}
      {showNames && <p className="closing-names">{names.join(' · ')} 드림</p>}
      {strip.length > 0 && (
        <div className="closing-strip" aria-hidden style={{ gridTemplateColumns: `repeat(${strip.length}, 1fr)` }}>
          {strip.map((img) => (
            <img key={img.id} src={img.src} alt="" loading="lazy" />
          ))}
        </div>
      )}
    </section>
  );
}
