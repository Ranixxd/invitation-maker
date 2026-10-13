// 붙이기 흐름 (CONSTITUTION §4.10)
// [붙이기] → ① 사진 선택(기기 사진 선택 창 바로 호출) → ② 프레임 → ③ 움직임 → ④ 위치(섹션 안) → 완료
// 모바일·데스크탑 편집기가 같은 흐름을 쓰도록 훅으로 묶는다.
import { useCallback, useRef, useState } from 'react';
import type { InvitationDoc, Sticker, StickerMotion, StickerShape, StickerSize } from '../../types/invitation';
import type { EditorAction } from '../../store/editorReducer';
import { MAX_STICKERS_PER_SECTION, MOTIONS, SHAPES, SIZES, stickersIn } from '../../lib/stickers';
import { filesToAssets, MAX_IMAGES_PER_DOC } from '../../lib/image';
import { uid } from '../../lib/id';
import { toast } from '../common/toast';
import { StickerArt } from '../invitation/StickerLayer';

type Step = 'frame' | 'motion';

interface Draft {
  imageId: string;
  shape: StickerShape;
  motion: StickerMotion;
  size: StickerSize;
  x: number;
  y: number;
}

interface Wizard {
  sectionId: string;
  stickerId: string | null; // null = 새 스티커
  step: Step;
  draft: Draft;
}

const NEW_DEFAULTS = { shape: 'heart', motion: 'bounce', size: 'md', x: 78, y: 22 } as const;
const STEP_LABELS = ['사진', '프레임', '움직임', '위치'];

