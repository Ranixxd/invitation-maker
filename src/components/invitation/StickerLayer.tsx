// 스티커는 섹션에 잘리지 않도록 청첩장 최상단 레이어(StickerOverlay)에 그린다 (CONSTITUTION §4.10)
// - 위치는 여전히 "섹션 기준 %" — 섹션의 레이아웃 위치(offsetTop 등)를 재서 겹쳐 그린다
// - 섹션 순서 변경·내용 변경으로 높이가 바뀌면 ResizeObserver로 다시 잰다
// - 위치 정하기 중에는 섹션 안 PlacingHitArea를 눌러도 그 자리로 옮길 수 있다
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type RefObject } from 'react';
import type { InvitationDoc, Sticker } from '../../types/invitation';
import { clampPos, coverSize, DEFAULT_CROP, shapeMask, sizePct } from '../../lib/stickers';
import type { RenderMode } from './InvitationView';

export interface StickerEdit {
  sticker: Sticker;
  onMove: (x: number, y: number) => void;
  /** 선택 박스의 [사진 조정] 버튼 */
  onAdjust?: () => void;
}

type ArtProps = {
  sticker: Pick<Sticker, 'shape' | 'motion'> & Partial<Pick<Sticker, 'crop'>>;
  src: string;
  /** 사진 가로/세로 비율 (사진 조정 계산용) */
  aspect: number;
};

/** 프레임 모양으로 잘린 사진. 사진 조정(crop)은 프레임 안에서의 확대·이동 */
export function StickerPhoto({ shape, crop, src, aspect }: { shape: Sticker['shape']; crop: Sticker['crop']; src: string; aspect: number }) {
  const mask = shapeMask(shape);
  const { w, h } = coverSize(aspect);
  return (
    <span className="sticker-shape" style={{ maskImage: mask, WebkitMaskImage: mask } as CSSProperties}>
      <img
        className="sticker-img"
        src={src}
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
    </span>
  );
}

/** 스티커 한 장: 움직임 + 프레임 사진. 선·그림자 없음 (CONSTITUTION §4.10) */
export function StickerArt({ sticker, src, aspect }: ArtProps) {
  const crop = sticker.crop ?? DEFAULT_CROP;
  return (
    <span className={`sticker-motion motion-${sticker.motion}`}>
      <StickerPhoto shape={sticker.shape} crop={crop} src={src} aspect={aspect} />
    </span>
  );
}

/** 섹션 안 좌표(%) 계산: 화면 좌표 → 섹션 기준 % (경계까지 허용) */
function toSectionPct(root: HTMLElement | null, sectionId: string, clientX: number, clientY: number) {
  const el = root?.querySelector<HTMLElement>(`[data-section-id="${sectionId}"]`);
  const r = el?.getBoundingClientRect();
  if (!r || !r.width || !r.height) return null;
  return { x: clampPos(((clientX - r.left) / r.width) * 100), y: clampPos(((clientY - r.top) / r.height) * 100) };
}

/** 위치 정하기 중: 섹션 아무 곳이나 누르면 그 자리로 이동 (끌기는 스티커에서만 → 화면 스크롤 유지) */
export function PlacingHitArea({ edit, sectionId }: { edit: StickerEdit; sectionId: string }) {
  return (
    <div
      className="sticker-hit-area"
      onClick={(e) => {
        const root = (e.currentTarget as HTMLElement).closest<HTMLElement>('.inv');
        const p = toSectionPct(root, sectionId, e.clientX, e.clientY);
        if (p) edit.onMove(p.x, p.y);
      }}
    />
  );
}

