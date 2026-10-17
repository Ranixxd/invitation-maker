import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { ImageAsset } from '../../../types/invitation';
import type { SectionOf } from '../../../types/invitation';
import type { SectionProps } from '../InvitationView';
import { GALLERY_MAX } from '../../../lib/image';
import { Button, IconChevronLeft, IconChevronRight, Modal, SectionHead } from '../ui';

/** 접힌 상태에서 보이는 사진 수 (3열 × 2줄). 더 있으면 `더보기`로 펼친다 */
const COLLAPSED = 6;

/** 하트 글자 띠 (캐러셀 뒤): 하트 모양 길을 따라 영문 필기체 문구가 끝없이 흐른다 */
const HEART_TEXT = 'you have my heart · ';
// 하트 길: 아래 꼭짓점에서 시작해 왼쪽 → 위 → 오른쪽 → 다시 꼭짓점.
// 꺾이는 두 곳(위 가운데 오목한 곳 · 아래 꼭짓점)을 완만하게 둥글려 글자가 몰리거나 벌어지지 않게 한다 (곡선이 모든 이음에서 매끈)
const HEART_D =
  'M200 346C186 346 170 336 150 318C100 276 24 212 24 130C24 66 70 24 122 24C146 24 166 32 176 44C186 58 214 58 224 44C234 32 254 24 278 24C330 24 376 66 376 130C376 212 300 276 250 318C230 336 214 346 200 346Z';

/** 길 위 글자 배치: 길 길이 L, 표본점(1px 간격 위치·각도), 한 바퀴 글자와 각 글자의 시작 위치·폭 */
interface HeartLayout {
  len: number;
  pts: { x: number; y: number; a: number }[];
  chars: string;
  starts: number[];
  widths: number[];
}

const HEART_LAP_SEC = 40; // 한 바퀴 도는 시간

function HeartText() {
  const pathRef = useRef<SVGPathElement>(null);
  const probeRef = useRef<SVGTextElement>(null);
  const textRef = useRef<SVGTextElement>(null);
  const [layout, setLayout] = useState<HeartLayout | null>(null);

  // 글자를 textPath에 올리면 길의 시작점(이음매)에서 글자가 잘린다 → 글자마다 위치를 직접 계산해 둥근 고리처럼 끝없이 잇는다.
  // 한 바퀴 반복 수는 길 길이에 맞추고, 글자 사이를 고르게 벌려 한 바퀴가 정확히 L이 되게 한다(글자 모양은 그대로)
  useLayoutEffect(() => {
    const measure = () => {
      const path = pathRef.current;
      const probe = probeRef.current;
      if (!path || !probe) return;
      const len = path.getTotalLength();
      probe.textContent = HEART_TEXT;
      const reps = Math.max(1, Math.round(len / (probe.getComputedTextLength() || 1)));
      const chars = HEART_TEXT.repeat(reps);
      probe.textContent = chars;
      const natural = probe.getComputedTextLength() || 1;
      const k = len / natural;
      if (probe.getNumberOfChars() !== chars.length) return; // 글꼴·공백 처리 차이로 글자 수가 다르면 그리지 않는다
      const starts = Array.from(chars, (_, i) => probe.getStartPositionOfChar(i).x * k);
      const widths = Array.from(chars, (_, i) => probe.getSubStringLength(i, 1));
      const n = Math.ceil(len);
      const pts = Array.from({ length: n + 1 }, (_, i) => {
        const p0 = path.getPointAtLength(Math.max(0, i - 0.5));
        const p1 = path.getPointAtLength(Math.min(len, i + 0.5));
        const p = path.getPointAtLength(Math.min(len, i));
        return { x: p.x, y: p.y, a: Math.atan2(p1.y - p0.y, p1.x - p0.x) };
      });
      probe.textContent = HEART_TEXT;
      setLayout({ len, pts, chars, starts, widths });
    };
    measure();
    document.fonts?.ready.then(measure);
  }, []);

  // 글자 위치 갱신: 글자 가운데가 길 위 (시작 위치 − 흐른 거리) mod L 에 오도록 x·y·rotate 목록을 한 번에 바꾼다
  useEffect(() => {
    const text = textRef.current;
    if (!layout || !text) return;
    const { len, pts, starts, widths } = layout;
    const place = (shift: number) => {
      const xs: string[] = [];
      const ys: string[] = [];
      const rs: string[] = [];
      starts.forEach((st, i) => {
        const w = widths[i];
        let mid = (st + w / 2 - shift) % len;
        if (mid < 0) mid += len;
        const p = pts[Math.round(mid)];
        const c = Math.cos(p.a);
        const sn = Math.sin(p.a);
        xs.push((p.x - (c * w) / 2).toFixed(2));
        ys.push((p.y - (sn * w) / 2).toFixed(2));
        rs.push(((p.a * 180) / Math.PI).toFixed(1));
      });
      text.setAttribute('x', xs.join(' '));
      text.setAttribute('y', ys.join(' '));
      text.setAttribute('rotate', rs.join(' '));
    };
    place(0);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    // 화면에 보일 때만 움직인다
    let visible = true;
    const io = 'IntersectionObserver' in window ? new IntersectionObserver(([e]) => (visible = e.isIntersecting)) : null;
    io?.observe(text);
    let frame = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      if (visible) place((((now - t0) / 1000) * len) / HEART_LAP_SEC);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      io?.disconnect();
    };
  }, [layout]);

  return (
    <svg className="gal-heart" viewBox="0 0 400 366" aria-hidden>
      <path ref={pathRef} d={HEART_D} fill="none" />
      <text ref={probeRef} className="gal-heart-probe">
        {HEART_TEXT}
      </text>
      {layout && (
        <text ref={textRef} className="gal-heart-text">
          {layout.chars}
        </text>
      )}
    </svg>
  );
}