export function useStickerFlow(
  doc: InvitationDoc,
  dispatch: (a: EditorAction) => void,
  onStartPlacing?: (sectionId: string) => void,
) {
  const [wizard, setWizardState] = useState<Wizard | null>(null);
  const [open, setOpen] = useState(false);
  const [placing, setPlacingState] = useState<{ sticker: Sticker; isNew: boolean } | null>(null);
  // 빠르게 연달아 누를 때(예: 움직임 고르고 바로 '위치 정하기')도 최신 값을 쓰도록 ref에 함께 보관
  const wizardRef = useRef<Wizard | null>(null);
  const placingRef = useRef<{ sticker: Sticker; isNew: boolean } | null>(null);
  const setWizard = (next: Wizard | null) => {
    wizardRef.current = next;
    setWizardState(next);
  };
  const setPlacing = (next: { sticker: Sticker; isNew: boolean } | null) => {
    placingRef.current = next;
    setPlacingState(next);
  };
  const fileInput = useRef<HTMLInputElement>(null);
  /** 사진 선택 창을 연 이유: 새 스티커(섹션 id) 또는 기존 스티커의 사진 바꾸기 */
  const pickFor = useRef<{ sectionId: string } | { replace: true } | null>(null);

  const close = useCallback(() => setOpen(false), []);

  // ① 사진 선택: 버튼을 누른 그 자리에서 기기 사진 선택 창을 바로 연다 (사용자 동작 안에서 호출해야 함)
  const openPicker = () => {
    if (Object.keys(doc.images).length >= MAX_IMAGES_PER_DOC) {
      toast(`사진은 청첩장당 최대 ${MAX_IMAGES_PER_DOC}장이에요`);
      return false;
    }
    fileInput.current?.click();
    return true;
  };

  const startNew = (sectionId: string) => {
    if (stickersIn(doc.stickers, sectionId).length >= MAX_STICKERS_PER_SECTION) {
      toast(`한 섹션에는 스티커를 ${MAX_STICKERS_PER_SECTION}개까지 붙일 수 있어요`);
      return;
    }
    pickFor.current = { sectionId };
    openPicker();
  };

  const onPicked = async (files: FileList | null) => {
    const reason = pickFor.current;
    pickFor.current = null;
    if (!files?.length || !reason) return; // 선택 창을 닫으면 아무것도 하지 않는다
    const [asset] = await filesToAssets(Array.from(files).slice(0, 1), 1);
    if (!asset) {
      toast('이 사진은 불러올 수 없어요');
      return;
    }
    dispatch({ type: 'ADD_IMAGES', images: [asset], target: 'pool' });
    if ('sectionId' in reason) {
      // ② 프레임 단계로
      setWizard({ sectionId: reason.sectionId, stickerId: null, step: 'frame', draft: { imageId: asset.id, ...NEW_DEFAULTS } });
      setOpen(true);
    } else {
      const cur = wizardRef.current;
      if (cur) setWizard({ ...cur, draft: { ...cur.draft, imageId: asset.id } });
    }
  };

  const openExisting = (stickerId: string) => {
    const st = doc.stickers.find((s) => s.id === stickerId);
    if (!st) return;
    const { imageId, shape, motion, size, x, y } = st;
    setWizard({ sectionId: st.sectionId, stickerId, step: 'frame', draft: { imageId, shape, motion, size, x, y } });
    setOpen(true);
  };

  const patch = (p: Partial<Draft>) => {
    const cur = wizardRef.current;
    if (cur) setWizard({ ...cur, draft: { ...cur.draft, ...p } });
  };
  const go = (step: Step) => {
    const cur = wizardRef.current;
    if (cur) setWizard({ ...cur, step });
  };

  // ④ 위치: 시트를 닫고 섹션 위에서 위치를 정한다
  const beginPlacing = () => {
    const w = wizardRef.current;
    if (!w) return;
    const sticker: Sticker = { id: w.stickerId ?? uid('st'), sectionId: w.sectionId, ...w.draft };
    setPlacing({ sticker, isNew: !w.stickerId });
    setOpen(false);
    onStartPlacing?.(w.sectionId);
  };

  const finishPlacing = () => {
    const cur = placingRef.current;
    if (!cur) return;
    const { sticker, isNew } = cur;
    if (isNew) dispatch({ type: 'ADD_STICKER', sticker });
    else {
      const { id, ...rest } = sticker;
      dispatch({ type: 'UPDATE_STICKER', stickerId: id, patch: rest });
    }
    setPlacing(null);
    toast(isNew ? '스티커를 붙였어요' : '스티커를 수정했어요');
  };

  const w = wizard;
  const imgSrc = w ? doc.images[w.draft.imageId]?.src : undefined;
  const currentStep = w?.step === 'motion' ? 2 : 1;

  const stepper = (
    <ol className="wizard-steps" aria-label="붙이기 단계">
      {STEP_LABELS.map((label, i) => (
        <li key={label} className={i === currentStep ? 'is-current' : i < currentStep ? 'is-done' : ''} aria-current={i === currentStep ? 'step' : undefined}>
          {i + 1}. {label}
        </li>
      ))}
    </ol>
  );

  const body = w && imgSrc && (
    <div className="sheet-pad sticker-wizard">
      {stepper}

      {w.step === 'frame' && (
        <>
          <div className="sticker-stage" aria-hidden>
            <span className="sticker-stage-art">
              <StickerArt sticker={{ shape: w.draft.shape, motion: 'none' }} src={imgSrc} />
            </span>
          </div>
          <div className="choice-cards" role="radiogroup" aria-label="프레임">
            {SHAPES.map((s) => (
              <button
                key={s.value}
                type="button"
                role="radio"
                aria-checked={w.draft.shape === s.value}
                className={`motion-card${w.draft.shape === s.value ? ' is-on' : ''}`}
                onClick={() => patch({ shape: s.value })}
              >
                <span className="motion-card-art">
                  <StickerArt sticker={{ shape: s.value, motion: 'none' }} src={imgSrc} />
                </span>
                {s.label}
              </button>
            ))}
          </div>
          <div className="wizard-actions">
            {w.stickerId && (
              <>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => {
                    pickFor.current = { replace: true };
                    openPicker();
                  }}
                >
                  사진 바꾸기
                </button>
                <button type="button" className="btn btn-ghost" onClick={beginPlacing}>
                  위치만 옮기기
                </button>
              </>
            )}
            <button type="button" className="btn btn-primary" onClick={() => go('motion')}>
              다음
            </button>
          </div>
        </>
      )}

      {w.step === 'motion' && (
        <>
          <div className="motion-grid" role="radiogroup" aria-label="움직임">
            {MOTIONS.map((m) => (
              <button
                key={m.value}
                type="button"
                role="radio"
                aria-checked={w.draft.motion === m.value}
                className={`motion-card${w.draft.motion === m.value ? ' is-on' : ''}`}
                onClick={() => patch({ motion: m.value })}
              >
                <span className="motion-card-art">
                  <StickerArt sticker={{ shape: w.draft.shape, motion: m.value }} src={imgSrc} />
                </span>
                {m.label}
              </button>
            ))}
          </div>
          <div className="wizard-actions">
            <button type="button" className="btn btn-ghost" onClick={() => go('frame')}>
              이전
            </button>
            <button type="button" className="btn btn-primary" onClick={beginPlacing}>
              위치 정하기
            </button>
          </div>
        </>
      )}

      {w.stickerId && (
        <button
          type="button"
          className="link-btn danger sticker-delete"
          onClick={() => {
            dispatch({ type: 'REMOVE_STICKER', stickerId: w.stickerId! });
            setOpen(false);
            toast('스티커를 뗐어요');
          }}
        >
          이 스티커 떼기
        </button>
      )}
    </div>
  );

  const placementBar = placing && (
    <div className="placement-bar" role="toolbar" aria-label="스티커 위치 정하기">
      <p className="placement-hint">4. 위치 — 스티커를 끌거나 섹션 안을 눌러 정하세요</p>
      <div className="placement-row">
        <div className="segmented placement-size" role="radiogroup" aria-label="크기">
          {SIZES.map((s) => (
            <button
              key={s.value}
              type="button"
              role="radio"
              aria-checked={placing.sticker.size === s.value}
              className={placing.sticker.size === s.value ? 'is-on' : ''}
              onClick={() => {
                const cur = placingRef.current;
                if (cur) setPlacing({ ...cur, sticker: { ...cur.sticker, size: s.value } });
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
        <button type="button" className="btn btn-ghost sm" onClick={() => setPlacing(null)}>
          취소
        </button>
        <button type="button" className="btn btn-primary sm" onClick={finishPlacing}>
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
    openExisting,
    placing: !!placing,
    picker,
    sheet: { open, onClose: close, title: w?.stickerId ? '스티커 수정' : '붙이기', body },
    stickerEdit: placing
      ? {
          sticker: placing.sticker,
          onMove: (x: number, y: number) => {
            const cur = placingRef.current;
            if (cur) setPlacing({ ...cur, sticker: { ...cur.sticker, x, y } });
          },
        }
      : null,
    placementBar,
  };
}
