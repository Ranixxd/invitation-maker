import { useLayoutEffect, useRef } from 'react';
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

/** 흩날리는 장식: 폴라로이드는 오린 하트, 표지(템플릿2)는 꽃잎. 자리·깊이·시간은 같은 표를 쓴다 */
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

/** 스크롤 상자: 가장 가까운 세로 스크롤 조상(편집기·템플릿 미리보기 휴대폰 화면), 없으면 창 */
function scrollParent(el: HTMLElement): HTMLElement | null {
  for (let n = el.parentElement; n; n = n.parentElement) {
    const oy = getComputedStyle(n).overflowY;
    if ((oy === 'auto' || oy === 'scroll') && n.scrollHeight > n.clientHeight) return n;
  }
  return null;
}

/** 펼침 히어로 사진의 위·아래 여백. 문구 ↔ 사진 = 사진 ↔ 일시 = 24, 그 아래 일시(23) · 16 · 재생 바(50) · 24 */
const UNFOLD_GAP = 24;
const UNFOLD_BOTTOM = UNFOLD_GAP + 23 + 16 + 50 + 24;

/** 펼침 히어로: 무대 높이(--stage-h)를 화면 높이에 맞추고, 스크롤 진행도(--p, 0~1)를 CSS 변수로 넘긴다.
 *  React 상태를 거치지 않고 스타일만 바꿔 스크롤 중 다시 그리기를 피한다 */
function useUnfold(aspect: number) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let parent: HTMLElement | null = null;
    let frame = 0;
    const update = () => {
      frame = 0;
      const stage = el.firstElementChild as HTMLElement | null;
      const range = el.offsetHeight - (stage?.offsetHeight ?? 0);
      if (reduce || range <= 0) return el.style.setProperty('--p', '0');
      const top = parent ? parent.getBoundingClientRect().top : 0;
      // 화면 배율(템플릿 썸네일 축소)을 보정해 실제 레이아웃 단위로
      const scale = el.getBoundingClientRect().height / el.offsetHeight || 1;
      const p = Math.min(1, Math.max(0, (top - el.getBoundingClientRect().top) / scale / range));
      el.style.setProperty('--p', (1 - (1 - p) ** 2).toFixed(4)); // 처음엔 빠르게, 끝에서 부드럽게
    };
    const measure = () => {
      parent = scrollParent(el);
      const w = el.offsetWidth;
      const h = parent ? parent.clientHeight : window.innerHeight;
      const stageH = Math.round(Math.min(w * 2, Math.max(w * 1.4, h)));
      el.style.setProperty('--stage-h', `${stageH}px`);
      // 처음 사진: 문구 아래(--unf-top)에 가로 꽉, 높이는 사진 원래 비율(--unf-h0). 아래 여백(일시·재생 버튼)을 넘으면 그만큼만
      const text = el.querySelector<HTMLElement>('.hero-unf-text');
      // offsetHeight는 정수로 반올림돼 간격이 1px 어긋나므로 소수점까지 잰다 (화면 배율 보정)
      const scale = el.getBoundingClientRect().width / w || 1;
      const top = text ? text.offsetTop + text.getBoundingClientRect().height / scale + UNFOLD_GAP : 0;
      el.style.setProperty('--unf-top', `${top}px`);
      el.style.setProperty('--unf-pc', top ? (UNFOLD_GAP / top).toFixed(4) : '0'); // 사진 위끝이 문구 아래끝에 닿는 진행도
      const h0 = Math.max(80, Math.min(w / aspect, stageH - top - UNFOLD_BOTTOM));
      el.style.setProperty('--unf-h0', `${h0}px`);
      el.style.setProperty('--unf-bottom', `${UNFOLD_BOTTOM}px`);
      update();
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    // 스크롤 상자가 어디든 잡도록 캡처 단계에서 듣는다
    window.addEventListener('scroll', onScroll, { capture: true, passive: true });
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('scroll', onScroll, { capture: true });
      window.removeEventListener('resize', measure);
      cancelAnimationFrame(frame);
    };
  }, [aspect]);
  return ref;
}

/** 펼침(템플릿3): 맨 위 문구(작은 문구 · 신랑 · 신부)는 항상 보이고, 그 아래 사진은 처음엔 가로 꽉 찬 원래 비율(잘림 없음),
 *  스크롤할수록 위아래로 늘어나 무대의 아래 여백을 뺀 높이를 채운다(그만큼 확대되며 좌우가 잘림). 일시·재생 바는 늘 사진 아래 */
function UnfoldHero({ doc, section }: SectionProps<SectionOf<'hero'>>) {
  const { imageId, headline } = section.data;
  const img = imageId ? doc.images[imageId] : null;
  const ref = useUnfold(img?.aspect || 0.75); // 사진 가로/세로 비율 (없으면 3:4)
  const date = parseLocal(doc.core.datetime);
  const names = doc.core.hosts.map((h) => h.name || h.label);
  const lines = (
    <>
      {headline && <span className="hero-unf-label">{headline}</span>}
      {names.map((n, i) => (
        <span key={i} className="hero-unf-name">
          {n}
        </span>
      ))}
    </>
  );
  return (
    <div ref={ref} className="hero hero--unfold">
      <div className="hero-unf-stage">
        <div className="hero-unf-photo">
          {img ? <img src={img.src} alt="대표 사진" /> : <div className="hero-img--empty">대표 사진을 추가해 주세요</div>}
        </div>
        {/* 문구: 바탕 위에선 잉크, 펼친 사진 위에선 크림색으로 겹쳐 바뀐다 (사진에 묻히지 않게 항상 맨 위) */}
        <h1 className="hero-unf-text">{lines}</h1>
        <p className="hero-unf-text is-light" aria-hidden>
          {lines}
        </p>
        {/* 일시·재생 바: 늘 사진 밖(아래), 사진이 늘어나는 만큼 함께 내려간다 */}
        {date && <p className="hero-unf-date">{formatDateKo(date)}</p>}
        <div className="hero-unf-music">
          <MusicBar title={section.data.music?.title || 'Our Wedding Song'} src={section.data.music?.src} />
        </div>
      </div>
    </div>
  );
}

export function HeroSection({ doc, section, mode }: SectionProps<SectionOf<'hero'>>) {
  const { imageId, layout, headline } = section.data;
  if (layout === 'unfold') return <UnfoldHero doc={doc} section={section} mode={mode} />;
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

  // 표지: 꽉 찬 사진 위 작은 문구·명조 이름(두 줄)·날짜/연도 → 포인트 띠 → 재생 바 (§3.5 템플릿2)
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
