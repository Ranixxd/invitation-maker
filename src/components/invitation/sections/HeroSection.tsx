import type { SectionOf } from '../../../types/invitation';
import type { SectionProps } from '../InvitationView';
import { formatDot, formatDotKo, formatKo, parseLocal } from '../../../lib/date';

/** 작은 채운 하트 (폴라로이드 히어로 장식) */
function HeartFilled() {
  return (
    <svg viewBox="0 0 24 22" aria-hidden>
      <path d="M12 21C5 15.5 1.5 12 1.5 7.5 1.5 4 4 1.5 7.2 1.5c2 0 3.6 1 4.8 2.8 1.2-1.8 2.8-2.8 4.8-2.8 3.2 0 5.7 2.5 5.7 6 0 4.5-3.5 8-10.5 13.5z" />
    </svg>
  );
}

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

  // 폴라로이드: 크림 종이 위 기울어진 폴라로이드 3장 · 작은 문구와 하트 · 영문 필기체 · 이름 · 일시·장소 (§3.5)
  if (layout === 'polaroid') {
    const extras = (section.data.extraImageIds ?? []).map((id) => doc.images[id]).filter(Boolean);
    const shots = [img, ...extras].slice(0, 3);
    const script = section.data.script?.trim() || 'Our Wedding Day';
    return (
      <div className={`hero hero--polaroid has-${Math.max(1, shots.length)}`}>
        {headline && (
          <p className="hero-pol-note">
            {headline}
            <span className="hero-pol-hearts" aria-hidden>
              <HeartFilled />
              <HeartFilled />
            </span>
          </p>
        )}
        <div className="hero-pol-stack">
          {(shots.length ? shots : [null]).map((shot, i) => (
            <figure key={i} className={`hero-pol-card is-${i + 1}`}>
              {shot ? <img src={shot.src} alt={i === 0 ? '대표 사진' : ''} /> : <div className="hero-img--empty">대표 사진을 추가해 주세요</div>}
            </figure>
          ))}
          <p className="hero-pol-script" lang="en">
            {script}
          </p>
        </div>
        <h1 className="hero-pol-names">{names.join(' · ')}</h1>
        {(date || venue) && (
          <p className="hero-pol-when">
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
