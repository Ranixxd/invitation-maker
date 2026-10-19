// 사진 칸: 필요한 장수만큼 칸을 두고 칸을 눌러 하나씩 채운다 (CONSTITUTION §6.8)
// 빈 칸을 누르면 남은 빈 칸 수만큼 한 번에 고를 수 있고, 채운 칸은 변경·삭제만 한다.
// reorderable이면 채운 칸의 손잡이(⠿)를 끌어 순서를 바꾼다 (포인터 이벤트, 터치 공통 — §6.7과 같은 방식)
import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import type { InvitationDoc, ImageAsset } from '../../types/invitation';
import type { EditorAction } from '../../store/editorReducer';
import { filesToAssets, MAX_IMAGES_PER_DOC } from '../../lib/image';
import { toast } from '../common/toast';

type Slot = string | null;

interface Props {
  doc: InvitationDoc;
  dispatch: (a: EditorAction) => void;
  /** 칸마다 들어 있는 사진 id (빈 칸은 null). 길이 = 칸 수 */
  slots: Slot[];
  /** 칸 내용이 바뀌었을 때 섹션에 반영 */
  onChange: (slots: Slot[]) => void;
  label: string;
  /** 끌어서 순서 바꾸기 (채운 칸은 앞쪽에 모여 있어야 한다) */
  reorderable?: boolean;
}

interface Drag {
  from: number;
  to: number;
  dx: number;
  dy: number;
}

/** 히어로·갤러리·마무리·스티커 중 이 사진을 쓰는 곳의 수 */
function refCount(doc: InvitationDoc, id: string): number {
  let n = doc.stickers.filter((st) => st.imageId === id).length;
  const count = (ids: (string | null | undefined)[]) => ids.filter((x) => x === id).length;
  for (const s of doc.sections) {
    if (s.type === 'hero') n += count([s.data.imageId, ...(s.data.extraImageIds ?? [])]);
    if (s.type === 'gallery') n += count(s.data.imageIds);
    if (s.type === 'closing') n += count(s.data.imageIds ?? []);
  }
  return n;
}