/** 캐러셀: 가로로 넘기는 사진, 가운데 사진이 가장 크고 양옆은 작게 살짝 보인다 */
function Carousel({ images, onOpen }: { images: ImageAsset[]; onOpen?: (i: number) => void }) {
  const track = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = track.current;
    if (!el) return;
    let frame = 0;
    // 각 사진이 가운데에서 떨어진 정도(0~1)를 --d로
    const update = () => {
      frame = 0;
      const mid = el.scrollLeft + el.clientWidth / 2;
      Array.from(el.children as HTMLCollectionOf<HTMLElement>).forEach((c) => {
        const d = Math.min(1, Math.abs(c.offsetLeft + c.offsetWidth / 2 - mid) / c.offsetWidth);
        c.style.setProperty('--d', d.toFixed(3));
      });
    };
    // 처음엔 두 번째 사진을 가운데에 → 양옆 사진이 모두 보인다
    const second = el.children[1] as HTMLElement | undefined;
    if (second) el.scrollLeft = second.offsetLeft + second.offsetWidth / 2 - el.clientWidth / 2;
    update();
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      el.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
    };
  }, [images.length]);

  return (
    <div className="gal-car">
      <HeartText />
      <div ref={track} className="gal-car-track">
        {images.map((img, i) => (
          <button key={img.id} type="button" className="gal-car-item" onClick={onOpen ? () => onOpen(i) : undefined} aria-label={`사진 ${i + 1} 크게 보기`}>
            <img src={img.src} alt="" loading="lazy" />
          </button>
        ))}
      </div>
    </div>
  );
}

export function GallerySection({ doc, section, mode }: SectionProps<SectionOf<'gallery'>>) {
  const { title, imageIds, layout } = section.data;
  const images = imageIds.map((id) => doc.images[id]).filter(Boolean).slice(0, GALLERY_MAX);
  const [open, setOpen] = useState<number | null>(null);
  const [expanded, setExpanded] = useState(false);
  const canFold = layout !== 'carousel' && images.length > COLLAPSED;
  const shown = canFold && !expanded ? images.slice(0, COLLAPSED) : images;
  const step = (d: number) => setOpen((i) => (i === null ? i : (i + d + images.length) % images.length));

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, images.length]);

  // 편집기 미리보기에서는 라이트박스를 열지 않는다 (편집기 화면을 덮지 않도록)
  const canOpen = mode === 'view';

  // 사진이 없을 때: 하객 화면에서는 섹션을 그리지 않고, 편집기에서는 자리 안내를 보여준다 (§4.6)
  if (images.length === 0 && mode === 'view') return null;

  return (
    <section className="inv-block gallery">
      <SectionHead title={title} desc={images.length === 0 ? '갤러리 편집에서 사진을 추가해 주세요' : undefined} />
      {images.length === 0 ? (
        <div className="gallery-grid" aria-hidden>
          {Array.from({ length: 6 }, (_, i) => (
            <span key={i} className="gallery-item gallery-ph">
              +
            </span>
          ))}
        </div>
      ) : layout === 'carousel' ? (
        <Carousel images={images} onOpen={canOpen ? setOpen : undefined} />
      ) : (
        <div className={`gallery-${layout}`}>
          {shown.map((img, i) => (
            <button
              key={img.id}
              type="button"
              className="gallery-item"
              onClick={canOpen ? () => setOpen(i) : undefined}
              aria-label={`사진 ${i + 1} 크게 보기`}
            >
              <img src={img.src} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      )}
      {canFold && (
        <div className="ui-col">
          <Button variant="primary" onClick={() => setExpanded((v) => !v)} aria-expanded={expanded}>
            {expanded ? '접기' : '더보기'}
          </Button>
        </div>
      )}
      {/* 라이트박스: 흐린 배경 위 테두리 사진 + 좌우 넘기기, 배경 눌러서 닫기 */}
      {open !== null && images[open] && (
        <Modal doc={doc} label={`사진 ${open + 1} / ${images.length}`} onClose={() => setOpen(null)} bare>
          <div className="lightbox">
            <button type="button" className="lightbox-nav" aria-label="이전 사진" onClick={() => step(-1)}>
              <IconChevronLeft />
            </button>
            <img className="lightbox-img" src={images[open].src} alt={`사진 ${open + 1}`} />
            <button type="button" className="lightbox-nav" aria-label="다음 사진" onClick={() => step(1)}>
              <IconChevronRight />
            </button>
          </div>
        </Modal>
      )}
    </section>
  );
}
