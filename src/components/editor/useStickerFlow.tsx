// 붙이기 흐름 (CONSTITUTION §4.10)
// [붙이기] → 기기 사진 선택 창 → 고르면 바로 붙고 선택된 상태(끌어서 위치 이동)
// 붙은 스티커를 누르면 선택 → 하단 바에서 프레임·크기·움직임 변경, 끌어서 이동, 떼기, 완료
// 모든 변경은 바로 문서에 반영된다(미리보기 = 결과). 모바일·데스크탑이 같은 훅을 쓴다.
import { useRef, useState } from 'react';
import type { InvitationDoc, Sticker } from '../../types/invitation';
import type { EditorAction } from '../../store/editorReducer';
import { MAX_STICKERS_PER_SECTION, MOTIONS, SHAPES, SIZES, stickersIn } from '../../lib/stickers';
import { filesToAssets, MAX_IMAGES_PER_DOC } from '../../lib/image';
import { uid } from '../../lib/id';
import { toast } from '../common/toast';
import { StickerArt } from '../invitation/StickerLayer';

/** 새로 붙일 때 기본값: 섹션 가운데, 하트, 뿅뿅, 보통 */
const NEW_DEFAULTS = { shape: 'heart', motion: 'bounce', size: 'md', x: 50, y: 50 } as const;

type Tab = 'shape' | 'size' | 'motion';
const TABS: { value: Tab; label: string }[] = [
  { value: 'shape', label: '프레임' },
  { value: 'size', label: '크기' },
  { value: 'motion', label: '움직임' },
];

export function useStickerFlow(
  doc: InvitationDoc,
  dispatch: (a: EditorAction) => void,
  /** 새로 붙인 스티커의 섹션을 화면 가운데로 */
  onAttached?: (sectionId: string) => void,
) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('shape');
  const fileInput = useRef<HTMLInputElement>(null);
  const pickFor = useRef<string | null>(null); // 사진을 붙일 섹션 id

  const selected = selectedId ? doc.stickers.find((s) => s.id === selectedId) ?? null : null;
  const imgSrc = selected ? doc.images[selected.imageId]?.src : undefined;

  const select = (id: string | null) => {
    setSelectedId(id);
    if (id) setTab('shape');
  };

  // [붙이기]: 버튼을 누른 그 자리에서 기기 사진 선택 창을 연다 (사용자 동작 안에서 호출해야 함)
  const startNew = (sectionId: string) => {
    if (stickersIn(doc.stickers, sectionId).length >= MAX_STICKERS_PER_SECTION) {
      toast(`한 섹션에는 스티커를 ${MAX_STICKERS_PER_SECTION}개까지 붙일 수 있어요`);
      return;
    }
    if (Object.keys(doc.images).length >= MAX_IMAGES_PER_DOC) {
      toast(`사진은 청첩장당 최대 ${MAX_IMAGES_PER_DOC}장이에요`);
      return;
    }
    setSelectedId(null);
    pickFor.current = sectionId;
    fileInput.current?.click();
  };

  // 사진을 고르면 바로 붙이고 선택 상태로 → 곧바로 끌어서 위치 이동
  const onPicked = async (files: FileList | null) => {
    const sectionId = pickFor.current;
    pickFor.current = null;
    if (!files?.length || !sectionId) return; // 선택 창을 닫으면 아무것도 하지 않는다
    const [asset] = await filesToAssets(Array.from(files).slice(0, 1), 1);
    if (!asset) {
      toast('이 사진은 불러올 수 없어요');
      return;
    }
    dispatch({ type: 'ADD_IMAGES', images: [asset], target: 'pool' });
    const sticker: Sticker = { id: uid('st'), sectionId, imageId: asset.id, ...NEW_DEFAULTS };
    dispatch({ type: 'ADD_STICKER', sticker });
    setSelectedId(sticker.id);
    setTab('shape');
    onAttached?.(sectionId);
  };

  const update = (patch: Partial<Omit<Sticker, 'id'>>) => {
    if (selectedId) dispatch({ type: 'UPDATE_STICKER', stickerId: selectedId, patch });
  };

  const remove = () => {
    if (!selectedId) return;
    dispatch({ type: 'REMOVE_STICKER', stickerId: selectedId });
    setSelectedId(null);
    toast('스티커를 뗐어요');
  };

  const bar = selected && imgSrc && (
    <div className="placement-bar sticker-bar" role="toolbar" aria-label="선택한 스티커">
      <p className="placement-hint">끌거나 섹션 안을 눌러 위치를 옮길 수 있어요</p>
      <div className="segmented sticker-tabs" role="tablist" aria-label="스티커 꾸미기">
        {TABS.map((t) => (
          <button
            key={t.value}
            type="button"
            role="tab"
            aria-selected={tab === t.value}
            className={tab === t.value ? 'is-on' : ''}
            onClick={() => setTab(t.value)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="sticker-options" role="radiogroup" aria-label={TABS.find((t) => t.value === tab)?.label}>
        {tab === 'shape' &&
          SHAPES.map((s) => (
            <button
              key={s.value}
              type="button"
              role="radio"
              aria-checked={selected.shape === s.value}
              className={`sticker-option${selected.shape === s.value ? ' is-on' : ''}`}
              onClick={() => update({ shape: s.value })}
            >
              <span className="sticker-option-art">
                <StickerArt sticker={{ shape: s.value, motion: 'none' }} src={imgSrc} />
              </span>
              {s.label}
            </button>
          ))}
        {tab === 'size' &&
          SIZES.map((s) => (
            <button
              key={s.value}
              type="button"
              role="radio"
              aria-checked={selected.size === s.value}
              className={`sticker-option${selected.size === s.value ? ' is-on' : ''}`}
              onClick={() => update({ size: s.value })}
            >
              <span className="sticker-option-art size-dot" aria-hidden>
                <i style={{ width: `${s.pct * 1.4}%` }} />
              </span>
              {s.label}
            </button>
          ))}
        {tab === 'motion' &&
          MOTIONS.map((m) => (
            <button
              key={m.value}
              type="button"
              role="radio"
              aria-checked={selected.motion === m.value}
              className={`sticker-option${selected.motion === m.value ? ' is-on' : ''}`}
              onClick={() => update({ motion: m.value })}
            >
              <span className="sticker-option-art">
                <StickerArt sticker={{ shape: selected.shape, motion: m.value }} src={imgSrc} />
              </span>
              {m.label}
            </button>
          ))}
      </div>

      <div className="placement-row">
        <button type="button" className="btn btn-ghost sm sticker-remove" onClick={remove}>
          떼기
        </button>
        <button type="button" className="btn btn-primary sm sticker-done" onClick={() => select(null)}>
          완료
        </button>
      </div>
    </div>
  );

  /** 편집기 어딘가에 한 번 렌더해야 하는 숨은 사진 선택 입력 */
  const picker = (
    <input
      ref={fileInput}
      type="file"
      accept="image/*"
      hidden
      onChange={(e) => {
        void onPicked(e.target.files);
        e.target.value = '';
      }}
    />
  );

  return {
    startNew,
    /** 붙은 스티커 누르기 → 선택 */
    openExisting: (id: string) => select(id),
    /** 스티커를 선택(이동·꾸미기) 중인지 */
    placing: !!selected,
    picker,
    stickerEdit: selected
      ? { sticker: selected, onMove: (x: number, y: number) => update({ x, y }) }
      : null,
    placementBar: bar,
  };
}