export function PhotoSlots({ doc, dispatch, slots, onChange, label, reorderable = false }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const target = useRef<{ kind: 'add'; at: number } | { kind: 'replace'; at: number }>({ kind: 'add', at: 0 });
  const [busy, setBusy] = useState(false);
  const empty = slots.filter((s) => !s).length;
  const filled = slots.filter((s): s is string => !!s);

  const slotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const start = useRef({ x: 0, y: 0 });
  const [drag, setDrag] = useState<Drag | null>(null);
  const dragRef = useRef<Drag | null>(null);
  const setDragBoth = (d: Drag | null) => {
    dragRef.current = d;
    setDrag(d);
  };

  /** 이 칸에서 빠진 사진을 다른 곳에서 안 쓰면 문서에서도 지운다 (§3.3) */
  const release = (id: string) => {
    if (refCount(doc, id) <= 1) dispatch({ type: 'REMOVE_IMAGE', imageId: id });
  };

  const toAssets = async (files: File[], n: number): Promise<ImageAsset[]> => {
    const room = Math.min(n, MAX_IMAGES_PER_DOC - Object.keys(doc.images).length);
    if (room <= 0) {
      toast(`사진은 초대장당 최대 ${MAX_IMAGES_PER_DOC}장이에요`);
      return [];
    }
    if (files.length > n) toast(`${n}장까지만 넣었어요`);
    setBusy(true);
    const assets = await filesToAssets(files, room);
    setBusy(false);
    if (assets.length) dispatch({ type: 'ADD_IMAGES', images: assets, target: 'pool' });
    return assets;
  };

  const onFiles = async (files: File[]) => {
    const t = target.current;
    if (t.kind === 'replace') {
      const [asset] = await toAssets(files.slice(0, 1), 1);
      if (!asset) return;
      const old = slots[t.at];
      onChange(slots.map((s, i) => (i === t.at ? asset.id : s)));
      if (old) release(old);
      return;
    }
    const assets = await toAssets(files, empty);
    if (!assets.length) return;
    // 누른 칸부터 빈 칸을 차례로 채우고, 남으면 앞쪽 빈 칸으로
    const order = [...slots.keys()].map((k) => (t.at + k) % slots.length).filter((i) => !slots[i]);
    const next = [...slots];
    assets.forEach((a, k) => (next[order[k]] = a.id));
    onChange(next);
  };

  const pick = (kind: 'add' | 'replace', at: number) => {
    target.current = { kind, at };
    const el = input.current;
    if (!el) return;
    el.multiple = kind === 'add' && empty > 1;
    el.click();
  };

  // ---- 끌어서 순서 바꾸기 ----
  const move = (from: number, to: number) => {
    if (from === to) return;
    const next = [...filled];
    const [m] = next.splice(from, 1);
    next.splice(to, 0, m);
    onChange([...next, ...Array<Slot>(slots.length - next.length).fill(null)]);
  };

  /** 포인터 아래에 있는 채운 칸 (없으면 가장 가까운 칸) */
  const indexAt = (x: number, y: number): number => {
    let best = 0;
    let bestD = Infinity;
    filled.forEach((_, i) => {
      const r = slotRefs.current[i]?.getBoundingClientRect();
      if (!r) return;
      const d = Math.hypot(r.left + r.width / 2 - x, r.top + r.height / 2 - y);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    });
    return best;
  };

  const onHandleDown = (e: PointerEvent, i: number) => {
    e.preventDefault();
    start.current = { x: e.clientX, y: e.clientY };
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      /* 캡처 불가 환경 무시 */
    }
    setDragBoth({ from: i, to: i, dx: 0, dy: 0 });
  };

  const onHandleMove = (e: PointerEvent) => {
    const d = dragRef.current;
    if (!d) return;
    setDragBoth({ ...d, dx: e.clientX - start.current.x, dy: e.clientY - start.current.y, to: indexAt(e.clientX, e.clientY) });
  };

  const onHandleUp = () => {
    const d = dragRef.current;
    if (!d) return;
    move(d.from, d.to);
    setDragBoth(null);
  };

  const onHandleKey = (e: KeyboardEvent, i: number) => {
    const dir = e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : 0;
    if (!dir) return;
    e.preventDefault();
    const to = i + dir;
    if (to >= 0 && to < filled.length) move(i, to);
  };

  return (
    <div className={`photo-slots${drag ? ' is-dragging' : ''}`} role="list" aria-label={label}>
      <input
        ref={input}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          if (e.target.files) onFiles(Array.from(e.target.files));
          e.target.value = '';
        }}
      />
      {slots.map((id, i) => {
        const img = id ? doc.images[id] : null;
        const dragged = drag?.from === i;
        const cls = `photo-slot${dragged ? ' is-dragged' : ''}${drag && !dragged && drag.to === i ? ' is-target' : ''}`;
        return (
          <div
            key={img ? img.id : `empty-${i}`}
            ref={(el) => (slotRefs.current[i] = el)}
            className={cls}
            role="listitem"
            style={dragged ? { transform: `translate(${drag.dx}px, ${drag.dy}px)` } : undefined}
          >
            {img ? (
              <>
                <img src={img.src} alt="" draggable={false} />
                {reorderable && filled.length > 1 && (
                  <button
                    type="button"
                    className="photo-slot-handle"
                    aria-label={`사진 ${i + 1} 순서 변경 (끌거나 방향키)`}
                    onPointerDown={(e) => onHandleDown(e, i)}
                    onPointerMove={onHandleMove}
                    onPointerUp={onHandleUp}
                    onPointerCancel={onHandleUp}
                    onKeyDown={(e) => onHandleKey(e, i)}
                  >
                    <span aria-hidden>⠿</span>
                  </button>
                )}
                <div className="photo-slot-actions">
                  <button type="button" disabled={busy} onClick={() => pick('replace', i)}>
                    변경
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => {
                      onChange(slots.map((s, j) => (j === i ? null : s)));
                      release(img.id);
                    }}
                  >
                    삭제
                  </button>
                </div>
              </>
            ) : (
              <button type="button" className="photo-slot-add" disabled={busy} onClick={() => pick('add', i)}>
                <span aria-hidden>+</span>
                {busy ? '처리 중…' : '사진 추가'}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
