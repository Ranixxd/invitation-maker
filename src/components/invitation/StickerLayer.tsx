// 섹션 위에 붙은 스티커를 그린다. 위치 정하기 중인 스티커는 끌어서 옮길 수 있다 (CONSTITUTION §4.10)
import { useRef, type CSSProperties } from 'react';
import type { InvitationDoc, Sticker } from '../../types/invitation';
import { clampPos, shapeMask, sizePct, stickersIn } from '../../lib/stickers';
import type { RenderMode } from './InvitationView';

export interface StickerEdit {
  sticker: Sticker;
  onMove: (x: number, y: number) => void;
}

interface Props {
  doc: InvitationDoc;
  sectionId: string;
  mode: RenderMode;
  /** 위치 정하기 중인 스티커 (이 섹션의 것일 때만 그려짐) */
  edit?: StickerEdit | null;
  onStickerClick?: (id: string) => void;
}

export function StickerArt({ sticker, src }: { sticker: Pick<Sticker, 'shape' | 'motion'>; src: string }) {
  const mask = shapeMask(sticker.shape);
  return (
    <span className={`sticker-motion motion-${sticker.motion}`}>
      <img
        className="sticker-img"
        src={src}
        alt=""
        draggable={false}
        style={{ maskImage: mask, WebkitMaskImage: mask } as CSSProperties}
      />
    </span>
  );
}

export function StickerLayer({ doc, sectionId, mode, edit, onStickerClick }: Props) {
  const layer = useRef<HTMLDivElement>(null);
  const editing = edit && edit.sticker.sectionId === sectionId ? edit : null;
  const list = stickersIn(doc.stickers, sectionId).filter((s) => s.id !== editing?.sticker.id);
  if (!list.length && !editing) return null;

  const place = (e: { clientX: number; clientY: number }) => {
    const r = layer.current?.getBoundingClientRect();
    if (!r || !editing) return;
    editing.onMove(clampPos(((e.clientX - r.left) / r.width) * 100), clampPos(((e.clientY - r.top) / r.height) * 100));
  };

  const style = (s: Sticker): CSSProperties => ({ left: `${s.x}%`, top: `${s.y}%`, width: `${sizePct(s.size)}%` });

  return (
    <div
      ref={layer}
      className={`sticker-layer${editing ? ' is-placing' : ''}`}
      // 위치 정하기 중: 섹션 아무 곳이나 누르면 그 자리로 이동 (끌기는 스티커에서만 → 화면 스크롤 유지)
      onClick={editing ? (e) => place(e) : undefined}
    >
      {list.map((s) => {
        const img = doc.images[s.imageId];
        if (!img) return null;
        // 하객 화면: 장식이므로 클릭을 막지 않는다. 편집기: 눌러서 수정
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
            <StickerArt sticker={s} src={img.src} />
          </button>
        ) : (
          <span key={s.id} className="sticker" style={style(s)} aria-hidden>
            <StickerArt sticker={s} src={img.src} />
          </span>
        );
      })}
      {editing && doc.images[editing.sticker.imageId] && (
        <span
          className="sticker is-dragging-target"
          style={style(editing.sticker)}
          role="slider"
          aria-label="스티커 위치 (끌어서 옮기기)"
          aria-valuetext={`가로 ${Math.round(editing.sticker.x)}%, 세로 ${Math.round(editing.sticker.y)}%`}
          tabIndex={0}
          onPointerDown={(e) => {
            e.preventDefault();
            try {
              (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
            } catch {
              /* 캡처 불가 환경 무시 */
            }
            place(e);
          }}
          onPointerMove={(e) => {
            if (e.buttons || e.pointerType === 'touch') place(e);
          }}
          onKeyDown={(e) => {
            const step = 2;
            const { x, y } = editing.sticker;
            const d = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }[e.key];
            if (!d) return;
            e.preventDefault();
            editing.onMove(clampPos(x + d[0]), clampPos(y + d[1]));
          }}
        >
          <StickerArt sticker={editing.sticker} src={doc.images[editing.sticker.imageId].src} />
        </span>
      )}
    </div>
  );
}
