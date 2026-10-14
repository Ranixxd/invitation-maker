import type { SectionOf } from '../../../types/invitation';
import type { SectionProps } from '../InvitationView';
import { formatDot, formatDotKo, formatKo, parseLocal } from '../../../lib/date';
import { HeartScribble } from '../HeartScribble';
import { Bokeh } from '../Bokeh';

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

  // 포스터: 포인트 바탕 위 이름(세로) · 크림 테두리 사진 · 아래 크림 띠에 일시·장소 (§3.5)
  if (layout === 'poster') {
    return (
      <div className="hero hero--poster">
        <Bokeh />
        {/* 이름 묶음을 하트가 감싼다: 하트는 이름 묶음 가운데 기준으로 놓인다 */}
        <div className="hero-poster-title">
          <HeartScribble className="hero-poster-heart" />
          <h1 className="hero-poster-names">
            {names.map((n, i) => (
              <span key={i}>{n}</span>
            ))}
          </h1>
        </div>
        <div className="hero-poster-photo">{photo}</div>
        {(date || venue) && (
          <p className="hero-poster-when">
            {date && <span>{formatDotKo(date)}</span>}
            {venue && <span>{venue}</span>}
          </p>
        )}
      </div>
    );
  }

  if (layout === 'full') {
    return (
      <div className="hero hero--full">
        <div className="hero-media">{photo}</div>
        <div className="hero-overlay">
          {headline && <p className="hero-headline">{headline}</p>}
          <h1 className="hero-names">{names.join(' · ')}</h1>
          {date && <p className="hero-date">{formatDot(date)}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className={`hero hero--${layout}`}>
      {headline && <p className="hero-headline">{headline}</p>}
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
