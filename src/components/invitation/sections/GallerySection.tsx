import { useEffect, useState } from 'react';
import type { SectionOf } from '../../../types/invitation';
import type { SectionProps } from '../InvitationView';

export function GallerySection({ doc, section, mode }: SectionProps<SectionOf<'gallery'>>) {
  const { title, imageIds, layout } = section.data;
  const images = imageIds.map((id) => doc.images[id]).filter(Boolean);
  const [open, setOpen] = useState<number | null>(null);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null);
      if (e.key === 'ArrowRight') setOpen((i) => (i === null ? i : (i + 1) % images.length));
      if (e.key === 'ArrowLeft') setOpen((i) => (i === null ? i : (i - 1 + images.length) % images.length));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, images.length]);

  // 편집기 미리보기에서는 라이트박스를 열지 않는다 (편집기 화면을 덮지 않도록)
  const canOpen = mode === 'view';

  return (
    <section className="inv-block gallery">
      <p className="inv-eyebrow">GALLERY</p>
      <h2 className="inv-title">{title}</h2>
      {images.length === 0 ? (
        <p className="inv-muted">사진을 추가해 주세요</p>
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
      {open !== null && images[open] && (
        <div className="lightbox" role="dialog" aria-modal="true" onClick={() => setOpen(null)}>
          <img src={images[open].src} alt={`사진 ${open + 1}`} onClick={(e) => e.stopPropagation()} />
          <button type="button" className="lightbox-close" aria-label="닫기" onClick={() => setOpen(null)}>
            ✕
          </button>
          <p className="lightbox-count">
            {open + 1} / {images.length}
          </p>
          <button
            type="button"
            className="lightbox-nav prev"
            aria-label="이전 사진"
            onClick={(e) => {
              e.stopPropagation();
              setOpen((open - 1 + images.length) % images.length);
            }}
          >
            ‹
          </button>
          <button
            type="button"
            className="lightbox-nav next"
            aria-label="다음 사진"
            onClick={(e) => {
              e.stopPropagation();
              setOpen((open + 1) % images.length);
            }}
          >
            ›
          </button>
        </div>
      )}
    </section>
  );
}
