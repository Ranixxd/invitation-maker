// 사진 칸: 필요한 장수만큼 칸을 두고 칸을 눌러 하나씩 채운다 (CONSTITUTION §6.8)
// 빈 칸을 누르면 남은 빈 칸 수만큼 한 번에 고를 수 있고, 채운 칸은 변경·삭제만 한다.
import { useRef, useState } from 'react';
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
}

/** 히어로·갤러리·스티커 중 이 사진을 쓰는 곳의 수 */
function refCount(doc: InvitationDoc, id: string): number {
  let n = doc.stickers.filter((st) => st.imageId === id).length;
  for (const s of doc.sections) {
    if (s.type === 'hero') n += (s.data.imageId === id ? 1 : 0) + (s.data.extraImageIds ?? []).filter((x) => x === id).length;
    if (s.type === 'gallery') n += s.data.imageIds.filter((x) => x === id).length;
  }
  return n;
}

export function PhotoSlots({ doc, dispatch, slots, onChange, label }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const target = useRef<{ kind: 'add'; at: number } | { kind: 'replace'; at: number }>({ kind: 'add', at: 0 });
  const [busy, setBusy] = useState(false);
  const empty = slots.filter((s) => !s).length;

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

  return (
    <div className="photo-slots" role="list" aria-label={label}>
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
        return (
          <div key={i} className="photo-slot" role="listitem">
            {img ? (
              <>
                <img src={img.src} alt="" />
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