interface Box {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface OverlayProps {
  doc: InvitationDoc;
  mode: RenderMode;
  rootRef: RefObject<HTMLDivElement>;
  edit?: StickerEdit | null;
  onStickerClick?: (id: string) => void;
}

export function StickerOverlay({ doc, mode, rootRef, edit, onStickerClick }: OverlayProps) {
  const [boxes, setBoxes] = useState<Record<string, Box>>({});
  // 오버레이 자신의 ref로 청첩장 루트(부모)를 찾는다.
  // 부모(InvitationView)의 ref는 자식의 layout effect보다 늦게 붙어서, 첫 렌더에 비어 있다(개발 모드 StrictMode에서는 두 번 실행돼 가려졌던 버그).
  const overlayRef = useRef<HTMLDivElement>(null);
  const getRoot = () => overlayRef.current?.parentElement ?? rootRef.current;
  const sectionKey = doc.sections.map((s) => `${s.id}:${s.enabled}`).join('|');

  // 섹션의 레이아웃 위치를 잰다 (offset*은 등장 애니메이션 transform의 영향을 받지 않음)
  useLayoutEffect(() => {
    const root = getRoot();
    if (!root) return;
    const measure = () => {
      const next: Record<string, Box> = {};
      root.querySelectorAll<HTMLElement>(':scope > [data-section-id]').forEach((el) => {
        next[el.dataset.sectionId!] = { top: el.offsetTop, left: el.offsetLeft, width: el.offsetWidth, height: el.offsetHeight };
      });
      setBoxes(next);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(root);
    root.querySelectorAll(':scope > [data-section-id]').forEach((el) => ro.observe(el));
    return () => ro.disconnect();
  }, [sectionKey]);

  // 하객 화면: 섹션처럼 화면에 들어올 때 나타나게 (§4.10)
  useEffect(() => {
    const root = getRoot();
    if (mode !== 'view' || !root) return;
    const els = root.querySelectorAll('.sticker-reveal:not(.is-visible)');
    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('is-visible'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-visible');
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.2 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [mode, boxes, doc.stickers]);

  const editing = edit ?? null;
  const list = doc.stickers.filter((s) => s.id !== editing?.sticker.id && boxes[s.sectionId]);

  const style = (s: Sticker): CSSProperties => {
    const b = boxes[s.sectionId];
    return {
      left: b.left + (b.width * s.x) / 100,
      top: b.top + (b.height * s.y) / 100,
      width: (b.width * sizePct(s.size)) / 100,
    };
  };

  return (
    <div ref={overlayRef} className={`sticker-overlay${editing ? ' is-placing' : ''}`}>
      {list.map((s) => {
        const img = doc.images[s.imageId];
        if (!img) return null;
        // 하객 화면: 장식이므로 누를 수 없음(아래 버튼을 가리지 않음). 편집기: 눌러서 수정
        return mode === 'preview' && onStickerClick ? (
          <button
            key={s.id}
            type="button"
            className="sticker is-editable"
            style={style(s)}
            aria-label="스티커 수정"
            onClick={(e) => {
              e.stopPropagation();
              onStickerClick(s.id);
            }}
          >
            <StickerArt sticker={s} src={img.src} aspect={img.aspect} />
          </button>
        ) : (
          <span key={s.id} className={`sticker${mode === 'view' ? ' sticker-reveal' : ''}`} style={style(s)} aria-hidden>
            <StickerArt sticker={s} src={img.src} aspect={img.aspect} />
          </span>
        );
      })}
      {editing && boxes[editing.sticker.sectionId] && doc.images[editing.sticker.imageId] && (
        <DraftSticker
          edit={editing}
          rootRef={rootRef}
          style={style(editing.sticker)}
          src={doc.images[editing.sticker.imageId].src}
          aspect={doc.images[editing.sticker.imageId].aspect}
        />
      )}
    </div>
  );
}

function DraftSticker({
  edit,
  rootRef,
  style,
  src,
  aspect,
}: {
  edit: StickerEdit;
  rootRef: RefObject<HTMLDivElement>;
  style: CSSProperties;
  src: string;
  aspect: number;
}) {
  const dragging = useRef(false);
  const move = (clientX: number, clientY: number) => {
    const p = toSectionPct(rootRef.current, edit.sticker.sectionId, clientX, clientY);
    if (p) edit.onMove(p.x, p.y);
  };
  return (
    <span
      className="sticker is-dragging-target"
      style={style}
      role="slider"
      aria-label="스티커 위치 (끌어서 옮기기)"
      aria-valuetext={`가로 ${Math.round(edit.sticker.x)}%, 세로 ${Math.round(edit.sticker.y)}%`}
      tabIndex={0}
      onPointerDown={(e) => {
        e.preventDefault();
        dragging.current = true;
        try {
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        } catch {
          /* 캡처 불가 환경 무시 */
        }
      }}
      onPointerMove={(e) => {
        if (dragging.current) move(e.clientX, e.clientY);
      }}
      onPointerUp={() => (dragging.current = false)}
      onPointerCancel={() => (dragging.current = false)}
      onKeyDown={(e) => {
        const step = 2;
        const { x, y } = edit.sticker;
        const d = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }[e.key];
        if (!d) return;
        e.preventDefault();
        edit.onMove(clampPos(x + d[0]), clampPos(y + d[1]));
      }}
    >
      <StickerArt sticker={edit.sticker} src={src} aspect={aspect} />
      {edit.onAdjust && (
        // 선택 박스 테두리 아래 [사진 조정] (§4.10). 끌기와 겹치지 않게 포인터 이벤트를 막는다
        <button
          type="button"
          className="sticker-adjust-chip"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            edit.onAdjust?.();
          }}
        >
          사진 조정
        </button>
      )}
    </span>
  );
}
