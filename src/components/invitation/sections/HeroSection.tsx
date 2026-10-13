import type { SectionOf } from '../../../types/invitation';
import type { SectionProps } from '../InvitationView';
import { formatDot, formatDotCompact, formatKo, parseLocal } from '../../../lib/date';

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

  if (layout === 'polaroid') {
    // 1번 테마(웜 폴라로이드): WEDDING DAY → 기울어진 흑백 폴라로이드(아래 여백에 이름) + 양옆 곡선 글자 → 굵은 날짜 (§3.5)
    const arcText = 'wedding · wedding · wedding · wedding';
    return (
      <div className="hero hero--polaroid">
        <p className="hero-headline">{headline}</p>
        <div className="polaroid-stage">
          <svg className="polaroid-arc is-left" viewBox="0 0 60 220" aria-hidden>
            <path id={`arcL-${section.id}`} d="M54 6 Q-14 110 54 214" fill="none" />
            <text>
              <textPath href={`#arcL-${section.id}`} startOffset="4%">
                {arcText}
              </textPath>
            </text>
          </svg>
          <figure className="polaroid">
            <div className="polaroid-photo">{photo}</div>
            <figcaption className="polaroid-names">{names.join(' & ')}</figcaption>
          </figure>
          <svg className="polaroid-arc is-right" viewBox="0 0 60 220" aria-hidden>
            <path id={`arcR-${section.id}`} d="M6 6 Q74 110 6 214" fill="none" />
            <text>
              <textPath href={`#arcR-${section.id}`} startOffset="4%">
                {arcText}
              </textPath>
            </text>
          </svg>
        </div>
        {date && <p className="hero-date-bold">{formatDotCompact(date)}</p>}
        {venue && <p className="hero-sub">{venue}</p>}
      </div>
    );
  }

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
