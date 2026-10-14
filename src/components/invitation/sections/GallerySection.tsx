import { useEffect, useState } from 'react';
import type { SectionOf } from '../../../types/invitation';
import type { SectionProps } from '../InvitationView';
import { IconChevronLeft, IconChevronRight, Modal, SectionHead } from '../ui';

export function GallerySection({ doc, section, mode }: SectionProps<SectionOf<'gallery'>>) {
  const { title, imageIds, layout } = section.data;
  const images = imageIds.map((id) => doc.images[id]).filter(Boolean);
  const [open, setOpen] = useState<number | null>(null);
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
      ) : (
        <div className={`gallery-${layout}`}>
          {images.map((img, i) => (
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
