import type { InvitationDoc } from '../../types/invitation';
import { SECTION_LABELS } from '../../data/templates';
import type { EditorAction } from '../../store/editorReducer';

export type Selection = 'settings' | string; // string = section id

interface Props {
  doc: InvitationDoc;
  selected: Selection;
  onSelect: (s: Selection) => void;
  dispatch: (a: EditorAction) => void;
  /** 기본 정보 항목 표시 (모바일 구성 시트는 툴바에 따로 있으므로 숨김) */
  showBasics?: boolean;
}

export function SectionList({ doc, selected, onSelect, dispatch, showBasics = true }: Props) {
  return (
    <nav className="section-list" aria-label="초대장 구성">
      {showBasics && (
        <ul>
          <li>
            <button type="button" className={`list-item${selected === 'settings' ? ' is-on' : ''}`} onClick={() => onSelect('settings')}>
              <span className="list-icon" aria-hidden>📋</span>
              <span className="list-name">기본 정보</span>
              <span className="list-desc">이름·날짜·장소·혼주</span>
            </button>
          </li>
        </ul>
      )}
      <p className="list-caption">섹션 (위에서부터 순서대로 보여요)</p>
      <ul>
        {doc.sections.map((s, i) => {
          const isHero = s.type === 'hero';
          const label = SECTION_LABELS[s.type];
          return (
            <li key={s.id} className={`section-row${s.enabled ? '' : ' is-hidden'}`}>
              <button type="button" className={`list-item${selected === s.id ? ' is-on' : ''}`} onClick={() => onSelect(s.id)}>
                <span className="list-num">{i + 1}</span>
                <span className="list-name">{label}</span>
                {!s.enabled && <span className="list-badge">숨김</span>}
                {isHero && <span className="list-badge">고정</span>}
              </button>
              {!isHero && (
                <span className="row-actions">
                  <button
                    type="button"
                    className="icon-btn sm"
                    aria-label={`${label} 위로`}
                    disabled={i <= 1}
                    onClick={() => dispatch({ type: 'MOVE_SECTION', sectionId: s.id, dir: -1 })}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className="icon-btn sm"
                    aria-label={`${label} 아래로`}
                    disabled={i === doc.sections.length - 1}
                    onClick={() => dispatch({ type: 'MOVE_SECTION', sectionId: s.id, dir: 1 })}
                  >
                    ↓
                  </button>
                  <input
                    type="checkbox"
                    role="switch"
                    className="switch sm"
                    aria-label={`${label} ${s.enabled ? '숨기기' : '보이기'}`}
                    checked={s.enabled}
                    onChange={() => dispatch({ type: 'TOGGLE_SECTION', sectionId: s.id })}
                  />
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
