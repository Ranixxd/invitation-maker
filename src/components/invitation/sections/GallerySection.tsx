import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { ImageAsset } from '../../../types/invitation';
import type { SectionOf } from '../../../types/invitation';
import type { SectionProps } from '../InvitationView';
import { GALLERY_MAX } from '../../../lib/image';
import { Button, IconChevronLeft, IconChevronRight, Modal, SectionHead } from '../ui';

/** 접힌 상태에서 보이는 사진 수 (3열 × 2줄). 더 있으면 `더보기`로 펼친다 */
const COLLAPSED = 6;

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
