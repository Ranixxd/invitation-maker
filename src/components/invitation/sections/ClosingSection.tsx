// 마무리 멘트: 하트 · 문단 · 서명 + 갤러리 앞 사진 3장 띠 (§4.1)
import type { SectionOf } from '../../../types/invitation';
import type { SectionProps } from '../InvitationView';
import { HeartMark } from '../ui';

const STRIP_COUNT = 3;

export function ClosingSection({ doc, section }: SectionProps<SectionOf<'closing'>>) {
  const { body, showNames } = section.data;
  const names = doc.core.hosts.map((h) => `${h.label} ${h.name || ''}`.trim());
  const paragraphs = body.split(/\n{2,}/).filter((p) => p.trim());
  const gallery = doc.sections.find((s) => s.type === 'gallery');
  const strip =
    gallery?.type === 'gallery' && gallery.enabled
      ? gallery.data.imageIds
          .map((id) => doc.images[id])
          .filter(Boolean)
          .slice(0, STRIP_COUNT)
      : [];

  return (
    <section className={`inv-block closing${strip.length === STRIP_COUNT ? ' has-strip' : ''}`}>
      <HeartMark />
      {paragraphs.map((p, i) => (
        <p key={i} className="ui-body">
          {p}
        </p>
      ))}
      {showNames && <p className="closing-names">{names.join(' · ')} 드림</p>}
      {strip.length === STRIP_COUNT && (
        <div className="closing-strip" aria-hidden>
          {strip.map((img) => (
            <img key={img.id} src={img.src} alt="" loading="lazy" />
          ))}
        </div>
      )}
    </section>
  );
}
