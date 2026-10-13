// 모바일 편집기: 미리보기가 곧 편집 화면, 편집은 바텀시트로 (CONSTITUTION §6.5)
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { InvitationDoc, SectionType } from '../../types/invitation';
import type { EditorAction } from '../../store/editorReducer';
import { isPinned, SECTION_LABELS } from '../../data/templates';
import { InvitationView } from '../invitation/InvitationView';
import { BottomSheet } from '../common/BottomSheet';
import { AppHeader } from '../common/shared';
import { Toggle } from '../common/fields';
import { SectionList } from './SectionList';
import { SectionPanel } from './SectionPanels';
import { SettingsPanel } from './SettingsPanel';
import { PublishPanel } from './PublishPanel';

/** 모바일 [섹션 편집] 버튼 문구. 브랜드 소개는 편집 불가라 버튼 없음 (§4.9) */
const EDIT_LABELS: Record<SectionType, string | null> = {
  hero: '대표 사진 편집',
  greeting: '시작 멘트 편집',
  couple: '신랑·신부 편집',
  profile: '추가 정보 편집',
  calendar: '예식 일자 편집',
  gallery: '갤러리 편집',
  rsvp: '참석 여부 편집',
  account: '계좌 편집',
  guestbook: '방명록 편집',
  location: '오시는 길 편집',
  snap: '게스트 스냅 편집',
  closing: '마무리 멘트 편집',
  brand: null,
};

type SheetKind = 'list' | 'settings' | 'publish' | { sectionId: string };

interface Props {
  doc: InvitationDoc;
  dispatch: (a: EditorAction) => void;
}

export function MobileEditor({ doc, dispatch }: Props) {
  const navigate = useNavigate();
  const [activeId, setActiveId] = useState<string | null>(doc.sections[0]?.id ?? null);
  // 닫히는 애니메이션 동안 내용이 비지 않도록 kind와 open을 분리
  const [sheet, setSheet] = useState<SheetKind>('list');
  const [open, setOpen] = useState(false);

  const show = useCallback((k: SheetKind) => {
    setSheet(k);
    setOpen(true);
  }, []);
  const close = useCallback(() => setOpen(false), []);

  // 화면 중앙선에 걸친 섹션 = 활성 섹션 (§6.5-1)
  const enabledKey = doc.sections.map((s) => `${s.id}:${s.enabled}`).join('|');
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>('.m-editor .inv-section');
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActiveId((e.target as HTMLElement).dataset.sectionId ?? null);
      },
      { rootMargin: '-50% 0px -50% 0px', threshold: 0 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [enabledKey]);

  const openSection = (id: string) => {
    const el = document.querySelector<HTMLElement>(`.m-editor [data-section-id="${id}"]`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setActiveId(id);
    show({ sectionId: id });
  };

  const section = typeof sheet === 'object' ? doc.sections.find((s) => s.id === sheet.sectionId) : undefined;
  const title =
    sheet === 'list'
      ? '구성'
      : sheet === 'settings'
        ? '기본 정보'
        : sheet === 'publish'
          ? '청첩장 만들기'
          : section
            ? SECTION_LABELS[section.type]
            : '';

  return (
    <div className="m-editor">
      <AppHeader
        className="m-head"
        left={
          <button type="button" className="btn btn-ghost sm" onClick={() => navigate('/view')}>
            미리보기
          </button>
        }
        right={
          <button type="button" className="btn btn-primary sm" onClick={() => show('publish')}>
            청첩장 만들기
          </button>
        }
      />

      <InvitationView
        doc={doc}
        mode="preview"
        autoScroll={false}
        selectedSectionId={activeId}
        onSectionClick={setActiveId}
        renderOverlay={(s) =>
          EDIT_LABELS[s.type] && (
          <div className={`sec-edit-layer${s.id === activeId ? ' is-active' : ''}`}>
            <button
              type="button"
              className="sec-edit-btn"
              tabIndex={s.id === activeId ? 0 : -1}
              onClick={(e) => {
                e.stopPropagation();
                show({ sectionId: s.id });
              }}
            >
              {EDIT_LABELS[s.type]}
            </button>
          </div>
          )
        }
      />

      <nav className="m-toolbar" aria-label="편집 도구">
        <button type="button" onClick={() => show('list')}>
          <span aria-hidden>☰</span>구성
        </button>
        <button type="button" onClick={() => show('settings')}>
          <span aria-hidden>📋</span>기본 정보
        </button>
      </nav>

      <BottomSheet open={open} title={title} onClose={close}>
        {sheet === 'list' && (
          <div className="sheet-pad">
            <SectionList
              doc={doc}
              selected={activeId ?? ''}
              onSelect={(s) => (s === 'settings' ? show(s) : openSection(s))}
              dispatch={dispatch}
              showBasics={false}
            />
          </div>
        )}
        {sheet === 'settings' && <SettingsPanel doc={doc} dispatch={dispatch} />}
        {sheet === 'publish' && (
          <div className="sheet-pad">
            <PublishPanel doc={doc} dispatch={dispatch} />
          </div>
        )}
        {section && (
          <>
            {!isPinned(section.type) && (
              <div className="sheet-pad sheet-visibility">
                <Toggle
                  label="초대장에 표시"
                  hint={section.enabled ? undefined : '숨겨져 있어 하객에게 보이지 않아요'}
                  checked={section.enabled}
                  onChange={() => dispatch({ type: 'TOGGLE_SECTION', sectionId: section.id })}
                />
              </div>
            )}
            <SectionPanel doc={doc} section={section} dispatch={dispatch} goSettings={() => show('settings')} />
          </>
        )}
      </BottomSheet>
    </div>
  );
}
