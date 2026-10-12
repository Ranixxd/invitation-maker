// 편집기 (CONSTITUTION 제6장). 데스크탑 3단 / 태블릿 2단 / 모바일은 미리보기+바텀시트(MobileEditor). 디자인 편집 없음(§6.2)
import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useEditor } from '../store/EditorContext';
import { SectionList, type Selection } from '../components/editor/SectionList';
import { SettingsPanel } from '../components/editor/SettingsPanel';
import { SectionPanel } from '../components/editor/SectionPanels';
import { MobileEditor } from '../components/editor/MobileEditor';
import { InvitationView } from '../components/invitation/InvitationView';
import { AppHeader, PhoneFrame } from '../components/common/shared';
import { toast } from '../components/common/toast';
import { SECTION_LABELS } from '../data/templates';

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
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [selected, setSelected] = useState<Selection>('settings');

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

  const select = setSelected;

  const section = doc.sections.find((s) => s.id === selected);
  const panelTitle =
    selected === 'settings' ? '기본 정보' : section ? SECTION_LABELS[section.type] : '';

  return (
    <div className="editor">
      <AppHeader
        className="editor-top"
        left={
          <div className="editor-title">
            <b>{doc.title || '제목 없음'}</b>
            <span className="save-status">저장 안 됨 (준비 중)</span>
          </div>
        }
        right={
          <>
            <button type="button" className="btn btn-ghost sm" onClick={() => navigate('/view')}>
              하객 화면 보기
            </button>
            <button type="button" className="btn btn-primary sm" onClick={() => toast('공유 링크는 서버 연동 후 제공돼요')}>
              공유하기
            </button>
          </>
        }
      />

      <aside className="editor-list" aria-label="구성">
        <SectionList doc={doc} selected={selected} onSelect={select} dispatch={dispatch} />
      </aside>

      <main className="editor-panel" aria-label="편집">
        <div className="panel-head">
          <h2>{panelTitle}</h2>
          {section && section.type !== 'hero' && (
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
        {section && !section.enabled && <p className="notice">이 섹션은 숨겨져 있어 초대장에 보이지 않아요.</p>}
        {selected === 'settings' && <SettingsPanel doc={doc} dispatch={dispatch} />}
        {section && <SectionPanel doc={doc} section={section} dispatch={dispatch} goSettings={() => select('settings')} />}
      </main>

      <section className="editor-preview" aria-label="미리보기">
        <PhoneFrame>
          <InvitationView doc={doc} mode="preview" selectedSectionId={section?.id ?? null} onSectionClick={select} />
        </PhoneFrame>
        <p className="field-hint preview-hint">미리보기에서 섹션을 누르면 바로 편집할 수 있어요</p>
      </section>

    </div>
  );
}
