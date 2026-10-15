import type { CSSProperties } from 'react';
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

/** 하트 히어로: 하늘색 면 둘레에 흩어진 동그라미 [x%, y%, 지름(면 폭 %)] — 면 가장자리에 걸치게 */
const HEART_DOTS: [number, number, number][] = [
  [-3, -2, 9], [48, 1, 9], [78, -4, 9], [94, 9, 9],
  [95, 46, 9], [-4, 40, 9], [-3, 62, 9], [10, 80, 9],
  [4, 90, 9], [20, 97, 9], [96, 72, 9],
];
const HEART_SCRIPT = 'OUR WEDDING';

/** 동그라미 글자: 단어마다 한 줄, 글자마다 동그라미 하나. 물결처럼 위아래로 어긋난다 */
function DotWords({ text }: { text: string }) {
  const words = text.toUpperCase().split(/\s+/).filter(Boolean).slice(0, 3);
  return (
    <div className="hero-hrt-words" role="img" aria-label={text}>
      {words.map((w, wi) => (
        <p key={wi} className={`hero-hrt-word is-${wi + 1}`} aria-hidden>
          {[...w].map((ch, ci) => (
            <span key={ci} style={{ '--dy': `${Math.round(Math.sin(ci * 1.3 + wi) * 8)}px` } as CSSProperties}>
              {ch}
            </span>
          ))}
        </p>
      ))}
    </div>
  );
}

function FallingHearts() {
  return (
    <div className="hero-fall" aria-hidden>
      {FALLING_HEARTS.map((h, i) => (
        <span
          key={i}
          className={`hero-fall-item is-d${h.depth}`}
          style={{ left: `${h.x}%`, animationDelay: `-${h.delay}s` }}
        >
          <HeartCut shape={h.shape} />
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

  // 하트: 하늘색 면 위 하트 모양 사진 · 둘레의 동그라미 · 동그라미 글자 · 이름 · 일시·장소 · 음악 (§3.5 러브 레터)
  if (layout === 'heart') {
    const script = section.data.script?.trim() || HEART_SCRIPT;
    return (
      <div className="hero hero--heart">
        {headline && <p className="hero-hrt-label">{headline}</p>}
        <div className="hero-hrt-panel">
          {HEART_DOTS.map(([x, y, d], i) => (
            <span key={i} className="hero-hrt-dot" style={{ left: `${x}%`, top: `${y}%`, width: `${d}%` }} aria-hidden />
          ))}
          <div className="hero-hrt-photo">{img ? <img src={img.src} alt="대표 사진" /> : <div className="hero-img--empty">대표 사진을 추가해 주세요</div>}</div>
          <DotWords text={script} />
        </div>
        <h1 className="hero-hrt-names">
          {names.map((n, i) => (
            <span key={i}>
              {i > 0 && <span className="hero-hrt-amp">&amp;</span>}
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
