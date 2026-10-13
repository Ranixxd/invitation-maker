// 붙이기 흐름 (CONSTITUTION §4.10): ① 사진·프레임 → ② 모션 → ③ 섹션 안에서 위치 → ④ 완료
// 모바일·데스크탑 편집기가 같은 흐름을 쓰도록 훅으로 묶는다.
import { useCallback, useState } from 'react';
import type { InvitationDoc, Sticker, StickerMotion, StickerShape, StickerSize } from '../../types/invitation';
import type { EditorAction } from '../../store/editorReducer';
import { MAX_STICKERS_PER_SECTION, MOTIONS, SHAPES, SIZES, stickersIn } from '../../lib/stickers';
import { filesToAssets, MAX_IMAGES_PER_DOC } from '../../lib/image';
import { uid } from '../../lib/id';
import { PhotoDrop } from '../common/shared';
import { toast } from '../common/toast';
import { StickerArt } from '../invitation/StickerLayer';

type Step = 'photo' | 'motion';

interface Draft {
  imageId: string | null;
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

const NEW_DRAFT: Draft = { imageId: null, shape: 'heart', motion: 'bounce', size: 'md', x: 78, y: 22 };

export function useStickerFlow(
  doc: InvitationDoc,
  dispatch: (a: EditorAction) => void,
  onStartPlacing?: (sectionId: string) => void,
) {
  const [wizard, setWizard] = useState<Wizard | null>(null);
  const [open, setOpen] = useState(false);
  const [placing, setPlacing] = useState<{ sticker: Sticker; isNew: boolean } | null>(null);
  const [busy, setBusy] = useState(false);

  const close = useCallback(() => setOpen(false), []);

  const startNew = (sectionId: string) => {
    if (stickersIn(doc.stickers, sectionId).length >= MAX_STICKERS_PER_SECTION) {
      toast(`한 섹션에는 스티커를 ${MAX_STICKERS_PER_SECTION}개까지 붙일 수 있어요`);
      return;
    }
    setWizard({ sectionId, stickerId: null, step: 'photo', draft: { ...NEW_DRAFT } });
    setOpen(true);
  };

  const openExisting = (stickerId: string) => {
    const st = doc.stickers.find((s) => s.id === stickerId);
    if (!st) return;
    const { imageId, shape, motion, size, x, y } = st;
    setWizard({ sectionId: st.sectionId, stickerId, step: 'photo', draft: { imageId, shape, motion, size, x, y } });
    setOpen(true);
  };

  const patch = (p: Partial<Draft>) => setWizard((w) => (w ? { ...w, draft: { ...w.draft, ...p } } : w));
  const go = (step: Step) => setWizard((w) => (w ? { ...w, step } : w));

  const beginPlacing = (w: Wizard) => {
    if (!w.draft.imageId) return;
    const sticker: Sticker = { id: w.stickerId ?? uid('st'), sectionId: w.sectionId, ...w.draft, imageId: w.draft.imageId };
    setPlacing({ sticker, isNew: !w.stickerId });
    setOpen(false);
    onStartPlacing?.(w.sectionId);
  };

  const finishPlacing = () => {
    if (!placing) return;
    const { sticker, isNew } = placing;
    if (isNew) dispatch({ type: 'ADD_STICKER', sticker });
    else {
      const { id, ...rest } = sticker;
      dispatch({ type: 'UPDATE_STICKER', stickerId: id, patch: rest });
    }
    setPlacing(null);
    toast(isNew ? '스티커를 붙였어요' : '스티커를 수정했어요');
  };

  const upload = async (files: File[]) => {
    if (Object.keys(doc.images).length >= MAX_IMAGES_PER_DOC) {
      toast(`사진은 청첩장당 최대 ${MAX_IMAGES_PER_DOC}장이에요`);
      return;
    }
    setBusy(true);
    const [asset] = await filesToAssets(files.slice(0, 1), 1);
    setBusy(false);
    if (!asset) return;
    dispatch({ type: 'ADD_IMAGES', images: [asset], target: 'pool' });
    patch({ imageId: asset.id });
  };

  const w = wizard;
  const imgSrc = w?.draft.imageId ? doc.images[w.draft.imageId]?.src : undefined;
  const images = Object.values(doc.images);

  const body = w && (
    <div className="sheet-pad sticker-wizard">
      <ol className="wizard-steps" aria-label="붙이기 단계">
        {['사진·프레임', '모션', '위치'].map((label, i) => (
          <li key={label} className={(w.step === 'photo' ? 0 : 1) === i ? 'is-current' : ''}>
            {i + 1}. {label}
          </li>
        ))}
      </ol>

      {w.step === 'photo' && (
        <>
          <div className="sticker-stage" aria-hidden>
            {imgSrc ? (
              <span className="sticker-stage-art">
                <StickerArt sticker={{ shape: w.draft.shape, motion: 'none' }} src={imgSrc} />
              </span>
            ) : (
              <span className="sticker-stage-empty">사진을 골라 주세요</span>
            )}
          </div>
          <div className="field">
            <span className="field-label">프레임</span>
            <div className="segmented" role="radiogroup" aria-label="프레임">
              {SHAPES.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  role="radio"
                  aria-checked={w.draft.shape === s.value}
                  className={w.draft.shape === s.value ? 'is-on' : ''}
                  onClick={() => patch({ shape: s.value })}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
          <div className="field">
            <span className="field-label">사진</span>
            <PhotoDrop onFiles={upload} busy={busy} compact>
              <p className="field-hint">내 사진 올리기</p>
            </PhotoDrop>
            {images.length > 0 && (
              <div className="pick-grid">
                {images.map((img) => (
                  <button
                    key={img.id}
                    type="button"
                    className={`pick-item${w.draft.imageId === img.id ? ' is-on' : ''}`}
                    aria-pressed={w.draft.imageId === img.id}
                    aria-label="이 사진 쓰기"
                    onClick={() => patch({ imageId: img.id })}
                  >
                    <img src={img.src} alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="wizard-actions">
            {w.stickerId && (
              <button type="button" className="btn btn-ghost" onClick={() => beginPlacing(w)}>
                위치만 옮기기
              </button>
            )}
            <button type="button" className="btn btn-primary" disabled={!w.draft.imageId} onClick={() => go('motion')}>
              다음
            </button>
          </div>
        </>
      )}

      {w.step === 'motion' && imgSrc && (
        <>
          <div className="motion-grid" role="radiogroup" aria-label="모션">
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
            <button type="button" className="btn btn-ghost" onClick={() => go('photo')}>
              이전
            </button>
            <button type="button" className="btn btn-primary" onClick={() => beginPlacing(w)}>
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
      <p className="placement-hint">스티커를 끌거나 섹션 안을 눌러 위치를 정하세요</p>
      <div className="placement-row">
        <div className="segmented placement-size" role="radiogroup" aria-label="크기">
          {SIZES.map((s) => (
            <button
              key={s.value}
              type="button"
              role="radio"
              aria-checked={placing.sticker.size === s.value}
              className={placing.sticker.size === s.value ? 'is-on' : ''}
              onClick={() => setPlacing({ ...placing, sticker: { ...placing.sticker, size: s.value } })}
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

  return {
    startNew,
    openExisting,
    placing: !!placing,
    sheet: { open, onClose: close, title: w?.stickerId ? '스티커 수정' : '붙이기', body },
    stickerEdit: placing
      ? {
          sticker: placing.sticker,
          onMove: (x: number, y: number) => setPlacing((p) => (p ? { ...p, sticker: { ...p.sticker, x, y } } : p)),
        }
      : null,
    placementBar,
  };
}
