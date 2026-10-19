// 붙이기 흐름 (CONSTITUTION §4.10)
// [붙이기] → 기기 사진 선택 창 → 고르면 바로 붙고 선택된 상태(끌어서 위치 이동)
// 붙은 스티커를 누르면 선택 → 하단 바에서 프레임·크기·움직임 변경, 끌어서 이동, 떼기, 완료
// 모든 변경은 바로 문서에 반영된다(미리보기 = 결과). 모바일·데스크탑이 같은 훅을 쓴다.
import { useRef, useState, type ReactNode } from 'react';
import type { InvitationDoc, Sticker } from '../../types/invitation';
import type { EditorAction } from '../../store/editorReducer';
import { DEFAULT_CROP, MAX_STICKERS_PER_SECTION, MOTIONS, SHAPES, SIZES, stickersIn } from '../../lib/stickers';
import { PhotoAdjust } from './PhotoAdjust';
import { filesToAssets, MAX_IMAGES_PER_DOC } from '../../lib/image';
import { uid } from '../../lib/id';
import { toast } from '../common/toast';
import { StickerArt } from '../invitation/StickerLayer';

/** 새로 붙일 때 기본값: 섹션 가운데, 하트, 뿅뿅, 보통, 사진 조정 없음 (선·그림자 없음) */
const NEW_DEFAULTS = { shape: 'heart', motion: 'bounce', size: 'md', x: 50, y: 50 } as const;

type Tab = 'shape' | 'size' | 'motion';
const TABS: { value: Tab; label: string }[] = [
  { value: 'shape', label: '프레임' },
  { value: 'size', label: '크기' },
  { value: 'motion', label: '움직임' },
];

interface FlowOptions {
  /** 새로 붙인 직후 (모바일: 해당 섹션을 화면 가운데로) */
  onAttached?: (sectionId: string) => void;
  /** 스티커가 선택될 때 (데스크탑: 그 섹션의 편집 패널로) */
  onSelected?: (sectionId: string) => void;
}

export function useStickerFlow(doc: InvitationDoc, dispatch: (a: EditorAction) => void, { onAttached, onSelected }: FlowOptions = {}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('shape');
  const [adjusting, setAdjusting] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const pickFor = useRef<string | null>(null); // 사진을 붙일 섹션 id

  const selected = selectedId ? doc.stickers.find((s) => s.id === selectedId) ?? null : null;
  const image = selected ? doc.images[selected.imageId] : undefined;
  const imgSrc = image?.src;
  const aspect = image?.aspect ?? 1;

  const select = (id: string | null) => {
    setSelectedId(id);
    setAdjusting(false);
    if (!id) return;
    setTab('shape');
    const st = doc.stickers.find((s) => s.id === id);
    if (st) onSelected?.(st.sectionId);
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
    const sticker: Sticker = { id: uid('st'), sectionId, imageId: asset.id, ...NEW_DEFAULTS, crop: DEFAULT_CROP };
    dispatch({ type: 'ADD_STICKER', sticker });
    setSelectedId(sticker.id);
    setTab('shape');
    onSelected?.(sectionId);
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

  /** 탭별 옵션 버튼 (모바일 바·데스크탑 패널 공용) */
  const options = (t: Tab) => {
    if (!selected || !imgSrc) return null;
    const opt = (key: string, on: boolean, label: string, onClick: () => void, art: ReactNode) => (
      <button
        key={key}
        type="button"
        role="radio"
        aria-checked={on}
        className={`sticker-option${on ? ' is-on' : ''}`}
        onClick={onClick}
      >
        {art}
        {label}
      </button>
    );
    const artOf = (st: Parameters<typeof StickerArt>[0]['sticker']) => (
      <span className="sticker-option-art">
        <StickerArt sticker={st} src={imgSrc} aspect={aspect} />
      </span>
    );
    switch (t) {
      case 'shape':
        return SHAPES.map((s) =>
          opt(s.value, selected.shape === s.value, s.label, () => update({ shape: s.value }), artOf({ shape: s.value, motion: 'none', crop: selected.crop })),
        );
      case 'size':
        return SIZES.map((s) =>
          opt(
            s.value,
            selected.size === s.value,
            s.label,
            () => update({ size: s.value }),
            <span className="sticker-option-art size-dot" aria-hidden>
              <i style={{ width: `${s.pct * 1.4}%` }} />
            </span>,
          ),
        );
      case 'motion':
        return MOTIONS.map((m) =>
          opt(m.value, selected.motion === m.value, m.label, () => update({ motion: m.value }), artOf({ ...selected, motion: m.value })),
        );
    }
  };

  // 모바일: 화면 아래 떠 있는 바 (탭으로 한 종류씩)
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
        {options(tab)}
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

  // 데스크탑: 편집 패널(타이틀 아래)을 이 내용으로 교체 — 넓으니 모든 종류를 한 번에 (§4.10)
  const panel = selected && imgSrc && (
    <div className="panel-body sticker-panel">
      <p className="notice sticker-panel-hint">오른쪽 미리보기에서 스티커를 끌거나 섹션 안을 눌러 위치를 옮길 수 있어요.</p>
      {TABS.map((t) => (
        <section key={t.value} className="panel-section">
          <header>
            <h3>{t.label}</h3>
          </header>
          <div className="sticker-options is-wrap" role="radiogroup" aria-label={t.label}>
            {options(t.value)}
          </div>
        </section>
      ))}
      {/* 사진 조정은 미리보기의 선택 박스 아래 버튼으로만 (패널에 중복 두지 않음) */}
      <div className="sticker-panel-actions">
        <button type="button" className="btn btn-ghost sticker-remove" onClick={remove}>
          떼기
        </button>
        <button type="button" className="btn btn-primary sticker-done" onClick={() => select(null)}>
          붙이기 완료
        </button>
      </div>
    </div>
  );

  // [사진 조정] 에디터: 취소하면 그대로, 완료하면 반영
  const adjustEditor = selected && image && adjusting && (
    <PhotoAdjust
      sticker={selected}
      image={image}
      onCancel={() => setAdjusting(false)}
      onDone={(crop) => {
        update({ crop });
        setAdjusting(false);
      }}
    />
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
    /** 선택 해제 (= 붙이기 완료) */
    deselect: () => select(null),
    /** 스티커를 선택(이동·꾸미기) 중인지 */
    placing: !!selected,
    picker,
    stickerEdit: selected
      ? { sticker: selected, onMove: (x: number, y: number) => update({ x, y }), onAdjust: () => setAdjusting(true) }
      : null,
    /** 모바일용 떠 있는 바 */
    placementBar: bar,
    /** 데스크탑용 편집 패널 내용 */
    panel,
    /** 사진 조정 에디터(포털) — 편집기 어딘가에 렌더 */
    adjustEditor,
  };
}
