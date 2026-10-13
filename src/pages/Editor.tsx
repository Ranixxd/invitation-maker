// 편집기 (CONSTITUTION 제6장). 데스크탑 3단 / 태블릿 2단 / 모바일은 미리보기+바텀시트(MobileEditor). 디자인 편집 없음(§6.2)
import { useCallback, useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import type { InvitationDoc } from '../types/invitation';
import type { EditorAction } from '../store/editorReducer';
import { useEditor } from '../store/EditorContext';
import { SectionList, type Selection } from '../components/editor/SectionList';
import { SettingsPanel } from '../components/editor/SettingsPanel';
import { SectionPanel } from '../components/editor/SectionPanels';
import { MobileEditor } from '../components/editor/MobileEditor';
import { useStickerFlow } from '../components/editor/useStickerFlow';
import { StickerPlusIcon } from '../components/common/icons';
import { InvitationView } from '../components/invitation/InvitationView';
import { AppHeader, PhoneFrame } from '../components/common/shared';
import { BottomSheet } from '../components/common/BottomSheet';
import { PublishPanel } from '../components/editor/PublishPanel';
import { isPinned, PINNED_LAST, SECTION_LABELS } from '../data/templates';

const MOBILE_QUERY = '(max-width: 767px)';

function useIsMobile() {
  const [m, setM] = useState(() => window.matchMedia(MOBILE_QUERY).matches);
  useEffect(() => {
    const mq = window.matchMedia(MOBILE_QUERY);
    const on = () => setM(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return m;
}

export default function Editor() {
  const { doc, dispatch } = useEditor();
  const isMobile = useIsMobile();

  // 저장 기능이 없으므로 새로고침·탭 닫기 전에 경고 (§7.1)
  const hasDoc = !!doc;
  useEffect(() => {
    if (!hasDoc) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [hasDoc]);

  if (!doc) return <Navigate to="/templates" replace />;
  if (isMobile) return <MobileEditor doc={doc} dispatch={dispatch} />;
  return <DesktopEditor doc={doc} dispatch={dispatch} />;
}

function DesktopEditor({ doc, dispatch }: { doc: InvitationDoc; dispatch: (a: EditorAction) => void }) {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<Selection>('settings');
  const [publishOpen, setPublishOpen] = useState(false);
  const closePublish = useCallback(() => setPublishOpen(false), []);

  // 붙이기 (§4.10): 붙이기·선택·이동은 오른쪽 휴대폰 미리보기 안에서
  const sticker = useStickerFlow(doc, dispatch, {
    // 스티커를 선택하면 그 섹션의 편집 패널로(타이틀 = 섹션 이름), 아래 내용은 스티커 꾸미기로 교체
    onSelected: (sectionId) => setSelected(sectionId),
    onAttached: (sectionId) => {
      document
        .querySelector<HTMLElement>(`.editor-preview [data-section-id="${sectionId}"]`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    },
  });

  // 목록에서 다른 항목을 고르면 스티커 꾸미기를 끝내고 그 편집 정보로
  const select = (s: Selection) => {
    if (sticker.placing) sticker.deselect();
    setSelected(s);
  };
  const section = doc.sections.find((s) => s.id === selected);
  const panelTitle = selected === 'settings' ? '기본 정보' : section ? SECTION_LABELS[section.type] : '';

  return (
    <div className="editor">
      <AppHeader
        className="editor-top"
        left={
          <button type="button" className="btn btn-ghost sm" onClick={() => navigate('/view')}>
            미리보기
          </button>
        }
        right={
          <button type="button" className="btn btn-primary sm" onClick={() => setPublishOpen(true)}>
            청첩장 만들기
          </button>
        }
      />

      <aside className="editor-list" aria-label="구성">
        <SectionList doc={doc} selected={selected} onSelect={select} dispatch={dispatch} />
      </aside>

      <main className="editor-panel" aria-label="편집">
        <div className="panel-head">
          <div className="panel-title">
            <h2>{panelTitle}</h2>
            {/* 붙이기: 타이틀 옆, 모바일과 같은 아이콘 (§4.10) */}
            {section && section.type !== PINNED_LAST && !sticker.placing && (
              <button type="button" className="btn btn-ghost sm panel-sticker-btn" onClick={() => sticker.startNew(section.id)}>
                <StickerPlusIcon size={18} />
                붙이기
              </button>
            )}
            {sticker.placing && <span className="panel-mode-badge">스티커 꾸미기</span>}
          </div>
          {section && !isPinned(section.type) && !sticker.placing && (
            <label className="panel-visibility">
              <span>{section.enabled ? '보이는 중' : '숨김'}</span>
              <input
                type="checkbox"
                role="switch"
                className="switch sm"
                checked={section.enabled}
                onChange={() => dispatch({ type: 'TOGGLE_SECTION', sectionId: section.id })}
                aria-label="섹션 표시"
              />
            </label>
          )}
        </div>
        {sticker.placing ? (
          // 스티커 선택 중: 타이틀 아래를 프레임·종류·크기·움직임 + 붙이기 완료로 교체, 완료하면 원래 편집 정보로 복귀
          sticker.panel
        ) : (
          <>
            {section && !section.enabled && <p className="notice">이 섹션은 숨겨져 있어 초대장에 보이지 않아요.</p>}
            {selected === 'settings' && <SettingsPanel doc={doc} dispatch={dispatch} />}
            {section && <SectionPanel doc={doc} section={section} dispatch={dispatch} goSettings={() => select('settings')} />}
          </>
        )}
      </main>

      <section className="editor-preview" aria-label="미리보기">
        <PhoneFrame>
          <InvitationView
            doc={doc}
            mode="preview"
            selectedSectionId={section?.id ?? null}
            onSectionClick={sticker.placing ? undefined : select}
            stickerEdit={sticker.stickerEdit}
            onStickerClick={sticker.openExisting}
          />
        </PhoneFrame>
        <p className="field-hint preview-hint">
          {sticker.placing ? '스티커를 끌거나 섹션 안을 눌러 위치를 옮길 수 있어요' : '미리보기에서 섹션을 누르면 바로 편집할 수 있어요'}
        </p>
      </section>

      <BottomSheet open={publishOpen} title="청첩장 만들기" onClose={closePublish}>
        <div className="sheet-pad">
          <PublishPanel doc={doc} dispatch={dispatch} />
        </div>
      </BottomSheet>
      {sticker.picker}
      {sticker.adjustEditor}
    </div>
  );
}
