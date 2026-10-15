import type { SectionOf } from '../../../types/invitation';
import type { SectionProps } from '../InvitationView';
import { formatDot, formatDateKo, formatKo, parseLocal } from '../../../lib/date';
import { HeartCut } from '../HeartCut';
import { MusicBar } from '../MusicBar';

const DEFAULT_SCRIPT = 'Our Wedding Day';

/** 히어로 배경에 흩날리는 오린 하트. depth 1(멀리: 작고 흐리고 느림) ~ 3(가까이: 크고 빠름) */
const FALLING_HEARTS: { x: number; depth: 1 | 2 | 3; delay: number; shape: 'a' | 'b' }[] = [
  { x: 6, depth: 1, delay: 0, shape: 'a' },
  { x: 18, depth: 3, delay: 7, shape: 'b' },
  { x: 27, depth: 2, delay: 12, shape: 'a' },
  { x: 39, depth: 1, delay: 4, shape: 'b' },
  { x: 48, depth: 2, delay: 1, shape: 'b' },
  { x: 57, depth: 1, delay: 15, shape: 'a' },
  { x: 66, depth: 3, delay: 2, shape: 'a' },
  { x: 74, depth: 1, delay: 9, shape: 'b' },
  { x: 83, depth: 2, delay: 6, shape: 'a' },
  { x: 92, depth: 1, delay: 18, shape: 'b' },
  { x: 12, depth: 2, delay: 16, shape: 'b' },
  { x: 88, depth: 3, delay: 11, shape: 'b' },
];

/** 표지 히어로 아래 흐르는 띠 문구 */
const COVER_BAND = 'OUR WEDDING';
const BAND_REPEAT = 10;

/** 흩날리는 장식: 폴라로이드는 오린 하트, 표지(크림 티켓)는 꽃잎. 자리·깊이·시간은 같은 표를 쓴다 */
function FallingHearts({ petals = false }: { petals?: boolean }) {
  return (
    <div className={`hero-fall${petals ? ' is-petals' : ''}`} aria-hidden>
      {FALLING_HEARTS.map((h, i) => (
        <span
          key={i}
          className={`hero-fall-item is-d${h.depth}`}
          style={{ left: `${h.x}%`, animationDelay: `-${h.delay}s` }}
        >
          {petals ? (
            <svg className="hero-petal" viewBox="0 0 12 16">
              <path d={h.shape === 'a' ? 'M6 0C9.6 3.4 10.4 9 6 16 1.8 9.4 2.6 3.6 6 0Z' : 'M5.4 0C10 2.6 11.6 8.8 6.4 16 1.4 10.6 1.2 3.8 5.4 0Z'} />
            </svg>
          ) : (
            <HeartCut shape={h.shape} />
          )}
        </span>
      ))}
    </div>
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

  // 폴라로이드: 크림 종이 위 흩날리는 하트 · 기울어진 폴라로이드 3장 · 작은 문구 · 영문 필기체 · 이름 · 일시·장소 · 음악 (§3.5)
  if (layout === 'polaroid') {
    const extras = (section.data.extraImageIds ?? []).map((id) => doc.images[id]).filter(Boolean);
    const shots = [img, ...extras].slice(0, 3);
    const script = section.data.script?.trim() || DEFAULT_SCRIPT;
    // 기본 문구는 손글씨 이미지(색은 포인트 토큰으로 칠함), 다른 문구는 필기체 웹폰트
    const scriptAsImage = script.toLowerCase() === DEFAULT_SCRIPT.toLowerCase();
    return (
      <div className={`hero hero--polaroid has-${Math.max(1, shots.length)}`}>
        <FallingHearts />
        {headline && <p className="hero-pol-note">{headline}</p>}
        <div className="hero-pol-stack">
          {(shots.length ? shots : [null]).map((shot, i) => (
            <figure key={i} className={`hero-pol-card is-${i + 1}`}>
              {shot ? <img src={shot.src} alt={i === 0 ? '대표 사진' : ''} /> : <div className="hero-img--empty">대표 사진을 추가해 주세요</div>}
            </figure>
          ))}
          {scriptAsImage ? (
            <p className="hero-pol-script is-image" role="img" aria-label={DEFAULT_SCRIPT} />
          ) : (
            <p className="hero-pol-script" lang="en">
              {script}
            </p>
          )}
        </div>
        <h1 className="hero-pol-names">
          {names.map((n, i) => (
            <span key={i}>
              {i > 0 && <HeartCut shape="b" className="hero-pol-names-heart" />}
              {n}
            </span>
          ))}
        </h1>
        {(date || venue) && (
          <p className="hero-pol-when">
            {date && <span>{formatDateKo(date)}</span>}
            {venue && <span>{venue}</span>}
          </p>
        )}
        <MusicBar title={section.data.music?.title || 'Our Wedding Song'} src={section.data.music?.src} />
      </div>
    );
  }

  // 표지: 꽉 찬 사진 위 작은 문구·명조 이름(두 줄)·날짜/연도 → 올리브 띠 → 플레이어 (§3.5 크림 티켓)
  if (layout === 'cover') {
    const pad = (n: number) => String(n).padStart(2, '0');
    const band = Array.from({ length: BAND_REPEAT }, (_, i) => <span key={i}>{COVER_BAND}</span>);
    return (
      <div className="hero hero--cover">
        <div className="hero-cov-photo">
          {img ? <img src={img.src} alt="대표 사진" /> : <div className="hero-img--empty">대표 사진을 추가해 주세요</div>}
          <FallingHearts petals />
          <div className="hero-cov-top">
            {headline && <p className="hero-cov-label">{headline}</p>}
            {/* 이름은 한 줄에 한 사람씩 */}
            <h1 className="hero-cov-names">
              {names.map((n, i) => (
                <span key={i}>{n}</span>
              ))}
            </h1>
          </div>
          {date && (
            <p className="hero-cov-date">
              <span>
                {pad(date.getMonth() + 1)}.{pad(date.getDate())}
              </span>
              <span>{date.getFullYear()}</span>
            </p>
          )}
        </div>
        <div className="hero-cov-band" aria-hidden>
          <div className="hero-cov-track">
            {band}
            {band}
          </div>
        </div>
        <MusicBar variant="player" title={section.data.music?.title || 'Our Wedding Song'} src={section.data.music?.src} />
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
