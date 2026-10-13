// 사진 조정: 선택한 프레임 안에서 사진 크기·위치 조절. 프레임 밖은 검은 dim으로 보여준다 (CONSTITUTION §4.10)
// - 끌기: 이동 / 핀치·휠·막대: 확대 / 프레임에 빈틈이 생기지 않게 범위 제한(clampCrop)
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react';
import { createPortal } from 'react-dom';
import type { ImageAsset, Sticker, StickerCrop } from '../../types/invitation';
import { clampCrop, coverSize, CROP_SCALE_MAX, CROP_SCALE_MIN, DEFAULT_CROP, shapeMask } from '../../lib/stickers';

interface Props {
  sticker: Sticker;
  image: ImageAsset;
  onCancel: () => void;
  onDone: (crop: StickerCrop) => void;
}

/** 프레임 = 무대 너비의 72% 정사각형, 무대 가운데 */
const FRAME_RATIO = 0.72;

export function PhotoAdjust({ sticker, image, onCancel, onDone }: Props) {
  const [crop, setCrop] = useState<StickerCrop>(() => clampCrop(sticker.crop ?? DEFAULT_CROP, image.aspect));
  const stage = useRef<HTMLDivElement>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<{ crop: StickerCrop; x: number; y: number; dist: number } | null>(null);

  const set = (c: StickerCrop) => setCrop(clampCrop(c, image.aspect));
  const framePx = () => (stage.current?.clientWidth ?? 300) * FRAME_RATIO;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onCancel();
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onCancel]);

  const startGesture = () => {
    const pts = [...pointers.current.values()];
    const cx = pts.reduce((a, p) => a + p.x, 0) / pts.length;
    const cy = pts.reduce((a, p) => a + p.y, 0) / pts.length;
    const dist = pts.length > 1 ? Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) : 0;
    gesture.current = { crop, x: cx, y: cy, dist };
  };

  const onDown = (e: PointerEvent) => {
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    startGesture();
  };

  const onMove = (e: PointerEvent) => {
    if (!pointers.current.has(e.pointerId) || !gesture.current) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const pts = [...pointers.current.values()];
    const g = gesture.current;
    const cx = pts.reduce((a, p) => a + p.x, 0) / pts.length;
    const cy = pts.reduce((a, p) => a + p.y, 0) / pts.length;
    const f = framePx();
    let scale = g.crop.scale;
    if (pts.length > 1 && g.dist > 0) scale = g.crop.scale * (Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) / g.dist);
    set({ scale, ox: g.crop.ox + ((cx - g.x) / f) * 100, oy: g.crop.oy + ((cy - g.y) / f) * 100 });
  };

  const onUp = (e: PointerEvent) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size) startGesture();
    else gesture.current = null;
  };

  const { w, h } = coverSize(image.aspect);
  const mask = shapeMask(sticker.shape);
  const framePct = FRAME_RATIO * 100;

  return createPortal(
    <div className="adjust-root" role="dialog" aria-modal="true" aria-label="사진 조정">
      <header className="adjust-head">
        <button type="button" className="adjust-text-btn" onClick={onCancel}>
          취소
        </button>
        <h2>사진 조정</h2>
        <button type="button" className="adjust-text-btn is-primary" onClick={() => onDone(crop)}>
          완료
        </button>
      </header>

      <div
        ref={stage}
        className="adjust-stage"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onWheel={(e) => set({ ...crop, scale: crop.scale * (e.deltaY < 0 ? 1.06 : 1 / 1.06) })}
      >
        {/* 프레임 기준으로 배치한 사진 전체(프레임 밖 부분은 아래 dim에 덮임) */}
        <div className="adjust-frame-box" style={{ width: `${framePct}%` }}>
          <img
            className="adjust-photo"
            src={image.src}
            alt=""
            draggable={false}
            style={{
              width: `${w}%`,
              height: `${h}%`,
              left: `${50 + crop.ox}%`,
              top: `${50 + crop.oy}%`,
              transform: `translate(-50%, -50%) scale(${crop.scale})`,
            }}
          />
        </div>
        {/* 프레임 모양만 뚫린 검은 dim */}
        <div
          className="adjust-dim"
          style={
            {
              WebkitMaskImage: `${mask}, linear-gradient(#000 0 0)`,
              maskImage: `${mask}, linear-gradient(#000 0 0)`,
              WebkitMaskSize: `${framePct}% ${framePct}%, 100% 100%`,
              maskSize: `${framePct}% ${framePct}%, 100% 100%`,
              WebkitMaskPosition: 'center, center',
              maskPosition: 'center, center',
              WebkitMaskRepeat: 'no-repeat',
              maskRepeat: 'no-repeat',
              WebkitMaskComposite: 'xor',
              maskComposite: 'exclude',
            } as CSSProperties
          }
        />
      </div>

      <div className="adjust-controls">
        <p className="adjust-hint">사진을 끌어 위치를, 아래 막대(또는 두 손가락)로 크기를 조절하세요</p>
        <div className="adjust-zoom">
          <span aria-hidden>－</span>
          <input
            type="range"
            min={CROP_SCALE_MIN}
            max={CROP_SCALE_MAX}
            step={0.01}
            value={crop.scale}
            aria-label="사진 크기"
            onChange={(e) => set({ ...crop, scale: Number(e.target.value) })}
          />
          <span aria-hidden>＋</span>
        </div>
        <button type="button" className="adjust-text-btn" onClick={() => setCrop(DEFAULT_CROP)}>
          처음 상태로
        </button>
      </div>
    </div>,
    document.body,
  );
}
