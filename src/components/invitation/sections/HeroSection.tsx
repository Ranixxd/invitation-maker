import type { SectionOf } from '../../../types/invitation';
import type { SectionProps } from '../InvitationView';
import { formatDot, formatKo, parseLocal } from '../../../lib/date';

export function HeroSection({ doc, section }: SectionProps<SectionOf<'hero'>>) {
  const { imageId, layout, headline } = section.data;
  const img = imageId ? doc.images[imageId] : null;
  const date = parseLocal(doc.core.datetime);
  const names = doc.core.hosts.map((h) => h.name || h.label);
  const venue = [doc.core.venue.name, doc.core.venue.hall].filter(Boolean).join(' ');

  const photo = img ? (
    <img className="hero-img" src={img.src} alt="대표 사진" />
  ) : (
    <div className="hero-img hero-img--empty" aria-label="대표 사진 없음">
      <span>대표 사진을 추가해 주세요</span>
    </div>
  );

  if (layout === 'full') {
    return (
      <div className="hero hero--full">
        <div className="hero-media">{photo}</div>
        <div className="hero-overlay">
          <p className="hero-headline">{headline}</p>
          <h1 className="hero-names">{names.join(' · ')}</h1>
          {date && <p className="hero-date">{formatDot(date)}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className={`hero hero--${layout}`}>
      <p className="hero-headline">{headline}</p>
      {date && <p className="hero-date hero-date--big">{formatDot(date)}</p>}
      <div className="hero-media">{photo}</div>
      <h1 className="hero-names">
        {names.map((n, i) => (
          <span key={i}>
            {i > 0 && <em className="hero-amp">{names.length === 2 ? '그리고' : ''}</em>}
            {n}
          </span>
        ))}
      </h1>
      {date && <p className="hero-sub">{formatKo(date)}</p>}
      {venue && <p className="hero-sub">{venue}</p>}
    </div>
  );
}
